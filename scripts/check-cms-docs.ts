/**
 * Lightweight CMS-01 architecture consistency check.
 * Verifies the five docs exist, cover mandate §25 items 1–18,
 * include CMS-01–CMS-12 acceptance criteria, share the same
 * RBAC / workflow / truth tokens (exact matching), cross-check
 * workflow transitions against the RBAC matrix, and structurally
 * parse mermaid fences offline (no mermaid JS renderer).
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
    "content.verify",
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
const RBAC_BLOCK = /<!--\s*cms-rbac-matrix\s*([\s\S]*?)-->/;
const TRANSITION_BLOCK = /<!--\s*cms-transitions\s*([\s\S]*?)-->/;
const MERMAID_KINDS = /^(flowchart|graph|stateDiagram-v2|erDiagram)\b/;

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

/** Exact token: ADMIN must not match SUPER_ADMIN. */
export function hasExactToken(text: string, token: string): boolean {
  const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?<![A-Za-z0-9_])${escaped}(?![A-Za-z0-9_])`).test(text);
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

export function parseRbacMatrix(markdown: string): Record<string, string[]> | null {
  const match = RBAC_BLOCK.exec(markdown);
  if (!match?.[1]) return null;
  const matrix: Record<string, string[]> = {};
  for (const raw of match[1].split("\n")) {
    const line = raw.trim();
    if (!line || !line.includes(":")) continue;
    const colon = line.indexOf(":");
    const role = line.slice(0, colon).trim();
    const caps = line
      .slice(colon + 1)
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    matrix[role] = caps;
  }
  return matrix;
}

export function parseTransitions(markdown: string): { from: string; to: string; capability: string }[] {
  const match = TRANSITION_BLOCK.exec(markdown);
  if (!match?.[1]) return [];
  const rows: { from: string; to: string; capability: string }[] = [];
  for (const raw of match[1].split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    const parts = line.split(":");
    if (parts.length !== 3) continue;
    const [from, to, capability] = parts;
    if (!from || !to || !capability) continue;
    rows.push({ from, to, capability });
  }
  return rows;
}

function countChars(text: string, open: string, close: string): { open: number; close: number } {
  return {
    open: [...text].filter((ch) => ch === open).length,
    close: [...text].filter((ch) => ch === close).length,
  };
}

/**
 * Offline mermaid structural check. Limitation: we do not execute the mermaid
 * JS renderer (not a repo dependency). We validate fence pairing, diagram
 * kind, non-empty body, and bracket balance.
 */
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
    const trimmed = body.trim();
    if (!trimmed) {
      errors.push(`${file}: empty mermaid block`);
    } else {
      const first = trimmed.split(/\r?\n/).find((line) => line.trim() && !line.trim().startsWith("%%")) ?? "";
      if (!MERMAID_KINDS.test(first.trim())) {
        errors.push(`${file}: mermaid block must start with flowchart|graph|stateDiagram-v2|erDiagram`);
      }
      const squares = countChars(trimmed, "[", "]");
      const parens = countChars(trimmed, "(", ")");
      if (squares.open !== squares.close) errors.push(`${file}: mermaid [] imbalance`);
      if (parens.open !== parens.close) errors.push(`${file}: mermaid () imbalance`);
      // erDiagram uses --o{ / }o-- as cardinality, not braces.
      const withoutCard = trimmed.replace(/\}o--|--o\{|\}\|--|--\|\{/g, "rel");
      const curlies = countChars(withoutCard, "{", "}");
      if (curlies.open !== curlies.close) errors.push(`${file}: mermaid {} imbalance`);
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
  const security = texts[CMS_DOC_FILES.indexOf("docs/CMS-SECURITY.md")] ?? "";

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

  const firstCanonical = parsed[0]?.canonical;
  for (const row of parsed.slice(1)) {
    if (!firstCanonical || !row.canonical) continue;
    if (JSON.stringify(row.canonical) !== JSON.stringify(firstCanonical)) {
      errors.push(`${row.file}: cms-canonical tokens differ from ${CMS_DOC_FILES[0]}`);
    }
  }

  for (const [index, text] of texts.entries()) {
    errors.push(...mermaidFenceErrors(text, CMS_DOC_FILES[index] ?? "doc"));
  }

  for (const [index, text] of texts.entries()) {
    const file = CMS_DOC_FILES[index] ?? "doc";
    for (const role of CANONICAL.roles) {
      if (!hasExactToken(text, role)) errors.push(`${file}: missing exact role token ${role}`);
    }
    for (const cap of CANONICAL.capabilities) {
      if (!hasExactToken(text, cap)) errors.push(`${file}: missing exact capability token ${cap}`);
    }
    for (const state of CANONICAL.workflow) {
      if (!hasExactToken(text, state)) errors.push(`${file}: missing exact workflow token ${state}`);
    }
    for (const status of CANONICAL.truth) {
      if (!hasExactToken(text, status)) errors.push(`${file}: missing exact truth token ${status}`);
    }
  }

  const matrix = parseRbacMatrix(security);
  if (!matrix) {
    errors.push("docs/CMS-SECURITY.md: missing <!-- cms-rbac-matrix --> block");
  } else {
    for (const role of CANONICAL.roles) {
      if (!matrix[role]) errors.push(`RBAC matrix missing role ${role}`);
    }
    for (const [role, caps] of Object.entries(matrix)) {
      if (!CANONICAL.roles.includes(role as (typeof CANONICAL.roles)[number])) {
        errors.push(`RBAC matrix unknown role ${role}`);
      }
      for (const cap of caps) {
        if (!CANONICAL.capabilities.includes(cap as (typeof CANONICAL.capabilities)[number])) {
          errors.push(`RBAC matrix ${role} has unknown capability ${cap}`);
        }
      }
    }
  }

  const transitions = parseTransitions(plan);
  if (transitions.length === 0) {
    errors.push("docs/CMS-IMPLEMENTATION-PLAN.md: missing <!-- cms-transitions --> block");
  }
  for (const edge of transitions) {
    if (!CANONICAL.workflow.includes(edge.from as (typeof CANONICAL.workflow)[number])) {
      errors.push(`transition from unknown state ${edge.from}`);
    }
    if (!CANONICAL.workflow.includes(edge.to as (typeof CANONICAL.workflow)[number])) {
      errors.push(`transition to unknown state ${edge.to}`);
    }
    if (!CANONICAL.capabilities.includes(edge.capability as (typeof CANONICAL.capabilities)[number])) {
      errors.push(`transition ${edge.from}->${edge.to} uses unknown capability ${edge.capability}`);
    }
    if (matrix) {
      const holders = Object.entries(matrix)
        .filter(([, caps]) => caps.includes(edge.capability))
        .map(([role]) => role);
      if (holders.length === 0) {
        errors.push(`transition ${edge.from}->${edge.to} capability ${edge.capability} is granted to no role`);
      }
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
