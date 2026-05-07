import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Clock3,
  Coffee,
  Gauge,
  Leaf,
  LineChart,
  MessageCircleQuestion,
  MousePointerClick,
  Play,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  Zap
} from "lucide-react";

export const navItems = [
  { label: "首页", href: "/" },
  { label: "产品", href: "/demo" },
  { label: "品牌洞察", href: "/insights" }
];

export const analysisCards = [
  {
    time: "02:14",
    title: "不建议",
    score: "72 / 100",
    ad: "低打扰提示",
    reason: "角色情绪仍在推进，切入广告可能破坏对话节奏。",
    question: "先继续看剧情？",
    options: ["继续", "稍后"]
  },
  {
    time: "05:36",
    title: "最佳插入点",
    score: "18 / 100",
    ad: "金典有机奶",
    reason:
      "当前场景为家庭早餐后的自然停顿，对白已结束，镜头切到餐桌远景，下一段剧情尚未进入冲突。",
    question: "早餐更想喝什么？",
    options: ["有机奶", "咖啡"]
  },
  {
    time: "08:42",
    title: "谨慎",
    score: "45 / 100",
    ad: "轻提醒库存",
    reason: "镜头转换明显，但字幕仍在承接上一句对白。",
    question: "想看哪种权益？",
    options: ["会员券", "加购"]
  }
];

export const interactionSteps: Array<{ title: string; desc: string; icon: LucideIcon }> = [
  { title: "广告自然插入", desc: "AI 智能识别节点，广告自然融入剧情", icon: Play },
  { title: "轻互动完成", desc: "用户轻点卡片，完成品牌互动", icon: Zap },
  { title: "精准返回正片", desc: "点击完成即刻回正片，体验无缝衔接", icon: Target }
];

export const profileQuestions = [
  { q: "早餐您想喝什么？", answer: "有机奶", tag: "健康饮品兴趣", icon: Leaf },
  { q: "你通常什么时候喝？", answer: "早餐", tag: "早餐饮用场景", icon: Sparkles },
  { q: "一般买给谁喝？", answer: "家人", tag: "家庭消费需求", icon: Users },
  { q: "你更看重什么？", answer: "有机认证", tag: "品质安全关注", icon: ShieldCheck },
  { q: "愿意试试新品吗？", answer: "想试试", tag: "高转化意愿", icon: LineChart }
];

export const insightMetrics: Array<{ title: string; value: string; icon: LucideIcon }> = [
  { title: "互动完成率", value: "68%", icon: Gauge },
  { title: "平均互动耗时", value: "2.4 秒", icon: Clock3 },
  { title: "高意向用户占比", value: "37%", icon: Users },
  { title: "画像完成率", value: "54%", icon: BarChart3 },
  { title: "提前回正片次数", value: "12,481", icon: LineChart }
];

export const portraitBars = [
  { label: "家庭健康型", value: 42, icon: Users },
  { label: "个人品质型", value: 28, icon: Users },
  { label: "新品尝鲜型", value: 18, icon: Leaf },
  { label: "价格敏感型", value: 12, icon: Target }
];

export const questionInsights = [
  ["早餐更想喝什么？", "有机奶", "64%", "咖啡", "36%"],
  ["你通常什么时候喝？", "早餐", "56%", "睡前", "44%"],
  ["一般买给谁喝？", "家人", "61%", "自己", "39%"],
  ["你更看重什么？", "有机认证", "72%", "口感", "28%"],
  ["愿意试试新品吗？", "想试试", "37%", "先看看", "63%"]
];

export const productPillars: Array<{ side: string; title: string; desc: string; icon: LucideIcon }> = [
  { side: "用户侧", title: "少等广告", desc: "3s轻互动后，精准跳回正片。", icon: Users },
  { side: "广告侧", title: "真实反馈", desc: "了解用户主动表达的喜好", icon: MessageCircleQuestion },
  {
    side: "平台侧",
    title: "高价值库存",
    desc: "可互动、高价值的新广告位",
    icon: BarChart3
  }
];

export const brandCopy = {
  ad: "金典有机奶",
  question: "早餐更想喝什么？",
  optionA: "有机奶",
  optionB: "咖啡",
  suggestion:
    "优先触达家庭健康型消费者，在家庭早餐场景中强化“有机认证”与“家人健康”心智。",
  script: "给家人的早餐，多一份有机安心。",
  benefit: "家庭装优惠券 / 早餐组合装 / 新品试饮装",
  content: "家庭剧、都市剧、亲子内容、生活方式类内容"
};

export const actionIcons = { MousePointerClick, Coffee, MessageCircleQuestion };
