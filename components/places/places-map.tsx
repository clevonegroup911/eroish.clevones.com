"use client";

import type { Place, PlaceConfirmation, VerificationStatus } from "@prisma/client";

import { StatusChip } from "@/components/ui/status-chip";
import type { Dictionary, Locale } from "@/lib/i18n";

export function PlacesMap({
  locale,
  dict,
  places,
}: {
  locale: Locale;
  dict: Dictionary;
  places: Place[];
}) {
  const confirmed = places.filter((place) => place.confirmation === "CONFIRMED");

  return (
    <div className="px-5 py-12 md:px-8">
      <p className="mb-4 text-sm text-muted">{dict.places.mapCaption}</p>
      <div className="overflow-x-auto border border-rule bg-paper-2">
        <svg
          viewBox="0 0 720 360"
          className="hidden min-w-[640px] md:block"
          role="img"
          aria-label={dict.places.title}
        >
          <rect width="720" height="360" fill="#e6e2d8" />
          <text x="24" y="32" fontSize="14" fill="#5f5c54">
            {dict.places.schematicTitle}
          </text>
          <path
            d="M 220 70 C 310 50 430 80 500 130 C 560 180 540 250 470 290 C 390 330 280 320 230 270 C 180 220 170 120 220 70 Z"
            fill="#ddd7cb"
            stroke="#c8c2b4"
          />
          <text x="430" y="200" fontSize="13" fill="#5f5c54">
            {dict.places.eastNote}
          </text>
          {confirmed.map((place) => (
            <g key={place.id}>
              <circle cx="280" cy="210" r="8" fill="#1a2330" />
              <text x="296" y="216" fontSize="16" fill="#121211">
                {locale === "fr" ? place.nameFr : place.nameEn}
              </text>
              <text x="296" y="238" fontSize="13" fill="#5f5c54">
                {dict.places.westLabel}
              </text>
            </g>
          ))}
        </svg>
        <ul className="grid gap-3 p-4 text-base md:hidden">
          {confirmed.map((place) => (
            <li key={place.id}>
              <strong>{locale === "fr" ? place.nameFr : place.nameEn}</strong>
              {" — "}
              {dict.places.mobileItem}
            </li>
          ))}
        </ul>
      </div>
      <p className="mt-3 text-sm text-muted">{dict.places.schematicNote}</p>
      <ul className="mt-10 grid gap-4 md:grid-cols-2">
        {places.map((place) => (
          <li key={place.id} className="border border-rule p-5">
            <StatusChip
              status={place.verification as VerificationStatus}
              locale={locale}
              example={place.exampleFlag}
            />
            <h2 className="editorial mt-3 text-2xl">{locale === "fr" ? place.nameFr : place.nameEn}</h2>
            <p className="mt-2 text-sm uppercase tracking-[0.12em] text-muted">
              {(locale === "fr" ? place.countryFr : place.countryEn) ?? dict.places.needs}
            </p>
            <p className="mt-3">{locale === "fr" ? place.noteFr : place.noteEn}</p>
            <p className="mt-3 text-[0.7rem] uppercase tracking-[0.12em] text-muted">
              {place.confirmation === ("CONFIRMED" as PlaceConfirmation)
                ? dict.places.confirmed
                : dict.places.needs}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
