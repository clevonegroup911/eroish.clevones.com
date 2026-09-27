import type { ExampleFlag, VerificationStatus } from "@prisma/client";

import { statusLabel } from "@/lib/verification";
import type { Locale } from "@/lib/i18n";

const tone: Record<VerificationStatus, string> = {
  VERIFIED: "text-verified border-verified",
  DOCUMENTED: "text-verified border-verified",
  CORRECTED: "text-verified border-verified",
  UPDATED: "text-declared border-declared",
  DECLARED: "text-declared border-declared",
  IN_PROGRESS: "text-declared border-declared",
  NEEDS_CONFIRMATION: "text-needs border-needs",
};

export function StatusChip({
  status,
  locale,
  example,
}: {
  status: VerificationStatus;
  locale: Locale;
  example?: ExampleFlag;
}) {
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <span className={`status-chip ${tone[status]}`}>{statusLabel(status, locale)}</span>
      {example === "EXAMPLE" ? (
        <span className="status-chip text-needs border-needs">
          {locale === "fr" ? "Donnée d’exemple" : "Example data"}
        </span>
      ) : null}
    </span>
  );
}
