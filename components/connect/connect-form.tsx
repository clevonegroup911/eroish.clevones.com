"use client";

import { useState } from "react";

import { CONNECT_INTENTS } from "@/lib/connect";
import type { Dictionary, Locale } from "@/lib/i18n";

export function ConnectForm({ dict }: { locale: Locale; dict: Dictionary }) {
  const [status, setStatus] = useState<"idle" | "ok" | "error" | "limited">("idle");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    const response = await fetch("/api/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (response.status === 429) {
      setStatus("limited");
      return;
    }
    setStatus(response.ok ? "ok" : "error");
  }

  return (
    <form onSubmit={onSubmit} className="grid max-w-2xl gap-5 px-5 py-12 md:px-8">
      <label className="grid gap-2">
        <span className="text-[0.7rem] uppercase tracking-[0.14em] text-muted">{dict.connect.fields.intent}</span>
        <select name="intent" required className="border border-rule bg-paper p-2">
          {CONNECT_INTENTS.map((intent) => (
            <option key={intent} value={intent}>
              {dict.connect.intents[intent]}
            </option>
          ))}
        </select>
      </label>
      {(
        [
          ["name", dict.connect.fields.name],
          ["organization", dict.connect.fields.organization],
          ["email", dict.connect.fields.email],
        ] as const
      ).map(([name, label]) => (
        <label key={name} className="grid gap-2">
          <span className="text-[0.7rem] uppercase tracking-[0.14em] text-muted">{label}</span>
          <input
            name={name}
            type={name === "email" ? "email" : "text"}
            required
            className="border border-rule bg-paper p-2"
          />
        </label>
      ))}
      {(
        [
          ["reason", dict.connect.fields.reason],
          ["context", dict.connect.fields.context],
          ["whyEjc", dict.connect.fields.whyEjc],
          ["requestedAction", dict.connect.fields.requestedAction],
          ["supporting", dict.connect.fields.supporting],
        ] as const
      ).map(([name, label]) => (
        <label key={name} className="grid gap-2">
          <span className="text-[0.7rem] uppercase tracking-[0.14em] text-muted">{label}</span>
          <textarea name={name} required={name !== "supporting"} rows={3} className="border border-rule bg-paper p-2" />
        </label>
      ))}
      <div aria-hidden className="hidden">
        <label>
          website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <button type="submit" className="w-fit border border-ink bg-ink px-5 py-2 text-[0.72rem] uppercase tracking-[0.14em] text-paper">
        {dict.connect.submit}
      </button>
      <p aria-live="polite" className="text-sm">
        {status === "ok" ? dict.connect.success : null}
        {status === "error" ? dict.connect.error : null}
        {status === "limited" ? dict.connect.rateLimited : null}
      </p>
    </form>
  );
}
