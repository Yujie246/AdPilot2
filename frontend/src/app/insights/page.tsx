import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  Clock3,
  Gift,
  Grid2X2,
  HelpCircle,
  LockKeyhole,
  Sparkles,
  Star,
  Target,
  Users
} from "lucide-react";
import { AppFrame } from "@/components/AppFrame";

type MetricCard = {
  icon: LucideIcon;
  label: string;
  value: string;
  note: string;
};

type ProcessCard = {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  bullets: string[];
};

const metrics: MetricCard[] = [
  { icon: Users, label: "有效互动事件数", value: "31,280 人", note: "基于多部剧集主题真实互动量" },
  { icon: Grid2X2, label: "识别核心人群", value: "4 类", note: "连续购买 / 行为分群洞察周围用户特征" },
  { icon: BriefcaseBusiness, label: "最高需求赛道", value: "早餐片 / 素颜冰箱", note: "高频场景需求心智显著占比最高" },
  { icon: Star, label: "最优记忆形式", value: "0.09 秒短剧工艺", note: "工艺冲突点强化记忆，记忆最强" },
  { icon: LockKeyhole, label: "最优内容方式", value: "家庭版本 + 讨论场景", note: "家庭场景与社交氛围融合，转化力最强" }
];

const processCards: ProcessCard[] = [
  {
    icon: HelpCircle,
    title: "互动采集",
    subtitle: "捕捉三层轻互动行为信号",
    bullets: ["第一秒停留或完整体验？", "有点兴趣但没点进去？", "划过也能被吸引、点击？"]
  },
  {
    icon: Clock3,
    title: "清洗信号",
    subtitle: "去噪与行为结构拆分",
    bullets: ["比如点击 / 反向滑走", "是否反复看 / 多次返回", "是否收藏 / 搜索关键词"]
  },
  {
    icon: Users,
    title: "人群聚类",
    subtitle: "基于轻互动建立场景标签",
    bullets: ["关注点聚类", "需求时机建模", "场景 / 内容偏好归纳", "价值取向识别"]
  },
  {
    icon: Target,
    title: "品牌反馈",
    subtitle: "输出品牌策略优化方向",
    bullets: ["有效受众", "核心卖点", "传播钩子", "内容方向", "洞察看板区"]
  }
];

const pathFeatures = [
  ["发现内容", "被信息流或弹窗触达内容"],
  ["浅层互动", "仅浏览视频封面与标题"],
  ["兴趣激发", "完整观看并点击商品/笔记"],
  ["深度探索", "查看用户评价 / 相关测评"],
  ["意向增强", "加入购物车 / 搜索品牌信息"],
  ["转化预判", "有转化倾向但尚未完成交易"]
];

const interactionPath = [
  ["01", "第一秒快速捕捉兴趣点", "视频信息流曝光", "停留超过阈值"],
  ["02", "完整观看关键场景内容", "短剧 / 场景展示 / 使用演示", "完整观看 > 50%"],
  ["03", "点击「想要同款」/ 商品页", "进入详情页", "跳转商品详情页"],
  ["04", "浏览产品参数 / 评论 2-3 个", "深度浏览，停留较长", "查看多模块信息"],
  ["05", "已加入购物车但未结算", "已添加，等待决策", "高购买潜力"]
];

const audienceRows = [
  ["01", "家庭早餐决策者", "28.7%", "关注家人健康、早餐习惯、认可科学/天然成分", "早餐钟意 / 实用测评 / 养生类内容", "以“家人健康”为焦点建立信任"],
  ["02", "品质精致生活者", "26.4%", "追求品质、精致生活，在意质感与体验", "颜值种草 / 好物分享 / 家居饮奶类", "强调产品设计与使用体验"],
  ["03", "健康养生型消费者", "22.1%", "注重健康、无添加概念，有营养/成分研究习惯", "成分科普 / 科研背书 / 专业评测", "强化成分与功效证据"],
  ["04", "尝鲜的控盘用户", "22.8%", "喜欢尝试新品，追求心智积累与互动讨论", "新品试用 / 众测福利 / 即时活动", "抓住新品首发与优惠机会"]
];

const heatCards = [
  ["比同类总类偏好 Top 功能占比", ["健康功效", "有机认证", "便捷体验", "安全成分", "价格实惠"]],
  ["购买决策角色占比", ["家庭主理人", "自己做决策", "和家人共同决策", "朋友推荐决策"]],
  ["正面需求/痛点关注占比", ["健康", "使用体验", "成分安全", "价格实惠", "口碑评价"]],
  ["转化不满/阻碍 直达方式占比", ["产品价值偏高", "效果不显著", "使用不便", "成分担忧", "优惠活动少"]]
];

const adviceCards = [
  ["A. 卖点聚焦", "聚焦用户大量的核心诉求，优先打造一个方向", ["健康/安全/营养：投放科普 + 成分证据", "品质/体验/颜值：场景化种草 + 设计感", "实用/高效/省心：真实案例 + 使用效果"]],
  ["B. 场景化内容塑造", "打造更贴近人群生活的内容，提升共鸣与信任", ["核心场景：早餐桌 / 素颜护肤 / 家庭收纳", "内容形式：短剧 / 测评 / Vlog / 科普", "热点话题：开箱价、结果化、多维触达"]],
  ["C. 分群投放建议", "差异化投放策略，提升转化效率与 ROI", ["家庭主妇类：亲子/家庭内容导购投放", "精致生活者：颜值/生活方式内容投放", "银发用户：新品体验 / 福利活动投放"]],
  ["D. 下一轮数据建议", "追踪更深层行为信号，持续优化洞察闭环", ["优先追踪：加购、收藏、复访、加入人群", "内容投放：增加互动型内容比例", "数据维度：地域/时间/设备/留言"]]
];

const segments = ["亲子健康关注者", "轻食健康践行者", "功效成分控人群", "颜值生活探索者", "职场效率提升人群", "价格敏感型患者", "长期复购用户"];

export default function InsightsPage() {
  return (
    <AppFrame>
      <div className="container-wide brand-insight-page">
        <section className="brand-insight-hero">
          <h1>
            连续互动生成<span className="gold-text">品牌洞察</span>
          </h1>
          <p>
            每一次轻互动中广告、笔记、一次 AI 对话的信号，AdPilot 将海量互动转化为可落地的人群分层、沟通内容、创意策略与投放建议，
            帮助品牌更高效理解用户，赢在下一步动作。
          </p>
        </section>

        <BrandSection index="1." title="本轮互动分析总览">
          <div className="bi-metric-grid">
            {metrics.map(({ icon: Icon, label, value, note }) => (
              <article className="bi-metric-card" key={label}>
                <Icon size={28} strokeWidth={1.7} />
                <span>{label}</span>
                <strong>{value}</strong>
                <small>{note}</small>
              </article>
            ))}
          </div>
        </BrandSection>

        <BrandSection index="2." title="系统如何从轻互动生成品牌洞察">
          <div className="bi-process-row">
            {processCards.map(({ icon: Icon, title, subtitle, bullets }, index) => (
              <div className="bi-process-wrap" key={title}>
                <article className="bi-process-card">
                  <Icon size={39} strokeWidth={1.7} />
                  <h3>{title}</h3>
                  <p>{subtitle}</p>
                  <ul>
                    {bullets.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>
                {index < processCards.length - 1 ? <ArrowRight className="bi-process-arrow" size={34} /> : null}
              </div>
            ))}
          </div>
        </BrandSection>

        <BrandSection index="3." title="单个用户路径示例（由高概率路径推演）">
          <div className="bi-path-layout">
            <article className="bi-path-card">
              <h3>该路径互动特征</h3>
              {pathFeatures.map(([title, desc], index) => (
                <div className="bi-path-step" key={title}>
                  <b>{index + 1}</b>
                  <span>
                    <strong>{title}</strong>
                    <small>{desc}</small>
                  </span>
                </div>
              ))}
            </article>

            <article className="bi-path-card wide">
              <h3>代表性互动路径</h3>
              {interactionPath.map(([step, title, scene, signal]) => (
                <div className="bi-interaction-row" key={step}>
                  <b>{step}</b>
                  <strong>{title}</strong>
                  <span>{scene}</span>
                  <em>信号：{signal}</em>
                </div>
              ))}
            </article>

            <article className="bi-path-card portrait">
              <h3>广告主人群画像</h3>
              <div className="bi-avatar-row">
                <span />
                <strong>家庭早睡决策者</strong>
              </div>
              {[
                ["消费动机", "为家人健康/安心买单"],
                ["核心场景", "早睡备餐 / 素颜护肤收纳"],
                ["有效卖点", "0.09 秒短剧工艺 / 有机认证"],
                ["内容偏好", "家庭日常场景 / 实用分享"],
                ["人群标签", "家庭健康主理人 / 高品质生活派"]
              ].map(([label, value]) => (
                <div className="bi-portrait-line" key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </article>
          </div>
        </BrandSection>

        <BrandSection index="4." title="核心人群分层结果（深度洞察）">
          <div className="bi-audience-table">
            <div className="bi-table-head">
              <span>人群画像</span>
              <span>典型特征关键词（理由）</span>
              <span>关键互动偏好（触点及内容）</span>
              <span>品牌侧重点与机会点</span>
            </div>
            {audienceRows.map(([rank, persona, percent, keywords, preference, chance]) => (
              <div className="bi-table-row" key={rank}>
                <div>
                  <b>{rank}</b>
                  <strong>{persona}</strong>
                  <em>{percent}</em>
                </div>
                <p>{keywords}</p>
                <p>{preference}</p>
                <p>{chance}</p>
              </div>
            ))}
          </div>
        </BrandSection>

        <BrandSection index="5." title="跨人群洞察对比">
          <div className="bi-heat-grid">
            {heatCards.map(([title, rows]) => (
              <article className="bi-heat-card" key={title as string}>
                <h3>{title as string}</h3>
                {(rows as string[]).map((row, rowIndex) => (
                  <div className="bi-heat-row" key={row}>
                    <span>{row}</span>
                    <i style={{ width: `${58 + rowIndex * 8}%` }} />
                  </div>
                ))}
              </article>
            ))}
          </div>
        </BrandSection>

        <BrandSection index="6." title="品牌牌方的核心建议">
          <div className="bi-advice-grid">
            {adviceCards.map(([title, subtitle, bullets], index) => {
              const icons = [Star, BriefcaseBusiness, Gift, BarChart3];
              const Icon = icons[index] ?? Sparkles;
              return (
                <article className="bi-advice-card" key={title as string}>
                  <Icon size={36} strokeWidth={1.6} />
                  <h3>{title as string}</h3>
                  <p>{subtitle as string}</p>
                  <ul>
                    {(bullets as string[]).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        </BrandSection>

        <section className="bi-more-panel">
          <h2>7. 更多细分人群持续生成中</h2>
          <div>
            {segments.map((segment) => (
              <span key={segment}>{segment}</span>
            ))}
          </div>
          <button type="button">
            生成广告主洞察报告
            <ArrowRight size={22} />
          </button>
          <p>报告将包含：人群分层、互动路径图谱、内容触点分布、关键词洞察、投放建议等完整分析，可直接用于下一轮投放优化与策略制定。</p>
        </section>
      </div>
    </AppFrame>
  );
}

function BrandSection({ children, index, title }: { children: ReactNode; index: string; title: string }) {
  return (
    <section className="bi-section">
      <h2>
        <span>{index}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}
