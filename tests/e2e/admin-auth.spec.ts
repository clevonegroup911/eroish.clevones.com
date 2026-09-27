import { expect, test } from "@playwright/test";

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
