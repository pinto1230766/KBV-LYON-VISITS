import { test, expect } from "@playwright/test";

test.describe("Gestion des orateurs", () => {
  test("doit permettre d'ajouter un nouvel orateur", async ({ page }) => {
    await page.goto("/?tab=speakers");
    
    // Sauter l'onboarding si visible
    const skip = page.getByRole("button", { name: /passer|skip|terminer/i });
    if (await skip.isVisible()) await skip.click();

    // Cliquer sur le bouton d'ajout (on assume qu'il contient 'ajouter' ou un plus)
    await page.getByRole("button", { name: /ajouter|add/i }).first().click();
    
    // Remplir le formulaire
    await page.getByLabel(/nom/i).fill("Jean Testeur");
    await page.getByLabel(/congrégation/i).fill("Congrégation de Test");
    
    // Enregistrer
    await page.getByRole("button", { name: /enregistrer|sauvegarder|save|ajouter|add/i }).last().click();

    // Vérifier que l'orateur apparaît dans la liste
    await expect(page.getByText("Jean Testeur")).toBeVisible();
  });
});