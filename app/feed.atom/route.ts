import { prisma } from "@/lib/db";
import { publicSiteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

export async function GET() {
  const origin = publicSiteUrl();
  const thinking = await prisma.thinkingPiece.findMany({
    where: { publishState: "PUBLISHED" },
    orderBy: { updatedAt: "desc" },
    take: 20,
  });

  const entries = thinking
    .map(
      (piece) => `
  <entry>
    <id>${origin}/en/thinking/${piece.slug}</id>
    <title>${escapeXml(piece.titleEn)}</title>
    <updated>${piece.updatedAt.toISOString()}</updated>
    <link href="${origin}/en/thinking/${piece.slug}"/>
    <summary>${escapeXml(piece.bodyEn.slice(0, 240))}</summary>
  </entry>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <id>${origin}/feed.atom</id>
  <title>EJC — Eroish J Clevone</title>
  <updated>${new Date().toISOString()}</updated>
  <link href="${origin}"/>
  <link rel="self" href="${origin}/feed.atom"/>
  ${entries}
</feed>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/atom+xml; charset=utf-8",
    },
  });
}

function escapeXml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}
