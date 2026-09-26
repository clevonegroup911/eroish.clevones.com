"use client";

import { useState } from "react";

import type { Dictionary, Locale } from "@/lib/i18n";

type AskResponse = {
  kind: "answer" | "refusal";
  text: string;
  citations: { slug: string; title: string; url: string }[];
};

export function AskPanel({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AskResponse | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setResult(null);
    const response = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, locale }),
    });
    const data = (await response.json()) as AskResponse;
    setResult(data);
    setLoading(false);
  }

  return (
    <div className="px-5 py-12 md:px-8">
      <form onSubmit={onSubmit} className="max-w-2xl">
        <label htmlFor="ask-query" className="block text-[0.7rem] uppercase tracking-[0.14em] text-muted">
          {dict.ask.title}
        </label>
        <textarea
          id="ask-query"
          required
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={dict.ask.placeholder}
          className="mt-3 w-full border border-rule bg-paper p-3"
          rows={4}
        />
        <button
          type="submit"
          disabled={loading}
          className="mt-4 border border-ink bg-ink px-5 py-2 text-[0.72rem] uppercase tracking-[0.14em] text-paper disabled:opacity-60"
        >
          {dict.ask.submit}
        </button>
      </form>
      {result ? (
        <section className="mt-10 max-w-2xl border border-rule p-5" aria-live="polite">
          <p className={`status-chip ${result.kind === "refusal" ? "text-needs border-needs" : "text-verified border-verified"}`}>
            {result.kind === "refusal" ? (locale === "fr" ? "Refus" : "Refusal") : dict.ask.sources}
          </p>
          <p className="mt-4 text-lg">{result.text}</p>
          {result.citations.length ? (
            <ul className="mt-4 list-disc pl-5 text-sm">
              {result.citations.map((citation) => (
                <li key={citation.slug}>
                  <a className="underline" href={citation.url}>
                    {citation.title}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
