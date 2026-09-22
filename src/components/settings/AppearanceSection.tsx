import { motion } from "framer-motion";
import { Globe, Moon, Sun, Monitor, Check, Palette, Sparkles } from "lucide-react";
import type { Language, TintColor } from "../../store/visitTypes";
import { TINT_PALETTES } from "../../store/useSettingsStore";

type ThemeMode = "light" | "dark" | "system";

interface Props {
  t: (k: string) => string;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  tintColor?: TintColor;
  setTintColor?: (tint: TintColor) => void;
  tintedIcons?: boolean;
  setTintedIcons?: (val: boolean) => void;
}

export function AppearanceSection({
  t,
  themeMode,
  setThemeMode,
  language,
  setLanguage,
  tintColor = "amber",
  setTintColor,
  tintedIcons = false,
  setTintedIcons,
}: Props) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="ios-card p-5 md:p-7 space-y-7">
        {/* Header Section */}
        <div className="flex items-center justify-between border-b border-border/50 pb-4">
          <h3 className="text-lg font-black text-foreground flex items-center gap-2.5">
            <Palette className="w-5 h-5 text-primary flex-shrink-0" />
            <span>{t("appearance") || "Apparence & Style Apple"}</span>
          </h3>
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest bg-muted px-2.5 py-1 rounded-full border border-border/50">
            HIG iOS 18
          </span>
        </div>

        {/* Theme mode selector (Clair, Sombre, Système) */}
        <div className="space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t("theme")}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => setThemeMode("light")}
              className={`relative p-4 rounded-2xl border-2 transition-all flex flex-col items-start gap-2 bg-card ${
                themeMode === "light" ? "border-primary shadow-md" : "border-border hover:border-primary/40 hover:shadow-sm"
              }`}
            >
              {themeMode === "light" && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
              )}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${themeMode === "light" ? "bg-primary/15" : "bg-muted"}`}>
                <Sun className={`w-5 h-5 ${themeMode === "light" ? "text-primary" : "text-muted-foreground"}`} />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{t("light")}</p>
                <p className="text-[10px] text-muted-foreground">{t("light_desc")}</p>
              </div>
            </button>

            <button
              onClick={() => setThemeMode("dark")}
              className={`relative p-4 rounded-2xl border-2 transition-all flex flex-col items-start gap-2 bg-card ${
                themeMode === "dark" ? "border-primary shadow-md" : "border-border hover:border-primary/40 hover:shadow-sm"
              }`}
            >
              {themeMode === "dark" && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
              )}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${themeMode === "dark" ? "bg-primary/15" : "bg-muted"}`}>
                <Moon className={`w-5 h-5 ${themeMode === "dark" ? "text-primary" : "text-muted-foreground"}`} />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{t("dark")}</p>
                <p className="text-[10px] text-muted-foreground">{t("dark_desc")}</p>
              </div>
            </button>

            <button
              onClick={() => setThemeMode("system")}
              className={`relative p-4 rounded-2xl border-2 transition-all flex flex-col items-start gap-2 bg-card ${
                themeMode === "system" ? "border-primary shadow-md" : "border-border hover:border-primary/40 hover:shadow-sm"
              }`}
            >
              {themeMode === "system" && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
              )}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${themeMode === "system" ? "bg-primary/15" : "bg-muted"}`}>
                <Monitor className={`w-5 h-5 ${themeMode === "system" ? "text-primary" : "text-muted-foreground"}`} />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{t("system")}</p>
                <p className="text-[10px] text-muted-foreground">{t("system_desc")}</p>
              </div>
            </button>
          </div>
        </div>

        {/* Nouveauté Apple iOS 18: Teinte de couleur uniforme / Tint Colors */}
        <div className="space-y-3 pt-2 border-t border-border/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Teinte d'accentuation (Apple iOS 18)</p>
              <p className="text-xs text-muted-foreground mt-0.5">Personnalisez la couleur principale de toute l'application</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
            {(Object.keys(TINT_PALETTES) as TintColor[]).map((key) => {
              const pal = TINT_PALETTES[key];
              const isSelected = tintColor === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTintColor?.(key)}
                  className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all active:scale-95 bg-card ${
                    isSelected ? "border-foreground shadow-md ring-2 ring-foreground/20" : "border-border hover:border-muted-foreground/40"
                  }`}
                  title={pal.label}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-transform"
                    style={{ backgroundColor: pal.hex }}
                  >
                    {isSelected && <Check className="w-4 h-4 text-white drop-shadow" />}
                  </div>
                  <span className={`text-[11px] font-bold text-center leading-tight ${isSelected ? "text-foreground font-black" : "text-muted-foreground"}`}>
                    {pal.label.split(" ")[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Nouveauté Apple iOS 18: Icônes Teintées (Tinted Icons Mode) */}
        <div className="space-y-3 pt-2 border-t border-border/50">
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-muted/50 border border-border/60">
            <div className="space-y-0.5 pr-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-bold text-foreground">Icônes teintées (Style iOS 18)</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Applique une teinte uniforme sur l'ensemble des icônes pour un look harmonisé épuré.
              </p>
            </div>
            {/* iOS Toggle Switch */}
            <button
              type="button"
              role="switch"
              aria-checked={tintedIcons}
              onClick={() => setTintedIcons?.(!tintedIcons)}
              className={`w-12 h-7 flex items-center rounded-full p-1 transition-colors duration-200 cursor-pointer shrink-0 ${
                tintedIcons ? "bg-primary" : "bg-slate-300 dark:bg-slate-700"
              }`}
            >
              <div
                className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-200 ${
                  tintedIcons ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Language selector */}
        <div className="space-y-3 pt-2 border-t border-border/50">
          <label htmlFor="lang-select" className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
            <Globe className="w-3.5 h-3.5" /> {t("display_language")}
          </label>
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
