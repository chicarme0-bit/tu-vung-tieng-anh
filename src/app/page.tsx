import Link from "next/link";

import { getSessionUser } from "@/lib/auth";

export default async function HomePage() {
  const user = await getSessionUser();

  return (
    <section className="hero-layout">
      <div className="hero-copy">
        <p className="eyebrow">English Vocabulary Platform</p>
        <h1>Hoc tu vung bang flashcard, quiz hai chieu va Gemini theo tung tai khoan.</h1>
        <p className="lead">
          MVP nay tap trung vao luong hoc don gian: luu tu vung, on tap theo nhip rieng, quiz Anh-Viet va Viet-Anh,
          theo doi streak, va dung Gemini API key ca nhan de tao noi dung dong.
        </p>
        <div className="action-row">
          <Link href={user ? "/dashboard" : "/register"} className="primary-button">
            {user ? "Mo dashboard" : "Bat dau mien phi"}
          </Link>
          <Link href="/quiz" className="secondary-button">
            Xem quiz demo
          </Link>
        </div>
      </div>

      <div className="hero-panel panel">
        <div className="metric-card accent-card">
          <p className="muted">Core features</p>
          <h3>Flashcard, Quiz, Progress, Gemini</h3>
        </div>
        <div className="metric-grid">
          <article className="metric-card">
            <span className="metric-value">2</span>
            <p>Huong quiz Anh-Viet va Viet-Anh</p>
          </article>
          <article className="metric-card">
            <span className="metric-value">1</span>
            <p>API key Gemini rieng cho tung user</p>
          </article>
          <article className="metric-card">
            <span className="metric-value">7d</span>
            <p>Session cookie server-side</p>
          </article>
          <article className="metric-card">
            <span className="metric-value">AES</span>
            <p>Ma hoa key truoc khi luu</p>
          </article>
        </div>
      </div>
    </section>
  );
}
