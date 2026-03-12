"use client";

import { useMemo, useState } from "react";

type ReviewItem = {
  id: string;
  english: string;
  vietnamese: string;
  pronunciation: string | null;
  exampleEn: string | null;
  exampleVi: string | null;
  state: string;
  dueAt: string;
  intervalDays: number;
  totalReviews: number;
  consecutiveCorrect: number;
  lapses: number;
  isDue: boolean;
};

const reviewActions = [
  { value: "AGAIN", label: "Again", hint: "lap lai som" },
  { value: "HARD", label: "Hard", hint: "giu nhip ngan" },
  { value: "GOOD", label: "Good", hint: "day lich ra vua phai" },
  { value: "EASY", label: "Easy", hint: "day lich ra xa hon" }
] as const;

export function ReviewTrainer({ items }: { items: ReviewItem[] }) {
  const [queue, setQueue] = useState(items);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const current = queue[index] ?? null;
  const dueCount = useMemo(() => queue.filter((item) => item.isDue).length, [queue]);

  if (!current) {
    return (
      <section className="panel stack-lg review-panel">
        <p className="eyebrow">Flashcard</p>
        <h1>Hang doi da xong</h1>
        <p className="muted">Ban da xu ly het the den lich. Co the quay lai quiz de tiep tuc cuong hoa tri nho.</p>
      </section>
    );
  }

  async function submit(result: string) {
    setSubmitting(true);
    setMessage(null);

    const response = await fetch("/api/review/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vocabularyId: current.id, result })
    });
    const data = await response.json();

    if (response.ok) {
      setMessage(`The nay se quay lai sau ${data.nextReviewLabel}. Trang thai moi: ${data.progress.state}.`);
      setFlipped(false);
      setQueue((itemsInQueue) => itemsInQueue.filter((item) => item.id !== current.id));
      setIndex(0);
    } else {
      setMessage(data.error || "Khong the luu ket qua on tap.");
    }

    setSubmitting(false);
  }

  return (
    <section className="panel stack-lg review-panel">
      <div className="section-header">
        <div>
          <p className="eyebrow">Spaced repetition</p>
          <h1>On tap theo lich thong minh</h1>
        </div>
        <span className="badge">{dueCount} the den lich</span>
      </div>

      <div className="review-stats-grid">
        <article className="metric-card">
          <p className="muted">Trang thai</p>
          <strong>{current.state}</strong>
        </article>
        <article className="metric-card">
          <p className="muted">Lan on</p>
          <strong>{current.totalReviews}</strong>
        </article>
        <article className="metric-card">
          <p className="muted">Dung lien tiep</p>
          <strong>{current.consecutiveCorrect}</strong>
        </article>
        <article className="metric-card">
          <p className="muted">So lan quen</p>
          <strong>{current.lapses}</strong>
        </article>
      </div>

      <button type="button" className={flipped ? "flashcard flipped" : "flashcard"} onClick={() => setFlipped((value) => !value)}>
        <div>
          <p className="muted">{flipped ? "Tieng Viet" : "Tieng Anh"}</p>
          <h2>{flipped ? current.vietnamese : current.english}</h2>
          {current.pronunciation ? <p>{current.pronunciation}</p> : null}
          {current.exampleEn ? <p className="muted">{current.exampleEn}</p> : null}
          {current.exampleVi ? <p className="muted">{current.exampleVi}</p> : null}
        </div>
      </button>

      <div className="action-row">
        {reviewActions.map((action) => (
          <button key={action.value} type="button" className="secondary-button review-action" onClick={() => submit(action.value)} disabled={submitting}>
            <span>{action.label}</span>
            <small>{action.hint}</small>
          </button>
        ))}
      </div>

      <p className="muted">
        {current.isDue ? "The nay da den lich on." : "The moi duoc chen vao hang doi de ban khoi dong bo nho."}
        {" "}
        Neu ban lam dung o quiz, he thong cung se day lich on ra xa hon.
      </p>

      {message ? <p className={message.startsWith("Khong") ? "error-text" : "success-text"}>{message}</p> : null}
    </section>
  );
}
