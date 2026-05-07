import { brandCopy } from "./data";

const DEFAULT_API_BASE_URL = process.env.NODE_ENV === "development" ? "http://127.0.0.1:8000" : "";
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL).replace(/\/$/, "");

function apiUrl(path: string) {
  return `${API_BASE_URL}${path}`;
}

export type InsightResponse = {
  suggestion: string;
  script: string;
  benefit: string;
  content: string;
  source: "qwen" | "mock";
};

export type ProductAnalysisResponse = {
  insertion_time: string;
  recommended_ad: string;
  match_score: number;
  reasons: string[];
  question: string;
  options: string[];
  pain_points: string[];
  advantages: string[];
  source: "qwen" | "mock";
};

export type ProductAnalysisRequest = {
  drama_file: string;
  drama_duration: string;
  drama_size: string;
  ad_file: string;
  ad_duration: string;
  ad_size: string;
  ad_image_file: string;
  ad_brand: string;
};

export async function recordInteraction(choice: string) {
  try {
    await fetch(apiUrl("/api/interaction"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: brandCopy.question,
        choice,
        profile: "家庭健康型消费者"
      })
    });
  } catch {
    // Demo remains fully usable if the backend is temporarily unavailable.
  }
}

export async function getInsights(): Promise<InsightResponse> {
  try {
    const response = await fetch(apiUrl("/api/insights"), { cache: "no-store" });
    if (!response.ok) throw new Error("insight request failed");
    return (await response.json()) as InsightResponse;
  } catch {
    return {
      suggestion: brandCopy.suggestion,
      script: brandCopy.script,
      benefit: brandCopy.benefit,
      content: brandCopy.content,
      source: "mock"
    };
  }
}

export async function runProductAnalysis(payload: ProductAnalysisRequest): Promise<ProductAnalysisResponse> {
  const response = await fetch(apiUrl("/api/product-analysis"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "product analysis request failed");
  }

  return normalizeProductAnalysis((await response.json()) as ProductAnalysisResponse, payload);
}

function normalizeProductAnalysis(response: ProductAnalysisResponse, request: ProductAnalysisRequest): ProductAnalysisResponse {
  return {
    ...response,
    insertion_time: safeInsertionTime(response.insertion_time, request.drama_duration)
  };
}

function safeInsertionTime(insertionTime: string, dramaDuration: string) {
  const durationSeconds = parseDurationSeconds(dramaDuration);
  const insertionSeconds = parseDurationSeconds(insertionTime);

  if (durationSeconds === null) return insertionTime;
  const latestAllowed = latestAllowedInsertionSecond(durationSeconds);

  if (insertionSeconds === null) return formatClock(defaultInsertionSecond(durationSeconds));
  if (insertionSeconds > latestAllowed) return formatClock(latestAllowed);
  return formatClock(insertionSeconds);
}

function latestAllowedInsertionSecond(durationSeconds: number) {
  if (durationSeconds > 135) return Math.max(15, durationSeconds - 121);
  return Math.max(0, Math.min(Math.floor(durationSeconds / 2), durationSeconds - 1));
}

function defaultInsertionSecond(durationSeconds: number) {
  return Math.min(latestAllowedInsertionSecond(durationSeconds), Math.max(15, Math.round(durationSeconds * 0.45)));
}

function parseDurationSeconds(value: string) {
  const text = value.trim();
  if (!text) return null;

  if (/^\d+$/.test(text)) return Number(text);

  const clockParts = text.split(":");
  if (clockParts.length >= 2 && clockParts.length <= 3 && clockParts.every((part) => /^\d+$/.test(part.trim()))) {
    const parts = clockParts.map((part) => Number(part.trim()));
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }

  const match = text.match(/^(?:(\d+)\s*(?:小时|时|h))?\s*(?:(\d+)\s*(?:分钟|分|m))?\s*(?:(\d+)\s*(?:秒|s))?$/i);
  if (!match || !match.slice(1).some(Boolean)) return null;

  const hours = Number(match[1] || 0);
  const minutes = Number(match[2] || 0);
  const seconds = Number(match[3] || 0);
  return hours * 3600 + minutes * 60 + seconds;
}

function formatClock(totalSeconds: number) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;
  if (hours) return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
