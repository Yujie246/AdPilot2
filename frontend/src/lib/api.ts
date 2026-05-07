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

  return (await response.json()) as ProductAnalysisResponse;
}
