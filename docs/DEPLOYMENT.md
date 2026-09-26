# Deployment — eroish.clevones.com

**Do not deploy from this document automatically.** This runbook is for a human operator on the existing Nginx VM. This repository must not touch the server or DNS.

## Target

| Item | Value |
|---|---|
| Public host | `eroish.clevones.com` |
| Existing VM | `35.187.57.95` (already serves `clevones.com`) |
| App user / path (proposed) | `/home/clevones/apps/eroish.clevones.com` |
| Process manager | PM2 process name `eroish-clevones-com` |
| Node | ≥ 20.9 |
| Production database | PostgreSQL 15 on the VM (separate database `eroish_prod`) |
| Local / CI database | SQLite `file:./dev.db` (resolved next to `prisma/schema.prisma`) |

This is a **separate app** from `clevones.com`. Do not reuse the `clevones-com` PM2 process, `.env`, or database.

## DNS (required, not applied here)

The subdomain currently has **no** DNS record.

Create:

```
A    eroish.clevones.com    35.187.57.95
```

TTL can follow the existing `clevones.com` zone. Do not point the apex or `www` of `clevones.com` at this app.

## Environment

Copy `.env.example` on the VM to `/home/clevones/apps/eroish.clevones.com/.env` (mode `600`). Set at least:

```
DATABASE_URL="postgresql://USER:PASSWORD@127.0.0.1:5432/eroish_prod?schema=public"
AUTH_SECRET="<openssl rand -base64 48>"
APP_ORIGIN="https://eroish.clevones.com"
SITE_URL="https://eroish.clevones.com"
ADMIN_BOOTSTRAP_EMAIL="<operator email>"
ADMIN_BOOTSTRAP_PASSWORD="<temporary password, rotate immediately>"
ALLOW_ADMIN_CREATE_IN_PRODUCTION="1"
```

`APP_ORIGIN` must be `https` in production. `SITE_URL` is the public origin written into sitemap, robots, and metadata (default `https://eroish.clevones.com`). Never commit real secrets.

## PostgreSQL vs SQLite

The committed Prisma schema uses **SQLite** so local development and CI do not require Postgres.

On the VM, before the first migrate:

1. Create database `eroish_prod`.
2. Change `prisma/schema.prisma` datasource to:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

A copy of that production schema is kept at `prisma/schema.postgres.prisma`.

3. `npx prisma migrate deploy` (or `db push` only on a fresh empty database if no migration history exists yet).
4. `npx tsx prisma/seed.ts` once, then remove `ALLOW_ADMIN_CREATE_IN_PRODUCTION` and rotate the admin password.

## First install on the VM

```bash
sudo mkdir -p /home/clevones/apps/eroish.clevones.com
sudo chown clevones:clevones /home/clevones/apps/eroish.clevones.com
cd /home/clevones/apps/eroish.clevones.com
git clone git@github.com:clevonegroup911/eroish.clevones.com.git .
# checkout the released SHA
cp .env.example .env   # then edit
npm ci
# switch Prisma provider to postgresql as above
npx prisma generate
npx prisma migrate deploy
npx tsx prisma/seed.ts
npm run build
pm2 start ops/pm2/ecosystem.config.cjs
pm2 save
```

## Process manager

`ops/pm2/ecosystem.config.cjs` starts `next start` on **port 3001** so it does not collide with `clevones.com` on 3000.

```bash
pm2 restart eroish-clevones-com --update-env
pm2 status eroish-clevones-com
```

## Nginx

Install `ops/nginx/eroish.clevones.com.conf` into `/etc/nginx/sites-available/`, symlink into `sites-enabled/`, then:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

Do not restart Nginx “to test” a backup. Do not edit the `clevones.com` server block except to keep it unchanged.

## TLS

After the A record resolves:

```bash
sudo certbot --nginx -d eroish.clevones.com
```

Certbot will adjust the server block. Renewals follow the existing VM timer.

## Health

- App: `https://eroish.clevones.com/health` → `{ ok: true }`
- Upstream locally: `http://127.0.0.1:3001/health`

## Backups

Use a dedicated dump directory, never the `clevones_prod` dump path:

`/home/clevones/backups/eroish.clevones.com/<UTC-stamp>/eroish_prod.dump`

`pg_dump` custom format, mode `600`, checksum file, restore-test only on a temporary database. Never `DROP DATABASE` production.

## Rollback

1. `pm2 stop eroish-clevones-com`
2. Check out the last known-good SHA
3. `npm ci && npm run build`
4. `pm2 restart eroish-clevones-com --update-env`

Database rollback is a human gate. Do not paste `DROP DATABASE eroish_prod` into a ticket.

## Forbidden

- Deploying from CI
- Changing DNS from this repository
- Sharing the `clevones-com` process or database
- Printing `.env` or PM2 env
- `prisma migrate reset` on production
