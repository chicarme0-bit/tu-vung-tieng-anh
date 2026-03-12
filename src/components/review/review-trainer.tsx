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
  { value: "AGAIN", label: "Again", hint: "lặp lại sớm" },
  { value: "HARD", label: "Hard", hint: "giữ nhịp ngắn" },
  { value: "GOOD", label: "Good", hint: "đẩy lịch ra vừa phải" },
  { value: "EASY", label: "Easy", hint: "đẩy lịch ra xa hơn" }
] as const;

export function ReviewTrainer({ items }: { items: ReviewItem[] }) {
  const [queue, setQueue] = useState(items);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const current = queue[index] ?? null;
  const dueCount = useMemo(() => queue.filter((item) => item.isDue).length, [queue]);

  if (!current) {
    return (
      <section className="panel stack-lg review-panel">
        <p className="eyebrow">Flashcard</p>
        <h1>Hàng đợi đã xong</h1>
        <p className="muted">Bạn đã xử lý hết thẻ đến lịch. Có thể quay lại quiz để tiếp tục củng cố trí nhớ.</p>
      </section>
    );
  }

  async function submit(result: string) {
    setMessage(`Đã lưu lựa chọn ${result}. Trong bản demo này, tiến độ được xử lý ngay trên trình duyệt.`);
    setFlipped(false);
    setQueue((itemsInQueue) => itemsInQueue.filter((item) => item.id !== current.id));
    setIndex(0);
  }

  return (
    <section className="panel stack-lg review-panel">
      <div className="section-header">
        <div>
          <p className="eyebrow">Spaced repetition</p>
          <h1>Ôn tập theo lịch thông minh</h1>
        </div>
        <span className="badge">{dueCount} thẻ đến lịch</span>
      </div>

      <div className="review-stats-grid">
        <article className="metric-card">
          <p className="muted">Trạng thái</p>
          <strong>{current.state}</strong>
        </article>
        <article className="metric-card">
          <p className="muted">Lần ôn</p>
          <strong>{current.totalReviews}</strong>
        </article>
        <article className="metric-card">
          <p className="muted">Đúng liên tiếp</p>
          <strong>{current.consecutiveCorrect}</strong>
        </article>
        <article className="metric-card">
          <p className="muted">Số lần quên</p>
          <strong>{current.lapses}</strong>
        </article>
      </div>

      <button type="button" className={flipped ? "flashcard flipped" : "flashcard"} onClick={() => setFlipped((value) => !value)}>
        <div>
          <p className="muted">{flipped ? "Tiếng Việt" : "Tiếng Anh"}</p>
          <h2>{flipped ? current.vietnamese : current.english}</h2>
          {current.pronunciation ? <p>{current.pronunciation}</p> : null}
          {current.exampleEn ? <p className="muted">{current.exampleEn}</p> : null}
          {current.exampleVi ? <p className="muted">{current.exampleVi}</p> : null}
        </div>
      </button>

      <div className="action-row">
        {reviewActions.map((action) => (
          <button key={action.value} type="button" className="secondary-button review-action" onClick={() => submit(action.value)}>
            <span>{action.label}</span>
            <small>{action.hint}</small>
          </button>
        ))}
      </div>

      <p className="muted">
        {current.isDue ? "Thẻ này đã đến lịch ôn." : "Thẻ mới được chèn vào hàng đợi để bạn khởi động bộ nhớ."}
        {" "}
        Phiên bản demo hiện lưu tương tác tại chỗ để website hoạt động ổn định trên Netlify.
      </p>

      {message ? <p className="success-text">{message}</p> : null}
    </section>
  );
}
