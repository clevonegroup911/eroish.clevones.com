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
    expect(location, path).toMatch(/^\/admin\/login/);
    expect(location, path).not.toMatch(/localhost|https?:\/\//);
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
