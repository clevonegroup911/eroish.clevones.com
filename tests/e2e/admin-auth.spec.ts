import { existsSync } from "node:fs";
import path from "node:path";

import { expect, test } from "@playwright/test";

import { OPEN_REDIRECT_PROBES } from "../../lib/safe-relative-path";

const ADMIN_PATHS = [
  "/admin",
  "/admin/identity",
  "/admin/now",
  "/admin/record",
  "/admin/proofs",
  "/admin/places",
  "/admin/ventures",
  "/admin/ledger",
  "/admin/thinking",
  "/admin/signals",
  "/admin/challenges",
  "/admin/ask",
  "/admin/connect",
  "/admin/media",
  "/admin/learning",
  "/admin/security",
  "/admin/analytics",
];

const LEAK =
  /SEED|Initial seed|Audit log|Contact requests|Command center|admin@localhost|Publish blocked|Learning proposal/i;

test("forged admin cookie does not leak data on any console route", async ({ request }, testInfo) => {
  if (testInfo.project.name === "mobile") test.skip();
  for (const path of ADMIN_PATHS) {
    const response = await request.get(path, {
      headers: { cookie: "ejc_admin_session=x" },
      maxRedirects: 0,
    });
    expect(response.status(), path).toBeGreaterThanOrEqual(300);
    expect(response.status(), path).toBeLessThan(400);
    const location = response.headers().location ?? "";
    expect(location, path).toMatch(/^\/admin\/login\?next=/);
    expect(location, path).not.toMatch(/localhost|https?:\/\//);
    expect(location, path).toMatch(/next=%2F/);
    expect(response.headers()["x-nonce"], path).toBeUndefined();
    const body = await response.text();
    expect(body, path).not.toMatch(LEAK);
    expect(body.length, path).toBeLessThan(800);
  }
});

test("forged admin session cannot publish", async ({ request }, testInfo) => {
  if (testInfo.project.name === "mobile") test.skip();
  const response = await request.post("/admin/now", {
    headers: { cookie: "ejc_admin_session=x" },
    form: { id: "forged" },
    maxRedirects: 0,
  });
  expect(response.status()).toBeGreaterThanOrEqual(300);
  expect(response.status()).toBeLessThan(400);
  const location = response.headers().location ?? "";
  expect(location).toMatch(/^\/admin\/login/);
  expect(location).not.toMatch(/localhost|https?:\/\//);
  const body = await response.text();
  expect(body).not.toMatch(LEAK);
});

test("logout revokes the session token", async ({ request }, testInfo) => {
  if (testInfo.project.name === "mobile") test.skip();
  const login = await request.post("/api/auth/login", {
    data: {
      email: "admin@localhost",
      password: "change-this-admin-password",
    },
  });
  expect(login.ok()).toBeTruthy();
  const setCookie = login.headers()["set-cookie"] ?? "";
  const token = /ejc_admin_session=([^;]+)/.exec(Array.isArray(setCookie) ? setCookie.join(";") : setCookie)?.[1];
  expect(token).toBeTruthy();

  const authed = await request.get("/admin", { maxRedirects: 0 });
  expect(authed.status()).toBeLessThan(400);

  await request.post("/api/auth/logout", { maxRedirects: 0 });
  const reused = await request.get("/admin", {
    headers: { cookie: `ejc_admin_session=${token}` },
    maxRedirects: 0,
  });
  expect(reused.status()).toBeGreaterThanOrEqual(300);
  expect(reused.status()).toBeLessThan(400);
  const reusedBody = await reused.text();
  expect(reusedBody).not.toMatch(/Command center|Audit log|Contact requests|Publish blocked|Learning proposal/i);
  expect(reused.headers().location ?? reusedBody).toMatch(/admin\/login|NEXT_REDIRECT;replace;\/admin\/login/);
});

test("login next= keeps the query string and rejects open redirects", async ({ request, page }, testInfo) => {
  if (testInfo.project.name === "mobile") test.skip();

  const intercepted = await request.get("/admin/ledger?x=1&y=2", { maxRedirects: 0 });
  expect(intercepted.status()).toBeGreaterThanOrEqual(300);
  expect(intercepted.status()).toBeLessThan(400);
  expect(intercepted.headers().location).toBe("/admin/login?next=%2Fadmin%2Fledger%3Fx%3D1%26y%3D2");

  for (const probe of OPEN_REDIRECT_PROBES) {
    const encoded = new URLSearchParams({ to: probe }).toString();
    const response = await request.get(`/api/redirect?${encoded}`, { maxRedirects: 0 });
    expect(response.status(), probe).toBe(307);
    expect(response.headers().location, probe).toBe("/");
  }

  await page.goto("/admin/ledger?x=1&y=2");
  await expect(page).toHaveURL(/\/admin\/login\?next=/);
  await page.getByLabel("Email").fill("admin@localhost");
  await page.getByLabel("Password").fill("change-this-admin-password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/admin\/ledger\?x=1&y=2/);
});

test("security headers include COOP on pages, redirects, API, health, and icon", async ({ request }, testInfo) => {
  if (testInfo.project.name === "mobile") test.skip();
  for (const pathName of ["/", "/en", "/fr/connect", "/health", "/icon", "/api/redirect?to=%2Ffr", "/admin/login"]) {
    const response = await request.get(pathName, { maxRedirects: 0 });
    expect(response.headers()["cross-origin-opener-policy"], pathName).toBe("same-origin");
    expect(response.headers()["cross-origin-resource-policy"], pathName).toBeUndefined();
    const csp = response.headers()["content-security-policy"] ?? "";
    if (pathName === "/en" || pathName === "/fr/connect") {
      expect(csp).toMatch(/script-src[^;]*'strict-dynamic'/);
      expect(csp).toMatch(/script-src[^;]*'nonce-/);
      expect(csp).not.toMatch(/script-src[^;]*'unsafe-inline'/);
    }
  }
});

test("production login behind https proto sets Secure on set and clear cookies", async ({ request }, testInfo) => {
  if (testInfo.project.name === "mobile") test.skip();
  const production = existsSync(path.join(process.cwd(), ".next/BUILD_ID"));
  const login = await request.post("/api/auth/login", {
    headers: { "x-forwarded-proto": "https" },
    data: {
      email: "admin@localhost",
      password: "change-this-admin-password",
    },
  });
  expect(login.ok()).toBeTruthy();
  const loginCookie = login.headers()["set-cookie"] ?? "";
  const token = /ejc_admin_session=([^;]+)/.exec(Array.isArray(loginCookie) ? loginCookie.join(";") : loginCookie)?.[1];
  expect(token).toBeTruthy();
  if (production) {
    expect(loginCookie).toMatch(/Secure/i);
  } else {
    expect(loginCookie).not.toMatch(/Secure/i);
  }

  const logout = await request.post("/api/auth/logout", {
    headers: {
      "x-forwarded-proto": "https",
      cookie: `ejc_admin_session=${token}`,
    },
    maxRedirects: 0,
  });
  const logoutCookie = logout.headers()["set-cookie"] ?? "";
  if (production) {
    expect(logoutCookie).toMatch(/Secure/i);
  }
});
