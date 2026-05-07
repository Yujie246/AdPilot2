"use client";

import { Expand, Pause, Play, Settings, SkipForward, Volume2 } from "lucide-react";

export function VideoChrome({
  image,
  children,
  compact = false,
  progress = 45,
  className = ""
}: {
  image: string;
  children?: React.ReactNode;
  compact?: boolean;
  progress?: number;
  className?: string;
}) {
  return (
    <div className={`video-chrome ${compact ? "compact" : ""} ${className}`}>
      <img alt="" className="video-still" src={image} />
      <div className="video-vignette" />
      {children}
      <div className="video-controls">
        <div className="progress-track">
          <span style={{ width: `${progress}%` }} />
          <i style={{ left: `${progress}%` }} />
        </div>
        <div className="control-row">
          <div className="control-left">
            <Pause size={24} />
            <SkipForward size={22} />
            <Volume2 size={22} />
            <span>00:05 / 00:15</span>
          </div>
          <div className="control-right">
            <Settings size={23} />
            <Expand size={23} />
          </div>
        </div>
      </div>
      {!compact ? (
        <button className="center-play" type="button" aria-label="播放">
          <Play fill="currentColor" size={38} />
        </button>
      ) : null}
    </div>
  );
}
