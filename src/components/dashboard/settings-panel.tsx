"use client";

import { FormEvent, useEffect, useState } from "react";

type SettingsPanelProps = {
  currentHint: string | null;
};

const STORAGE_KEY = "tvta-demo-gemini-key";

export function SettingsPanel({ currentHint }: SettingsPanelProps) {
  const [status, setStatus] = useState<string | null>(currentHint ? `API key đang lưu: ${currentHint}` : null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);

    if (saved) {
      setStatus(`API key demo đang lưu cục bộ: ${saved.slice(0, 3)}...${saved.slice(-3)}`);
    }
  }, []);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const apiKey = String(formData.get("apiKey") || "");
    window.localStorage.setItem(STORAGE_KEY, apiKey);

    setStatus("Đã lưu API key ở trình duyệt hiện tại để demo giao diện.");
    setLoading(false);
    event.currentTarget.reset();
  }

  return (
    <section className="panel stack-lg settings-panel">
      <div>
        <p className="eyebrow">Tích hợp AI</p>
        <h1>Cài đặt Gemini</h1>
      </div>
      <form className="stack" onSubmit={handleSave}>
        <input name="apiKey" className="input" type="password" placeholder="Nhập Gemini API key" required />
        <button className="primary-button" type="submit" disabled={loading}>
          {loading ? "Đang lưu..." : "Lưu API key"}
        </button>
      </form>
      <p className="muted">Phiên bản demo hiện lưu API key cục bộ trong trình duyệt để tránh lỗi server khi triển khai.</p>
      {status ? <p className="success-text">{status}</p> : null}
    </section>
  );
}
