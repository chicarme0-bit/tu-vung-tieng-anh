"use client";

import { FormEvent, useState } from "react";

type SettingsPanelProps = {
  currentHint: string | null;
};

export function SettingsPanel({ currentHint }: SettingsPanelProps) {
  const [status, setStatus] = useState<string | null>(currentHint ? `API key dang luu: ${currentHint}` : null);
  const [loading, setLoading] = useState(false);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/gemini/save-key", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiKey: String(formData.get("apiKey") || "") })
    });
    const data = await response.json();

    if (!response.ok) {
      setStatus(data.error || "Khong the luu API key");
      setLoading(false);
      return;
    }

    setStatus("Da luu Gemini API key an toan o server.");
    setLoading(false);
    event.currentTarget.reset();
  }

  return (
    <section className="panel stack-lg settings-panel">
      <div>
        <p className="eyebrow">Tich hop AI</p>
        <h1>Cai dat Gemini</h1>
      </div>
      <form className="stack" onSubmit={handleSave}>
        <input name="apiKey" className="input" type="password" placeholder="Nhap Gemini API key" required />
        <button className="primary-button" type="submit" disabled={loading}>
          {loading ? "Dang luu..." : "Luu API key"}
        </button>
      </form>
      <p className="muted">Key duoc ma hoa o backend bang khoa rieng cua server va chi dung de goi Gemini tu server-side.</p>
      {status ? <p className="success-text">{status}</p> : null}
    </section>
  );
}
