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
      setError(data.error || "Khong the tao quiz");
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
      setError(data.error || "Khong the nop quiz");
      return;
    }

    setResult({ score: data.score, correctAnswers: data.correctAnswers, totalQuestions: data.totalQuestions });
  }

  return (
    <div className="page-grid two-columns">
      <section className="panel stack-lg">
        <div>
          <p className="eyebrow">Tu tao de</p>
          <h1>Quiz Anh-Viet va Viet-Anh</h1>
        </div>
        <form className="stack" onSubmit={generateQuiz}>
          <div className="inline-fields">
            <select name="direction" className="input" defaultValue="EN_TO_VI">
              <option value="EN_TO_VI">Anh sang Viet</option>
              <option value="VI_TO_EN">Viet sang Anh</option>
            </select>
            <select name="mode" className="input" defaultValue="MULTIPLE_CHOICE">
              <option value="MULTIPLE_CHOICE">Trac nghiem</option>
              <option value="TYPING">Tu dien dap an</option>
            </select>
          </div>
          <div className="inline-fields">
            <select name="categoryId" className="input" defaultValue="">
              <option value="">Tat ca chu de</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
            <input name="count" type="number" className="input" min="1" max="20" defaultValue="5" />
          </div>
          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? "Dang tao quiz..." : "Tao quiz"}
          </button>
        </form>
      </section>

      <section className="panel stack-lg">
        <div>
          <p className="eyebrow">Ket qua</p>
          <h2>{result ? `${result.score} diem` : "San sang lam bai"}</h2>
        </div>
        {result ? <p className="success-text">Dung {result.correctAnswers}/{result.totalQuestions} cau.</p> : <p className="muted">Tao de ben trai de bat dau.</p>}
        {error ? <p className="error-text">{error}</p> : null}
      </section>

      <section className="panel stack-lg span-full">
        <div className="section-header">
          <div>
            <p className="eyebrow">Bai lam</p>
            <h2>{questions.length ? `${questions.length} cau hoi` : "Chua co cau hoi nao"}</h2>
          </div>
          {questions.length ? (
            <button className="secondary-button" onClick={submitQuiz}>Nop bai</button>
          ) : null}
        </div>

        <div className="stack-lg">
          {questions.map((question, index) => (
            <article key={question.vocabularyId} className="quiz-card">
              <p className="muted">Cau {index + 1}</p>
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
                  placeholder="Nhap dap an"
                  value={answers[question.vocabularyId] || ""}
                  onChange={(event) => setAnswers((current) => ({ ...current, [question.vocabularyId]: event.target.value }))}
                />
              )}
              {question.explanation ? <p className="muted">Goi y: {question.explanation}</p> : null}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
