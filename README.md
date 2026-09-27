# eroish.clevones.com

Official, independent public identity and authority platform for **Eroish Clevone Jeamson**.

- Public name: **Eroish J Clevone**
- Signature: **EJC**
- Congolese entrepreneur, businessman, builder, Founder/CEO
- Associated with **CLEVONE SARL** (journey exposure only — not a product or services catalogue)

This is not a portfolio, résumé, LinkedIn clone, Wikipedia-style dump, influencer page, or luxury site.

## Confirmed facts only

The public record states: full name, public name, signature, Congolese nationality, roles, Founder/CEO, association with CLEVONE SARL, and birth in Kinshasa on 1 September 1994. He grew up and lived across different countries, cities and provinces; those specific places are **not** confirmed and appear as structured placeholders.

**Never invent facts.** Empty + verified beats complete + fictional.

## Stack

Next.js 15 (App Router) · TypeScript strict · Tailwind CSS v4 · Prisma (SQLite locally, PostgreSQL in production) · Vitest · Playwright · GitHub Actions.

## Local development

```bash
cp .env.example .env
npm install
npx prisma db push
npx tsx prisma/seed.ts
npm run dev
```

- Public: [http://127.0.0.1:3000/en](http://127.0.0.1:3000/en)
- Admin: [http://127.0.0.1:3000/admin/login](http://127.0.0.1:3000/admin/login) — `admin@localhost` / `change-this-admin-password` (local only)

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

End-to-end tests start their own server on `http://127.0.0.1:3100` (override with `E2E_ORIGIN`). They use a production `next start` only when `.next/BUILD_ID` exists; otherwise they use `next dev`. Screenshots write to `E2E_ARTIFACTS_DIR` or gitignored `tests/e2e/output`. They do not reuse an already-running app unless `E2E_REUSE_SERVER=1`.

## Docs

- [Architecture](docs/ARCHITECTURE.md)
- [Deployment](docs/DEPLOYMENT.md) — Nginx VM `35.187.57.95`, subdomain, PM2, TLS, DNS A record. **Do not deploy from the agent.**
- [Content needed](docs/CONTENT-NEEDED.md)
- [Backlog](docs/BACKLOG.md)

## Systems

NOW · THE RECORD · Proof Graph · Reputation Ledger · THINKING · CHALLENGE EJC · ASK EJC (no source → no invented fact) · CONNECT intent router · EJC SIGNAL · Schema.org Person graph · FR/EN · admin command center · Learning Engine (approval required).
