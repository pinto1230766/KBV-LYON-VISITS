import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E configuration for KBV-LYON-VISITS v2.
 *
 * Setup (run once locally):
 *   bun add -D @playwright/test
 *   bunx playwright install --with-deps chromium
 *
 * Run:
 *   bun run e2e           # headless
 *   bun run e2e:ui        # interactive
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://localhost:8080",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:8080",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
});
