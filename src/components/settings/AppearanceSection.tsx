import { motion } from "framer-motion";
import { Globe, Moon, Sun, Monitor, Check } from "lucide-react";
import type { Language } from "../../store/visitTypes";

type ThemeMode = "light" | "dark" | "system";

interface Props {
  t: (k: string) => string;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
}

export function AppearanceSection({ t, themeMode, setThemeMode, language, setLanguage }: Props) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="premium-card p-4 md:p-6 space-y-6">
        <h3 className="text-base font-black text-foreground flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary flex-shrink-0" />
          <span>{t("appearance")}</span>
        </h3>

        {/* Theme selector */}
        <div className="space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t("theme")}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => setThemeMode("light")}
              className={`relative p-4 rounded-2xl border-2 transition-all flex flex-col items-start gap-2 bg-white dark:bg-card ${
                themeMode === "light" ? "border-primary shadow-md" : "border-border hover:border-muted-foreground/30 hover:shadow-sm"
              }`}
            >
              {themeMode === "light" && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
              )}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${themeMode === "light" ? "bg-primary/10" : "bg-white/60 dark:bg-muted/60"}`}>
                <Sun className={`w-5 h-5 ${themeMode === "light" ? "text-primary" : "text-muted-foreground"}`} />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{t("light")}</p>
                <p className="text-[10px] text-muted-foreground">{t("light_desc")}</p>
              </div>
            </button>

            <button
              onClick={() => setThemeMode("dark")}
              className={`relative p-4 rounded-2xl border-2 transition-all flex flex-col items-start gap-2 bg-white dark:bg-card ${
                themeMode === "dark" ? "border-primary shadow-md" : "border-border hover:border-muted-foreground/30 hover:shadow-sm"
              }`}
            >
              {themeMode === "dark" && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
              )}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${themeMode === "dark" ? "bg-primary/10" : "bg-white/60 dark:bg-muted/60"}`}>
                <Moon className={`w-5 h-5 ${themeMode === "dark" ? "text-primary" : "text-muted-foreground"}`} />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{t("dark")}</p>
                <p className="text-[10px] text-muted-foreground">{t("dark_desc")}</p>
              </div>
            </button>

            <button
              onClick={() => setThemeMode("system")}
              className={`relative p-4 rounded-2xl border-2 transition-all flex flex-col items-start gap-2 bg-white dark:bg-card ${
                themeMode === "system" ? "border-primary shadow-md" : "border-border hover:border-muted-foreground/30 hover:shadow-sm"
              }`}
            >
              {themeMode === "system" && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
              )}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${themeMode === "system" ? "bg-primary/10" : "bg-white/60 dark:bg-muted/60"}`}>
                <Monitor className={`w-5 h-5 ${themeMode === "system" ? "text-primary" : "text-muted-foreground"}`} />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{t("system")}</p>
                <p className="text-[10px] text-muted-foreground">{t("system_desc")}</p>
              </div>
            </button>
          </div>
        </div>

        {/* Language selector */}
        <div className="space-y-3">
          <label htmlFor="lang-select" className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t("display_language")}</label>
          <div className="relative">
            <select
              id="lang-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="input-soft text-sm w-full appearance-none pr-10 font-bold"
            >
              <option value="fr">FR  Français</option>
              <option value="cv">CV  Kriolu</option>
              <option value="pt">PT  Português</option>
            </select>
            <Globe className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
