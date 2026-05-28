import { test, expect } from "@playwright/test";

test.describe("Gestion des hôtes", () => {
  test("doit permettre d'ajouter un nouvel hôte", async ({ page }) => {
    await page.goto("/?tab=hosts", { waitUntil: "networkidle" });
    
    // Gestion robuste de l'onboarding (évite les erreurs si déjà passé)
    const skipButton = page.getByRole("button", { name: /passer|skip|terminer|commencer/i });
    if (await skipButton.isVisible()) {
      await skipButton.click();
    }

    // On utilise force: true ou on attend que le bouton soit stable
    const addButton = page.getByRole("button", { name: /ajouter|add/i }).first();
    await addButton.click();
    
    await page.getByLabel(/nom/i).fill("Famille Silva");
    await page.getByLabel(/téléphone/i).fill("0601020304");
    
    await page.getByRole("button", { name: /enregistrer|sauvegarder|save|ajouter|add/i }).last().click();

    // Vérification explicite : l'hôte doit être présent dans la liste
    await expect(page.locator("main")).toContainText("Famille Silva");
  });
});