import Link from "next/link";

import { requireSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
        <p className="eyebrow">Xin chao, {user.name || user.email}</p>
        <h1>Dashboard hoc tu vung</h1>
        <p className="lead">He thong on tap gio uu tien cac the den han, tach rieng tu dang hoc va tu da nho ben vung.</p>
      </section>

      <article className="metric-card panel">
        <p className="muted">Tong tu vung</p>
        <span className="metric-value">{vocabularyCount}</span>
      </article>
      <article className="metric-card panel">
        <p className="muted">Den lich hom nay</p>
        <span className="metric-value">{reviewDue}</span>
      </article>
      <article className="metric-card panel">
        <p className="muted">Dang hoc</p>
        <span className="metric-value">{learningCount}</span>
      </article>
      <article className="metric-card panel">
        <p className="muted">Nho ben vung</p>
        <span className="metric-value">{maturedCount}</span>
      </article>
      <article className="metric-card panel">
        <p className="muted">Streak hien tai</p>
        <span className="metric-value">{user.streak?.currentStreak ?? 0}</span>
      </article>

      <section className="panel stack-lg">
        <div className="section-header">
          <div>
            <p className="eyebrow">Loi di nhanh</p>
            <h2>Bat dau hoc</h2>
          </div>
        </div>
        <div className="stack">
          <Link href="/review" className="primary-button">Mo hang doi on tap</Link>
          <Link href="/quiz" className="secondary-button">Tao quiz moi</Link>
          <Link href="/vocabulary" className="secondary-button">Them va quan ly tu vung</Link>
          <Link href="/settings" className="secondary-button">Luu Gemini API key</Link>
        </div>
      </section>

      <section className="panel stack-lg">
        <div>
          <p className="eyebrow">Chu de co san</p>
          <h2>Khoi dong nhanh</h2>
        </div>
        <div className="chip-row">
          {categories.map((category) => (
            <span key={category.id} className="badge">{category.name}</span>
          ))}
        </div>
      </section>

      <section className="panel stack-lg span-full">
        <div>
          <p className="eyebrow">Lich su gan day</p>
          <h2>5 lan lam quiz moi nhat</h2>
        </div>
        <div className="attempt-list">
          {recentAttempts.length ? recentAttempts.map((attempt) => (
            <article key={attempt.id} className="attempt-card">
              <div>
                <strong>{attempt.category?.name || "Tong hop"}</strong>
                <p className="muted">{attempt.direction} • {attempt.mode}</p>
              </div>
              <div>
                <strong>{attempt.score} diem</strong>
                <p className="muted">{attempt.correctAnswers}/{attempt.totalQuestions} cau dung</p>
              </div>
            </article>
          )) : <p className="muted">Chua co lan lam quiz nao. Hay tao bai dau tien.</p>}
        </div>
      </section>
    </div>
  );
}
