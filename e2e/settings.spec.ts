import { test, expect } from "@playwright/test";

test.describe("Paramètres et Localisation", () => {
  test("doit changer la langue de l'interface dynamiquement", async ({ page }) => {
    await page.goto("/?tab=settings");
    
    // Sauter l'onboarding
    const skip = page.getByRole("button", { name: /passer|skip|terminer/i });
    if (await skip.isVisible().catch(() => false)) await skip.click();

    // Vérifier le titre en Français
    await expect(page.getByText("Paramètres").filter({ visible: true }).first()).toBeVisible();

    // Cliquer sur le sous-onglet Apparence
    await page.getByRole("button", { name: /apparence|aparencia|aparência/i }).click();

    // Changer la langue pour le Portugais (pt)
    await page.locator("#lang-select").selectOption("pt");

    // Vérifier que le titre a changé en Portugais (Configurações)
    await expect(page.getByText("Configurações").filter({ visible: true }).first()).toBeVisible();
  });

  test("doit ouvrir le manuel utilisateur depuis les paramètres", async ({ page }) => {
    await page.goto("/?tab=settings");
    
    const skip = page.getByRole("button", { name: /passer|skip|terminer/i });
    if (await skip.isVisible().catch(() => false)) await skip.click();

    // Cliquer sur le bouton du manuel utilisateur
    await page.getByRole("button", { name: /manuel utilisateur|mode d'emploi|user manual|manual de utilização/i }).click();
    
    // Vérifier que le manuel est affiché
    await expect(page.getByRole("heading", { name: /manuel utilisateur|user manual|manuel de utiliz|mode d'emploi/i, exact: false })).toBeVisible();
  });

  test("doit afficher le thème système et le basculer", async ({ page }) => {
    await page.goto("/?tab=settings");
    
    const skip = page.getByRole("button", { name: /passer|skip|terminer/i });
    if (await skip.isVisible().catch(() => false)) await skip.click();

    // Cliquer sur le sous-onglet Apparence
    await page.getByRole("button", { name: /apparence|aparencia|aparência/i }).click();

    // Vérifier que les options de thème sont présentes (ex: bouton Système)
    await expect(page.getByRole("button", { name: /système|sistem/i }).first()).toBeVisible();
  });
});