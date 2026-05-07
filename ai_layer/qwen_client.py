from __future__ import annotations

import json
import os
from typing import Any

import httpx
from dotenv import load_dotenv


DEFAULT_BASE_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1"
DEFAULT_MODEL = "qwen3.6-plus"

load_dotenv()


class QwenClient:
    """Tiny OpenAI-compatible client for DashScope/Qwen.

    If no API key is present, callers receive the provided fallback so the
    hackathon demo stays reliable offline.
    """

    def __init__(self) -> None:
        self.api_key = os.getenv("DASHSCOPE_API_KEY", "")
        self.base_url = os.getenv("DASHSCOPE_BASE_URL", DEFAULT_BASE_URL).rstrip("/")
        self.model = os.getenv("QWEN_MODEL", DEFAULT_MODEL)

    @property
    def configured(self) -> bool:
        return bool(self.api_key)

    async def json_completion(self, prompt: str, fallback: dict[str, Any]) -> dict[str, Any]:
        if not self.configured:
            return {**fallback, "source": "mock"}

        try:
            parsed = await self.required_json_completion(prompt)
            return {**fallback, **parsed, "source": "qwen"}
        except Exception:
            return {**fallback, "source": "mock"}

    async def required_json_completion(self, prompt: str) -> dict[str, Any]:
        if not self.configured:
            raise RuntimeError("DASHSCOPE_API_KEY is not configured")

        payload = {
            "model": self.model,
            "messages": [
                {
                    "role": "system",
                    "content": "你是 AdPilot 广告导演的策略模型。只输出合法 JSON，不输出 Markdown。"
                },
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.55,
            # Equivalent to OpenAI SDK's extra_body={"enable_thinking": True}.
            "enable_thinking": True
        }

        timeout_seconds = _timeout_seconds()
        timeout = httpx.Timeout(timeout_seconds, connect=min(10.0, timeout_seconds))
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(
                f"{self.base_url}/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                },
                json=payload
            )
            response.raise_for_status()
            content = _extract_message_content(response.json())
            return _parse_json(content)


def _extract_message_content(payload: dict[str, Any]) -> str:
    content = payload["choices"][0]["message"].get("content", "")
    if not isinstance(content, str) or not content.strip():
        raise ValueError("Qwen response content is empty")
    return content


def _parse_json(content: str) -> dict[str, Any]:
    text = _strip_code_fence(content.strip())
    try:
        data = json.loads(text)
        if isinstance(data, dict):
            return data
    except json.JSONDecodeError:
        pass

    decoder = json.JSONDecoder()
    for index, char in enumerate(text):
        if char != "{":
            continue
        try:
            data, _ = decoder.raw_decode(text[index:])
        except json.JSONDecodeError:
            continue
        if isinstance(data, dict):
            return data

    raise ValueError("Qwen response must contain a JSON object")


def _strip_code_fence(text: str) -> str:
    if not text.startswith("```"):
        return text

    lines = text.splitlines()
    if lines and lines[0].strip().startswith("```"):
        lines = lines[1:]
    if lines and lines[-1].strip().startswith("```"):
        lines = lines[:-1]
    return "\n".join(lines).strip()


def _timeout_seconds() -> float:
    default = 25.0 if os.getenv("VERCEL") else 200.0
    raw_timeout = os.getenv("QWEN_TIMEOUT_SECONDS")
    if not raw_timeout:
        return default

    try:
        timeout = float(raw_timeout)
    except ValueError:
        return default

    return max(1.0, timeout)
