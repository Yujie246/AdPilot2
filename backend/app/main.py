from __future__ import annotations

import os

from fastapi import FastAPI
from fastapi import HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel, Field

from ai_layer.qwen_client import QwenClient
from database.store import interaction_count, record_interaction, save_report


app = FastAPI(title="AdPilot API", version="0.1.0")
cors_origin_regex = os.getenv("CORS_ORIGIN_REGEX") or None
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://127.0.0.1:3000,http://localhost:3000"
        ).split(",")
        if origin.strip()
    ],
    allow_origin_regex=cors_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

qwen = QwenClient()


class InteractionIn(BaseModel):
    question: str = Field(min_length=1, max_length=80)
    choice: str = Field(min_length=1, max_length=40)
    profile: str = Field(default="家庭健康型消费者", max_length=80)


class ProductAnalysisIn(BaseModel):
    drama_file: str = Field(min_length=1, max_length=160)
    drama_duration: str = Field(default="未知", max_length=40)
    drama_size: str = Field(default="未知", max_length=40)
    ad_file: str = Field(min_length=1, max_length=160)
    ad_duration: str = Field(default="未知", max_length=40)
    ad_size: str = Field(default="未知", max_length=40)
    ad_image_file: str = Field(default="未上传", max_length=160)
    ad_brand: str = Field(default="金典有机奶", max_length=80)


@app.get("/health")
async def health() -> dict[str, str | bool]:
    return {"ok": True, "qwen_configured": qwen.configured, "model": qwen.model}


@app.get("/api/analysis")
async def analysis() -> dict[str, object]:
    return {
        "insertions": [
            {"time": "02:14", "risk": 72, "label": "不建议"},
            {"time": "05:36", "risk": 18, "label": "推荐"},
            {"time": "08:42", "risk": 45, "label": "谨慎"}
        ],
        "best": {
            "time": "05:36",
            "reason": "家庭早餐场景对话结束，镜头进入自然停顿，适合轻量插入广告。"
        }
    }


@app.post("/api/product-analysis")
async def product_analysis(data: ProductAnalysisIn) -> dict[str, object]:
    if not qwen.configured:
        return _normalize_product_analysis(_product_analysis_payload(data), data, source="mock")

    prompt = f"""
你是 AdPilot 剧中互动广告分析模型。基于用户上传素材生成产品页结果。
素材：剧集《{data.drama_file}》时长{data.drama_duration}大小{data.drama_size}；广告《{data.ad_file}》时长{data.ad_duration}大小{data.ad_size}；品牌/主题：{data.ad_brand}。
任务：给出合理插入点、互动问题、传统广告痛点、AdPilot 优势。只能根据文件信息谨慎推断。
只输出 JSON：
{{"insertion_time":"25:36","recommended_ad":"{data.ad_brand}","match_score":92,"reasons":["理由1","理由2","理由3"],"question":"问题","options":["选项1","选项2"],"pain_points":["痛点1","痛点2","痛点3"],"advantages":["优势1","优势2","优势3"]}}
要求：pain_points 必须包含“开 3X 倍速需要手一直按着”的体验痛点；pain_points 和 advantages 每条 18-26 个汉字，适合前端单行展示；语言要像产品展示文案，不要像短标签；match_score 为0-100整数；不要 Markdown。
"""
    try:
        parsed = await qwen.required_json_completion(prompt)
        return _normalize_product_analysis(parsed, data)
    except Exception:
        return _normalize_product_analysis(_product_analysis_payload(data), data, source="mock")


@app.get("/api/question")
async def generate_question() -> dict[str, object]:
    fallback = {
        "question": "早餐更想喝什么？",
        "options": ["有机奶", "咖啡"],
        "reason": "问题贴合早餐场景和金典有机奶卖点，用户理解成本低。"
    }
    prompt = """
基于以下信息生成一个片中广告轻互动问题：
- 剧情场景：家庭早餐后，父亲与孩子对话结束，画面自然停顿。
- 广告品牌：金典有机奶
- 广告卖点：有机认证、家人健康、早餐饮用
要求：输出 JSON，字段为 question、options、reason。question 不超过 12 个汉字，options 两个。
"""
    return await qwen.json_completion(prompt, fallback)


@app.post("/api/interaction")
async def interaction(data: InteractionIn) -> dict[str, object]:
    record_interaction(data.question, data.choice, data.profile)
    return {
        "ok": True,
        "count": interaction_count(),
        "message": "互动已记录，用户画像已更新"
    }


@app.get("/api/insights")
async def insights() -> dict[str, object]:
    fallback = _insight_payload()
    prompt = """
你是 AdPilot 广告主洞察模型。请根据以下互动数据生成投放建议：
- 品牌：金典有机奶
- 互动完成率：68%
- 平均互动耗时：2.4 秒
- 高意向用户占比：37%
- 用户画像：家庭健康型 42%、个人品质型 28%、新品尝鲜型 18%、价格敏感型 12%
- 关键选择：早餐想喝有机奶 64%；购买对象为家人 61%；关注有机认证 72%
输出 JSON，字段必须为 suggestion、script、benefit、content。每个字段 1 句中文。
"""
    return await qwen.json_completion(prompt, fallback)


@app.post("/api/report")
async def report() -> PlainTextResponse:
    payload = _insight_payload()
    save_report("金典有机奶广告主洞察报告", payload)
    body = "\n".join(
        [
            "AdPilot 金典有机奶广告主洞察报告",
            "",
            "核心结论",
            payload["suggestion"],
            "",
            f"推荐文案：{payload['script']}",
            f"推荐权益：{payload['benefit']}",
            f"建议内容：{payload['content']}",
            "",
            "数据摘要",
            "互动完成率 68%，平均互动耗时 2.4 秒，高意向用户占比 37%。",
            "家庭健康型用户占比 42%，有机认证关注度 72%。"
        ]
    )
    return PlainTextResponse(
        body,
        media_type="text/plain; charset=utf-8",
        headers={"Content-Disposition": 'attachment; filename="adpilot-jindian-report.txt"'}
    )


def _insight_payload() -> dict[str, str]:
    return {
        "suggestion": "优先触达家庭健康型消费者，在家庭早餐场景中强化“有机认证”与“家人健康”心智。",
        "script": "给家人的早餐，多一份有机安心。",
        "benefit": "家庭装优惠券 / 早餐组合装 / 新品试饮装",
        "content": "家庭剧、都市剧、亲子内容、生活方式类内容"
    }


def _product_analysis_payload(data: ProductAnalysisIn | None = None) -> dict[str, object]:
    brand = data.ad_brand if data else "金典有机奶"
    return {
        "insertion_time": "25:36",
        "recommended_ad": brand,
        "match_score": 88,
        "reasons": [
            "剧情节奏舒缓适合植入健康饮品概念",
            "广告时长适合移动端碎片化观看习惯",
            "品牌主题能与生活化剧情自然衔接"
        ],
        "question": "追剧间隙你想喝什么？",
        "options": [brand, "其他饮品"],
        "pain_points": [
            "传统广告强行切断剧情，用户容易产生跳出感",
            "开 3X 倍速仍要手一直按着，观看操作很累",
            "只能单向曝光，品牌难获得真实偏好反馈"
        ],
        "advantages": [
            "识别剧情空窗自然承接广告，减少打断感",
            "3s 轻互动即可回正片，减少等待和拖动",
            "互动答案沉淀偏好，帮助品牌优化投放"
        ],
        "source": "mock"
    }


def _normalize_product_analysis(payload: dict[str, object], data: ProductAnalysisIn, source: str = "qwen") -> dict[str, object]:
    return {
        "insertion_time": _string_value(payload.get("insertion_time"), "25:36"),
        "recommended_ad": _string_value(payload.get("recommended_ad"), data.ad_brand),
        "match_score": _score_value(payload.get("match_score"), 88),
        "reasons": _string_list(payload.get("reasons"), ["素材节奏适合", "不打断主线", "互动问题清晰"]),
        "question": _string_value(payload.get("question"), "你更喜欢哪个卖点？"),
        "options": _string_list(payload.get("options"), [data.ad_brand, "继续观看"])[:2],
        "pain_points": _product_pain_points(payload.get("pain_points")),
        "advantages": _product_advantages(payload.get("advantages")),
        "source": source
    }


def _string_value(value: object, fallback: str) -> str:
    if isinstance(value, str) and value.strip():
        return value.strip()
    return fallback


def _score_value(value: object, fallback: int) -> int:
    if isinstance(value, int):
        return max(0, min(100, value))
    if isinstance(value, float):
        return max(0, min(100, round(value)))
    if isinstance(value, str) and value.strip().isdigit():
        return max(0, min(100, int(value.strip())))
    return fallback


def _string_list(value: object, fallback: list[str]) -> list[str]:
    if isinstance(value, list):
        items = [item.strip() for item in value if isinstance(item, str) and item.strip()]
        if items:
            return items
    return fallback


def _product_pain_points(value: object) -> list[str]:
    defaults = [
        "广告硬切打断剧情情绪，用户容易跳出观看状态",
        "开 3X 倍速仍要手一直按着，操作疲劳明显",
        "只有被动曝光，品牌难获得真实偏好反馈"
    ]
    items = _string_list(value, defaults)
    if not any("3X" in item or "倍速" in item for item in items):
        items = [defaults[0], *items]
    return items[:3]


def _product_advantages(value: object) -> list[str]:
    defaults = [
        "剧情节点自然承接广告，降低打断感并提升记忆",
        "3s 轻互动即可回正片，减少等待与手动拖动",
        "互动答案沉淀偏好数据，帮助品牌优化投放"
    ]
    return _string_list(value, defaults)[:3]
