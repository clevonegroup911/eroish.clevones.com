import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

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
  fs.mkdirSync("/opt/cursor/artifacts", { recursive: true });
  await page.screenshot({
    path: path.join("/opt/cursor/artifacts", "admin_command_center.png"),
    fullPage: true,
  });

  await page.goto("/admin/now");
  await expect(page.getByRole("heading", { name: "Now" })).toBeVisible();
  await page.getByRole("button", { name: "Publish" }).first().click();
  await expect(page.getByTestId("publish-result")).toContainText("Blocked");
});
