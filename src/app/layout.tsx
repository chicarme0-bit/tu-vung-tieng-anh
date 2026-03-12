import type { Metadata } from "next";
import Link from "next/link";

import { AppNav } from "@/components/layout/app-nav";
import { getSessionUser } from "@/lib/auth";

import "./globals.css";

export const metadata: Metadata = {
  title: "Tu Vung Tieng Anh",
  description: "MVP hoc tu vung tieng Anh voi on tap, quiz hai chieu va tich hop Gemini"
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getSessionUser();

  return (
    <html lang="vi">
      <body>
        <div className="app-shell">
          <AppNav isAuthenticated={Boolean(user)} />
          <main className="main-content">{children}</main>
          <footer className="footer">
            <p>Hoc tu vung thong minh cho nguoi Viet, co AI ho tro va luu tien do theo tai khoan.</p>
            <Link href="/dashboard">Vao dashboard</Link>
          </footer>
        </div>
      </body>
    </html>
  );
}
