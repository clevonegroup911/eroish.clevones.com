import type { Dictionary } from "@/lib/i18n";

export const MANDATE_SOURCE_KEY = "mandate-confirmed-facts";

export function localizeSourceLabel(label: string, dict: Dictionary): string {
  if (label === MANDATE_SOURCE_KEY) return dict.sources.mandate;
  return label;
}
