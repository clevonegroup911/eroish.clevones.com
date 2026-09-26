import { CONFIRMED } from "@/lib/identity";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const origin = process.env.APP_ORIGIN ?? CONFIRMED.siteUrl;
  const signals = await prisma.signalPost.findMany({
    where: { publishState: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
    take: 30,
  });
  const thinking = await prisma.thinkingPiece.findMany({
    where: { publishState: "PUBLISHED" },
    orderBy: { updatedAt: "desc" },
    take: 20,
  });

  const items = [
    ...signals.map(
      (post) => `
    <item>
      <title>EJC Signal — ${post.type}</title>
      <link>${origin}/en/signal</link>
      <guid isPermaLink="false">${post.id}</guid>
      <pubDate>${post.createdAt.toUTCString()}</pubDate>
      <description><![CDATA[${escapeXml(post.body)}]]></description>
    </item>`,
    ),
    ...thinking.map(
      (piece) => `
    <item>
      <title>${escapeXml(piece.titleEn)}</title>
      <link>${origin}/en/thinking/${piece.slug}</link>
      <guid>${origin}/en/thinking/${piece.slug}</guid>
      <pubDate>${piece.createdAt.toUTCString()}</pubDate>
      <description><![CDATA[${escapeXml(piece.bodyEn)}]]></description>
    </item>`,
    ),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>EJC — Eroish J Clevone</title>
    <link>${origin}</link>
    <description>Published signals and thinking from the official EJC public record. Empty until real items are published.</description>
    <language>en</language>
    ${items.join("\n")}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}

function escapeXml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}
