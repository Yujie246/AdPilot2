export function AdPilotLogo({ color = "gold" }: { color?: "gold" | "color" }) {
  return (
    <span className="brand-lockup" aria-label="AdPilot">
      <span className={`brand-mark brand-mark-${color}`}>
        <img src="/assets/adpilot-logo.png" alt="" />
      </span>
      <span className="brand-name">AdPilot</span>
    </span>
  );
}
