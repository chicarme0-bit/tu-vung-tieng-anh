import type { Metadata } from "next";
import { Be_Vietnam_Pro, Literata } from "next/font/google";
import Link from "next/link";

import { AppNav } from "@/components/layout/app-nav";
import { getSessionUser } from "@/lib/auth";

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
  description: "MVP hoc tu vung tieng Anh voi on tap, quiz hai chieu va tich hop Gemini"
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getSessionUser();

  return (
    <html lang="vi">
      <body className={`${bodyFont.variable} ${headingFont.variable}`}>
        <div className="app-shell">
          <AppNav isAuthenticated={Boolean(user)} />
          <main className="main-content">{children}</main>
          <footer className="footer">
            <p>Học từ vựng thông minh cho người Việt, có AI hỗ trợ và lưu tiến độ theo tài khoản.</p>
            <Link href="/dashboard">Vào dashboard</Link>
          </footer>
        </div>
      </body>
    </html>
  );
}
