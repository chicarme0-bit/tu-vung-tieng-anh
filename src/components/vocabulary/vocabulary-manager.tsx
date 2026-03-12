"use client";

import { FormEvent, useEffect, useState } from "react";

type VocabularyItem = {
  id: string;
  english: string;
  vietnamese: string;
  pronunciation: string | null;
  exampleEn: string | null;
  exampleVi: string | null;
  source: string;
  difficulty: number;
  categoryId?: string;
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

const STORAGE_KEY = "tvta-demo-vocabulary";

export function VocabularyManager({ initialItems, categories }: VocabularyManagerProps) {
  const [items, setItems] = useState(initialItems);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);

    if (saved) {
      setItems(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const categoryId = String(formData.get("categoryId") || "");
    const category = categories.find((item) => item.id === categoryId) ?? null;

    const payload: VocabularyItem = {
      id: `local-${Date.now()}`,
      english: String(formData.get("english") || ""),
      vietnamese: String(formData.get("vietnamese") || ""),
      pronunciation: String(formData.get("pronunciation") || "") || null,
      exampleEn: String(formData.get("exampleEn") || "") || null,
      exampleVi: String(formData.get("exampleVi") || "") || null,
      categoryId: categoryId || undefined,
      source: "MANUAL",
      difficulty: Number(formData.get("difficulty") || 1),
      category
    };

    setItems((current) => [payload, ...current]);
    setSaving(false);
    event.currentTarget.reset();
  }

  async function handleGenerate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setGenerating(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const topic = String(formData.get("topic") || "Chủ đề mới");
    const amount = Number(formData.get("amount") || 5);
    const categoryId = String(formData.get("categoryId") || "");
    const category = categories.find((item) => item.id === categoryId) ?? null;

    const generated = Array.from({ length: amount }, (_, index) => ({
      id: `gemini-demo-${Date.now()}-${index}`,
      english: `${topic} word ${index + 1}`,
      vietnamese: `Từ ${index + 1} về ${topic.toLowerCase()}`,
      pronunciation: null,
      exampleEn: `This is a demo example for ${topic} word ${index + 1}.`,
      exampleVi: `Đây là ví dụ mô phỏng cho từ ${index + 1} về ${topic.toLowerCase()}.`,
      categoryId: categoryId || undefined,
      source: "GEMINI",
      difficulty: 2,
      category
    }));

    setItems((current) => [...generated, ...current]);
    setGenerating(false);
    event.currentTarget.reset();
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
            {generating ? "Đang tạo..." : "Tạo bản demo"}
          </button>
        </form>
        {error ? <p className="error-text">{error}</p> : <p className="muted">Phiên bản hiện tại tạo dữ liệu mẫu cục bộ để demo giao diện ổn định trên web.</p>}
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
