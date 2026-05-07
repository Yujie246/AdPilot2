"use client";

import { useMemo, useState } from "react";
import { Captions, Clock3, PlayCircle, RefreshCw, ShieldCheck, Sparkles, Target, Volume2 } from "lucide-react";
import { AppFrame } from "@/components/AppFrame";
import { GhostButton, GlassPanel, GoldButton } from "@/components/Glass";
import { VideoChrome } from "@/components/VideoChrome";
import { analysisCards } from "@/lib/data";

export default function ConsolePage() {
  const [selected, setSelected] = useState(1);
  const current = useMemo(() => analysisCards[selected], [selected]);

  return (
    <AppFrame>
      <div className="container-wide">
        <section className="section-title">
          <h1>
            <span className="gold-text">AI</span> 广告导演控制台
          </h1>
          <p>AI 正在分析画面、字幕与音频节奏，寻找最适合插入广告的瞬间呼吸点。</p>
        </section>

        <div className="console-layout">
          <div>
            <GlassPanel className="analysis-stage">
              <VideoChrome image="/assets/family-breakfast.jpg" progress={57}>
                <span className="status-chip top-left">
                  <Sparkles size={14} fill="currentColor" /> 画面理解中
                </span>
                <span className="status-chip top-right">
                  <Captions size={17} /> 字幕识别
                </span>
                <span className="status-chip bottom-left">
                  <Volume2 size={17} /> 音频节奏
                </span>
                <span className="scan-line" />
                <span className="face-frame" />
                <span className="subtitle-pill">你先吃早饭吧，今天还有很多事要做。</span>
                <span className="audio-bars" aria-hidden="true">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <i key={index} />
                  ))}
                </span>
              </VideoChrome>
            </GlassPanel>

            <GlassPanel className="timeline-panel">
              {analysisCards.map((item, index) => (
                <button
                  className={selected === index ? "timeline-point best" : "timeline-point"}
                  key={item.time}
                  onClick={() => setSelected(index)}
                  type="button"
                >
                  <span className="dot" />
                  <span>
                    <strong>{item.time}</strong>
                    <span>风险{item.score.split(" ")[0]}</span>
                    <em>{item.title}</em>
                  </span>
                </button>
              ))}
            </GlassPanel>
          </div>

          <aside className="right-stack">
            <div className="top-score-grid">
              <GlassPanel className="score-card">
                <h3>
                  <Clock3 size={21} color="#ffc967" /> 最佳插入点
                </h3>
                <span className="big">{current.time}</span>
              </GlassPanel>
              <GlassPanel className="score-card">
                <h3>
                  <ShieldCheck size={21} color="#ffc967" /> 打扰风险评分
                </h3>
                <div className="risk">
                  <span className="risk-arc" />
                  <strong>{current.score}</strong>
                </div>
              </GlassPanel>
            </div>

            <GlassPanel className="ad-card">
              <div>
                <h3>
                  <PlayCircle size={20} color="#ffc967" /> 推荐广告
                </h3>
                <strong>{current.ad}</strong>
              </div>
              <img alt="金典有机奶广告" src="/assets/milk-ad.jpg" />
            </GlassPanel>

            <GlassPanel className="reason-card">
              <h3>
                <Sparkles size={20} color="#ffc967" /> AI 推荐理由
              </h3>
              <p>{current.reason}</p>
            </GlassPanel>

            <GlassPanel className="question-card">
              <h3>
                <Target size={20} color="#ffc967" /> AI 生成互动问题
              </h3>
              <div className="question-row">
                <strong>{current.question}</strong>
                <button className="option-button selected" type="button">
                  {current.options[0]}
                </button>
                <button className="option-button" type="button">
                  {current.options[1]}
                </button>
              </div>
            </GlassPanel>

            <div className="console-actions">
              <GoldButton href="/demo" icon={PlayCircle}>
                预览互动广告
              </GoldButton>
              <GhostButton href="/console" icon={RefreshCw}>
                重新生成问题
              </GhostButton>
            </div>
          </aside>
        </div>
      </div>
    </AppFrame>
  );
}
