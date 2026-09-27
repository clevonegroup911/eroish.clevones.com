import { PageIntro } from "@/components/layout/page-shell";
import { PlacesMap } from "@/components/places/places-map";
import { localeContext, sectionMetadata } from "@/lib/locale-page";
import { prisma } from "@/lib/db";


export function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  return sectionMetadata(params, (dict) => ({ title: dict.places.title, description: dict.places.lead }));
}

export default async function PlacesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale, dict } = await localeContext(params);
  const places = await prisma.place.findMany({
    where: { publishState: { in: ["PUBLISHED", "REVIEW"] } },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <>
      <PageIntro title={dict.places.title} lead={dict.places.lead} />
      <PlacesMap locale={locale} dict={dict} places={places} />
    </>
  );
}
