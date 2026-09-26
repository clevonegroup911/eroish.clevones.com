"use client";

import type { ProofItem, SourceLink, VerificationStatus } from "@prisma/client";

import { StatusChip } from "@/components/ui/status-chip";
import type { Dictionary, Locale } from "@/lib/i18n";

type Row = ProofItem & { sources: SourceLink[] };

export function ProofGraph({
  locale,
  dict,
  items,
}: {
  locale: Locale;
  dict: Dictionary;
  items: Row[];
}) {
  return (
    <div className="px-5 py-12 md:px-8">
      <svg viewBox="0 0 800 220" className="mb-12 w-full border border-rule bg-paper-2" role="img" aria-label={dict.proof.title}>
        <text x="40" y="36" className="fill-muted" fontSize="11" letterSpacing="2">
          EJC
        </text>
        {items.map((item, index) => {
          const x = 80 + index * 170;
          return (
            <g key={item.id}>
              <line x1="70" y1="110" x2={x} y2="110" stroke="#c8c2b4" />
              <circle cx={x} cy="110" r="10" fill={item.verification === "VERIFIED" ? "#1f4d3c" : "#8a3d2f"} />
              <text x={x} y="150" textAnchor="middle" fontSize="10" fill="#5f5c54">
                {item.slug.slice(0, 16)}
              </text>
            </g>
          );
        })}
      </svg>
      <ul className="grid gap-6 md:grid-cols-2">
        {items.map((item) => (
          <li key={item.id} className="border border-rule p-5">
            <StatusChip status={item.verification as VerificationStatus} locale={locale} example={item.exampleFlag} />
            <h2 className="editorial mt-3 text-2xl">{locale === "fr" ? item.claimFr : item.claimEn}</h2>
            <p className="mt-3 text-ink-soft">{locale === "fr" ? item.contextFr : item.contextEn}</p>
            <p className="mt-3 text-sm">{locale === "fr" ? item.evidenceFr : item.evidenceEn}</p>
            <p className="mt-4 text-sm text-muted">
              {dict.record.fields.evidence}: {item.sources.map((source) => source.label).join(" · ")}
            </p>
            <button
              type="button"
              className="mt-4 text-[0.7rem] uppercase tracking-[0.12em] underline"
              onClick={() => {
                void fetch("/api/analytics", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    name: "verify_claim",
                    path: window.location.pathname,
                    meta: { slug: item.slug },
                  }),
                });
              }}
            >
              {locale === "fr" ? "Inspecter" : "Inspect"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
