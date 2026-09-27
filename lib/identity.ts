/**
 * Confirmed public facts only. Anything else must be a structured
 * placeholder marked needs-confirmation. Never invent biographical detail.
 */
export const CONFIRMED = {
  fullName: "Eroish Clevone Jeamson",
  publicName: "Eroish J Clevone",
  signature: "EJC",
  nationality: "Congolese",
  nationalityCode: "CD",
  countryEn: "Democratic Republic of the Congo",
  countryFr: "République démocratique du Congo",
  roles: ["Entrepreneur", "Businessman", "Builder"] as const,
  title: "Founder/CEO",
  organization: "CLEVONE SARL",
  birthDate: "1994-09-01",
  birthDateDisplayEn: "1 September 1994",
  birthDateDisplayFr: "1er septembre 1994",
  birthPlaceCity: "Kinshasa",
  birthPlaceCountryEn: "Democratic Republic of the Congo",
  birthPlaceCountryFr: "République démocratique du Congo",
  livedAcrossEn: "Grew up and lived across different countries, cities and provinces",
  livedAcrossFr: "A grandi et vécu dans différents pays, villes et provinces",
  siteHost: "eroish.clevones.com",
  siteUrl: "https://eroish.clevones.com",
  githubDescription: "Entrepreneur, Businessman, Builder",
} as const;

export function personJsonLd(origin: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${origin}/#ejc`,
    name: CONFIRMED.fullName,
    alternateName: [CONFIRMED.publicName, CONFIRMED.signature],
    nationality: {
      "@type": "Country",
      name: CONFIRMED.countryEn,
      identifier: CONFIRMED.nationalityCode,
    },
    birthDate: CONFIRMED.birthDate,
    birthPlace: {
      "@type": "Place",
      name: CONFIRMED.birthPlaceCity,
      address: {
        "@type": "PostalAddress",
        addressLocality: CONFIRMED.birthPlaceCity,
        addressCountry: CONFIRMED.nationalityCode,
      },
    },
    jobTitle: CONFIRMED.title,
    description: CONFIRMED.githubDescription,
    url: origin,
    affiliation: {
      "@type": "Organization",
      name: CONFIRMED.organization,
    },
    knowsLanguage: ["fr", "en"],
  };
}
