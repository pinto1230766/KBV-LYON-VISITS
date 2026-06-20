import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, MapPin, Clock, User, Check, Sparkles, Globe, BookOpen, FileSpreadsheet, Cloud, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSettingsStore } from "@/store/useSettingsStore";
import type { Language } from "@/store/visitTypes";
import { useTranslation } from "@/hooks/useTranslation";
import { pickAndImportBackup } from "@/lib/backup";
import { toast } from "sonner";

const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

const LANGUAGES: { code: Language; name: string; nativeName: string; flag: string }[] = [
  { code: "fr", name: "Français", nativeName: "Français", flag: "./images/flags/france.png" },
  { code: "pt", name: "Português", nativeName: "Português", flag: "./images/flags/portugal.png" },
  { code: "cv", name: "Cape Verdean Creole", nativeName: "Crioulo Caboverdiano", flag: "./images/flags/cape_verde.png" },
];

interface OnboardingWizardProps {
  onComplete: () => void;
  onShowUserManual?: () => void;
}

export function OnboardingWizard({ onComplete, onShowUserManual }: OnboardingWizardProps) {
  const updateCongregation = useSettingsStore((s) => s.updateCongregation);
  const setLanguage = useSettingsStore((s) => s.setLanguage);
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);
  const [form, setForm] = useState({
    name: "Lyon KBV",
    city: "Lyon",
    day: "Dimanche",
    time: "11:30",
    responsableName: "",
    responsablePhone: "",
    googleSheetUrl: "https://docs.google.com/spreadsheets/d/1drIzPPi6AohCroSyUkF1UmMFxuEtMACBF4XATDjBOcg/edit?gid=1530698388#gid=1530698388",
    supabaseUrl: "https://mlcanzkssfrdrsubmqnt.supabase.co",
    supabaseKey: "sb_publishable_l_0Y7pScFKdIwfydwchxmw_Su44uJJN",
  });

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const steps = [
    {
      id: "language",
      icon: Globe,
      title: t("welcome"),
      subtitle: t("app_description"),
      content: (
        <div className="space-y-4 text-center">
          <div className="grid grid-cols-2 xs:grid-cols-3 gap-3 pt-1">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setSelectedLanguage(lang.code);
                  setLanguage(lang.code);
                }}
                className={`p-4 xs:p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${selectedLanguage === lang.code
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                  }`}
              >
                <img src={lang.flag} alt={lang.name} className="w-12 h-9 xs:w-16 xs:h-12 object-contain" />
                <span className="text-[10px] xs:text-xs font-black text-foreground text-center leading-tight">{lang.nativeName}</span>
              </button>
            ))}
          </div>
        </div>
      ),
      canNext: selectedLanguage !== null,
    },
    {
      id: "welcome",
      icon: Globe,
      title: selectedLanguage === "cv" ? "Bun vinda" : selectedLanguage === "pt" ? "Bem-vindo" : "Bienvenue",
      subtitle: selectedLanguage === "cv" ? "Aplikason di koordenamentu di vizitas" : selectedLanguage === "pt" ? "Aplicativo de coordenação de visitas" : "Application de coordination des visites",
      content: (
        <div className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
            {selectedLanguage === "cv" ? "Konfigurans jundu bo kongregason em kalker etapas. Tudu bo dadus ta fica privadu na dispositivo." : selectedLanguage === "pt" ? "Vamos configurar sua congregação em algumas etapas. Todos os seus dados permanecerão privados neste dispositivo." : "Configurons ensemble votre congrégation en quelques étapes. Toutes vos données resteront privées sur cet appareil."}
          </p>
        </div>
      ),
      canNext: true,
    },
    {
      id: "congregation",
      icon: MapPin,
      title: t("congregation_profile"),
      subtitle: "",
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              {t("congregation_name")}
            </Label>
            <Input
              id="name"
              placeholder="ex: Lyon KBV"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className="bg-white dark:bg-card border-border"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              {t("city")}
            </Label>
            <Input
              id="city"
              placeholder="ex: Lyon"
              value={form.city}
              onChange={(e) => update("city", e.target.value)}
              className="bg-white dark:bg-card border-border"
            />
          </div>
        </div>
      ),
      canNext: form.name.trim().length > 0 && form.city.trim().length > 0,
    },
    {
      id: "schedule",
      icon: Clock,
      title: form.name ? `${form.name}` : t("schedule"),
      subtitle: selectedLanguage === "cv" ? "Koru ki runions publiku ta sta?" : selectedLanguage === "pt" ? "Quando se reúnem as reuniões públicas?" : "Quand se tiennent vos réunions publiques ?",
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              {t("day")}
            </Label>
            <Select value={form.day} onValueChange={(v) => update("day", v)}>
              <SelectTrigger className="bg-muted border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DAYS.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="time" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              {t("time")}
            </Label>
            <Input
              id="time"
              type="time"
              value={form.time}
              onChange={(e) => update("time", e.target.value)}
              className="bg-white dark:bg-card border-border"
            />
          </div>
        </div>
      ),
      canNext: true,
    },
    {
      id: "responsable",
      icon: User,
      title: form.name ? `${form.name}` : t("reception_manager"),
      subtitle: selectedLanguage === "cv" ? "Keni ta koordena akolimentu di oradores? (opasonal)" : selectedLanguage === "pt" ? "Quem coordena o acolhimento dos oradores? (opcional)" : "Qui coordonne l'accueil des orateurs ? (optionnel)",
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="respName" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              {t("full_name")}
            </Label>
            <Input
              id="respName"
              placeholder="ex: Francisco Pinto"
              value={form.responsableName}
              onChange={(e) => update("responsableName", e.target.value)}
              className="bg-white dark:bg-card border-border"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="respPhone" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              {t("phone")}
            </Label>
            <Input
              id="respPhone"
              type="tel"
              placeholder="ex: 06 12 34 56 78"
              value={form.responsablePhone}
              onChange={(e) => update("responsablePhone", e.target.value)}
              className="bg-white dark:bg-card border-border"
            />
          </div>
        </div>
      ),
      canNext: true,
    },
    {
      id: "google-sheet",
      icon: FileSpreadsheet,
      title: selectedLanguage === "cv" ? "Google Sheet" : selectedLanguage === "pt" ? "Google Sheet" : "Google Sheet",
      subtitle: selectedLanguage === "cv" ? "Kola URL di bo folha pa sinkronizâ vizitas (opasonal)" : selectedLanguage === "pt" ? "Cole o URL da sua planilha para sincronizar visitas (opcional)" : "Collez l'URL de votre feuille pour synchroniser les visites (optionnel)",
      content: (
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
            <p className="text-xs text-primary font-medium">
              {selectedLanguage === "cv" ? "Google Sheet ta permití importâ vizitas automaticamente." : selectedLanguage === "pt" ? "O Google Sheet permite importar visitas automaticamente." : "Le Google Sheet permet d'importer vos visites automatiquement."}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sheetUrl" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              {t("sheet_url")}
            </Label>
            <Input
              id="sheetUrl"
              placeholder="https://docs.google.com/spreadsheets/d/..."
              value={form.googleSheetUrl}
              onChange={(e) => update("googleSheetUrl", e.target.value)}
              className="bg-muted border-border text-xs"
            />
            <p className="text-[10px] text-muted-foreground">{t("sheet_url_hint")}</p>
          </div>
        </div>
      ),
      canNext: true,
    },
    {
      id: "supabase",
      icon: Cloud,
      title: "Supabase",
      subtitle: selectedLanguage === "cv" ? "Sinkronizason cloud (opasonal)" : selectedLanguage === "pt" ? "Sincronização na nuvem (opcional)" : "Synchronisation cloud (optionnel)",
      content: (
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
            <p className="text-xs text-primary font-medium">
              {selectedLanguage === "cv" ? "Supabase ta permití sinkronizâ dadus enti varios dispositivos." : selectedLanguage === "pt" ? "Supabase permite sincronizar dados entre vários dispositivos." : "Supabase permet de synchroniser vos données entre plusieurs appareils."}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="supabaseUrl" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              {t("supabase_url")}
            </Label>
            <Input
              id="supabaseUrl"
              placeholder="https://votre-projet.supabase.co"
              value={form.supabaseUrl}
              onChange={(e) => update("supabaseUrl", e.target.value)}
              className="bg-muted border-border text-xs"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="supabaseKey" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              {t("supabase_anon_key")}
            </Label>
            <Input
              id="supabaseKey"
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={form.supabaseKey}
              onChange={(e) => update("supabaseKey", e.target.value)}
              className="bg-muted border-border text-xs"
            />
            <p className="text-[10px] text-muted-foreground">{t("supabase_key_hint")}</p>
          </div>
        </div>
      ),
      canNext: true,
    },
    {
      id: "success",
      icon: Sparkles,
      title: t("onboarding_success_title"),
      subtitle: t("onboarding_success_subtitle"),
      content: (
        <div className="space-y-6 flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center animate-bounce">
            <Check className="w-10 h-10 text-primary" />
          </div>

          <div className="w-full space-y-3">
            <Button
              variant="outline"
              className="w-full h-14 rounded-2xl border-2 border-primary/20 hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-3 group"
              onClick={() => onShowUserManual?.()}
            >
              <BookOpen className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
              <span className="font-bold text-primary">{t("view_manual_btn")}</span>
            </Button>

            <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest font-bold">
              Ou commencez directement
            </p>
          </div>
        </div>
      ),
      canNext: true,
    },
  ];

  const currentStep = steps[step];
  const isLast = step === steps.length - 1;

  const handleFinish = () => {
    // Save congregation settings
    updateCongregation({
      name: form.name.trim() || "Lyon KBV",
      city: form.city.trim() || "Lyon",
      day: form.day,
      time: form.time,
      responsableName: form.responsableName.trim(),
      responsablePhone: form.responsablePhone.trim(),
      googleSheetUrl: form.googleSheetUrl.trim(),
    });

    // Save Supabase credentials to the settings store so getSupabase() can pick them up
    if (form.supabaseUrl.trim() || form.supabaseKey.trim()) {
      useSettingsStore.getState().setSupabaseConfig(form.supabaseUrl.trim());
      useSettingsStore.getState().setSupabaseKey(form.supabaseKey.trim());
      // Rebuild the Supabase client with the new config
      import("../lib/supabase").then(({ resetSupabaseClient }) => resetSupabaseClient());
    }

    onComplete();
  };



  return (
    <div className="fixed inset-0 z-[9998] bg-background flex flex-col">
      {/* Progress */}
      <div className="safe-top px-6 pt-6 pb-2">
        <div className="flex justify-between items-center mb-1">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
            Étape {step + 1} sur {steps.length}
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleFinish}
            className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors h-auto py-1 px-2"
          >
            {selectedLanguage === "cv" ? "Passa" : selectedLanguage === "pt" ? "Pular" : "Passer"}
          </Button>
        </div>
        <div className="flex gap-1.5">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i <= step ? "bg-primary" : "bg-muted"
                }`}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-6 overflow-y-auto min-h-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep.id}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
            className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full py-6 xs:py-10"
          >
            <div className="mb-6 xs:mb-8">
              <div className="w-10 h-10 xs:w-12 xs:h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 xs:mb-6">
                <currentStep.icon className="w-5 h-5 xs:w-6 xs:h-6 text-primary" />
              </div>
              <h1 className="text-2xl xs:text-3xl font-black text-foreground tracking-tight">{currentStep.title}</h1>
              <p className="text-sm xs:text-base text-muted-foreground mt-1 xs:mt-2 leading-relaxed">{currentStep.subtitle}</p>
            </div>

            <div className="flex-1 flex flex-col">
              {currentStep.content}

              {/* Navigation inside content to keep it close to icons/items */}
              <div className="mt-12 flex flex-col items-center gap-4">
                <Button
                  size="lg"
                  className="w-full max-w-[280px] h-14 rounded-2xl font-bold shadow-xl shadow-primary/20 gap-2 text-base transition-all active:scale-95"
                  disabled={!currentStep.canNext}
                  onClick={() => {
                    if (step === 0 && selectedLanguage) {
                      setLanguage(selectedLanguage);
                    }
                    if (isLast) handleFinish();
                    else setStep((s) => s + 1);
                  }}
                >
                  {isLast ? (
                    <>
                      <Check className="w-5 h-5 shrink-0" />
                      {t("start_app_btn")}
                    </>
                  ) : (
                    <>
                      {selectedLanguage === "cv" ? "Próximu" : selectedLanguage === "pt" ? "Seguinte" : "Suivant"}
                      <ChevronRight className="w-5 h-5 shrink-0" />
                    </>
                  )}
                </Button>

                {step > 0 && (
                  <button
                    onClick={() => setStep(s => s - 1)}
                    className="text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors py-2"
                  >
                    {selectedLanguage === "cv" ? "Bota pa trás" : selectedLanguage === "pt" ? "Voltar" : "Retour"}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Import sauvegarde — toujours visible en bas */}
      <div className="safe-bottom px-6 pb-4 pt-2 border-t border-border/40 flex justify-center">
        <button
          onClick={async () => {
            const ok = await pickAndImportBackup();
            if (ok) {
              toast.success(
                selectedLanguage === "cv" ? "Sauvardu importadu — recarrega" :
                  selectedLanguage === "pt" ? "Backup importado — a recarregar" :
                    "Sauvegarde importée — rechargement"
              );
              // Mark onboarding done so we skip the wizard after reload
              try { localStorage.setItem("kbv-onboarding-done", "true"); } catch { /* noop */ }
              setTimeout(() => window.location.reload(), 800);
            } else {
              toast.error(
                selectedLanguage === "cv" ? "Inposivel inportâ" :
                  selectedLanguage === "pt" ? "Falha ao importar" :
                    "Échec de l'import"
              );
            }
          }}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors py-2 px-4 rounded-xl hover:bg-muted/50"
        >
          <Upload className="w-4 h-4" />
          {selectedLanguage === "cv" ? "Inportâ sauvardu" : selectedLanguage === "pt" ? "Importar backup" : "Importer une sauvegarde"}
        </button>
      </div>
    </div>
  );
}
