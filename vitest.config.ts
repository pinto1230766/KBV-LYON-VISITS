import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path"; // Utilisation du préfixe 'node:' pour les modules intégrés en ESM
import { fileURLToPath } from "node:url"; // Pour obtenir le chemin du fichier actuel

const __filename = fileURLToPath(import.meta.url); // Obtient le chemin du fichier actuel
const __dirname = path.dirname(__filename); // Dérive __dirname de __filename

export default defineConfig({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- type mismatch between vite & vitest's bundled vite
  plugins: [react() as any],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}", "src/hooks/**/*.{test,spec}.{ts,tsx}", "src/lib/**/*.{test,spec}.{ts,tsx}"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
