"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { exploreItems, type Dictionary, type Locale } from "@/lib/i18n";

export function ExploreLayer({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const items = exploreItems[locale];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(q) || item.keywords.toLowerCase().includes(q),
    );
  }, [items, query]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      inputRef.current?.focus();
      void fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "explore_open", path: window.location.pathname, locale }),
      });
    }
  }, [open, locale]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-3 border border-current px-4 py-2 text-[0.72rem] tracking-[0.16em] uppercase"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        {dict.explore.title}
        <kbd className="hidden sm:inline text-[0.65rem] tracking-normal opacity-70">⌘K</kbd>
      </button>
      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={dict.explore.title}
          className="fixed inset-0 z-50 flex items-start justify-center bg-ink/55 px-4 pt-[12vh]"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-xl border border-rule bg-paper p-4 shadow-none"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="mb-3 text-[0.7rem] uppercase tracking-[0.16em] text-muted">
              {dict.explore.hint}
            </p>
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full border-b border-ink bg-transparent py-2 text-lg outline-none"
              placeholder={dict.explore.title}
              aria-label={dict.explore.title}
            />
            <ul className="mt-4 max-h-80 overflow-auto">
              {filtered.length === 0 ? (
                <li className="py-3 text-muted">{dict.explore.empty}</li>
              ) : (
                filtered.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className="flex w-full items-center justify-between py-2 text-left hover:underline"
                    >
                      <span>{item.label}</span>
                      <span aria-hidden className="text-muted">
                        →
                      </span>
                    </a>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      ) : null}
    </>
  );
}
