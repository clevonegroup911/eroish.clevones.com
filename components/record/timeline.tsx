"use client";

import { useMemo, useState } from "react";
import type { RecordEvent, SourceLink, VerificationStatus } from "@prisma/client";

import { StatusChip } from "@/components/ui/status-chip";
import type { Dictionary, Locale } from "@/lib/i18n";

const FILTERS = ["ALL", "DECISION", "ACTION", "RESULT", "MILESTONE", "LESSON", "PUBLIC_EVENT"] as const;

type Row = RecordEvent & { sources: SourceLink[] };

export function RecordTimeline({
  locale,
  dict,
  items,
}: {
  locale: Locale;
  dict: Dictionary;
  items: Row[];
}) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("ALL");

  const visible = useMemo(
    () => (filter === "ALL" ? items : items.filter((item) => item.kind === filter)),
    [filter, items],
  );

  return (
    <div>
      <div className="flex flex-wrap gap-2 border-b border-rule px-5 py-4 md:px-8" role="tablist" aria-label="Record filters">
        {FILTERS.map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={filter === key}
            onClick={() => {
              setFilter(key);
              void fetch("/api/analytics", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: "record_filter", path: window.location.pathname, meta: { key } }),
              });
            }}
            className={`px-3 py-1 text-[0.7rem] uppercase tracking-[0.12em] border ${
              filter === key ? "border-ink bg-ink text-paper" : "border-rule"
            }`}
          >
            {dict.record.filters[key]}
          </button>
        ))}
      </div>
      {visible.length === 0 ? (
        <p className="px-5 py-16 text-muted md:px-8">{dict.record.empty}</p>
      ) : (
        <ol className="divide-y divide-rule">
          {visible.map((item) => (
            <li key={item.id} className="grid gap-6 px-5 py-10 md:grid-cols-[7rem_1fr] md:px-8">
              <p className="text-[0.7rem] uppercase tracking-[0.16em] text-muted">{item.year ?? "—"}</p>
              <div>
                <StatusChip
                  status={item.verification as VerificationStatus}
                  locale={locale}
                  example={item.exampleFlag}
                />
                <h2 className="editorial mt-3 text-3xl">
                  {locale === "fr" ? item.titleFr : item.titleEn}
                </h2>
                <p className="mt-2 text-sm uppercase tracking-[0.12em] text-muted">{item.kind}</p>
                <dl className="mt-6 grid gap-4 md:grid-cols-2">
                  <Field label={dict.record.fields.context} value={locale === "fr" ? item.contextFr : item.contextEn} />
                  <Field label={dict.record.fields.decision} value={locale === "fr" ? item.decisionFr : item.decisionEn} />
                  <Field label={dict.record.fields.action} value={locale === "fr" ? item.actionFr : item.actionEn} />
                  <Field label={dict.record.fields.result} value={locale === "fr" ? item.resultFr : item.resultEn} />
                  <Field label={dict.record.fields.lesson} value={locale === "fr" ? item.lessonFr : item.lessonEn} />
                </dl>
                <p className="mt-4 text-sm text-muted">
                  {dict.record.fields.evidence}:{" "}
                  {item.sources.map((source) => source.label).join(" · ") || "—"}
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[0.68rem] uppercase tracking-[0.14em] text-muted">{label}</dt>
      <dd className="mt-1">{value}</dd>
    </div>
  );
}
