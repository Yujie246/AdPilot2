import {
  CircleCheck,
  Gauge,
  Maximize,
  Pause,
  Settings,
  Sparkles,
  Volume2
} from "lucide-react";
import { AppFrame } from "@/components/AppFrame";
import { GoldButton } from "@/components/Glass";
import { productPillars } from "@/lib/data";

export default function Home() {
  return (
    <AppFrame>
      <div className="container-wide hero-layout">
        <section>
          <h1 className="hero-title">
            <span className="hero-title-line">剧中广告的新形态：</span>
            <br />
            <span className="gold-text">让广告被回应</span>
          </h1>
          <p className="muted-lead">
            AdPilot 将剧中广告升级为可互动广告：用户完成 3s轻互动，即可提前结束剧中广告，精准回到正片。
          </p>
          <div className="pillar-row">
            {productPillars.map((item) => (
              <div className="pillar-card" key={item.side}>
                <item.icon size={30} strokeWidth={1.6} />
                <div>
                  <small>{item.side}</small>
                  <strong>{item.title}</strong>
                  <span>{item.desc}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="hero-actions">
            <GoldButton href="/demo" icon={Sparkles}>
              体验产品
            </GoldButton>
          </div>
        </section>

        <section className="hero-console" aria-label="AdPilot 产品预览">
          <div className="ad-preview-player">
            <div className="ad-preview-stage">
              <img src="/assets/ad-drive-future.png" alt="金色夜景汽车广告画面" />
              <span className="ad-moment-badge">
                <i />
                广告时刻
              </span>
              <div className="ad-interaction-card">
                <div className="ad-return-row">
                  <span>
                    <CircleCheck size={14} strokeWidth={2.4} />
                    完成后跳回正片，预计节省12秒
                  </span>
                  <b>5s</b>
                </div>
                <strong>这辆车最吸引你的是？</strong>
                <div className="ad-choice-row">
                  <button className="selected" type="button">
                    <Gauge size={17} strokeWidth={2.1} />
                    推背加速
                  </button>
                  <button type="button">
                    <Sparkles size={17} strokeWidth={2.1} />
                    未来科技
                  </button>
                </div>
              </div>
            </div>
            <div className="ad-player-chrome">
              <div className="ad-player-progress">
                <span />
                <i />
              </div>
              <div className="ad-player-controls">
                <div>
                  <Pause size={24} fill="currentColor" strokeWidth={0} />
                  <Volume2 size={25} strokeWidth={2.2} />
                  <span>25:36 / 46:21</span>
                </div>
                <div>
                  <Settings size={24} strokeWidth={2.4} />
                  <Maximize size={25} strokeWidth={2.4} />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AppFrame>
  );
}
