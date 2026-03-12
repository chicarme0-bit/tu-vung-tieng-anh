"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type VocabularyItem = {
  id: string;
  english: string;
  vietnamese: string;
  pronunciation: string | null;
  exampleEn: string | null;
  exampleVi: string | null;
  source: string;
  difficulty: number;
  category: { name: string } | null;
};

type Category = {
  id: string;
  name: string;
};

type VocabularyManagerProps = {
  initialItems: VocabularyItem[];
  categories: Category[];
};

export function VocabularyManager({ initialItems, categories }: VocabularyManagerProps) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const payload = {
      english: String(formData.get("english") || ""),
      vietnamese: String(formData.get("vietnamese") || ""),
      pronunciation: String(formData.get("pronunciation") || ""),
      exampleEn: String(formData.get("exampleEn") || ""),
      exampleVi: String(formData.get("exampleVi") || ""),
      categoryId: String(formData.get("categoryId") || "") || undefined,
      difficulty: Number(formData.get("difficulty") || 1)
    };

    const response = await fetch("/api/vocabulary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json();

    if (!response.ok) {
      setError(data.error || "Không thể tạo từ vựng");
      setSaving(false);
      return;
    }

    setItems((current) => [data, ...current]);
    setSaving(false);
    event.currentTarget.reset();
    router.refresh();
  }

  async function handleGenerate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setGenerating(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const payload = {
      topic: String(formData.get("topic") || ""),
      amount: Number(formData.get("amount") || 5),
      categoryId: String(formData.get("categoryId") || "") || undefined
    };

    const response = await fetch("/api/gemini/generate-vocabulary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json();

    if (!response.ok) {
      setError(data.error || "Không thể tạo từ với Gemini");
      setGenerating(false);
      return;
    }

    setItems((current) => [...data.items, ...current]);
    setGenerating(false);
    event.currentTarget.reset();
    router.refresh();
  }

  return (
    <div className="page-grid two-columns">
      <section className="panel stack-lg">
        <div>
          <p className="eyebrow">Quản lý từ vựng</p>
          <h2>Thêm từ mới</h2>
        </div>
        <form className="stack" onSubmit={handleCreate}>
          <input name="english" className="input" placeholder="Từ tiếng Anh" required />
          <input name="vietnamese" className="input" placeholder="Nghĩa tiếng Việt" required />
          <input name="pronunciation" className="input" placeholder="Phiên âm" />
          <input name="exampleEn" className="input" placeholder="Ví dụ tiếng Anh" />
          <input name="exampleVi" className="input" placeholder="Ví dụ tiếng Việt" />
          <div className="inline-fields">
            <select name="categoryId" className="input">
              <option value="">Chọn chủ đề</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <input name="difficulty" type="number" min="1" max="5" defaultValue="1" className="input" />
          </div>
          <button className="primary-button" type="submit" disabled={saving}>
            {saving ? "Đang lưu..." : "Lưu từ vựng"}
          </button>
        </form>
      </section>

      <section className="panel stack-lg">
        <div>
          <p className="eyebrow">AI hỗ trợ</p>
          <h2>Tạo bộ từ bằng Gemini</h2>
        </div>
        <form className="stack" onSubmit={handleGenerate}>
          <input name="topic" className="input" placeholder="Ví dụ: công nghệ, môi trường, marketing" required />
          <div className="inline-fields">
            <input name="amount" type="number" min="1" max="20" defaultValue="5" className="input" />
            <select name="categoryId" className="input">
              <option value="">Không gán chủ đề</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <button className="secondary-button" type="submit" disabled={generating}>
            {generating ? "Đang tạo..." : "Tạo bằng Gemini"}
          </button>
        </form>
        {error ? <p className="error-text">{error}</p> : <p className="muted">Muốn dùng Gemini, hãy lưu API key ở trang Cài đặt.</p>}
      </section>

      <section className="panel table-panel span-full">
        <div className="section-header">
          <div>
            <p className="eyebrow">Thư viện</p>
            <h2>{items.length} từ vựng hiện có</h2>
          </div>
        </div>
        <div className="vocabulary-list">
          {items.map((item) => (
            <article key={item.id} className="vocabulary-card">
              <div className="word-row">
                <strong>{item.english}</strong>
                <span className="badge">{item.category?.name || "Chưa phân loại"}</span>
              </div>
              <p>{item.vietnamese}</p>
              {item.pronunciation ? <p className="muted">{item.pronunciation}</p> : null}
              {item.exampleEn ? <p className="muted">{item.exampleEn}</p> : null}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
