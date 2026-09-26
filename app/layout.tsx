import type { Metadata } from "next";
import { IBM_Plex_Sans, Newsreader } from "next/font/google";

import { CONFIRMED, personJsonLd } from "@/lib/identity";

import "./globals.css";

const plex = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-newsreader",
  display: "swap",
});

const origin = process.env.APP_ORIGIN ?? CONFIRMED.siteUrl;

export const metadata: Metadata = {
  metadataBase: new URL(origin),
  title: {
    default: "Eroish J Clevone — EJC",
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = personJsonLd(origin);

  return (
    <html lang="en" className={`${plex.variable} ${newsreader.variable}`}>
      <body className="min-h-screen bg-paper text-ink antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
