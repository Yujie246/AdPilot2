import type { LucideIcon } from "lucide-react";

export function GlassPanel({
  children,
  className = ""
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <section className={`glass-panel ${className}`}>{children}</section>;
}

export function IconBadge({ icon: Icon, subtle = false }: { icon: LucideIcon; subtle?: boolean }) {
  return (
    <span className={subtle ? "icon-badge subtle" : "icon-badge"}>
      <Icon size={22} strokeWidth={1.8} />
    </span>
  );
}

export function GoldButton({
  children,
  href,
  onClick,
  className = "",
  icon: Icon
}: {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  icon?: LucideIcon;
}) {
  const content = (
    <>
      {Icon ? <Icon size={24} strokeWidth={1.8} /> : null}
      <span>{children}</span>
    </>
  );

  if (href) {
    return (
      <a className={`gold-button ${className}`} href={href}>
        {content}
      </a>
    );
  }

  return (
    <button className={`gold-button ${className}`} onClick={onClick} type="button">
      {content}
    </button>
  );
}

export function GhostButton({
  children,
  href,
  onClick,
  icon: Icon
}: {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  icon?: LucideIcon;
}) {
  const content = (
    <>
      {Icon ? <Icon size={22} strokeWidth={1.8} /> : null}
      <span>{children}</span>
    </>
  );

  if (href) {
    return (
      <a className="ghost-button" href={href}>
        {content}
      </a>
    );
  }

  return (
    <button className="ghost-button" onClick={onClick} type="button">
      {content}
    </button>
  );
}
