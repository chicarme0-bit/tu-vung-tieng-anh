import Link from "next/link";

export default async function HomePage() {
  return (
    <section className="hero-layout">
      <div className="hero-copy">
        <p className="eyebrow">English Vocabulary Platform</p>
        <h1>Học từ vựng bằng flashcard, quiz hai chiều và Gemini mà không cần đăng nhập.</h1>
        <p className="lead">
          Phiên bản này tập trung vào trải nghiệm dùng ngay: lưu từ vựng, ôn tập theo nhịp riêng, quiz Anh-Việt và Việt-Anh,
          theo dõi tiến độ và dùng Gemini để tạo nội dung động mà không cần tạo tài khoản.
        </p>
        <div className="action-row">
          <Link href="/dashboard" className="primary-button">
            Mở dashboard
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
            <p>Chế độ dùng ngay không cần tài khoản</p>
          </article>
          <article className="metric-card">
            <span className="metric-value">24/7</span>
            <p>Truy cập trực tiếp vào toàn bộ tính năng</p>
          </article>
          <article className="metric-card">
            <span className="metric-value">AI</span>
            <p>Tạo từ mới và câu hỏi nhanh bằng Gemini</p>
          </article>
        </div>
      </div>
    </section>
  );
}
