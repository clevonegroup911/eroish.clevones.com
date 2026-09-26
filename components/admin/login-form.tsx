"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function AdminLoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password"),
      }),
    });
    if (!response.ok) {
      setError(true);
      return;
    }
    router.push(params.get("next") || "/admin");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 grid gap-4">
      <label className="grid gap-2">
        <span className="text-[0.7rem] uppercase tracking-[0.14em] text-muted">Email</span>
        <input name="email" type="email" required className="border border-rule bg-paper p-2" />
      </label>
      <label className="grid gap-2">
        <span className="text-[0.7rem] uppercase tracking-[0.14em] text-muted">Password</span>
        <input name="password" type="password" required minLength={8} className="border border-rule bg-paper p-2" />
      </label>
      <button type="submit" className="border border-ink bg-ink px-5 py-2 text-[0.72rem] uppercase tracking-[0.14em] text-paper">
        Sign in
      </button>
      {error ? <p className="text-needs">Sign-in failed.</p> : null}
    </form>
  );
}
