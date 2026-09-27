/**
 * Lightweight CMS-01 architecture consistency check.
 * Verifies the five docs exist, cover mandate §25 items 1–18,
 * include CMS-01–CMS-12 acceptance criteria, share the same
 * RBAC / workflow / truth tokens, and fence mermaid blocks.
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

export const CMS_DOC_FILES = [
  "docs/CMS-ARCHITECTURE.md",
  "docs/CMS-DATA-MODEL.md",
  "docs/CMS-SECURITY.md",
  "docs/CMS-MIGRATION.md",
  "docs/CMS-IMPLEMENTATION-PLAN.md",
] as const;

export const REQUIRED_SECTIONS = [
  "## 1. Existing-system assessment",
  "## 2. Gap analysis",
  "## 3. Component architecture",
  "## 4. PostgreSQL/Prisma data model",
  "## 5. Entity relationships",
  "## 6. Custom-field strategy",
  "## 7. Localization",
  "## 8. RBAC matrix",
  "## 9. Workflow state machine",
  "## 10. Media/storage",
  "## 11. API/service boundaries",
  "## 12. Security threat model",
  "## 13. Audit/versioning design",
  "## 14. Migration strategy",
  "## 15. Testing strategy",
  "## 16. Performance strategy",
  "## 17. Implementation dependency graph",
  "## 18. Acceptance criteria",
] as const;

export const REQUIRED_PHASES = [
  "CMS-01",
  "CMS-02",
  "CMS-03",
  "CMS-04",
  "CMS-05",
  "CMS-06",
  "CMS-07",
  "CMS-08",
  "CMS-09",
  "CMS-10",
  "CMS-11",
  "CMS-12",
] as const;

export const CANONICAL = {
  roles: ["SUPER_ADMIN", "ADMIN", "EDITOR", "AUTHOR", "REVIEWER", "MEDIA_MANAGER"],
  capabilities: [
    "content.create",
    "content.edit",
    "content.review",
    "content.publish",
    "content.delete",
    "media.upload",
    "media.delete",
    "users.manage",
    "roles.manage",
    "settings.manage",
    "audit.read",
  ],
  workflow: ["DRAFT", "IN_REVIEW", "APPROVED", "SCHEDULED", "PUBLISHED", "UNPUBLISHED", "ARCHIVED"],
  truth: ["VERIFIED", "UNVERIFIED", "TO_CONFIRM", "PRIVATE"],
} as const;

const CANONICAL_BLOCK = /<!--\s*cms-canonical\s*([\s\S]*?)-->/;

export type CmsDocsCheckResult = {
  ok: boolean;
  errors: string[];
};

function repoRoot(): string {
  return process.cwd();
}

export function readCmsDoc(relativePath: string, root = repoRoot()): string {
  return readFileSync(path.join(root, relativePath), "utf8");
}

function parseList(block: string, key: string): string[] {
  const line = block
    .split("\n")
    .map((row) => row.trim())
    .find((row) => row.startsWith(`${key}:`));
  if (!line) return [];
  return line
    .slice(key.length + 1)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function parseCanonical(markdown: string): {
  roles: string[];
  capabilities: string[];
  workflow: string[];
  truth: string[];
} | null {
  const match = CANONICAL_BLOCK.exec(markdown);
  if (!match?.[1]) return null;
  const block = match[1];
  return {
    roles: parseList(block, "roles"),
    capabilities: parseList(block, "capabilities"),
    workflow: parseList(block, "workflow"),
    truth: parseList(block, "truth"),
  };
}

export function mermaidFenceErrors(markdown: string, file: string): string[] {
  const errors: string[] = [];
  const ticks = markdown.match(/```/g)?.length ?? 0;
  if (ticks % 2 !== 0) {
    errors.push(`${file}: unclosed fenced block (odd number of \`\`\`)`);
  }
  const opened = [...markdown.matchAll(/```mermaid[^\n]*\n/g)];
  if (opened.length === 0) {
    errors.push(`${file}: expected at least one \`\`\`mermaid block`);
  }
  let searchFrom = 0;
  for (const open of opened) {
    const start = markdown.indexOf(open[0], searchFrom);
    const afterOpen = start + open[0].length;
    const close = markdown.indexOf("```", afterOpen);
    if (close === -1) {
      errors.push(`${file}: mermaid block is not closed`);
      break;
    }
    const body = markdown.slice(afterOpen, close);
    if (!body.trim()) {
      errors.push(`${file}: empty mermaid block`);
    }
    searchFrom = close + 3;
  }
  return errors;
}

export function checkCmsDocs(root = repoRoot()): CmsDocsCheckResult {
  const errors: string[] = [];
  const texts: string[] = [];

  for (const file of CMS_DOC_FILES) {
    const absolute = path.join(root, file);
    if (!existsSync(absolute)) {
      errors.push(`missing ${file}`);
      continue;
    }
    texts.push(readCmsDoc(file, root));
  }

  if (texts.length !== CMS_DOC_FILES.length) {
    return { ok: false, errors };
  }

  const combined = texts.join("\n");
  for (const heading of REQUIRED_SECTIONS) {
    if (!combined.includes(heading)) {
      errors.push(`missing section heading: ${heading}`);
    }
  }

  const plan = texts[CMS_DOC_FILES.indexOf("docs/CMS-IMPLEMENTATION-PLAN.md")] ?? "";
  for (const phase of REQUIRED_PHASES) {
    const heading = `### ${phase}`;
    if (!plan.includes(heading)) {
      errors.push(`missing phase heading: ${heading}`);
    }
    const headingIndex = plan.indexOf(heading);
    if (headingIndex === -1) continue;
    const nextHeading = plan.indexOf("\n### ", headingIndex + heading.length);
    const slice = nextHeading === -1 ? plan.slice(headingIndex) : plan.slice(headingIndex, nextHeading);
    if (!/acceptance criteria/i.test(slice)) {
      errors.push(`${phase} is missing acceptance criteria`);
    }
  }

  const parsed = texts.map((text, index) => ({
    file: CMS_DOC_FILES[index] ?? `doc-${index}`,
    canonical: parseCanonical(text),
  }));

  for (const row of parsed) {
    if (!row.canonical) {
      errors.push(`${row.file}: missing <!-- cms-canonical --> block`);
      continue;
    }
    (Object.keys(CANONICAL) as (keyof typeof CANONICAL)[]).forEach((key) => {
      const expected = [...CANONICAL[key]];
      const actual = row.canonical?.[key] ?? [];
      if (expected.join(",") !== actual.join(",")) {
        errors.push(
          `${row.file}: ${key} mismatch (expected ${expected.join(", ")}; got ${actual.join(", ") || "(empty)"})`,
        );
      }
    });
  }

  for (const [index, text] of texts.entries()) {
    errors.push(...mermaidFenceErrors(text, CMS_DOC_FILES[index] ?? "doc"));
  }

  // Cross-check that the human-facing tables also name every role / capability / state.
  for (const [index, text] of texts.entries()) {
    const file = CMS_DOC_FILES[index] ?? "doc";
    for (const role of CANONICAL.roles) {
      if (!text.includes(role)) errors.push(`${file}: does not mention role ${role}`);
    }
    for (const cap of CANONICAL.capabilities) {
      if (!text.includes(cap)) errors.push(`${file}: does not mention capability ${cap}`);
    }
    for (const state of CANONICAL.workflow) {
      if (!text.includes(state)) errors.push(`${file}: does not mention workflow state ${state}`);
    }
    for (const status of CANONICAL.truth) {
      if (!text.includes(status)) errors.push(`${file}: does not mention truth status ${status}`);
    }
  }

  return { ok: errors.length === 0, errors };
}

const invoked = process.argv[1] ?? "";
if (invoked.includes("check-cms-docs")) {
  const result = checkCmsDocs();
  if (!result.ok) {
    console.error("CMS docs consistency failed:\n" + result.errors.map((error) => `- ${error}`).join("\n"));
    process.exit(1);
  }
  console.log("CMS docs consistency: PASS");
}
