import { expect, test } from "@playwright/test";

import { shot } from "./artifacts";

test("admin command center and publishing safety", async ({ page }, testInfo) => {
  if (testInfo.project.name === "mobile") {
    test.skip();
  }

  await page.goto("/admin/now");
  await expect(page).toHaveURL(/admin\/login/);

  const login = await page.request.post("/api/auth/login", {
    data: {
      email: "admin@localhost",
      password: "change-this-admin-password",
    },
  });
  expect(login.ok()).toBeTruthy();

  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: "Command center" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Now" })).toBeVisible();
  await shot(page, "admin_command_center");

  await page.goto("/admin/now");
  await expect(page.getByRole("heading", { name: "Now" })).toBeVisible();
  await page.getByRole("button", { name: "Publish" }).first().click();
  await expect(page.getByTestId("publish-result")).toContainText("Blocked");
});
