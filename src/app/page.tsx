import Link from "next/link";

import { getSessionUser } from "@/lib/auth";

export default async function HomePage() {
  const user = await getSessionUser();

  return (
    <section className="hero-layout">
      <div className="hero-copy">
        <p className="eyebrow">English Vocabulary Platform</p>
        <h1>Học từ vựng bằng flashcard, quiz hai chiều và Gemini theo từng tài khoản.</h1>
        <p className="lead">
          MVP này tập trung vào luồng học đơn giản: lưu từ vựng, ôn tập theo nhịp riêng, quiz Anh-Việt và Việt-Anh,
          theo dõi streak, và dùng Gemini API key cá nhân để tạo nội dung động.
        </p>
        <div className="action-row">
          <Link href={user ? "/dashboard" : "/register"} className="primary-button">
            {user ? "Mở dashboard" : "Bắt đầu miễn phí"}
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
            <p>Hướng quiz Anh-Việt và Việt-Anh</p>
          </article>
          <article className="metric-card">
            <span className="metric-value">1</span>
            <p>API key Gemini riêng cho từng user</p>
          </article>
          <article className="metric-card">
            <span className="metric-value">7d</span>
            <p>Session cookie server-side</p>
          </article>
          <article className="metric-card">
            <span className="metric-value">AES</span>
            <p>Mã hóa key trước khi lưu</p>
          </article>
        </div>
      </div>
    </section>
  );
}
