"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { navItems } from "@/lib/data";
import { AdPilotLogo } from "./AdPilotLogo";

export function AppFrame({
  children,
  logoColor = "gold"
}: {
  children: React.ReactNode;
  logoColor?: "gold" | "color";
}) {
  const pathname = usePathname();

  return (
    <main className="page-shell">
      <div className="ambient ambient-a" />
      <div className="ambient ambient-b" />
      <div className="gold-wave wave-top" />
      <div className="gold-wave wave-bottom" />
      <header className="site-header">
        <Link href="/" aria-label="AdPilot 首页">
          <AdPilotLogo color={logoColor} />
        </Link>
        <nav className="site-nav" aria-label="主导航">
          {navItems.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" || pathname === "/console" : pathname === item.href;
            return (
              <Link className={active ? "active" : ""} key={item.href} href={item.href}>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="page-content"
      >
        {children}
      </motion.div>
    </main>
  );
}
