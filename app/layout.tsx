import type { Metadata } from "next";
import { headers } from "next/headers";
import localFont from "next/font/local";

import { nonceFromCsp } from "@/lib/csp";
import { CONFIRMED, personJsonLd } from "@/lib/identity";
import { defaultLocale, isLocale } from "@/lib/i18n";
import { publicSiteUrl } from "@/lib/site-url";

import "./globals.css";

const plex = localFont({
  src: [
    { path: "./fonts/ibm-plex-sans-latin-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/ibm-plex-sans-latin-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/ibm-plex-sans-latin-600.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-plex",
  display: "swap",
});

const newsreader = localFont({
  src: [
    { path: "./fonts/newsreader-latin-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/newsreader-latin-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/newsreader-latin-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/newsreader-latin-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-newsreader",
  display: "swap",
});

export const dynamic = "force-dynamic";

const origin = publicSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(origin),
  title: {
    default: "Eroish J Clevone",
    template: "%s · EJC",
  },
  description:
    "Official public identity of Eroish Clevone Jeamson. Public name Eroish J Clevone. Signature EJC. Congolese entrepreneur, businessman, builder, Founder/CEO.",
  applicationName: "EJC",
  authors: [{ name: CONFIRMED.publicName, url: origin }],
  creator: CONFIRMED.fullName,
  alternates: {
    canonical: origin,
    languages: {
      en: `${origin}/en`,
      fr: `${origin}/fr`,
    },
    types: {
      "application/rss+xml": `${origin}/feed.xml`,
    },
  },
  openGraph: {
    type: "profile",
    locale: "en",
    alternateLocale: ["fr"],
    url: origin,
    siteName: "Eroish J Clevone",
    title: "Eroish J Clevone — EJC",
    description:
      "Official public identity of Eroish Clevone Jeamson. Congolese entrepreneur, businessman, builder, Founder/CEO.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headerStore = await headers();
  const headerLocale = headerStore.get("x-locale") ?? defaultLocale;
  const locale = isLocale(headerLocale) ? headerLocale : defaultLocale;
  const nonce = nonceFromCsp(headerStore.get("content-security-policy"));
  const jsonLd = personJsonLd(origin);

  return (
    <html lang={locale} className={`${plex.variable} ${newsreader.variable}`}>
      <body className="min-h-screen bg-paper text-ink antialiased">
        <script
          nonce={nonce}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
