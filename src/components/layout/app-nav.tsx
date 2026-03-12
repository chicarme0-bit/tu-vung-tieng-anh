"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";

type AppNavProps = {
  isAuthenticated: boolean;
};

const links: Array<{ href: Route; label: string }> = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/vocabulary", label: "Từ vựng" },
  { href: "/review", label: "Ôn tập" },
  { href: "/quiz", label: "Quiz" },
  { href: "/settings", label: "Cài đặt" }
];

export function AppNav(_: AppNavProps) {
  const pathname = usePathname();

  return (
    <header className="topbar">
      <Link href="/" className="brand">
        TVTA
      </Link>
      <nav className="nav">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className={pathname === link.href ? "nav-link active" : "nav-link"}>
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="nav-actions">
        <span className="badge">Dùng ngay không cần tài khoản</span>
      </div>
    </header>
  );
}
