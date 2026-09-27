import { defineConfig } from "@playwright/test";

import { e2eOrigin } from "./tests/e2e/origin";

const origin = e2eOrigin();

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "**/*.spec.ts",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  timeout: 90_000,
  expect: { timeout: 15_000 },
  reporter: [["list"]],
  outputDir: "tests/e2e/test-results",
  use: {
    baseURL: origin,
    trace: "off",
    screenshot: "off",
    video: "off",
    actionTimeout: 15_000,
  },
  projects: [
    {
      name: "desktop",
      use: {
        browserName: "chromium",
        viewport: { width: 1280, height: 800 },
      },
    },
    {
      name: "mobile",
      use: {
        browserName: "chromium",
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
  webServer: {
    command: "npx tsx tests/e2e/dev-server.ts",
    url: `${origin}/health`,
    reuseExistingServer: process.env.E2E_REUSE_SERVER === "1",
    timeout: 180_000,
  },
});
