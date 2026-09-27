# CMS-01 Data model — PostgreSQL / Prisma

Baseline: `prisma/schema.prisma` (SQLite, full models) and stub `prisma/schema.postgres.prisma` (PostgreSQL datasource only). Production target was already PostgreSQL (`docs/DEPLOYMENT.md`). This document is the CMS schema design. **CMS-02 applies it.** CMS-01 does not migrate the database.

<!-- cms-canonical
roles: SUPER_ADMIN, ADMIN, EDITOR, AUTHOR, REVIEWER, MEDIA_MANAGER
capabilities: content.create, content.edit, content.review, content.publish, content.delete, content.verify, media.upload, media.delete, users.manage, roles.manage, settings.manage, audit.read
workflow: DRAFT, IN_REVIEW, APPROVED, SCHEDULED, PUBLISHED, UNPUBLISHED, ARCHIVED
truth: VERIFIED, UNVERIFIED, TO_CONFIRM, PRIVATE
-->

**JSONB policy.** JSONB is used only for (1) custom-field **values** and (2) block **payloads**. Field definitions, select options, validation, SEO, provenance, and audit snapshots stay relational or `TEXT`. **No EAV** (`ContentFieldValue` rows per field) unless a later measured case proves JSONB + definitions inferior — not expected.

**Illustrative data** in comments is not an EJC fact.

---

## Database strategy (dev / CI / production)

| Environment | Today (PR #1) | CMS-02 onward |
|---|---|---|
| Local Fedora / laptop | SQLite `file:./dev.db` next to `prisma/schema.prisma` (`lib/db.ts` also sets `PRAGMA busy_timeout` via `$executeRawUnsafe`) | PostgreSQL 15 via **Podman** (`podman-compose`) by default; `docker compose` is an alternative (`postgres:15`, db `eroish_dev`) |
| GitHub Actions | `DATABASE_URL: file:./dev.db` in `.github/workflows/ci.yml` | `services: postgres:15` + `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/eroish_ci` |
| Production VM | Documented switch to `postgresql` + `eroish_prod`; **no production data yet** | Same; first real migration history is created in CMS-02 |

**Why not keep SQLite for CMS work.** The CMS requires JSONB operators and GIN on custom values / block payloads, and PostgreSQL full-text search. Prisma’s SQLite `Json` is TEXT. Enums work in Prisma on both providers, but native Postgres enums and `tsvector` do not. Maintaining two providers after CMS-02 (the current split-file approach) already failed: `schema.postgres.prisma` has **no models**.

**Consequences.**

- Fedora local validation must run **Podman** (or Docker, or install Postgres 15). Compose/`podman-compose` file is a CMS-02 deliverable.
- CI quality job gains a service container and a wait-for-healthy step; `prisma migrate deploy` (or `migrate dev` in generate) replaces `db push` for schema apply.
- `lib/db.ts` SQLite `PRAGMA` becomes a no-op / is removed.
- Existing unit tests that do not touch Prisma stay unchanged. Tests that construct `AskSource` objects (`tests/unit/ask-ejc.test.ts`) stay valid if new fields are optional or the helper is updated in CMS-02 **with** the schema — not in CMS-01.
- Production empty DB: migrate deploy + seed. No data-loss event.

This is a **technical** decision. It is not an owner gate.

---

## 4. PostgreSQL/Prisma data model

### 4.1 Design rules

- Additive first: keep existing tables; add columns and new tables; dual-read until CMS-12.
- CUID string PKs (matches today).
- `createdAt` / `updatedAt` on every durable entity.
- Soft delete (`deletedAt DateTime?`) on editorial content and media assets. **Not** on `AuditLog`, `Session`, `RateLimitEntry`. Restore clears `deletedAt` and writes audit. Rollback of content never deletes audit rows.
- `onDelete` is explicit on every FK.
- Workflow and truth are **separate columns**. Publishing updates workflow only.
- Proof Graph statuses stay on `ProofItem.verification` as today’s `VerificationStatus` (platform mandate §6). Editorial `TruthStatus` is the CMS publishing axis.

### 4.2 Enums (target)

```prisma
enum Locale {
  EN
  FR
}

enum WorkflowState {
  DRAFT
  IN_REVIEW
  APPROVED
  SCHEDULED
  PUBLISHED
  UNPUBLISHED
  ARCHIVED
}

enum TruthStatus {
  VERIFIED
  UNVERIFIED
  TO_CONFIRM
  PRIVATE
}

enum AdminRole {
  SUPER_ADMIN
  ADMIN
  EDITOR
  AUTHOR
  REVIEWER
  MEDIA_MANAGER
}

enum TranslationState {
  MISSING
  IN_PROGRESS
  COMPLETE
  OUTDATED
}

enum Visibility {
  PUBLIC
  PRIVATE
}

enum RelationType {
  FOUNDED
  LEADS
  BORN_IN
  LIVED_IN
  INVOLVED_IN
  BELONGS_TO
  REFERENCES
  DOCUMENTS
  SUPPORTED_BY
  RELATED_TO
  APPEARED_IN
  ISSUED_BY
  EVIDENCES
}

enum SourceType {
  OWNER_CONFIRMED
  PRIMARY_DOCUMENT
  PUBLIC_RECORD
  PRESS
  FIRST_PARTY
  THIRD_PARTY
  INTERNAL_NOTE
}

enum MediaKind {
  IMAGE
  VIDEO
  AUDIO
  DOCUMENT
  EMBED
}

enum StorageAdapter {
  LOCAL
  S3
  GCS
}

enum FieldKind {
  TEXT
  RICH_TEXT
  NUMBER
  BOOLEAN
  DATE
  DATETIME
  URL
  EMAIL
  SELECT
  MULTI_SELECT
  RELATION
  MEDIA
  DOCUMENT
  LOCATION
  JSON
}

// Existing enums kept: VerificationStatus, RecordKind, NowKind,
// CommitmentState, ThinkingCategory, ThinkingFormat, SignalType,
// ConnectIntent, PlaceConfirmation, ChallengeKind, ChallengeModeration,
// LearningProposalStatus, ExampleFlag.
// PublishState is retained during dual-write, then replaced by WorkflowState.
```

**Mapping from today’s `PublishState`:** `DRAFT→DRAFT`, `REVIEW→IN_REVIEW`, `PUBLISHED→PUBLISHED`, `ARCHIVED→ARCHIVED`. New: `APPROVED`, `SCHEDULED`, `UNPUBLISHED`.

**Mapping to `TruthStatus` (editorial gate, not a rewrite of Proof Graph):**

| Today `VerificationStatus` | Editorial `TruthStatus` |
|---|---|
| `VERIFIED`, `DOCUMENTED`, `CORRECTED`, `UPDATED` | `VERIFIED` (still must have sources to publish) |
| `DECLARED`, `IN_PROGRESS` | `UNVERIFIED` |
| `NEEDS_CONFIRMATION` | `TO_CONFIRM` |
| *(none)* | `PRIVATE` (new; also set `visibility = PRIVATE`) |

**Visibility vs label (D1).** Public reachability is `workflowState = PUBLISHED` AND `visibility = PUBLIC` AND `deletedAt IS NULL` AND `truthStatus != PRIVATE`. `truthStatus` is the **label** (`VERIFIED` as fact; `UNVERIFIED` / `TO_CONFIRM` as “à confirmer / to confirm”), never a visibility switch. Mandate §19 requires a public unverified/to-confirm Ask tier.

`publishingSafetyCheck` is extended, not inverted:

- It still **never mutates** `truthStatus` / `verification`.
- `EXAMPLE` still cannot be published **as fact**.
- `PRIVATE` cannot be `visibility = PUBLIC`.
- Biography / identity claims that are not `VERIFIED` may be `PUBLISHED` only if every public surface (and Ask) renders the explicit to-confirm label. They cannot be published as unlabelled fact (that is the existing unverified-as-fact block).
- Setting `truthStatus = VERIFIED` is a separate `content.verify` action (SUPER_ADMIN; biography always SUPER_ADMIN), requires at least one `ProvenanceSource` or `OWNER_CONFIRMED` attestation, writes `verifiedById` / `verifiedAt` / `verificationNote`, and is audited.

### 4.3 Auth (compatible with existing session)

```prisma
model AdminUser {
  id           String     @id @default(cuid())
  email        String     @unique
  passwordHash String
  role         AdminRole  @default(ADMIN)
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
  lastLoginAt  DateTime?
  deletedAt    DateTime?
  sessions     Session[]
  auditLogs    AuditLog[]
  uploads      MediaAsset[] @relation("Uploader")
  workflowEvents WorkflowEvent[]
}

model Session {
  id        String    @id @default(cuid())
  userId    String
  user      AdminUser @relation(fields: [userId], references: [id], onDelete: Cascade)
  tokenHash String    @unique
  expiresAt DateTime
  createdAt DateTime  @default(now())

  @@index([userId, expiresAt])
}
```

Seed/bootstrap user (today `admin@localhost`) is assigned `SUPER_ADMIN` on migrate. `requireAdmin()` stays; `requireCapability(cap)` lands in **CMS-04** and reads `role` plus the matrix in `docs/CMS-SECURITY.md`. JWT payload does **not** embed capabilities (avoids stale grants); look up the user row as today. An ADMIN cannot grant, disable, or downgrade a SUPER_ADMIN. The last SUPER_ADMIN cannot be removed.

Optional later (not required for CMS-02): `CapabilityOverride` for per-user extras. Default is role→capabilities only.

### 4.4 Shared editorial columns (applied to native content)

Every native editorial model receives (additive):

```prisma
  nodeId         String
  node           ContentNode    @relation(fields: [nodeId], references: [id], onDelete: Restrict)
  workflowState  WorkflowState  @default(DRAFT)
  truthStatus    TruthStatus    @default(TO_CONFIRM)
  visibility     Visibility     @default(PRIVATE)
  exampleFlag    ExampleFlag    @default(LIVE)
  approvedForAsk Boolean        @default(false)
  verifiedById   String?
  verifiedBy     AdminUser?     @relation("VerifiedBy", fields: [verifiedById], references: [id], onDelete: SetNull)
  verifiedAt     DateTime?
  verificationNote String       @default("")
  scheduledAt    DateTime?
  publishedAt    DateTime?
  unpublishedAt  DateTime?
  archivedAt     DateTime?
  deletedAt      DateTime?
  authorId       String?
  author         AdminUser?     @relation("Authored", fields: [authorId], references: [id], onDelete: SetNull)
  editorId       String?
  editor         AdminUser?     @relation("Edited", fields: [editorId], references: [id], onDelete: SetNull)
  reviewerId     String?
  reviewer       AdminUser?     @relation("Reviewed", fields: [reviewerId], references: [id], onDelete: SetNull)
  publisherId    String?
  publisher      AdminUser?     @relation("Published", fields: [publisherId], references: [id], onDelete: SetNull)
  submittedAt    DateTime?
  reviewedAt     DateTime?
  // existing publishState + verification retained until CMS-12 cutover
```

Schema **defaults** are safe (D4): `DRAFT`, `TO_CONFIRM`, `approvedForAsk false`, `visibility PRIVATE`. Migration sets live values explicitly for already-`CONFIRMED` seed rows (`PUBLISHED` / `VERIFIED` / `PUBLIC` / `approvedForAsk` only where today’s Ask sources are approved). `onDelete: SetNull` on author/editor/reviewer/publisher/verifiedBy so a user soft-delete cannot cascade-wipe content. `AuditLog.actor` stays Restrict — do not hard-delete users who have audit rows.

Composite index on each:

```prisma
  @@index([workflowState, truthStatus, deletedAt])
  @@index([visibility, approvedForAsk, deletedAt])
```

### 4.4b ContentNode registry (polymorphic links)

**Choice (D5): a central `ContentNode` with real FKs.** `TermBinding`, `ContentProvenance`, `TypedRelation`, `WorkflowEvent`, `SeoMetadata`, and `PendingRevision` all reference `ContentNode.id`. They do **not** use a bare `entityType` + `entityId` pair, and `SeoMetadata` has **no** FK to `ContentEntry.entityId`.

Justification: the existing `SourceLink` / `ContentRevision` optional-FK star already shows how polymorphic IDs drift. A registry row is created in the same transaction as every editorial insert (`nodeId` unique on the native/custom parent). Postgres can then enforce existence. Service-layer-only `entityType`+`entityId` cannot prevent orphans without triggers. An orphan-cleanup job still runs in CMS-11 for any crash between node create and parent create (should be zero if transactional); integrity tests assert every editorial row has a node and every node has exactly one parent.

```prisma
model ContentNode {
  id         String   @id @default(cuid())
  entityType String
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  seo        SeoMetadata[]
  terms      TermBinding[]
  provenance ContentProvenance[]
  relationsFrom TypedRelation[] @relation("RelFrom")
  relationsTo   TypedRelation[] @relation("RelTo")
  workflowEvents WorkflowEvent[]
  pending    PendingRevision?
}

model PendingRevision {
  id            String        @id @default(cuid())
  nodeId        String        @unique
  node          ContentNode   @relation(fields: [nodeId], references: [id], onDelete: Cascade)
  workflowState WorkflowState @default(DRAFT)
  snapshot      String        // full proposed JSON TEXT
  authorId      String?
  author        AdminUser?    @relation(fields: [authorId], references: [id], onDelete: SetNull)
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
}
```

**Live edit (D3).** Editing a `PUBLISHED` item does **not** mutate the live row. It creates (or updates) the single `PendingRevision` for that node (`workflowState = DRAFT`). That copy walks `DRAFT → IN_REVIEW → APPROVED →` publish, which atomically swaps `snapshot` onto the live row and writes a committed `ContentRevision`. The public site keeps serving the previous live version until that swap.

### 4.5 Native content (existing, evolved)

Sketches show **new or changed** fields. Unlisted columns stay as in `prisma/schema.prisma`.

```prisma
model IdentityProfile {
  id                String             @id @default(cuid())
  nodeId            String             @unique
  node              ContentNode        @relation(fields: [nodeId], references: [id], onDelete: Restrict)
  // locale-neutral parent. Today there is NO @@unique([locale]) on IdentityProfile
  // (two seed rows, EN and FR). CMS-08 collapses them to one parent + translations.
  fullName          String
  publicName        String
  signature         String
  nationality       String
  title             String
  associatedOrg     String
  birthDate         String
  birthPlace        String
  rolesLine         String
  commandLine       String             // optional; never a motto; TO_CONFIRM when non-empty
  summary           String
  multiculturalNote String
  portraitCaption   String
  portraitAssetId   String?
  portraitAsset     MediaAsset?        @relation(fields: [portraitAssetId], references: [id], onDelete: SetNull)
  publishState      PublishState       @default(DRAFT)
  verification      VerificationStatus @default(NEEDS_CONFIRMATION)
  workflowState     WorkflowState      @default(DRAFT)
  truthStatus       TruthStatus        @default(TO_CONFIRM)
  visibility        Visibility         @default(PRIVATE)
  exampleFlag       ExampleFlag        @default(LIVE)
  approvedForAsk    Boolean            @default(false)
  verifiedById      String?
  verifiedAt        DateTime?
  verificationNote  String             @default("")
  deletedAt         DateTime?
  createdAt         DateTime           @default(now())
  updatedAt         DateTime           @updatedAt
  revisions         ContentRevision[]
  translations      IdentityTranslation[]
}

model IdentityTranslation {
  id               String           @id @default(cuid())
  profileId        String
  profile          IdentityProfile  @relation(fields: [profileId], references: [id], onDelete: Cascade)
  locale           Locale
  nationality      String
  title            String
  rolesLine        String
  commandLine      String
  summary          String
  multiculturalNote String
  portraitCaption  String
  state            TranslationState @default(MISSING)
  sourceLocale     Locale           @default(FR)
  lastTranslatedAt DateTime?
  outdatedAt       DateTime?
  createdAt        DateTime         @default(now())
  updatedAt        DateTime         @updatedAt

  @@unique([profileId, locale])
}

model Place {
  id            String             @id @default(cuid())
  slug          String             @unique
  kind          String
  lat           Float?
  lng           Float?
  confirmation  PlaceConfirmation
  sortOrder     Int                @default(0)
  countryTermId String?
  countryTerm   TaxonomyTerm?      @relation("PlaceCountry", fields: [countryTermId], references: [id], onDelete: SetNull)
  // nameEn/nameFr/noteEn/noteFr retained until PlaceTranslation cutover
  nameEn        String
  nameFr        String
  countryEn     String?
  countryFr     String?
  noteEn        String
  noteFr        String
  publishState  PublishState       @default(DRAFT)
  verification  VerificationStatus @default(NEEDS_CONFIRMATION)
  workflowState WorkflowState      @default(DRAFT)
  truthStatus   TruthStatus        @default(TO_CONFIRM)
  visibility    Visibility         @default(PRIVATE)
  exampleFlag   ExampleFlag        @default(LIVE)
  approvedForAsk Boolean           @default(false)
  deletedAt     DateTime?
  sources       SourceLink[]
  translations  PlaceTranslation[]
  createdAt     DateTime           @default(now())
  updatedAt     DateTime           @updatedAt
  revisions     ContentRevision[]

  @@index([workflowState, truthStatus, deletedAt])
}

model PlaceTranslation {
  id           String           @id @default(cuid())
  placeId      String
  place        Place            @relation(fields: [placeId], references: [id], onDelete: Cascade)
  locale       Locale
  name         String
  country      String?
  note         String
  state        TranslationState @default(MISSING)
  sourceLocale Locale           @default(FR)
  lastTranslatedAt DateTime?
  outdatedAt   DateTime?
  createdAt    DateTime         @default(now())
  updatedAt    DateTime         @updatedAt

  @@unique([placeId, locale])
}

model JourneyChapter {
  id            String             @id @default(cuid())
  slug          String             @unique
  sortOrder     Int
  yearLabel     String
  badge         String             // verified | needs | none — mirrors journeyChapters()
  workflowState WorkflowState      @default(DRAFT)
  truthStatus   TruthStatus        @default(TO_CONFIRM)
  visibility    Visibility         @default(PRIVATE)
  exampleFlag   ExampleFlag        @default(LIVE)
  deletedAt     DateTime?
  translations  JourneyChapterTranslation[]
  createdAt     DateTime           @default(now())
  updatedAt     DateTime           @updatedAt

  @@index([sortOrder])
}

model JourneyChapterTranslation {
  id           String           @id @default(cuid())
  chapterId    String
  chapter      JourneyChapter   @relation(fields: [chapterId], references: [id], onDelete: Cascade)
  locale       Locale
  title        String
  body         String
  state        TranslationState
  sourceLocale Locale           @default(FR)
  lastTranslatedAt DateTime?
  outdatedAt   DateTime?
  createdAt    DateTime         @default(now())
  updatedAt    DateTime         @updatedAt
  @@unique([chapterId, locale])
}

model Venture {
  id           String             @id @default(cuid())
  slug         String             @unique
  name         String
  exposureOnly Boolean            @default(true)
  startDate    String?
  organizationId String?
  organization Organization?      @relation(fields: [organizationId], references: [id], onDelete: SetNull)
  // roleEn/roleFr/summaryEn/summaryFr kept during dual-write
  roleEn       String
  roleFr       String
  summaryEn    String
  summaryFr    String
  publishState PublishState       @default(DRAFT)
  verification VerificationStatus @default(NEEDS_CONFIRMATION)
  workflowState WorkflowState     @default(DRAFT)
  truthStatus  TruthStatus        @default(TO_CONFIRM)
  visibility   Visibility         @default(PRIVATE)
  exampleFlag  ExampleFlag        @default(LIVE)
  approvedForAsk Boolean          @default(false)
  deletedAt    DateTime?
  sources      SourceLink[]
  createdAt    DateTime           @default(now())
  updatedAt    DateTime           @updatedAt
  revisions    ContentRevision[]
}

model Organization {
  id            String   @id @default(cuid())
  slug          String   @unique
  name          String
  exposureOnly  Boolean  @default(true)
  workflowState WorkflowState @default(DRAFT)
  truthStatus   TruthStatus   @default(TO_CONFIRM)
  visibility    Visibility    @default(PRIVATE)
  deletedAt     DateTime?
  ventures      Venture[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model RecordEvent {
  id           String             @id @default(cuid())
  slug         String             @unique
  kind         RecordKind
  year         Int?
  occurredOn   String?
  titleEn      String
  titleFr      String
  contextEn    String
  contextFr    String
  decisionEn   String
  decisionFr   String
  actionEn     String
  actionFr     String
  resultEn     String
  resultFr     String
  lessonEn     String
  lessonFr     String
  publishState PublishState       @default(DRAFT)
  verification VerificationStatus @default(NEEDS_CONFIRMATION)
  workflowState WorkflowState     @default(DRAFT)
  truthStatus  TruthStatus        @default(TO_CONFIRM)
  visibility   Visibility         @default(PRIVATE)
  exampleFlag  ExampleFlag        @default(LIVE)
  approvedForAsk Boolean          @default(false)
  deletedAt    DateTime?
  proofs       ProofItem[]
  sources      SourceLink[]
  translations RecordEventTranslation[]
  createdAt    DateTime           @default(now())
  updatedAt    DateTime           @updatedAt
  revisions    ContentRevision[]

  @@index([year, occurredOn])
  @@index([workflowState, truthStatus, deletedAt])
}

model RecordEventTranslation {
  id           String           @id @default(cuid())
  recordId     String
  record       RecordEvent      @relation(fields: [recordId], references: [id], onDelete: Cascade)
  locale       Locale
  title        String
  context      String
  decision     String
  action       String
  result       String
  lesson       String
  state        TranslationState
  sourceLocale Locale           @default(FR)
  lastTranslatedAt DateTime?
  outdatedAt   DateTime?
  createdAt    DateTime         @default(now())
  updatedAt    DateTime         @updatedAt
  @@unique([recordId, locale])
}

model ProofItem {
  id              String             @id @default(cuid())
  slug            String             @unique
  claimEn         String
  claimFr         String
  contextEn       String
  contextFr       String
  evidenceEn      String
  evidenceFr      String
  occurredOn      String?
  lastUpdateOn    String?
  relatedRecordId String?
  relatedRecord   RecordEvent?       @relation(fields: [relatedRecordId], references: [id], onDelete: SetNull)
  publishState    PublishState       @default(DRAFT)
  verification    VerificationStatus @default(NEEDS_CONFIRMATION) // Proof Graph status — unchanged enum
  workflowState   WorkflowState      @default(DRAFT)
  truthStatus     TruthStatus        @default(TO_CONFIRM)
  visibility      Visibility         @default(PRIVATE)
  exampleFlag     ExampleFlag        @default(LIVE)
  approvedForAsk  Boolean            @default(false)
  deletedAt       DateTime?
  sources         SourceLink[]
  createdAt       DateTime           @default(now())
  updatedAt       DateTime           @updatedAt
  revisions       ContentRevision[]
}

model NowItem {
  id           String             @id @default(cuid())
  kind         NowKind
  locale       Locale             // dual-write; NowItemTranslation later
  title        String
  body         String
  occurredOn   String?
  version      Int                @default(1)
  publishState PublishState       @default(DRAFT)
  verification VerificationStatus @default(NEEDS_CONFIRMATION)
  workflowState WorkflowState     @default(DRAFT)
  truthStatus  TruthStatus        @default(TO_CONFIRM)
  visibility   Visibility         @default(PRIVATE)
  exampleFlag  ExampleFlag        @default(EXAMPLE)
  approvedForAsk Boolean          @default(false)
  deletedAt    DateTime?
  sources      SourceLink[]
  createdAt    DateTime           @default(now())
  updatedAt    DateTime           @updatedAt
  revisions    ContentRevision[]

  @@index([kind, locale])
  @@index([workflowState, truthStatus, deletedAt])
}

model AskSource {
  id           String             @id @default(cuid())
  slug         String             @unique
  titleEn      String
  titleFr      String
  bodyEn       String
  bodyFr       String
  canonicalUrl String
  tags         String             @default("")
  approved     Boolean            @default(false) // legacy; prefer approvedForAsk
  publishState PublishState       @default(DRAFT)
  verification VerificationStatus @default(NEEDS_CONFIRMATION)
  workflowState WorkflowState     @default(DRAFT)
  truthStatus  TruthStatus        @default(TO_CONFIRM)
  visibility   Visibility         @default(PRIVATE)
  exampleFlag  ExampleFlag        @default(LIVE)
  approvedForAsk Boolean          @default(false)
  deletedAt    DateTime?
  links        SourceLink[]
  createdAt    DateTime           @default(now())
  updatedAt    DateTime           @updatedAt

  @@index([approvedForAsk, workflowState, truthStatus, visibility, deletedAt])
}
```

`ThinkingPiece`, `Thesis`, `SignalPost`, `LedgerCommitment`, `Achievement`, `MediaItem` (appearances) follow the same additive editorial columns. `MediaItem` is **not** the file library.

**New natives (empty until owner-supplied facts):** `Principle`, `Project`, `Publication`, `SocialLink`. They use the same editorial columns + translation tables. No seed facts.

### 4.6 Custom types, fields, blocks (no EAV)

```prisma
model ContentType {
  id          String   @id @default(cuid())
  key         String   @unique
  name        String
  native      Boolean  @default(false) // true = code-backed (RecordEvent, …)
  description String   @default("")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  fields      FieldDefinition[]
  entries     ContentEntry[]
}

model FieldDefinition {
  id            String    @id @default(cuid())
  contentTypeId String
  contentType   ContentType @relation(fields: [contentTypeId], references: [id], onDelete: Cascade)
  key           String
  kind          FieldKind
  required      Boolean   @default(false)
  localized     Boolean   @default(true)
  minLength     Int?
  maxLength     Int?
  pattern       String?
  minNumber     Float?
  maxNumber     Float?
  defaultText   String?
  helpText      String    @default("")
  sortOrder     Int       @default(0)
  groupKey      String?
  visible       Boolean   @default(true)
  relationToKey String?   // ContentType.key or native model name
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  options       FieldOption[]

  @@unique([contentTypeId, key])
  @@index([contentTypeId, sortOrder])
}

model FieldOption {
  id        String          @id @default(cuid())
  fieldId   String
  field     FieldDefinition @relation(fields: [fieldId], references: [id], onDelete: Cascade)
  value     String
  labelEn   String
  labelFr   String
  sortOrder Int             @default(0)

  @@unique([fieldId, value])
}

model ContentEntry {
  id            String       @id @default(cuid())
  contentTypeId String
  contentType   ContentType  @relation(fields: [contentTypeId], references: [id], onDelete: Restrict)
  slug          String
  workflowState WorkflowState @default(DRAFT)
  truthStatus   TruthStatus   @default(TO_CONFIRM)
  visibility    Visibility    @default(PRIVATE)
  exampleFlag   ExampleFlag   @default(LIVE)
  approvedForAsk Boolean      @default(false)
  scheduledAt   DateTime?
  publishedAt   DateTime?
  unpublishedAt DateTime?
  deletedAt     DateTime?
  authorId      String?
  author        AdminUser?   @relation(fields: [authorId], references: [id], onDelete: SetNull)
  // JSONB: non-localized custom field values only (key → scalar/array/id)
  customValues  Json         @default("{}")
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
  translations  ContentEntryTranslation[]
  blocks        ContentBlock[]

  @@unique([contentTypeId, slug])
  @@index([workflowState, truthStatus, deletedAt])
}

model ContentEntryTranslation {
  id           String           @id @default(cuid())
  entryId      String
  entry        ContentEntry     @relation(fields: [entryId], references: [id], onDelete: Cascade)
  locale       Locale
  state        TranslationState @default(MISSING)
  sourceLocale Locale           @default(FR)
  lastTranslatedAt DateTime?
  outdatedAt   DateTime?
  // JSONB: localized custom field values only
  customValues Json             @default("{}")
  createdAt    DateTime         @default(now())
  updatedAt    DateTime         @updatedAt

  @@unique([entryId, locale])
}

model ContentBlock {
  id        String       @id @default(cuid())
  entryId   String
  entry     ContentEntry @relation(fields: [entryId], references: [id], onDelete: Cascade)
  type      String       // Hero, Biography, Quote, Timeline, Gallery, MediaGrid,
                         // Cta, Statistics, FeaturedRecord, JourneySegment, Proof,
                         // RichText, ImageText, Video, Document, Embed, Contact, SocialLinks
  sortOrder Int          @default(0)
  locale    Locale?      // null = shared structure; payload may embed locale keys
  payload   Json         @default("{}") // JSONB — block payload only
  createdAt DateTime     @default(now())
  updatedAt DateTime     @updatedAt

  @@index([entryId, sortOrder])
}
```

`FieldKind.JSON` is allowed only when a field is itself a justified nested object (rare). It still stores inside `customValues`, not a side table.

Block types are **allowlisted in code** (no uncontrolled drag-and-drop schema). Admin can instantiate allowlisted types; they cannot invent a new block type without a deploy.

### 4.7 Taxonomy, provenance, typed relations

```prisma
model TaxonomyTerm {
  id            String   @id @default(cuid())
  slug          String
  vocabulary    String   // category | tag | topic | industry | location | organization | role
  parentId      String?
  parent        TaxonomyTerm?  @relation("TermTree", fields: [parentId], references: [id], onDelete: Restrict)
  children      TaxonomyTerm[] @relation("TermTree")
  workflowState WorkflowState  @default(DRAFT)
  truthStatus   TruthStatus    @default(TO_CONFIRM)
  deletedAt     DateTime?
  translations  TaxonomyTermTranslation[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@unique([vocabulary, slug])
  @@index([vocabulary, parentId])
}

model TaxonomyTermTranslation {
  id           String           @id @default(cuid())
  termId       String
  term         TaxonomyTerm     @relation(fields: [termId], references: [id], onDelete: Cascade)
  locale       Locale
  label        String
  state        TranslationState @default(MISSING)
  sourceLocale Locale           @default(FR)
  createdAt    DateTime         @default(now())
  updatedAt    DateTime         @updatedAt
  @@unique([termId, locale])
}

model TermBinding {
  id        String       @id @default(cuid())
  termId    String
  term      TaxonomyTerm @relation(fields: [termId], references: [id], onDelete: Cascade)
  nodeId    String
  node      ContentNode  @relation(fields: [nodeId], references: [id], onDelete: Cascade)
  createdAt DateTime     @default(now())

  @@unique([termId, nodeId])
  @@index([nodeId])
}

model ProvenanceSource {
  id           String             @id @default(cuid())
  sourceType   SourceType
  url          String?
  title        String
  publishedOn  String?
  notes        String             @default("")
  confidenceNote String           @default("") // text, never a percentage
  verification VerificationStatus @default(NEEDS_CONFIRMATION)
  verifiedById String?
  verifiedBy   AdminUser?         @relation(fields: [verifiedById], references: [id], onDelete: SetNull)
  verifiedAt   DateTime?
  mediaAssetId String?
  mediaAsset   MediaAsset?        @relation(fields: [mediaAssetId], references: [id], onDelete: SetNull)
  createdAt    DateTime           @default(now())
  updatedAt    DateTime           @updatedAt
  links        ContentProvenance[]

  @@index([sourceType, verification])
}

model ContentProvenance {
  id            String           @id @default(cuid())
  sourceId      String
  source        ProvenanceSource @relation(fields: [sourceId], references: [id], onDelete: Restrict)
  nodeId        String
  node          ContentNode      @relation(fields: [nodeId], references: [id], onDelete: Cascade)
  isApprovedAsk Boolean          @default(false)
  createdAt     DateTime         @default(now())

  @@unique([sourceId, nodeId])
  @@index([nodeId])
}

model TypedRelation {
  id            String        @id @default(cuid())
  fromNodeId    String
  fromNode      ContentNode   @relation("RelFrom", fields: [fromNodeId], references: [id], onDelete: Restrict)
  toNodeId      String
  toNode        ContentNode   @relation("RelTo", fields: [toNodeId], references: [id], onDelete: Restrict)
  relationType  RelationType
  validFrom     String?
  validTo       String?
  truthStatus   TruthStatus   @default(TO_CONFIRM)
  workflowState WorkflowState @default(DRAFT)
  visibility    Visibility    @default(PRIVATE)
  note          String        @default("")
  deletedAt     DateTime?
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  @@unique([fromNodeId, toNodeId, relationType])
  @@index([fromNodeId])
  @@index([toNodeId])
  @@index([relationType, workflowState, truthStatus])
}
```

`SourceLink` remains until CMS-12; writers dual-write to `ContentProvenance`. `onDelete: Restrict` on provenance source prevents silently dropping the only evidence for a claim.

### 4.8 Media metadata (bytes are not in Postgres)

```prisma
model MediaAsset {
  id               String         @id @default(cuid())
  storageKey       String         @unique
  adapter          StorageAdapter @default(LOCAL)
  kind             MediaKind
  originalFilename String
  mimeDeclared     String
  mimeSniffed      String
  checksumSha256   String
  byteSize         Int
  width            Int?
  height           Int?
  durationMs       Int?
  focalX           Float?
  focalY           Float?
  visibility       Visibility     @default(PRIVATE)
  workflowState    WorkflowState  @default(DRAFT)
  truthStatus      TruthStatus    @default(TO_CONFIRM)
  uploaderId       String?
  uploader         AdminUser?     @relation("Uploader", fields: [uploaderId], references: [id], onDelete: SetNull)
  deletedAt        DateTime?
  createdAt        DateTime       @default(now())
  updatedAt        DateTime       @updatedAt
  derivatives      MediaDerivative[]
  translations     MediaAssetTranslation[]

  @@index([visibility, deletedAt])
  @@index([checksumSha256])
}

model MediaDerivative {
  id         String     @id @default(cuid())
  assetId    String
  asset      MediaAsset @relation(fields: [assetId], references: [id], onDelete: Cascade)
  kind       String     // thumbnail | sm | md | lg | avif | webp
  storageKey String     @unique
  mime       String
  width      Int
  height     Int
  checksumSha256 String
  byteSize   Int
  createdAt  DateTime   @default(now())
}

model MediaAssetTranslation {
  id          String     @id @default(cuid())
  assetId     String
  asset       MediaAsset @relation(fields: [assetId], references: [id], onDelete: Cascade)
  locale      Locale
  title       String     @default("")
  caption     String     @default("")
  description String     @default("")
  alt         String     @default("")
  credits     String     @default("")
  copyright   String     @default("")
  sourceNote  String     @default("")
  state       TranslationState @default(MISSING)
  sourceLocale Locale    @default(FR)
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  @@unique([assetId, locale])
}
```

Public HTML never contains `storageKey` for `visibility = PRIVATE`. See `docs/CMS-MIGRATION.md` §10.

### 4.9 SEO, navigation, settings, workflow log, observability

```prisma
model SeoMetadata {
  id           String      @id @default(cuid())
  nodeId       String
  node         ContentNode @relation(fields: [nodeId], references: [id], onDelete: Cascade)
  locale       Locale
  title        String      @default("")
  description  String      @default("")
  canonical    String      @default("")
  ogTitle      String      @default("")
  ogImageId    String?
  robots       String      @default("index,follow")
  schemaType   String      @default("")
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt

  @@unique([nodeId, locale])
}

model NavItem {
  id            String   @id @default(cuid())
  locale        Locale
  label         String
  href          String
  sortOrder     Int      @default(0)
  parentId      String?
  parent        NavItem? @relation("NavTree", fields: [parentId], references: [id], onDelete: Restrict)
  children      NavItem[] @relation("NavTree")
  workflowState WorkflowState @default(DRAFT)
  deletedAt     DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([locale, sortOrder])
}

model SiteSetting {
  id        String   @id @default(cuid())
  key       String   @unique
  valueText String   @default("")
  updatedAt DateTime @updatedAt
}

model WorkflowEvent {
  id        String        @id @default(cuid())
  actorId   String?
  actor     AdminUser?    @relation(fields: [actorId], references: [id], onDelete: SetNull)
  nodeId    String
  node      ContentNode   @relation(fields: [nodeId], references: [id], onDelete: Cascade)
  fromState WorkflowState?
  toState   WorkflowState
  note      String        @default("")
  createdAt DateTime      @default(now())

  @@index([nodeId, createdAt])
}

model CmsObservabilityEvent {
  id         String   @id @default(cuid())
  name       String   // publish_failure | validation_failure | broken_media |
                      // search_miss | quality_issue | editor_correction | bottleneck
  entityType String   @default("")
  entityId   String   @default("")
  detail     String   @default("")
  createdAt  DateTime @default(now())

  @@index([name, createdAt])
}
```

`AuditLog` and `ContentRevision` stay. Extend (additive):

```prisma
model AuditLog {
  id        String     @id @default(cuid())
  actorId   String?
  actor     AdminUser? @relation(fields: [actorId], references: [id], onDelete: Restrict)
  action    String
  entity    String
  entityId  String
  summary   String
  payload   String     @default("{}") // TEXT snapshot/diff, not JSONB
  requestPath String   @default("")
  requestId   String   @default("")
  createdAt DateTime   @default(now())

  @@index([entity, entityId])
  @@index([actorId, createdAt])
}

model ContentRevision {
  id        String   @id @default(cuid())
  entity    String
  entityId  String
  version   Int
  snapshot  String   // full JSON TEXT, not JSONB
  note      String   @default("")
  actorId   String?
  createdAt DateTime @default(now())
  // optional typed FKs from today remain during dual-write

  @@unique([entity, entityId, version])
  @@index([entity, entityId])
}
```

`AnalyticsEvent`, `RateLimitEntry`, `ConnectRequest`, `LearningProposal`, `ChallengeEntry` stay as they are (operational, not CMS-edited identity).

### 4.10 Soft delete justification

Used on editorial entities and `MediaAsset` because mandate §9 requires restore and mandate §11 forbids destroying audit/history. Not used on `Session` (logout deletes rows), `RateLimitEntry` (ephemeral), or `AuditLog` / `WorkflowEvent` / `CmsObservabilityEvent` (append-only).

---

## 5. Entity relationships

### 5.1 ER diagram (core CMS + graph)

```mermaid
erDiagram
  AdminUser ||--o{ Session : has
  AdminUser ||--o{ AuditLog : acts
  AdminUser ||--o{ MediaAsset : uploads
  AdminUser ||--o{ WorkflowEvent : performs

  ContentNode ||--o{ SeoMetadata : seo
  ContentNode ||--o{ TermBinding : tagged
  ContentNode ||--o{ ContentProvenance : cited
  ContentNode ||--o{ WorkflowEvent : logged
  ContentNode ||--o{ PendingRevision : pending
  ContentNode ||--o{ TypedRelation : from_rel
  ContentNode ||--o{ TypedRelation : to_rel

  ContentType ||--o{ FieldDefinition : defines
  FieldDefinition ||--o{ FieldOption : options
  ContentType ||--o{ ContentEntry : instances
  ContentEntry ||--o{ ContentEntryTranslation : localized
  ContentEntry ||--o{ ContentBlock : blocks
  ContentEntry ||--|| ContentNode : node

  Place ||--o{ PlaceTranslation : localized
  RecordEvent ||--o{ RecordEventTranslation : localized
  RecordEvent ||--o{ ProofItem : related
  JourneyChapter ||--o{ JourneyChapterTranslation : localized

  Organization ||--o{ Venture : ventures
  Venture ||--o| Organization : belongs

  ProvenanceSource ||--o{ ContentProvenance : cited_by
  MediaAsset ||--o{ MediaDerivative : derivatives
  MediaAsset ||--o{ MediaAssetTranslation : localized

  TaxonomyTerm ||--o{ TaxonomyTermTranslation : localized
  TaxonomyTerm ||--o{ TermBinding : binds
  TaxonomyTerm ||--o{ TaxonomyTerm : parent

  IdentityProfile ||--o{ IdentityTranslation : localized
  IdentityProfile ||--|| ContentNode : node
  AskSource ||--o{ SourceLink : legacy
```

`TypedRelation` uses real FKs `fromNodeId` / `toNodeId` on `ContentNode` (not a string entityType pair).

### 5.2 Typed relationship graph feeding the Proof Graph

The public Proof Graph (`components/proof/proof-graph.tsx`) today renders `ProofItem` rows from `getPublishedProofs()` (`lib/queries.ts`). The CMS graph **feeds** that view; it does not replace Proof statuses with confidence percentages.

```mermaid
flowchart LR
  EJC["IdentityProfile / Person lock"]
  Org["Organization / Venture"]
  Place["Place"]
  Rec["RecordEvent"]
  Proof["ProofItem"]
  Media["MediaItem appearance or MediaAsset"]
  Think["ThinkingPiece / Publication"]
  Prov["ProvenanceSource"]

  EJC -- "FOUNDED / LEADS" --> Org
  EJC -- "BORN_IN" --> Place
  Rec -- "BELONGS_TO journey" --> EJC
  Proof -- "EVIDENCES / RELATED_TO" --> Rec
  Media -- "DOCUMENTS" --> Rec
  Think -- "REFERENCES" --> Rec
  Prov -- "SUPPORTED_BY" --> Proof
  Prov -- "SUPPORTED_BY" --> Rec
```

**TypedRelation examples (illustrative, non-factual except Kinshasa):**

| from | relationType | to | truth | notes |
|---|---|---|---|---|
| IdentityProfile | `BORN_IN` | Place `kinshasa` | `VERIFIED` | Birthplace already seeded. Not `LIVED_IN`. |
| IdentityProfile | `LEADS` | Organization `clevone-sarl` | `VERIFIED` | Exposure only; not a catalogue |
| ProofItem `origin-kinshasa` | `EVIDENCES` | RecordEvent `birth-kinshasa-1994` | `VERIFIED` | Today’s `relatedRecordId` |
| ProofItem | `SUPPORTED_BY` | ProvenanceSource `mandate-confirmed-facts` | `VERIFIED` | Today’s `SourceLink` |

Public Proof Graph query (target):

```
ProofItem
  WHERE workflowState = PUBLISHED
    AND visibility = PUBLIC
    AND truthStatus != PRIVATE
    AND deletedAt IS NULL
  INCLUDE published TypedRelation, ProvenanceSource, related RecordEvent
```

`PRIVATE` relations and sources are omitted even if the proof row itself is public.

---

## 6. Custom-field strategy

1. **Native entities stay relational.** Biography, Journey, Places, NOW, Record, Proof, Thinking, Ask sources, etc. do not dump their critical fields into JSONB.
2. **Admin-defined types** (`ContentType.native = false`) use `FieldDefinition` rows (kind, required, localized, validation columns, help, order, group, visibility).
3. **Values** sit in `ContentEntry.customValues` / `ContentEntryTranslation.customValues` (JSONB). Shape is `{ [fieldKey]: unknown }` validated against `FieldDefinition` in the service layer (Zod built from definitions).
4. **Select options** are `FieldOption` rows, not JSON.
5. **Relations and media** store IDs in JSONB (`"portrait": "clxyz"` / `"places": ["id1"]`) and are resolved/verified as real FKs by the service (existence, visibility, not private).
6. **No EAV.** A `ContentFieldValue` table would multiply joins, complicate translations, and fight Postgres JSONB indexing. If a single field must be queried at scale, CMS-06 may add a generated column or expression index on `customValues->>'key'` — still not EAV.
7. **`FieldKind.JSON`** is last-resort for a nested object that is not worth a native model. It is still stored inside `customValues`.
8. Localization: if `FieldDefinition.localized`, the value lives only on the translation row. Source-locale edit marks other locales `OUTDATED`.

---

## 7. Localization

FR is the **primary editorial language** (`sourceLocale` defaults to `FR`). EN is first-class, not a duplicated record.

### Rules

- Do not clone entire `RecordEvent` (etc.) rows per locale. Use `*Translation` entities with `@@unique([parentId, locale])`.
- During dual-write, existing `titleEn`/`titleFr` and row-per-locale tables remain the read source until CMS-08 flips loaders.
- Translation states: `MISSING`, `IN_PROGRESS`, `COMPLETE`, `OUTDATED`.
- Editing the source locale (default FR) sets `outdatedAt = now()` and `state = OUTDATED` on the other locale if that locale was `COMPLETE`.
- `lastTranslatedAt` updates only when a translator saves a non-source locale.
- Admin Translations view lists missing/outdated counts per entity.
- **FR/EN public policy (one rule, D6).** FR is primary. A slug may be published when the FR translation is `COMPLETE` (workflow + truth/label + safety still apply). EN `MISSING` is **not** a publish gate.
  - Public site: `/en/{slug}` **404s** when EN is `MISSING`. No silent FR-in-EN copy (avoids duplicate content). `/fr/{slug}` remains the canonical page.
  - Sitemap and `hreflang`: emit the EN alternate only when EN is `COMPLETE` or `OUTDATED` (an EN string exists).
  - Ask EJC: use the requested locale when that translation is `COMPLETE` or `OUTDATED`; otherwise answer from FR and label the locale. Never invent an EN sentence.
  - Migration copies today’s EN and FR column/row strings as `COMPLETE`, so existing `/en` URLs and e2e keep working.
- UI chrome (nav labels, buttons) stays in `lib/i18n.ts` until/unless `NavItem` replaces explore/nav in CMS-09. **Biography facts do not belong in the dictionary** long-term; `CONFIRMED` + CMS rows own them.

### Identity / Now / Signal (one pattern)

One locale-neutral parent + `*Translation` children with `@@unique([parentId, locale])`. Same as Place and Record. Today `IdentityProfile` / `NowItem` / `SignalPost` are **row-per-locale with no unique-on-locale constraint**. CMS-08 collapses the two identity seed rows into one `IdentityProfile` + two `IdentityTranslation`s. Do not introduce a `profileGroupId` alias — the FK is `profileId`.

---

## Indexes checklist (CMS-02)

| Table | Index | Why |
|---|---|---|
| All editorial | `(workflowState, truthStatus, deletedAt)` | Public/admin lists |
| `AskSource` | `(approvedForAsk, workflowState, truthStatus, visibility, deletedAt)` | Ask corpus |
| `TypedRelation` | `(fromNodeId)`, `(toNodeId)`, unique `(fromNodeId, toNodeId, relationType)` | Proof Graph |
| `ContentProvenance` | `(nodeId)` | Sources on a claim |
| `ContentEntry` | unique `(contentTypeId, slug)` | URLs |
| `MediaAsset` | `checksumSha256`, `(visibility, deletedAt)` | Dedup + access |
| `AuditLog` | `(entity, entityId)`, `(actorId, createdAt)` | Security screen |
| `SeoMetadata` | unique `(nodeId, locale)` | CMS-09 |
| `RecordEvent` | `(year, occurredOn)` | Existing Record order |

GIN on `ContentEntry.customValues` and `ContentBlock.payload` only after CMS-06 has query patterns.

---

## Related documents

RBAC and workflow actors: `docs/CMS-SECURITY.md`, `docs/CMS-IMPLEMENTATION-PLAN.md`. Media adapters: `docs/CMS-MIGRATION.md`.
