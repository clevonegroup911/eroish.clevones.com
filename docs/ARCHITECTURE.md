# Architecture — eroish.clevones.com

Official public identity platform for **Eroish Clevone Jeamson** (public name **Eroish J Clevone**, signature **EJC**). This is not a CLEVONE SARL product site, portfolio, résumé, or luxury showcase.

Conventions (Next.js App Router, Prisma, Nginx/PM2 on the existing VM, security headers, trusted `APP_ORIGIN`) follow the ops style of `clevones.com` without sharing branding or content.

## Runtime

- **Next.js 15** App Router, React 19, TypeScript strict
- **Tailwind CSS v4** editorial tokens (paper / ink / deep — no gold, no gradients)
- **Prisma** + **SQLite** for local, CI, and tests (`file:./dev.db` next to the schema)
- **PostgreSQL** for production on the Nginx VM (provider switch documented in `docs/DEPLOYMENT.md`)
- **Vitest** unit tests, **Playwright** e2e + screenshots
- **FR/EN** via `/en` and `/fr`; `/` negotiates `Accept-Language`

## Public systems

| Path | Mandate |
|---|---|
| `/[locale]` | Presence, confirmed facts, journey chapters, explore entry |
| `/identity` | Who I am + venture exposure (not a catalogue) |
| `/now` | Current focus/objective/challenge/decision/action/result/lesson/signal |
| `/record` | Evidence-based chronological record + filters |
| `/proof` | Proof Graph + verification statuses |
| `/ledger` | Reputation ledger of commitments |
| `/thinking` | Essays/notes with permanent URLs |
| `/challenge` | Moderated thesis challenges + version history |
| `/ask` | Sourced retrieval only; refusal when no source |
| `/connect` | Intent router, honeypot, rate limit |
| `/signal` | Timestamped short posts |
| `/journey` | Scroll-driven chapters |
| `/places` | Confirmed Kinshasa + structured unconfirmed slots |
| `/principles` | Personal principles stay empty until written |
| `/media` | Sourced appearances only |
| `/privacy` | What this site never publishes |

`Explore EJC` is a command layer (homepage control + ⌘K) that routes into those systems.

## Data & trust

Every public entity has `publishState`, `verification`, optional `exampleFlag`, sources, and `ContentRevision` + `AuditLog` history.

**Publishing safety** (`lib/publishing-safety.ts`) blocks `PUBLISHED` when:

- verification is unverified-as-fact (`NEEDS_CONFIRMATION`, `DECLARED`, `IN_PROGRESS`)
- there is no source
- `exampleFlag === EXAMPLE`

Review-state placeholders may appear in the UI **labelled** as example / needs confirmation. They are not published as fact.

## Ask EJC

`lib/ask-ejc.ts` is a sourced retrieval stub over `AskSource` rows with `approved: true`. It cites matching sources or refuses. It does not call a generative model and cannot invent achievements, wealth, or relationships.

## Connect

Validated intent payload, hidden honeypot (`website`), in-memory rate limit (swap for Redis/Postgres on the VM if needed). Stored `ipHash` only — never a raw IP in the admin UI.

## Admin

Cookie session (HMAC JWT via `jose`). Command center: Now, Record, Proofs, Places, Ventures, Thinking, Signals, Challenges, Ask sources, Connect, Media, Identity, Learning, Security/audit, Analytics.

Learning Engine writes **proposals** from meaningful events (refusals, claim inspections, qualified connect). Proposals require human approval and never rewrite identity autonomously.

## Security

`middleware.ts` sets a per-request CSP with a script nonce (`strict-dynamic`; `unsafe-eval` only in development). `style-src` still allows `'unsafe-inline'` because Next/Tailwind emit inline styles. Other headers (`X-Frame-Options: DENY`, nosniff, Referrer-Policy, Permissions-Policy, HSTS) are set in `next.config.ts`. Admin routes verify the HMAC JWT in middleware and again in every console page, action, and data load. `APP_ORIGIN` is never derived from `Host` / `X-Forwarded-*`. Middleware redirects clone `request.nextUrl` so `Location` uses the request host (never a baked-in `localhost`). Route handlers may use a relative `Location`.

## Identity graph

`lib/identity.ts` is the only module allowed to state confirmed biographical facts. Schema.org `Person` JSON-LD is emitted from that module.
