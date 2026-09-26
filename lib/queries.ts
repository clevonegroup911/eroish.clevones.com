import type { Locale as AppLocale } from "@/lib/i18n";
import { prisma } from "@/lib/db";

export function dbLocale(locale: AppLocale) {
  return locale === "fr" ? "FR" : "EN";
}

export async function getPublishedPlaces() {
  return prisma.place.findMany({
    where: { publishState: "PUBLISHED" },
    include: { sources: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getPublishedVentures() {
  return prisma.venture.findMany({
    where: { publishState: "PUBLISHED" },
    include: { sources: true },
    orderBy: { name: "asc" },
  });
}

export async function getPublishedRecord(kind?: string) {
  return prisma.recordEvent.findMany({
    where: {
      publishState: "PUBLISHED",
      ...(kind && kind !== "ALL" ? { kind: kind as never } : {}),
    },
    include: { sources: true, proofs: true },
    orderBy: [{ year: "asc" }, { occurredOn: "asc" }],
  });
}

export async function getPublishedProofs() {
  return prisma.proofItem.findMany({
    where: { publishState: "PUBLISHED" },
    include: { sources: true, relatedRecord: true },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getPublishedNow(locale: AppLocale) {
  return prisma.nowItem.findMany({
    where: { publishState: "PUBLISHED", locale: dbLocale(locale) },
    include: { sources: true },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getPublishedThinking() {
  return prisma.thinkingPiece.findMany({
    where: { publishState: "PUBLISHED" },
    include: { sources: true },
    orderBy: { publishedOn: "desc" },
  });
}

export async function getThinkingBySlug(slug: string) {
  return prisma.thinkingPiece.findFirst({
    where: { slug, publishState: "PUBLISHED" },
    include: { sources: true, revisions: true },
  });
}

export async function getPublishedTheses() {
  return prisma.thesis.findMany({
    where: { publishState: "PUBLISHED" },
    include: {
      sources: true,
      versions: { orderBy: { version: "asc" } },
      challenges: { where: { moderation: { in: ["APPROVED", "RESPONDED"] } } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getThesisBySlug(slug: string) {
  return prisma.thesis.findFirst({
    where: { slug, publishState: "PUBLISHED" },
    include: {
      sources: true,
      versions: { orderBy: { version: "asc" } },
      challenges: { where: { moderation: { in: ["APPROVED", "RESPONDED"] } } },
    },
  });
}

export async function getPublishedSignals(locale: AppLocale) {
  return prisma.signalPost.findMany({
    where: { publishState: "PUBLISHED", locale: dbLocale(locale) },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPublishedLedger() {
  return prisma.ledgerCommitment.findMany({
    where: { publishState: "PUBLISHED" },
    include: { sources: true, history: { orderBy: { changedAt: "asc" } } },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getPublishedMedia() {
  return prisma.mediaItem.findMany({
    where: { publishState: "PUBLISHED" },
    include: { sources: true },
    orderBy: { publishedOn: "desc" },
  });
}

export async function getPublishedAchievements() {
  return prisma.achievement.findMany({
    where: { publishState: "PUBLISHED" },
    include: { sources: true },
  });
}

export async function getIdentity(locale: AppLocale) {
  return prisma.identityProfile.findFirst({
    where: { locale: dbLocale(locale), publishState: "PUBLISHED" },
  });
}

export async function getApprovedAskSources() {
  return prisma.askSource.findMany({
    where: { approved: true, publishState: "PUBLISHED" },
  });
}
