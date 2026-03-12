"use client";

import { FormEvent, useState } from "react";

type Category = {
  id: string;
  name: string;
};

type QuizQuestion = {
  vocabularyId: string;
  questionText: string;
  correctAnswer: string;
  explanation?: string | null;
  options?: string[];
};

type QuizStudioProps = {
  categories: Category[];
};

export function QuizStudio({ categories }: QuizStudioProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [config, setConfig] = useState({ direction: "EN_TO_VI", mode: "MULTIPLE_CHOICE", categoryId: "", count: 5 });
  const [result, setResult] = useState<{ score: number; correctAnswers: number; totalQuestions: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function generateQuiz(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData(event.currentTarget);
    const payload = {
      direction: String(formData.get("direction") || "EN_TO_VI"),
      mode: String(formData.get("mode") || "MULTIPLE_CHOICE"),
      categoryId: String(formData.get("categoryId") || "") || undefined,
      count: Number(formData.get("count") || 5)
    };

    const response = await fetch("/api/quiz/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json();

    if (!response.ok) {
      setError(data.error || "Không thể tạo quiz");
      setLoading(false);
      return;
    }

    setConfig({ ...payload, categoryId: payload.categoryId || "" });
    setQuestions(data.questions);
    setAnswers({});
    setLoading(false);
  }

  async function submitQuiz() {
    const response = await fetch("/api/quiz/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        direction: config.direction,
        mode: config.mode,
        categoryId: config.categoryId || undefined,
        answers: questions.map((question) => ({
          ...question,
          userAnswer: answers[question.vocabularyId] || ""
        }))
      })
    });
    const data = await response.json();

    if (!response.ok) {
      setError(data.error || "Không thể nộp quiz");
      return;
    }

    setResult({ score: data.score, correctAnswers: data.correctAnswers, totalQuestions: data.totalQuestions });
  }

  return (
    <div className="page-grid two-columns">
      <section className="panel stack-lg">
        <div>
          <p className="eyebrow">Tự tạo đề</p>
          <h1>Quiz Anh-Việt và Việt-Anh</h1>
        </div>
        <form className="stack" onSubmit={generateQuiz}>
          <div className="inline-fields">
            <select name="direction" className="input" defaultValue="EN_TO_VI">
              <option value="EN_TO_VI">Anh sang Việt</option>
              <option value="VI_TO_EN">Việt sang Anh</option>
            </select>
            <select name="mode" className="input" defaultValue="MULTIPLE_CHOICE">
              <option value="MULTIPLE_CHOICE">Trắc nghiệm</option>
              <option value="TYPING">Tự điền đáp án</option>
            </select>
          </div>
          <div className="inline-fields">
            <select name="categoryId" className="input" defaultValue="">
              <option value="">Tất cả chủ đề</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
            <input name="count" type="number" className="input" min="1" max="20" defaultValue="5" />
          </div>
          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? "Đang tạo quiz..." : "Tạo quiz"}
          </button>
        </form>
      </section>

      <section className="panel stack-lg">
        <div>
          <p className="eyebrow">Kết quả</p>
          <h2>{result ? `${result.score} điểm` : "Sẵn sàng làm bài"}</h2>
        </div>
        {result ? <p className="success-text">Đúng {result.correctAnswers}/{result.totalQuestions} câu.</p> : <p className="muted">Tạo đề bên trái để bắt đầu.</p>}
        {error ? <p className="error-text">{error}</p> : null}
      </section>

      <section className="panel stack-lg span-full">
        <div className="section-header">
          <div>
            <p className="eyebrow">Bài làm</p>
            <h2>{questions.length ? `${questions.length} câu hỏi` : "Chưa có câu hỏi nào"}</h2>
          </div>
          {questions.length ? (
            <button className="secondary-button" onClick={submitQuiz}>Nộp bài</button>
          ) : null}
        </div>

        <div className="stack-lg">
          {questions.map((question, index) => (
            <article key={question.vocabularyId} className="quiz-card">
              <p className="muted">Câu {index + 1}</p>
              <h3>{question.questionText}</h3>
              {config.mode === "MULTIPLE_CHOICE" ? (
                <div className="choice-grid">
                  {question.options?.map((option) => (
                    <button
                      type="button"
                      key={option}
                      className={answers[question.vocabularyId] === option ? "choice active" : "choice"}
                      onClick={() => setAnswers((current) => ({ ...current, [question.vocabularyId]: option }))}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              ) : (
                <input
                  className="input"
                  placeholder="Nhập đáp án"
                  value={answers[question.vocabularyId] || ""}
                  onChange={(event) => setAnswers((current) => ({ ...current, [question.vocabularyId]: event.target.value }))}
                />
              )}
              {question.explanation ? <p className="muted">Gợi ý: {question.explanation}</p> : null}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
