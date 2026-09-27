"use client";

import { useState } from "react";

import type { Dictionary } from "@/lib/i18n";

export function ChallengeForm({ slug, dict }: { slug: string; dict: Dictionary }) {
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/challenge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug,
        kind: form.get("kind"),
        name: form.get("name"),
        organization: form.get("organization"),
        body: form.get("body"),
      }),
    });
    setStatus(response.ok ? "ok" : "error");
  }

  return (
    <form onSubmit={onSubmit} className="mt-12 grid max-w-xl gap-4 border-t border-rule pt-8">
      <h3 className="editorial text-2xl">{dict.challenge.submit}</h3>
      <label className="grid gap-2">
        <span className="text-[0.7rem] uppercase tracking-[0.14em] text-muted">{dict.challenge.kind}</span>
        <select name="kind" className="border border-rule bg-paper p-2">
          {Object.entries(dict.challenge.kinds).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-2">
        <span className="text-[0.7rem] uppercase tracking-[0.14em] text-muted">{dict.challenge.name}</span>
        <input name="name" required className="border border-rule bg-paper p-2" />
      </label>
      <label className="grid gap-2">
        <span className="text-[0.7rem] uppercase tracking-[0.14em] text-muted">{dict.challenge.organization}</span>
        <input name="organization" className="border border-rule bg-paper p-2" />
      </label>
      <label className="grid gap-2">
        <span className="text-[0.7rem] uppercase tracking-[0.14em] text-muted">{dict.challenge.body}</span>
        <textarea name="body" required rows={5} className="border border-rule bg-paper p-2" />
      </label>
      <button type="submit" className="w-fit border border-ink bg-ink px-5 py-2 text-[0.72rem] uppercase tracking-[0.14em] text-paper">
        {dict.challenge.submit}
      </button>
      <p aria-live="polite">{status === "ok" ? dict.challenge.success : status === "error" ? dict.challenge.error : null}</p>
    </form>
  );
}
