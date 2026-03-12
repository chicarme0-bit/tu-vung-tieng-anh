"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type AuthFormProps = {
  mode: "login" | "register";
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      email: String(formData.get("email") || ""),
      password: String(formData.get("password") || ""),
      name: String(formData.get("name") || "")
    };

    const response = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error || "Có lỗi xảy ra");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form className="panel auth-panel" onSubmit={handleSubmit}>
      <div>
        <p className="eyebrow">{mode === "login" ? "Chào mừng quay lại" : "Bắt đầu học ngay"}</p>
        <h1>{mode === "login" ? "Đăng nhập" : "Tạo tài khoản"}</h1>
      </div>

      {mode === "register" ? <input name="name" placeholder="Tên hiển thị" className="input" /> : null}
      <input name="email" type="email" placeholder="Email" className="input" required />
      <input name="password" type="password" placeholder="Mật khẩu" className="input" required />

      {error ? <p className="error-text">{error}</p> : null}

      <button className="primary-button" type="submit" disabled={loading}>
        {loading ? "Đang xử lý..." : mode === "login" ? "Đăng nhập" : "Tạo tài khoản"}
      </button>
    </form>
  );
}
