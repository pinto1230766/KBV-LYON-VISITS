import { useState } from "react";
import { useSettingsStore } from "../store/useSettingsStore";
import { useTranslation } from "../hooks/useTranslation";
import { GeneralSection } from "./settings/GeneralSection";
import { AppearanceSection } from "./settings/AppearanceSection";
import { NotificationsSection } from "./settings/NotificationsSection";
import { DataSection } from "./settings/DataSection";

type SettingsTab = "general" | "appearance" | "notifications" | "data";

export function SettingsPage({ onShowUserManual }: { onShowUserManual?: () => void }) {
  const {
    settings, setLanguage, setThemeMode, setTintColor, setTintedIcons,
    updateNotifications, updateCongregation,
    setSoundEnabled, setVibrationEnabled,
  } = useSettingsStore();
  
  const congregation =
    settings.congregation || {
      name: "", city: "", day: "Dimanche", time: "11:30",
      responsableName: "", responsablePhone: "",
      whatsappGroup: "", whatsappInviteId: "",
      googleSheetUrl: "", lastSyncAt: "",
    };
  const notifications =
    settings.notifications || { enabled: false, steps: { remindJ7: true, remindJ2: true } };
  
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [subTab, setSubTab] = useState("profile");

  const soundEnabled = settings.soundEnabled;
  const vibrationEnabled = settings.vibrationEnabled;
  const themeMode = settings.themeMode || "system";
  const lang = settings.language || "fr";

  const getDesc = (id: string) => {
    const descs: Record<string, Record<string, string>> = {
      profile: {
        fr: "Nom, ville, jour et heure de réunion",
        cv: "Nomi, sidadi, dia i óra di runion",
        pt: "Nome, cidade, dia e hora de reunião"
      },
      reception: {
        fr: "Nom, téléphone et groupe WhatsApp",
        cv: "Nomi, telefoni i grupu WhatsApp",
        pt: "Nome, telefone e grupo WhatsApp"
      },
      appearance: {
        fr: "Mode sombre/clair et langue d'affichage",
        cv: "Modu skuru/klaru i língua di afixason",
        pt: "Modo escuro/claro e idioma de exibição"
      },
      notifications: {
        fr: "Configuration des rappels et effets sonores",
        cv: "Configurason di lembransas i sons",
        pt: "Configuração de lembretes e sons"
      },
      data: {
        fr: "Import, export complet et doublons",
        cv: "Inporta, sporta dadus i doblons",
        pt: "Importar, exportar dados e duplicados"
      },
      manual: {
        fr: "Consulter le manuel d'utilisation",
        cv: "Odja gia di utilizason",
        pt: "Consultar manual de utilização"
      },
      legal: {
        fr: "RGPD, respect de la vie privée et support",
        cv: "RGPD, protejason di dadus i supórte",
        pt: "RGPD, proteção de dados e suporte"
      }
    };
    return descs[id]?.[lang] || descs[id]?.fr || "";
  };

  const getGroupLabel = (groupKey: string) => {
    const labels: Record<string, Record<string, string>> = {
      congregation: {
        fr: "Congrégation & Accueil",
        cv: "Kongregason & Akolhimentu",
        pt: "Congregação & Acolhimento"
      },
      preferences: {
        fr: "Préférences",
        cv: "Preferénsias",
        pt: "Preferências"
      },
      system: {
        fr: "Système",
        cv: "Sistema",
        pt: "Sistema"
      }
    };
    return labels[groupKey]?.[lang] || labels[groupKey]?.fr || "";
  };

  const sidebarGroups = [
    {
      key: "congregation",
      items: [
        { id: "profile", tab: "general" as SettingsTab, label: t("congregation_profile") || "Profil de la congrégation", icon: "groups", bg: "bg-blue-500 text-white" },
        { id: "reception", tab: "general" as SettingsTab, label: t("reception_manager") || "Responsable Accueil", icon: "support_agent", bg: "bg-orange-500 text-white" },
      ]
    },
    {
      key: "preferences",
      items: [
        { id: "appearance", tab: "appearance" as SettingsTab, label: t("appearance") || "Langue & Thème", icon: "palette", bg: "bg-pink-500 text-white" },
        { id: "notifications", tab: "notifications" as SettingsTab, label: t("notifications_label") || "Rappels & Sons", icon: "notifications", bg: "bg-red-500 text-white" },
      ]
    },
    {
      key: "system",
      items: [
        { id: "data", tab: "data" as SettingsTab, label: t("import_export") || "Sauvegarde & Données", icon: "database", bg: "bg-emerald-500 text-white" },
        { id: "manual", tab: "general" as SettingsTab, label: t("user_manual") || "Guide d'utilisation", icon: "book_2", bg: "bg-purple-600 text-white" },
        { id: "legal", tab: "general" as SettingsTab, label: t("legal_info") || "Mentions Légales", icon: "shield_person", bg: "bg-slate-500 text-white" },
      ]
    }
  ];

  return (
    <div className="relative min-h-[calc(100vh-6rem)] py-2 space-y-4">
      {/* Atmospheric Background */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-30 mix-blend-screen" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuARrergcPKowhd-qszyaHKVKh8VaXMeMGZ_IAwtzoLWHArjaqn7X0HkbljtMoOTZsOlQrfHWY4n1T9oYWeRLDfH4hg50nMXPRq0MAPQwdi_J_0GDcxVXrlzJ36BPun8UZlHrtbx0IlrqFNqnkTRG7kY5GPH8ptegfo3TgtjqqKpHA8TnbbF7GXAldGDpYLqy_a3jvuNTfynPRhMWO4ioUSBWBNMxroFo12k8rfB-uIQS1r2fDLHXVNAGobgpx1u0doqQBr_ls4_7VqA')", backgroundSize: "cover", backgroundPosition: "center", filter: "blur(40px)" }}></div>

      <div className="relative z-10">
        {/* Apple Large Title */}
        <div className="pb-3 border-b border-border/40 mb-5 max-w-[1400px] mx-auto">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            {t("settings") || "Réglages"}
          </h1>
          <p className="text-sm font-medium text-muted-foreground mt-0.5">
            Personnalisation, apparence et préférences de coordination
          </p>
        </div>

        {/* iPadOS Style Split View Container */}
        <div className="grid grid-cols-12 gap-6 max-w-[1400px] mx-auto md:h-[calc(100vh-190px)]">
          {/* Left Pane: Categories */}
          <div className="col-span-12 md:col-span-5 lg:col-span-4 flex flex-col gap-5 overflow-y-auto pr-2 pb-4 md:pb-8 md:h-full">
            {sidebarGroups.map((group) => (
              <div key={group.key} className="space-y-2">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/85 px-2">
                  {getGroupLabel(group.key)}
                </h4>
                <div className="ios-card overflow-hidden flex flex-col">
                  {group.items.map((sub) => {
                    const isActive = subTab === sub.id;
                    return (
                      <button
                        key={sub.id}
                        onClick={() => {
                          setActiveTab(sub.tab);
                          setSubTab(sub.id);
                        }}
                        className={`flex items-start justify-between p-4 transition-all border-b border-outline-variant/10 last:border-none text-left touch-manipulation group ${
                          isActive
                            ? "bg-primary/10 text-on-surface shadow-inner"
                            : "hover:bg-surface-variant/20 text-on-surface-variant"
                        }`}
                      >
                        <div className="flex items-center gap-3.5 w-full">
                          <div className={`w-10 h-10 rounded-xl ${sub.bg} flex items-center justify-center shadow-md shrink-0 group-hover:scale-105 transition-transform duration-200`}>
                            <span className="material-symbols-outlined text-lg">{sub.icon}</span>
                          </div>
                          <div className="space-y-0.5 min-w-0 pr-2">
                            <p className={`font-label-md text-sm font-bold truncate ${isActive ? "text-primary font-black" : "text-foreground"}`}>
                              {sub.label}
                            </p>
                            <p className="text-[11px] text-muted-foreground leading-tight line-clamp-2">
                              {getDesc(sub.id)}
                            </p>
                          </div>
                        </div>
                        <span className={`material-symbols-outlined text-muted-foreground/50 group-hover:translate-x-0.5 transition-transform shrink-0 self-center text-lg ${isActive ? "text-primary" : ""}`}>
                          chevron_right
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Right Pane: Details Area */}
          <div className="col-span-12 md:col-span-7 lg:col-span-8 overflow-y-auto pb-12 pr-1 md:h-full">
            <div className="space-y-6">
              {activeTab === "general" && (
                <GeneralSection
                  t={t}
                  congregation={congregation}
                  updateCongregation={updateCongregation}
                  onShowUserManual={onShowUserManual}
                  activeSubTab={subTab}
                />
              )}

              {activeTab === "appearance" && (
                <AppearanceSection
                  t={t}
                  themeMode={themeMode}
                  setThemeMode={setThemeMode}
                  language={settings.language}
                  setLanguage={setLanguage}
                  tintColor={settings.tintColor}
                  setTintColor={setTintColor}
                  tintedIcons={settings.tintedIcons}
                  setTintedIcons={setTintedIcons}
                />
              )}

              {activeTab === "notifications" && (
                <NotificationsSection
                  t={t}
                  notifications={notifications}
                  updateNotifications={updateNotifications}
                  soundEnabled={soundEnabled}
                  setSoundEnabled={setSoundEnabled}
                  vibrationEnabled={vibrationEnabled}
                  setVibrationEnabled={setVibrationEnabled}
                  language={language}
                />
              )}

              {activeTab === "data" && <DataSection t={t} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
