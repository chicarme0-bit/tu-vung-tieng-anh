import Link from "next/link";

import { requireSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireSessionUser();

  const [vocabularyCount, reviewDue, learningCount, maturedCount, recentAttempts, categories] = await Promise.all([
    prisma.vocabulary.count(),
    prisma.userVocabularyProgress.count({
      where: {
        userId: user.id,
        dueAt: {
          lte: new Date()
        }
      }
    }),
    prisma.userVocabularyProgress.count({
      where: {
        userId: user.id,
        state: {
          in: ["LEARNING", "RELEARNING"]
        }
      }
    }),
    prisma.userVocabularyProgress.count({
      where: {
        userId: user.id,
        state: "REVIEW",
        intervalDays: {
          gte: 7
        }
      }
    }),
    prisma.quizAttempt.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { category: true }
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } })
  ]);

  return (
    <div className="page-grid dashboard-grid">
      <section className="panel welcome-panel span-full">
        <p className="eyebrow">Xin chào, {user.name || user.email}</p>
        <h1>Dashboard học từ vựng</h1>
        <p className="lead">Hệ thống ôn tập giờ ưu tiên các thẻ đến hạn, tách riêng từ đang học và từ đã nhớ bền vững.</p>
      </section>

      <article className="metric-card panel">
        <p className="muted">Tổng từ vựng</p>
        <span className="metric-value">{vocabularyCount}</span>
      </article>
      <article className="metric-card panel">
        <p className="muted">Đến lịch hôm nay</p>
        <span className="metric-value">{reviewDue}</span>
      </article>
      <article className="metric-card panel">
        <p className="muted">Đang học</p>
        <span className="metric-value">{learningCount}</span>
      </article>
      <article className="metric-card panel">
        <p className="muted">Nhớ bền vững</p>
        <span className="metric-value">{maturedCount}</span>
      </article>
      <article className="metric-card panel">
        <p className="muted">Streak hiện tại</p>
        <span className="metric-value">{user.streak?.currentStreak ?? 0}</span>
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
          <Link href="/settings" className="secondary-button">Lưu Gemini API key</Link>
        </div>
      </section>

      <section className="panel stack-lg">
        <div>
          <p className="eyebrow">Chủ đề có sẵn</p>
          <h2>Khởi động nhanh</h2>
        </div>
        <div className="chip-row">
          {categories.map((category) => (
            <span key={category.id} className="badge">{category.name}</span>
          ))}
        </div>
      </section>

      <section className="panel stack-lg span-full">
        <div>
          <p className="eyebrow">Lịch sử gần đây</p>
          <h2>5 lần làm quiz mới nhất</h2>
        </div>
        <div className="attempt-list">
          {recentAttempts.length ? recentAttempts.map((attempt) => (
            <article key={attempt.id} className="attempt-card">
              <div>
                <strong>{attempt.category?.name || "Tổng hợp"}</strong>
                <p className="muted">{attempt.direction} • {attempt.mode}</p>
              </div>
              <div>
                <strong>{attempt.score} điểm</strong>
                <p className="muted">{attempt.correctAnswers}/{attempt.totalQuestions} câu đúng</p>
              </div>
            </article>
          )) : <p className="muted">Chưa có lần làm quiz nào. Hãy tạo bài đầu tiên.</p>}
        </div>
      </section>
    </div>
  );
}
