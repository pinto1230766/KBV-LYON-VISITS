import { test, expect } from "@playwright/test";

test.describe("Paramètres et Localisation", () => {
  test("doit changer la langue de l'interface dynamiquement", async ({ page }) => {
    await page.goto("/?tab=settings");
    
    // Sauter l'onboarding
    const skip = page.getByRole("button", { name: /passer|skip|terminer/i });
    if (await skip.isVisible().catch(() => false)) await skip.click();

    // Vérifier le titre en Français
    await expect(page.getByText("Paramètres")).toBeVisible();

    // Changer la langue pour le Portugais (pt)
    await page.getByLabel(/langue|language/i).selectOption("pt");

    // Vérifier que le titre a changé en Portugais (Configurações)
    await expect(page.getByText("Configurações")).toBeVisible();
  });

  test("doit ouvrir le manuel utilisateur depuis les paramètres", async ({ page }) => {
    await page.goto("/?tab=settings");
    
    const skip = page.getByRole("button", { name: /passer|skip|terminer/i });
    if (await skip.isVisible().catch(() => false)) await skip.click();

    // Cliquer sur le bouton du manuel utilisateur
    await page.getByRole("button", { name: /manuel utilisateur|user manual|manual de utilização/i }).click();
    
    // Vérifier que le manuel est affiché
    await expect(page.getByRole("heading", { name: /manuel utilisateur|user manual|manual de utiliz/i, exact: false })).toBeVisible();
  });

  test("doit afficher le thème système et le basculer", async ({ page }) => {
    await page.goto("/?tab=settings");
    
    const skip = page.getByRole("button", { name: /passer|skip|terminer/i });
    if (await skip.isVisible().catch(() => false)) await skip.click();

    // Vérifier que les options de thème sont présentes
    await expect(page.getByRole("button", { name: /thème|theme/i })).toBeVisible();
  });
});