"use client";

import type { Place, PlaceConfirmation, VerificationStatus } from "@prisma/client";

import { StatusChip } from "@/components/ui/status-chip";
import type { Dictionary, Locale } from "@/lib/i18n";

function project(lat: number, lng: number) {
  const x = ((lng + 180) / 360) * 800;
  const y = ((90 - lat) / 180) * 360;
  return { x, y };
}

export function PlacesMap({
  locale,
  dict,
  places,
}: {
  locale: Locale;
  dict: Dictionary;
  places: Place[];
}) {
  const mapped = places.filter(
    (place) => place.confirmation === "CONFIRMED" && place.lat != null && place.lng != null,
  );

  return (
    <div className="px-5 py-12 md:px-8">
      <svg viewBox="0 0 800 360" className="w-full border border-rule bg-paper-2" role="img" aria-label={dict.places.title}>
        <rect width="800" height="360" fill="#e6e2d8" />
        <path
          d="M 330 70 C 360 55 410 60 445 95 C 470 125 490 170 500 210 C 505 245 490 280 455 300 C 410 318 360 310 330 280 C 300 250 285 200 290 155 C 295 115 310 85 330 70 Z"
          fill="#ddd7cb"
          stroke="#c8c2b4"
        />
        <path
          d="M 200 90 C 250 70 310 80 340 110 C 300 150 240 160 210 140 C 190 125 185 105 200 90 Z"
          fill="#ddd7cb"
          stroke="#c8c2b4"
        />
        <text x="24" y="28" fontSize="11" letterSpacing="1.4" fill="#5f5c54">
          {dict.places.mapCaption}
        </text>
        {mapped.map((place) => {
          const { x, y } = project(place.lat ?? 0, place.lng ?? 0);
          return (
            <g key={place.id}>
              <circle cx={x} cy={y} r="6" fill="#1a2330" />
              <text x={x + 12} y={y + 4} fontSize="13" fill="#121211">
                {locale === "fr" ? place.nameFr : place.nameEn}
              </text>
            </g>
          );
        })}
      </svg>
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
