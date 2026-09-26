"use client";

import { useEffect, useRef } from "react";

import { CONFIRMED } from "@/lib/identity";
import type { Locale } from "@/lib/i18n";

type Chapter = {
  id: string;
  year: string;
  title: string;
  body: string;
  status: "verified" | "needs";
};

export function journeyChapters(locale: Locale): Chapter[] {
  if (locale === "fr") {
    return [
      {
        id: "origin",
        year: "1994",
        title: "Origine",
        body: `Né à Kinshasa, ${CONFIRMED.birthPlaceCountryFr}, le ${CONFIRMED.birthDateDisplayFr}.`,
        status: "verified",
      },
      {
        id: "places",
        year: "—",
        title: "Une vie entre les lieux",
        body: "A grandi et vécu dans différents pays, villes et provinces. Dimension multiculturelle, cosmopolite, Third Culture Kid — les villes précises restent à confirmer.",
        status: "needs",
      },
      {
        id: "builder",
        year: "—",
        title: "Bâtisseur",
        body: "Entrepreneur, homme d’affaires, bâtisseur. Les dates de carrière détaillées ne sont pas confirmées.",
        status: "verified",
      },
      {
        id: "responsibility",
        year: "—",
        title: "Responsabilité",
        body: `Fondateur et CEO. Associé à ${CONFIRMED.organization}. Pas un catalogue de produits ou services.`,
        status: "verified",
      },
      {
        id: "record",
        year: "Maintenant",
        title: "Le registre continue",
        body: "Le registre public s’écrit par des faits sourcés. Rien d’autre n’est inventé pour remplir la page.",
        status: "verified",
      },
    ];
  }

  return [
    {
      id: "origin",
      year: "1994",
      title: "Origin",
      body: `Born in Kinshasa, ${CONFIRMED.birthPlaceCountryEn}, on ${CONFIRMED.birthDateDisplayEn}.`,
      status: "verified",
    },
    {
      id: "places",
      year: "—",
      title: "A life across places",
      body: "Grew up and lived across different countries, cities and provinces. A multicultural, cosmopolitan, Third Culture dimension — specific cities remain unconfirmed.",
      status: "needs",
    },
    {
      id: "builder",
      year: "—",
      title: "Builder",
      body: "Entrepreneur, businessman, builder. Detailed career dates are not confirmed.",
      status: "verified",
    },
    {
      id: "responsibility",
      year: "—",
      title: "Responsibility",
      body: `Founder/CEO. Associated with ${CONFIRMED.organization}. Not a catalogue of products or services.`,
      status: "verified",
    },
    {
      id: "record",
      year: "Now",
      title: "The record continues",
      body: "The public record is written from sourced facts. Nothing else is invented to fill the page.",
      status: "verified",
    },
  ];
}

export function JourneyChapters({ locale }: { locale: Locale }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const chapters = journeyChapters(locale);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const nodes = Array.from(root.querySelectorAll<HTMLElement>("[data-chapter]"));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      nodes.forEach((node) => node.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
        }
      },
      { threshold: 0.35 },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={rootRef} className="space-y-16">
      {chapters.map((chapter, index) => (
        <article
          key={chapter.id}
          data-chapter
          className="chapter grid gap-6 border-t border-rule pt-10 md:grid-cols-[8rem_1fr]"
        >
          <p className="text-[0.7rem] uppercase tracking-[0.18em] text-muted">
            {String(index + 1).padStart(2, "0")} · {chapter.year}
          </p>
          <div>
            <h3 className="editorial text-3xl md:text-4xl">{chapter.title}</h3>
            <p className="mt-4 max-w-2xl text-lg text-ink-soft">{chapter.body}</p>
            <p
              className={`mt-4 status-chip ${
                chapter.status === "verified" ? "text-verified border-verified" : "text-needs border-needs"
              }`}
            >
              {chapter.status === "verified"
                ? locale === "fr"
                  ? "Vérifié"
                  : "Verified"
                : locale === "fr"
                  ? "À confirmer"
                  : "Needs confirmation"}
            </p>
          </div>
        </article>
      ))}
    </div>
  );
}
