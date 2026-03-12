"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

type AppNavProps = {
  isAuthenticated: boolean;
};

const links: Array<{ href: Route; label: string }> = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/vocabulary", label: "Tu vung" },
  { href: "/review", label: "On tap" },
  { href: "/quiz", label: "Quiz" },
  { href: "/settings", label: "Cai dat" }
];

export function AppNav({ isAuthenticated }: AppNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <header className="topbar">
      <Link href="/" className="brand">
        TVTA
      </Link>
      <nav className="nav">
        {isAuthenticated
          ? links.map((link) => (
              <Link key={link.href} href={link.href} className={pathname === link.href ? "nav-link active" : "nav-link"}>
                {link.label}
              </Link>
            ))
          : null}
      </nav>
      <div className="nav-actions">
        {isAuthenticated ? (
          <button className="ghost-button" onClick={handleLogout} disabled={loading}>
            {loading ? "Dang xuat..." : "Dang xuat"}
          </button>
        ) : (
          <>
            <Link href="/login" className="ghost-button">
              Dang nhap
            </Link>
            <Link href="/register" className="primary-button small">
              Tao tai khoan
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
