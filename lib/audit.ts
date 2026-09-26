import { prisma } from "@/lib/db";

export async function writeAudit(input: {
  actorId?: string | null;
  action: string;
  entity: string;
  entityId: string;
  summary: string;
  payload?: Record<string, unknown>;
}) {
  await prisma.auditLog.create({
    data: {
      actorId: input.actorId ?? null,
      action: input.action,
      entity: input.entity,
      entityId: input.entityId,
      summary: input.summary,
      payload: JSON.stringify(input.payload ?? {}),
    },
  });
}

export async function writeRevision(input: {
  entity: string;
  entityId: string;
  version: number;
  snapshot: unknown;
  note?: string;
}) {
  await prisma.contentRevision.create({
    data: {
      entity: input.entity,
      entityId: input.entityId,
      version: input.version,
      snapshot: JSON.stringify(input.snapshot),
      note: input.note ?? "",
    },
  });
}
