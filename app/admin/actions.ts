"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/admin/session";
import { writeAudit, writeRevision } from "@/lib/audit";
import { prisma } from "@/lib/db";
import { publishingSafetyCheck, type PublishCandidate } from "@/lib/publishing-safety";

export type ActionResult = { ok: true } | { ok: false; reasons: string[] };

async function loadCandidate(
  entity: string,
  id: string,
): Promise<PublishCandidate | null> {
  await requireAdmin();
  const include = { sources: true } as const;
  if (entity === "NowItem") {
    return prisma.nowItem.findUnique({ where: { id }, include });
  }
  if (entity === "RecordEvent") {
    return prisma.recordEvent.findUnique({ where: { id }, include });
  }
  if (entity === "ProofItem") {
    return prisma.proofItem.findUnique({ where: { id }, include });
  }
  if (entity === "Place") {
    return prisma.place.findUnique({ where: { id }, include });
  }
  if (entity === "Venture") {
    return prisma.venture.findUnique({ where: { id }, include });
  }
  if (entity === "ThinkingPiece") {
    return prisma.thinkingPiece.findUnique({ where: { id }, include });
  }
  if (entity === "Thesis") {
    return prisma.thesis.findUnique({ where: { id }, include });
  }
  if (entity === "LedgerCommitment") {
    return prisma.ledgerCommitment.findUnique({ where: { id }, include });
  }
  if (entity === "MediaItem") {
    return prisma.mediaItem.findUnique({ where: { id }, include });
  }
  if (entity === "AskSource") {
    const row = await prisma.askSource.findUnique({ where: { id }, include: { links: true } });
    if (!row) return null;
    return {
      ...row,
      sources: row.links.length
        ? row.links
        : [{ label: row.titleEn, url: row.canonicalUrl }],
    };
  }
  return null;
}

export async function attemptPublish(entity: string, id: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  const current = await loadCandidate(entity, id);
  if (!current) return { ok: false, reasons: ["not-found"] };

  const candidate: PublishCandidate = {
    ...current,
    publishState: "PUBLISHED",
  };
  const safety = publishingSafetyCheck(candidate);
  if (!safety.ok) {
    await writeAudit({
      actorId: admin.id,
      action: "PUBLISH_BLOCKED",
      entity,
      entityId: id,
      summary: `Blocked: ${safety.reasons.join(", ")}`,
    });
    return safety;
  }

  const data = { publishState: "PUBLISHED" as const };
  if (entity === "NowItem") await prisma.nowItem.update({ where: { id }, data });
  if (entity === "RecordEvent") await prisma.recordEvent.update({ where: { id }, data });
  if (entity === "ProofItem") await prisma.proofItem.update({ where: { id }, data });
  if (entity === "Place") await prisma.place.update({ where: { id }, data });
  if (entity === "Venture") await prisma.venture.update({ where: { id }, data });
  if (entity === "ThinkingPiece") await prisma.thinkingPiece.update({ where: { id }, data });
  if (entity === "Thesis") await prisma.thesis.update({ where: { id }, data });
  if (entity === "LedgerCommitment") await prisma.ledgerCommitment.update({ where: { id }, data });
  if (entity === "MediaItem") await prisma.mediaItem.update({ where: { id }, data });
  if (entity === "AskSource") await prisma.askSource.update({ where: { id }, data });

  await writeRevision({
    entity,
    entityId: id,
    version: Date.now(),
    snapshot: { publishState: "PUBLISHED" },
    note: "Published after safety check",
  });
  await writeAudit({
    actorId: admin.id,
    action: "PUBLISH",
    entity,
    entityId: id,
    summary: "Published after safety check",
  });
  revalidatePath("/admin");
  return { ok: true };
}

export async function updateIdentityTagline(formData: FormData) {
  const admin = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const commandLine = String(formData.get("commandLine") ?? "").trim();
  if (!id) return;
  await prisma.identityProfile.update({
    where: { id },
    data: { commandLine },
  });
  await writeAudit({
    actorId: admin.id,
    action: "TAGLINE_UPDATE",
    entity: "IdentityProfile",
    entityId: id,
    summary: commandLine
      ? "Optional tagline stored — not a confirmed public statement until sourced"
      : "Optional tagline cleared",
  });
  revalidatePath("/admin/identity");
  revalidatePath("/en");
  revalidatePath("/fr");
}

export async function decideLearningProposal(id: string, decision: "APPROVED" | "REJECTED") {
  const admin = await requireAdmin();
  await prisma.learningProposal.update({
    where: { id },
    data: {
      status: decision,
      approvedBy: admin.email,
      decidedAt: new Date(),
    },
  });
  await writeAudit({
    actorId: admin.id,
    action: `LEARNING_${decision}`,
    entity: "LearningProposal",
    entityId: id,
    summary: `Learning proposal ${decision.toLowerCase()} — identity not auto-rewritten`,
  });
  revalidatePath("/admin/learning");
}

export async function moderateChallenge(id: string, moderation: "APPROVED" | "REJECTED") {
  const admin = await requireAdmin();
  await prisma.challengeEntry.update({ where: { id }, data: { moderation } });
  await writeAudit({
    actorId: admin.id,
    action: `CHALLENGE_${moderation}`,
    entity: "ChallengeEntry",
    entityId: id,
    summary: `Challenge ${moderation.toLowerCase()}`,
  });
  revalidatePath("/admin/challenges");
}
