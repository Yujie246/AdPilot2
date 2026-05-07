# AdPilot

AdPilot 是一个腾讯黑客松 Web Demo：在片中广告播放 5 秒后出现轻互动卡片，用户完成 3-5 秒互动即可精准跳回正片，同时为广告主沉淀真实偏好洞察。

## 运行

```bash
uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000
cd frontend
/Users/liuyujie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node node_modules/next/dist/bin/next dev -H 127.0.0.1 -p 3000
```

打开 `http://127.0.0.1:3000`。

## Vercel 部署

前后端分离部署到 Vercel 的步骤见 [`deploy/VERCEL.md`](deploy/VERCEL.md)。推荐建两个 Vercel Project：根目录部署 FastAPI 后端，`frontend/` 部署 Next.js 前端。

## 千问模型

后端默认按 OpenAI-compatible 协议调用千问：

```bash
export DASHSCOPE_API_KEY="sk-..."
export DASHSCOPE_BASE_URL="https://dashscope.aliyuncs.com/compatible-mode/v1"
export QWEN_MODEL="qwen3.6-plus"
```

请只通过环境变量或本机 `.env` 配置 API Key，不要把真实 Key 写进代码、README 或提交记录。千问请求会开启 `enable_thinking`；如果模型返回格式异常、网络超时或未配置 Key，后端会自动回落到 Mock 数据。

未配置 `DASHSCOPE_API_KEY` 时会自动使用黑客松 Mock 数据，方便现场演示不被网络或额度卡住。
