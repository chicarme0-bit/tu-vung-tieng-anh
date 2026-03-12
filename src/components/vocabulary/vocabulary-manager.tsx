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
      setError(data.error || "Khong the tao tu vung");
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
      setError(data.error || "Khong the tao tu voi Gemini");
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
          <p className="eyebrow">Quan ly tu vung</p>
          <h2>Them tu moi</h2>
        </div>
        <form className="stack" onSubmit={handleCreate}>
          <input name="english" className="input" placeholder="Tu tieng Anh" required />
          <input name="vietnamese" className="input" placeholder="Nghia tieng Viet" required />
          <input name="pronunciation" className="input" placeholder="Phien am" />
          <input name="exampleEn" className="input" placeholder="Vi du tieng Anh" />
          <input name="exampleVi" className="input" placeholder="Vi du tieng Viet" />
          <div className="inline-fields">
            <select name="categoryId" className="input">
              <option value="">Chon chu de</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <input name="difficulty" type="number" min="1" max="5" defaultValue="1" className="input" />
          </div>
          <button className="primary-button" type="submit" disabled={saving}>
            {saving ? "Dang luu..." : "Luu tu vung"}
          </button>
        </form>
      </section>

      <section className="panel stack-lg">
        <div>
          <p className="eyebrow">AI ho tro</p>
          <h2>Tao bo tu bang Gemini</h2>
        </div>
        <form className="stack" onSubmit={handleGenerate}>
          <input name="topic" className="input" placeholder="Vi du: cong nghe, moi truong, marketing" required />
          <div className="inline-fields">
            <input name="amount" type="number" min="1" max="20" defaultValue="5" className="input" />
            <select name="categoryId" className="input">
              <option value="">Khong gan chu de</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <button className="secondary-button" type="submit" disabled={generating}>
            {generating ? "Dang tao..." : "Tao bang Gemini"}
          </button>
        </form>
        {error ? <p className="error-text">{error}</p> : <p className="muted">Muon dung Gemini, hay luu API key o trang Cai dat.</p>}
      </section>

      <section className="panel table-panel span-full">
        <div className="section-header">
          <div>
            <p className="eyebrow">Thu vien</p>
            <h2>{items.length} tu vung hien co</h2>
          </div>
        </div>
        <div className="vocabulary-list">
          {items.map((item) => (
            <article key={item.id} className="vocabulary-card">
              <div className="word-row">
                <strong>{item.english}</strong>
                <span className="badge">{item.category?.name || "Chua phan loai"}</span>
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
