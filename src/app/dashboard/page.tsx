import Link from "next/link";

import { demoCategories, demoDashboard } from "@/lib/demo-data";

export const dynamic = "force-static";

export default function DashboardPage() {
  return (
    <div className="page-grid dashboard-grid">
      <section className="panel welcome-panel span-full">
        <p className="eyebrow">Xin chào</p>
        <h1>Dashboard học từ vựng</h1>
        <p className="lead">Phiên bản demo này chạy trực tiếp trên web, không cần tài khoản và không phụ thuộc cơ sở dữ liệu.</p>
      </section>

      <article className="metric-card panel">
        <p className="muted">Tổng từ vựng</p>
        <span className="metric-value">{demoDashboard.vocabularyCount}</span>
      </article>
      <article className="metric-card panel">
        <p className="muted">Đến lịch hôm nay</p>
        <span className="metric-value">{demoDashboard.reviewDue}</span>
      </article>
      <article className="metric-card panel">
        <p className="muted">Đang học</p>
        <span className="metric-value">{demoDashboard.learningCount}</span>
      </article>
      <article className="metric-card panel">
        <p className="muted">Nhớ bền vững</p>
        <span className="metric-value">{demoDashboard.maturedCount}</span>
      </article>
      <article className="metric-card panel">
        <p className="muted">Streak hiện tại</p>
        <span className="metric-value">{demoDashboard.streak}</span>
      </article>

      <section className="panel stack-lg">
        <div className="section-header">
          <div>
            <p className="eyebrow">Lối đi nhanh</p>
            <h2>Bắt đầu học</h2>
          </div>
        </div>
        <div className="stack">
          <Link href="/review" className="primary-button">Mở hàng đợi ôn tập</Link>
          <Link href="/quiz" className="secondary-button">Tạo quiz mới</Link>
          <Link href="/vocabulary" className="secondary-button">Thêm và quản lý từ vựng</Link>
          <Link href="/settings" className="secondary-button">Lưu cài đặt cục bộ</Link>
        </div>
      </section>

      <section className="panel stack-lg">
        <div>
          <p className="eyebrow">Chủ đề có sẵn</p>
          <h2>Khởi động nhanh</h2>
        </div>
        <div className="chip-row">
          {demoCategories.map((category) => (
            <span key={category.id} className="badge">{category.name}</span>
          ))}
        </div>
      </section>

      <section className="panel stack-lg span-full">
        <div>
          <p className="eyebrow">Lịch sử gần đây</p>
          <h2>Lần làm quiz gần nhất</h2>
        </div>
        <div className="attempt-list">
          {demoDashboard.recentAttempts.map((attempt) => (
            <article key={attempt.id} className="attempt-card">
              <div>
                <strong>{attempt.category.name}</strong>
                <p className="muted">{attempt.direction} • {attempt.mode}</p>
              </div>
              <div>
                <strong>{attempt.score} điểm</strong>
                <p className="muted">{attempt.correctAnswers}/{attempt.totalQuestions} câu đúng</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
