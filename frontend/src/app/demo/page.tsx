"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  BrainCircuit,
  Check,
  CircleCheck,
  CloudUpload,
  FlaskConical,
  Frown,
  LockKeyhole,
  Play,
  Pause,
  Scale,
  Settings,
  Sparkles,
  Target,
  Timer,
  UploadCloud,
  Volume2,
  VolumeX,
  Maximize
} from "lucide-react";
import { AppFrame } from "@/components/AppFrame";
import { runProductAnalysis, type ProductAnalysisResponse } from "@/lib/api";

type UploadedAsset = {
  file: File;
  url: string;
  duration: string;
  size: string;
  source: "default" | "upload";
};

type DemoAssetKind = "drama" | "adVideo";

type StoredAsset = {
  id: DemoAssetKind;
  file: File | Blob;
  name: string;
  type: string;
  lastModified: number;
  duration: string;
  size: string;
};

type InteractionPrompt = {
  question: string;
  options: [string, string];
};

const DEMO_DB_NAME = "adpilot-demo-assets";
const DEMO_STORE_NAME = "uploads";
const DEMO_BRAND_KEY = "adpilot-demo-brand";
const memoryUploads: Partial<Record<DemoAssetKind, StoredAsset>> = {};

const defaultDemoAssets: Record<DemoAssetKind, { fileName: string; label: string; path: string; type: string }> = {
  drama: {
    fileName: "电视剧测试视频.mp4",
    label: "测试视频",
    path: "/assets/电视剧测试视频.mp4",
    type: "video/mp4"
  },
  adVideo: {
    fileName: "广告测试视频.mp4",
    label: "测试广告",
    path: "/assets/广告测试视频.mp4",
    type: "video/mp4"
  }
};

const productSteps: Array<{ step: string; icon: LucideIcon; label: string }> = [
  { step: "1", icon: UploadCloud, label: "上传剧集与广告" },
  { step: "2", icon: BrainCircuit, label: "AI 分析插入时机" },
  { step: "3", icon: Sparkles, label: "生成互动卡片" },
  { step: "4", icon: Play, label: "完成互动跳回正片" }
];

const jindianInteractionPrompts: InteractionPrompt[] = [
  { question: "第一杯奶通常在哪喝？", options: ["早餐桌", "通勤路上"] },
  { question: "奶香你站哪一派？", options: ["清爽顺口", "浓醇满足"] },
  { question: "这瓶奶更像给谁准备的？", options: ["给自己撑一天", "给家人多一点安心"] },
  { question: "家里买奶，谁更有发言权？", options: ["我来把关", "家人爱喝才算"] },
  { question: "看到“0.09 秒”，你第一反应是？", options: ["工艺挺硬核", "听起来很新鲜"] },
  { question: "看到牧场画面，你会先看？", options: ["奶源靠不靠谱", "环境干不干净"] },
  { question: "有机奶最该证明什么？", options: ["认证可信", "奶源可追"] },
  { question: "你更愿意为哪点多花钱？", options: ["真有认证", "真好喝"] },
  { question: "这支广告你记住了什么？", options: ["0.09 秒杀菌", "超超超好喝"] },
  { question: "买奶你更像哪种人？", options: ["固定买一款", "看到新品会试"] },
  { question: "家里有人说“随便买”，你会？", options: ["还是买好点", "看哪个便宜"] },
  { question: "冰箱里的奶，你希望它？", options: ["随时都有", "喝完再买"] },
  { question: "试饮机会给你，你会？", options: ["自己先喝", "带回家一起试"] },
  { question: "下次想在哪遇到它？", options: ["超市货架", "外卖/电商"] },
  { question: "它最适合进哪份清单？", options: ["早餐常备", "家庭囤货"] }
];

export default function DemoPage() {
  const [drama, setDrama] = useState<UploadedAsset | null>(null);
  const [adVideo, setAdVideo] = useState<UploadedAsset | null>(null);
  const [brand, setBrand] = useState("金典有机奶");
  const [analysis, setAnalysis] = useState<ProductAnalysisResponse | null>(null);
  const [status, setStatus] = useState<"idle" | "analyzing" | "done" | "error">("idle");
  const [error, setError] = useState("");

  const canAnalyze = Boolean(drama && adVideo && status !== "analyzing");
  const selectedBrand = brand.trim() || inferBrand(adVideo?.file.name);
  const playbackKey = analysis
    ? `${analysis.insertion_time}-${analysis.question}-${drama?.file.name ?? ""}-${adVideo?.file.name ?? ""}`
    : "idle";

  useEffect(() => {
    let active = true;

    const storedBrand = window.localStorage.getItem(DEMO_BRAND_KEY);
    if (storedBrand) setBrand(storedBrand);

    async function restoreUploads() {
      const [storedDrama, storedAdVideo] = await Promise.all([
        loadRememberedAsset("drama").then((asset) => asset ?? loadDefaultAsset("drama")),
        loadRememberedAsset("adVideo").then((asset) => asset ?? loadDefaultAsset("adVideo"))
      ]);

      if (!active) {
        revokeAssetUrl(storedDrama);
        revokeAssetUrl(storedAdVideo);
        return;
      }

      if (storedDrama) setDrama((prev) => replaceAsset(prev, storedDrama));
      if (storedAdVideo) setAdVideo((prev) => replaceAsset(prev, storedAdVideo));
    }

    void restoreUploads();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => () => {
    revokeAssetUrl(drama);
  }, [drama?.url]);

  useEffect(() => () => {
    revokeAssetUrl(adVideo);
  }, [adVideo?.url]);

  async function handleUpload(kind: "drama" | "adVideo", file: File | null) {
    if (!file) return;
    setAnalysis(null);
    setStatus("idle");
    setError("");
    const asset = await buildAsset(file);
    if (kind === "drama") setDrama((prev) => replaceAsset(prev, asset));
    if (kind === "adVideo") setAdVideo((prev) => replaceAsset(prev, asset));
    rememberAsset(kind, asset);
    void saveStoredAsset(kind, asset);
  }

  function handleBrandChange(value: string) {
    setBrand(value);
    window.localStorage.setItem(DEMO_BRAND_KEY, value);
  }

  async function startAnalysis() {
    if (!drama || !adVideo) return;
    setStatus("analyzing");
    setError("");
    setAnalysis(null);

    try {
      const result = await runProductAnalysis({
        drama_file: drama.file.name,
        drama_duration: drama.duration,
        drama_size: drama.size,
        ad_file: adVideo.file.name,
        ad_duration: adVideo.duration,
        ad_size: adVideo.size,
        ad_image_file: "不使用广告图片",
        ad_brand: selectedBrand
      });
      setAnalysis(result);
      setStatus("done");
    } catch (caught) {
      setStatus("error");
      const message = caught instanceof Error ? caught.message : "未知错误";
      setError(`AI 分析失败：${message}`);
    }
  }

  return (
    <AppFrame>
      <div className="container-wide product-page">
        <section className="product-head">
          <h1>
            上传内容，AI 自动生成<span className="gold-text">互动广告体验</span>
          </h1>
          <div className="product-flow">
            {productSteps.map(({ step, icon: Icon, label }, index) => (
              <div className="flow-wrap" key={step}>
                <span className="flow-chip">
                  <b>{step}</b>
                  <Icon size={18} strokeWidth={1.8} />
                  {label}
                </span>
                {index < productSteps.length - 1 ? <i /> : null}
              </div>
            ))}
          </div>
        </section>

        <div className="product-grid">
          <aside className="product-panel upload-panel">
            <PanelTitle icon={CloudUpload} title="上传与分析" />
            <div className="upload-list">
              <UploadRow
                accept="video/*"
                asset={drama}
                icon={Play}
                label="剧集文件"
                onChange={(file) => handleUpload("drama", file)}
                placeholder="选择电视剧源文件"
                tag={assetTag("drama", drama)}
              />
              <UploadRow
                accept="video/*"
                asset={adVideo}
                icon={FlaskConical}
                label="广告视频"
                onChange={(file) => handleUpload("adVideo", file)}
                placeholder="选择广告源文件"
                tag={assetTag("adVideo", adVideo)}
              />
            </div>
            <label className="brand-field">
              <span>广告品牌 / 主题</span>
              <input onChange={(event) => handleBrandChange(event.target.value)} placeholder="如：金典有机奶" value={brand} />
            </label>
            <button className="analysis-button" disabled={!canAnalyze} onClick={startAnalysis} type="button">
              <Sparkles size={20} strokeWidth={1.8} />
              {status === "analyzing" ? "AI 分析中" : "开始分析"}
            </button>

            <div className="analysis-result">
              <div className="analysis-result-title">
                <span>AI</span>
                <strong>AI 分析结果</strong>
                {analysis ? <small>Qwen 3.6 Plus</small> : null}
              </div>
              <AnalysisResult analysis={analysis} error={error} status={status} />
            </div>
          </aside>

          <section className="product-panel compare-panel">
            <PanelTitle icon={Scale} title="体验对比" />
            {analysis ? (
              <>
                <ExperienceCard
                  badge="A"
                  title="传统片中广告"
                  tone="traditional"
                  sideTitle="痛点 / 劣势"
                  sideItems={analysis.pain_points}
                  active={Boolean(analysis)}
                  adSrc={adVideo?.url}
                  brand={selectedBrand}
                  dramaSrc={drama?.url}
                  insertionTime={analysis.insertion_time}
                  runKey={playbackKey}
                />
                <ExperienceCard
                  badge="B"
                  title="AdPilot 互动广告"
                  tone="adpilot"
                  sideTitle="优势亮点"
                  sideItems={analysis.advantages}
                  question={analysis.question}
                  options={analysis.options}
                  active={Boolean(analysis)}
                  adSrc={adVideo?.url}
                  brand={selectedBrand}
                  dramaSrc={drama?.url}
                  insertionTime={analysis.insertion_time}
                  runKey={playbackKey}
                />
              </>
            ) : (
              <div className="compare-empty-state">
                <strong>{status === "analyzing" ? "AI 正在生成体验对比" : "上传完成后开始分析"}</strong>
                <span>
                  {status === "analyzing"
                    ? "系统会自动生成传统广告与 AdPilot 互动广告的播放对比。"
                    : "这里会在分析完成后展示可播放的对比视频、痛点和优势亮点。"}
                </span>
              </div>
            )}
          </section>
        </div>
      </div>
    </AppFrame>
  );
}

function PanelTitle({ icon: Icon, title }: { icon: LucideIcon; title: string }) {
  return (
    <div className="product-panel-title">
      <Icon size={25} strokeWidth={1.8} />
      <h2>{title}</h2>
    </div>
  );
}

function UploadRow({
  accept,
  asset,
  icon: Icon,
  label,
  onChange,
  optional = false,
  placeholder,
  tag
}: {
  accept: string;
  asset: UploadedAsset | null;
  icon: LucideIcon;
  label: string;
  onChange: (file: File | null) => void;
  optional?: boolean;
  placeholder: string;
  tag: string;
}) {
  const inputId = useMemo(() => `upload-${label}-${Math.random().toString(36).slice(2)}`, [label]);
  return (
    <label className={asset ? "asset-row uploaded" : "asset-row"} htmlFor={inputId}>
      <input accept={accept} id={inputId} onChange={(event) => onChange(event.target.files?.[0] ?? null)} type="file" />
      <span className="asset-icon video">
        <Icon size={24} fill={Icon === Play ? "currentColor" : "none"} strokeWidth={1.8} />
      </span>
      <div>
        <strong>{asset ? asset.file.name : label}</strong>
        <small>{asset ? `${asset.duration} · ${asset.size}` : `${placeholder}${optional ? "（可选）" : ""}`}</small>
      </div>
      <span className={asset?.source === "upload" ? "asset-tag custom" : "asset-tag"}>{tag}</span>
      {asset ? (
        <Check className="asset-status-icon" size={25} strokeWidth={1.7} />
      ) : (
        <UploadCloud className="asset-status-icon" size={24} strokeWidth={1.8} />
      )}
    </label>
  );
}

function AnalysisResult({
  analysis,
  error,
  status
}: {
  analysis: ProductAnalysisResponse | null;
  error: string;
  status: "idle" | "analyzing" | "done" | "error";
}) {
  if (status === "analyzing") {
    return <div className="analysis-empty">千问正在结合上传素材生成插入点、互动问题和体验对比。</div>;
  }

  if (status === "error") {
    return <div className="analysis-empty error">{error}</div>;
  }

  if (!analysis) {
    return <div className="analysis-empty">上传剧集与广告后，点击开始分析生成真实 AI 结果。</div>;
  }

  return (
    <div className="analysis-body">
      <div className="analysis-metrics">
        <Metric icon={Timer} label="推荐插入点：" value={analysis.insertion_time} />
        <Metric icon={FlaskConical} label="推荐广告：" value={analysis.recommended_ad} />
        <Metric icon={Target} label="匹配度：" value={`${analysis.match_score}%`} />
      </div>
      <div className="analysis-reasons">
        <strong>推荐理由：</strong>
        <div>
          {analysis.reasons.map((reason) => (
          <span key={reason}>
            <CircleCheck size={14} strokeWidth={2.2} />
            {reason}
          </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="metric-line">
      <Icon size={22} strokeWidth={1.7} />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ExperienceCard({
  active,
  adSrc,
  badge,
  brand,
  dramaSrc,
  insertionTime,
  runKey,
  title,
  tone,
  sideTitle,
  sideItems,
  question,
  options
}: {
  active: boolean;
  adSrc?: string;
  badge: string;
  brand: string;
  dramaSrc?: string;
  insertionTime?: string;
  runKey: string;
  title: string;
  tone: "traditional" | "adpilot";
  sideTitle: string;
  sideItems: string[];
  question?: string;
  options?: string[];
}) {
  const displaySideItems = buildSideCopy(tone, sideItems);
  const dramaRef = useRef<HTMLVideoElement>(null);
  const adRef = useRef<HTMLVideoElement>(null);
  const insertionSeconds = Math.max(5, parseTimestamp(insertionTime ?? "0:05"));
  const [phase, setPhase] = useState<"waiting" | "drama" | "ad" | "returned">("waiting");
  const [cardVisible, setCardVisible] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [volume, setVolume] = useState(0);
  const [timeState, setTimeState] = useState({ current: 0, duration: 0 });
  const [episodeIndex, setEpisodeIndex] = useState(0);
  const [adFastForward, setAdFastForward] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const answeredRef = useRef(false);
  const hasPlayback = Boolean(active && dramaSrc && adSrc);
  const interactionPrompt = buildInteractionPrompt(brand, question, options, episodeIndex);

  useEffect(() => {
    setCardVisible(false);
    setAnswered(false);
    answeredRef.current = false;
    setSelectedOption(null);
    setIsPaused(false);
    setAdFastForward(false);
    setEpisodeIndex(0);
    setTimeState({ current: 0, duration: 0 });

    if (!hasPlayback) {
      setPhase("waiting");
      return;
    }

    setPhase("drama");

    const drama = dramaRef.current;
    const ad = adRef.current;
    if (ad) {
      ad.pause();
      ad.currentTime = 0;
      ad.playbackRate = 1;
      ad.volume = volume;
    }
    if (drama) {
      const startAt = getStartSecond(drama, insertionSeconds);
      drama.currentTime = startAt;
      drama.volume = volume;
      void drama.play().catch(() => setIsPaused(true));
    }
  }, [hasPlayback, insertionSeconds, runKey]);

  useEffect(() => {
    if (dramaRef.current) dramaRef.current.volume = volume;
    if (adRef.current) adRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    if (!adRef.current) return;
    adRef.current.playbackRate = phase === "ad" && adFastForward ? 3 : 1;
  }, [adFastForward, phase]);

  function handleDramaMetadata() {
    if (!hasPlayback || phase !== "drama") return;
    const drama = dramaRef.current;
    if (!drama) return;
    drama.currentTime = getStartSecond(drama, insertionSeconds);
    setTimeState({ current: drama.currentTime, duration: drama.duration || 0 });
    void drama.play().catch(() => setIsPaused(true));
  }

  function handleDramaTime() {
    const drama = dramaRef.current;
    if (!drama || (phase !== "drama" && phase !== "returned")) return;
    const safeInsertion = getSafeInsertion(drama, insertionSeconds);
    setTimeState({ current: drama.currentTime, duration: drama.duration || 0 });
    if (phase === "drama" && drama.currentTime >= safeInsertion - 0.08) {
      drama.pause();
      drama.currentTime = safeInsertion;
      switchToAd();
    }
  }

  function switchToAd() {
    const ad = adRef.current;
    setPhase("ad");
    setCardVisible(false);
    setAdFastForward(false);
    setTimeState({ current: 0, duration: Number.isFinite(ad?.duration) ? ad?.duration || 0 : 0 });
    setIsPaused(false);
    if (ad) {
      ad.currentTime = 0;
      ad.playbackRate = 1;
      ad.volume = volume;
      void ad.play().catch(() => setIsPaused(true));
    }
  }

  function simulateNextEpisode() {
    if (!hasPlayback || tone !== "adpilot") return;

    const drama = dramaRef.current;
    const ad = adRef.current;
    if (drama) drama.pause();

    setEpisodeIndex((index) => index + 1);
    setAnswered(false);
    answeredRef.current = false;
    setSelectedOption(null);
    setCardVisible(false);
    setPhase("ad");
    setAdFastForward(false);
    setIsPaused(false);
    setTimeState({ current: 0, duration: ad?.duration || 0 });

    if (ad) {
      ad.currentTime = 0;
      ad.playbackRate = 1;
      ad.volume = volume;
      setTimeState({ current: 0, duration: Number.isFinite(ad.duration) ? ad.duration : 0 });
      void ad.play().catch(() => setIsPaused(true));
    }
  }

  function handleAdMetadata() {
    const ad = adRef.current;
    if (!ad || phase !== "ad") return;
    setTimeState({ current: ad.currentTime, duration: Number.isFinite(ad.duration) ? ad.duration : 0 });
  }

  function handleAdTime() {
    const ad = adRef.current;
    if (!ad || phase !== "ad") return;
    setTimeState({ current: ad.currentTime, duration: Number.isFinite(ad.duration) ? ad.duration : 0 });
    if (tone === "adpilot" && !answeredRef.current) {
      const shouldShowCard = ad.currentTime >= 3 && ad.currentTime < 13;
      if (shouldShowCard && !cardVisible) setSelectedOption(null);
      setCardVisible(shouldShowCard);
    }
  }

  function chooseInteractionOption(option: string) {
    setSelectedOption(option);
    answeredRef.current = true;
    window.setTimeout(returnToDrama, 80);
  }

  function returnToDrama() {
    const drama = dramaRef.current;
    const ad = adRef.current;
    if (ad) {
      ad.pause();
      ad.playbackRate = 1;
    }
    setAnswered(true);
    answeredRef.current = true;
    setCardVisible(false);
    setSelectedOption(null);
    setPhase("returned");
    setAdFastForward(false);
    setIsPaused(false);
    if (drama) {
      drama.currentTime = getSafeInsertion(drama, insertionSeconds);
      drama.volume = volume;
      setTimeState({ current: drama.currentTime, duration: drama.duration || 0 });
      void drama.play().catch(() => setIsPaused(true));
    }
  }

  function getActiveVideo() {
    return phase === "ad" ? adRef.current : dramaRef.current;
  }

  function togglePlayback() {
    const video = getActiveVideo();
    if (!video) return;

    if (video.paused) {
      video.volume = volume;
      void video.play().then(() => setIsPaused(false)).catch(() => setIsPaused(true));
      return;
    }

    video.pause();
    setIsPaused(true);
  }

  function updateVolume(nextVolume: number) {
    const normalized = Math.min(1, Math.max(0, nextVolume));
    setVolume(normalized);
    if (dramaRef.current) dramaRef.current.volume = normalized;
    if (adRef.current) adRef.current.volume = normalized;
  }

  function seekActiveVideo(nextTime: number) {
    const video = getActiveVideo();
    if (!video || !Number.isFinite(nextTime)) return;

    const duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : timeState.duration;
    const boundedTime = Math.min(Math.max(0, nextTime), Math.max(0, duration || nextTime));

    if (phase === "drama") {
      const safeInsertion = getSafeInsertion(video, insertionSeconds);
      if (boundedTime >= safeInsertion - 0.08) {
        video.currentTime = safeInsertion;
        setTimeState({ current: safeInsertion, duration: duration || 0 });
        switchToAd();
        return;
      }
    }

    video.currentTime = boundedTime;
    setTimeState({ current: boundedTime, duration: duration || 0 });
  }

  function toggleAdFastForward() {
    if (phase !== "ad") return;
    setAdFastForward((enabled) => !enabled);
  }

  return (
    <article className={`experience-card ${tone}`}>
      <div className="experience-title">
        <b>{badge}</b>
        <h3>{title}</h3>
        {tone === "adpilot" && hasPlayback ? (
          <button className="next-episode-button" onClick={simulateNextEpisode} type="button">
            <Play size={15} fill="currentColor" strokeWidth={0} />
            模拟播放下一集
          </button>
        ) : null}
      </div>
      <div className="experience-content">
        <div className={hasPlayback ? "product-video-card sequence" : "product-video-card empty"}>
          {hasPlayback ? (
            <>
              <video
                className={phase === "ad" ? "" : "active"}
                muted={volume <= 0.02}
                onLoadedMetadata={handleDramaMetadata}
                onPause={() => setIsPaused(true)}
                onPlay={() => setIsPaused(false)}
                onTimeUpdate={handleDramaTime}
                playsInline
                preload="metadata"
                ref={dramaRef}
                src={dramaSrc}
              />
              <video
                className={phase === "ad" ? "active" : ""}
                muted={volume <= 0.02}
                onEnded={returnToDrama}
                onLoadedMetadata={handleAdMetadata}
                onPause={() => setIsPaused(true)}
                onPlay={() => setIsPaused(false)}
                onTimeUpdate={handleAdTime}
                playsInline
                preload="metadata"
                ref={adRef}
                src={adSrc}
              />
              <div className="segment-chip">{phase === "ad" ? "广告时刻" : "正片片段"}</div>
              {tone === "adpilot" && cardVisible ? (
                <div className="product-interaction" aria-live="polite">
                  <div>
                    <CircleCheck size={13} strokeWidth={2.2} />
                    完成互动可跳回正片
                    <b>3s</b>
                  </div>
                  <strong>{interactionPrompt.question}</strong>
                  <span>
                    {interactionPrompt.options.map((option, index) => (
                      <button
                        className={selectedOption === option ? "selected" : ""}
                        key={option}
                        onClick={() => chooseInteractionOption(option)}
                        style={{ fontSize: `${getInteractionOptionFontSize(option)}px` }}
                        type="button"
                      >
                        {option}
                      </button>
                    ))}
                  </span>
                  <small>10s 后自动收起</small>
                </div>
              ) : null}
              <MediaControls
                isPaused={isPaused}
                adFastForward={adFastForward}
                onSeek={seekActiveVideo}
                onToggleAdFastForward={toggleAdFastForward}
                onTogglePlayback={togglePlayback}
                onVolumeChange={updateVolume}
                phase={phase}
                timeState={timeState}
                volume={volume}
              />
            </>
          ) : (
            <span>{active ? "请同时上传剧集和广告视频" : "AI 分析完成后自动播放对比"}</span>
          )}
        </div>
        <aside className="experience-side">
          <h4>{sideTitle}</h4>
          {displaySideItems.length ? (
            displaySideItems.map((item, index) => {
              const icons = tone === "traditional" ? [Timer, LockKeyhole, Frown] : [Sparkles, CircleCheck, BarChart3];
              const Icon = icons[index] ?? CircleCheck;
              return (
                <div className="side-point" key={item}>
                  <Icon size={20} strokeWidth={1.7} />
                  <span>{item}</span>
                </div>
              );
            })
          ) : (
            <div className="side-placeholder">AI 分析完成后生成</div>
          )}
        </aside>
      </div>
    </article>
  );
}

function MediaControls({
  adFastForward,
  isPaused,
  onSeek,
  onToggleAdFastForward,
  onTogglePlayback,
  onVolumeChange,
  phase,
  timeState,
  volume
}: {
  adFastForward: boolean;
  isPaused: boolean;
  onSeek: (time: number) => void;
  onToggleAdFastForward: () => void;
  onTogglePlayback: () => void;
  onVolumeChange: (volume: number) => void;
  phase: "waiting" | "drama" | "ad" | "returned";
  timeState: { current: number; duration: number };
  volume: number;
}) {
  const duration = Number.isFinite(timeState.duration) && timeState.duration > 0 ? timeState.duration : 0;
  const progress = duration ? Math.min(100, Math.max(0, (timeState.current / duration) * 100)) : 0;
  return (
    <div className="product-media-controls">
      <div className="media-progress">
        <span style={{ width: `${progress}%` }} />
        <i style={{ left: `${progress}%` }} />
        <input
          aria-label="视频进度"
          disabled={!duration}
          max={duration || 0}
          min="0"
          onChange={(event) => onSeek(Number(event.target.value))}
          step="0.1"
          type="range"
          value={duration ? Math.min(timeState.current, duration) : 0}
        />
      </div>
      <div className="media-control-row">
        <div>
          <button aria-label={isPaused ? "播放" : "暂停"} onClick={onTogglePlayback} type="button">
            {isPaused || phase === "waiting" ? (
              <Play size={19} fill="currentColor" strokeWidth={0} />
            ) : (
              <Pause size={19} fill="currentColor" strokeWidth={0} />
            )}
          </button>
          {volume <= 0.02 ? <VolumeX size={20} strokeWidth={2} /> : <Volume2 size={20} strokeWidth={2} />}
          <input
            aria-label="音量"
            max="1"
            min="0"
            onChange={(event) => onVolumeChange(Number(event.target.value))}
            step="0.01"
            type="range"
            value={volume}
          />
          <span>
            {phase === "ad" ? "广告" : "正片"} {formatMediaClock(timeState.current)} / {formatMediaClock(timeState.duration)}
          </span>
          {phase === "ad" ? (
            <button
              aria-pressed={adFastForward}
              className={adFastForward ? "speed-button active" : "speed-button"}
              onClick={onToggleAdFastForward}
              type="button"
            >
              3X
            </button>
          ) : null}
        </div>
        <div>
          <Settings size={19} strokeWidth={2.2} />
          <Maximize size={20} strokeWidth={2.2} />
        </div>
      </div>
    </div>
  );
}

async function buildAsset(file: File): Promise<UploadedAsset> {
  const url = URL.createObjectURL(file);
  const duration = await readVideoDuration(url);
  return {
    file,
    url,
    duration,
    size: formatFileSize(file.size),
    source: "upload"
  };
}

async function loadDefaultAsset(kind: DemoAssetKind): Promise<UploadedAsset | null> {
  try {
    const config = defaultDemoAssets[kind];
    const file = new File([], config.fileName, {
      type: config.type,
      lastModified: Date.now()
    });

    return {
      file,
      url: config.path,
      duration: await readVideoDuration(config.path),
      size: await readRemoteFileSize(config.path),
      source: "default"
    };
  } catch {
    return null;
  }
}

function replaceAsset(previous: UploadedAsset | null, next: UploadedAsset) {
  revokeAssetUrl(previous);
  return next;
}

function revokeAssetUrl(asset: UploadedAsset | null) {
  if (asset?.source === "upload" && asset.url) URL.revokeObjectURL(asset.url);
}

function openDemoDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB is unavailable"));
      return;
    }

    const request = window.indexedDB.open(DEMO_DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(DEMO_STORE_NAME)) {
        db.createObjectStore(DEMO_STORE_NAME, { keyPath: "id" });
      }
    };
    request.onerror = () => reject(request.error ?? new Error("Failed to open IndexedDB"));
    request.onsuccess = () => resolve(request.result);
  });
}

function toStoredAsset(kind: DemoAssetKind, asset: UploadedAsset): StoredAsset {
  return {
    id: kind,
    file: asset.file,
    name: asset.file.name,
    type: asset.file.type,
    lastModified: asset.file.lastModified,
    duration: asset.duration,
    size: asset.size
  };
}

function rememberAsset(kind: DemoAssetKind, asset: UploadedAsset) {
  memoryUploads[kind] = toStoredAsset(kind, asset);
}

async function loadRememberedAsset(kind: DemoAssetKind) {
  const remembered = memoryUploads[kind];
  if (remembered) return createUploadedAsset(remembered);
  return loadStoredAsset(kind);
}

async function createUploadedAsset(stored: StoredAsset): Promise<UploadedAsset> {
  const file =
    stored.file instanceof File
      ? stored.file
      : new File([stored.file], stored.name, {
          type: stored.type,
          lastModified: stored.lastModified
        });
  const url = URL.createObjectURL(file);

  return {
    file,
    url,
    duration: stored.duration || (await readVideoDuration(url)),
    size: stored.size || formatFileSize(file.size),
    source: "upload"
  };
}

async function saveStoredAsset(kind: DemoAssetKind, asset: UploadedAsset) {
  try {
    const db = await openDemoDatabase();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(DEMO_STORE_NAME, "readwrite");
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error("Failed to save upload"));
      transaction.objectStore(DEMO_STORE_NAME).put(toStoredAsset(kind, asset));
    });
    db.close();
  } catch {
    // The page still works if the browser blocks local persistence.
  }
}

async function loadStoredAsset(kind: DemoAssetKind): Promise<UploadedAsset | null> {
  try {
    const db = await openDemoDatabase();
    const stored = await new Promise<StoredAsset | undefined>((resolve, reject) => {
      const transaction = db.transaction(DEMO_STORE_NAME, "readonly");
      const request = transaction.objectStore(DEMO_STORE_NAME).get(kind);
      request.onerror = () => reject(request.error ?? new Error("Failed to load upload"));
      request.onsuccess = () => resolve(request.result as StoredAsset | undefined);
      transaction.oncomplete = () => db.close();
      transaction.onerror = () => reject(transaction.error ?? new Error("Failed to load upload"));
    });

    if (!stored?.file) return null;
    memoryUploads[kind] = stored;
    return createUploadedAsset(stored);
  } catch {
    return null;
  }
}

function readVideoDuration(url: string): Promise<string> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      const duration = Number.isFinite(video.duration) ? video.duration : 0;
      resolve(formatDuration(duration));
    };
    video.onerror = () => resolve("视频素材");
    video.src = url;
  });
}

async function readRemoteFileSize(url: string) {
  try {
    const response = await fetch(url, { method: "HEAD" });
    const length = Number(response.headers.get("content-length"));
    if (Number.isFinite(length) && length > 0) return formatFileSize(length);
  } catch {
    // Size is only display metadata; the video can still be used without it.
  }
  return "测试素材";
}

function formatDuration(seconds: number) {
  if (!seconds) return "视频素材";
  const minute = Math.floor(seconds / 60);
  const second = Math.round(seconds % 60);
  return `${minute}:${String(second).padStart(2, "0")}`;
}

function formatMediaClock(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "00:00";
  const minute = Math.floor(seconds / 60);
  const second = Math.floor(seconds % 60);
  return `${String(minute).padStart(2, "0")}:${String(second).padStart(2, "0")}`;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function inferBrand(adFile?: string) {
  const name = adFile || "上传广告素材";
  return name.replace(/\.[^.]+$/, "").replace(/[_-]/g, " ");
}

function assetTag(kind: DemoAssetKind, asset: UploadedAsset | null) {
  if (!asset || asset.source === "default") return defaultDemoAssets[kind].label;
  return kind === "drama" ? "自选视频" : "自选广告";
}

function buildSideCopy(tone: "traditional" | "adpilot", items: string[]) {
  const defaults =
    tone === "traditional"
      ? [
          "拖进度条难卡准，容易错过正片片段",
          "快进仍要等缓冲，观看连贯性被破坏",
          "只能被动等广告，用户掌控感几乎为零"
        ]
      : [
          "3 秒互动后，精准跳回正片继续帧",
          "无需拖拽快进，降低等待与操作成本",
          "互动是可选权利，用户重新获得掌控感"
        ];

  return defaults;
}

function polishSideItem(item: string | undefined, fallback: string, tone: "traditional" | "adpilot", index: number) {
  if (!item) return fallback;
  if (tone === "traditional" && index === 1) return fallback;
  if (item.length < 14 || item.length > 28) return fallback;
  return item;
}

function parseTimestamp(value: string) {
  const parts = value
    .split(":")
    .map((part) => Number(part.trim()))
    .filter((part) => Number.isFinite(part));
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 1) return parts[0];
  return 5;
}

function getSafeInsertion(video: HTMLVideoElement, insertionSeconds: number) {
  if (!Number.isFinite(video.duration) || video.duration <= 6) return insertionSeconds;
  return Math.min(Math.max(5, insertionSeconds), Math.max(5, video.duration - 1));
}

function getStartSecond(video: HTMLVideoElement, insertionSeconds: number) {
  return Math.max(0, getSafeInsertion(video, insertionSeconds) - 5);
}

function getInteractionOptionFontSize(option: string) {
  const compactLength = Array.from(option.replace(/\s+/g, "")).length;
  if (compactLength >= 8) return 8.2;
  if (compactLength >= 7) return 8.8;
  if (compactLength >= 6) return 9.4;
  if (compactLength >= 5) return 10.4;
  return 12;
}

function buildInteractionPrompt(brand: string, question: string | undefined, options: string[] | undefined, seed: number) {
  if (brand.includes("金典") || question?.includes("奶")) {
    const index = Math.abs(seed) % jindianInteractionPrompts.length;
    return jindianInteractionPrompts[index];
  }

  const fallbackOptions = options?.slice(0, 2);
  return {
    question: question || `你更看重${brand}的哪种特质？`,
    options:
      fallbackOptions?.length === 2
        ? [fallbackOptions[0], fallbackOptions[1]]
        : ["安心品质", "更好口感"]
  } satisfies InteractionPrompt;
}
