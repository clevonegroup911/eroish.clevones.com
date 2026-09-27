import type { NowKind } from "@prisma/client";

export const NOW_KIND_ORDER: NowKind[] = [
  "OBJECTIVE",
  "FOCUS",
  "DECISION",
  "CHALLENGE",
  "LATEST_ACTION",
  "LATEST_RESULT",
  "LATEST_LESSON",
  "LATEST_SIGNAL",
];

export function sortNowItems<T extends { kind: NowKind }>(items: T[]): T[] {
  return [...items].sort(
    (a, b) => NOW_KIND_ORDER.indexOf(a.kind) - NOW_KIND_ORDER.indexOf(b.kind),
  );
}
