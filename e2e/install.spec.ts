import { test, expect, type Page } from "@playwright/test";

test.describe("Install Page", () => {
  test.beforeEach(async ({ page }: { page: Page }) => {
    await page.goto("/?tab=install", { waitUntil: "networkidle" });
    
    // Skip onboarding if present
    const skipButton = page.getByRole("button", { name: /passer|skip|terminer|commencer/i });
    if (await skipButton.isVisible()) {
      await skipButton.click();
    }
  });

  test("should display installation instructions and QR code", async ({ page }: { page: Page }) => {
    await expect(page.getByRole("heading", { name: "Installer l'application" })).toBeVisible();
    await expect(page.getByText("Scannez ce code pour ouvrir l'application sur un autre téléphone")).toBeVisible();
    await expect(page.locator("svg[data-qr-code-value]")).toBeVisible(); // Check for QR code SVG
  });

  test("should display independence notice", async ({ page }: { page: Page }) => {
    await expect(page.getByText("Installation indépendante")).toBeVisible();
    await expect(page.getByText("Vos données restent locales et privées.")).toBeVisible();
    await expect(page.getByText("Chaque appareil gère ses propres données")).toBeVisible();
    await expect(page.getByText("Aucune donnée n'est partagée en ligne")).toBeVisible();
    await expect(page.getByText("Idéal pour les coordinateurs de congrégation")).toBeVisible();
  });

  test("should copy app URL to clipboard", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-write", "clipboard-read"]);
    await page.getByRole("button", { name: /copier/i }).click();
    await expect(page.getByRole("button", { name: /copié/i })).toBeVisible();
  });

  test("should display platform-specific installation guides", async ({ page }: { page: Page }) => {
    await expect(page.getByText("Guides rapides")).toBeVisible();
    await expect(page.getByText("Android")).toBeVisible();
    await expect(page.getByText("iPhone / iPad")).toBeVisible();
  });
});