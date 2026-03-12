import type { Metadata } from "next";
import { Be_Vietnam_Pro, Literata } from "next/font/google";
import Link from "next/link";

import { AppNav } from "@/components/layout/app-nav";

import "./globals.css";

const bodyFont = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"]
});

const headingFont = Literata({
  subsets: ["latin", "vietnamese"],
  variable: "--font-heading",
  weight: ["400", "600", "700", "800"]
});

export const metadata: Metadata = {
  title: "Tu Vung Tieng Anh",
  description: "MVP học từ vựng tiếng Anh với ôn tập, quiz hai chiều và tích hợp Gemini"
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body className={`${bodyFont.variable} ${headingFont.variable}`}>
        <div className="app-shell">
          <AppNav isAuthenticated />
          <main className="main-content">{children}</main>
          <footer className="footer">
            <p>Học từ vựng thông minh cho người Việt, có AI hỗ trợ và có thể dùng ngay không cần tài khoản.</p>
            <Link href="/dashboard">Vào dashboard</Link>
          </footer>
        </div>
      </body>
    </html>
  );
}
