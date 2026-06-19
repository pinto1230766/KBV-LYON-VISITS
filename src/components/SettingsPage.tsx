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
    settings, setLanguage, setThemeMode, updateNotifications, updateCongregation,
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

  const tabs: Array<{ id: SettingsTab; label: string; icon: string }> = [
    { id: "general", label: t("general"), icon: "person" },
    { id: "appearance", label: t("appearance"), icon: "palette" },
    { id: "notifications", label: t("notifications_label"), icon: "notifications" },
    { id: "data", label: t("import_export"), icon: "import_export" },
  ];

  const subSections: Record<SettingsTab, Array<{ id: string; label: string; icon: string; bg: string }>> = {
    general: [
      { id: "profile", label: t("congregation_profile") || "Profil", icon: "groups", bg: "bg-blue-500 text-primary-foreground" },
      { id: "reception", label: t("reception_manager") || "Accueil", icon: "support_agent", bg: "bg-primary text-primary-foreground" },
      { id: "manual", label: t("user_manual") || "Guide", icon: "book_2", bg: "bg-purple-600 text-primary-foreground" },
      { id: "legal", label: t("legal_info") || "Légal", icon: "shield_person", bg: "bg-card text-foreground" },
    ],
    appearance: [
      { id: "appearance", label: t("appearance") || "Langue & Thème", icon: "palette", bg: "bg-blue-500 text-primary-foreground" },
    ],
    notifications: [
      { id: "notifications", label: t("notifications_label") || "Rappels & Sons", icon: "notifications", bg: "bg-red-500 text-primary-foreground" },
    ],
    data: [
      { id: "data", label: t("import_export") || "Sauvegarde & Données", icon: "database", bg: "bg-primary text-primary-foreground" },
    ],
  };

  const handleTabChange = (tab: SettingsTab) => {
    setActiveTab(tab);
    if (tab === "general") setSubTab("profile");
    else if (tab === "appearance") setSubTab("appearance");
    else if (tab === "notifications") setSubTab("notifications");
    else if (tab === "data") setSubTab("data");
  };

  return (
    <div className="relative min-h-[calc(100vh-10rem)] py-4 md:py-6 space-y-6">
      {/* Atmospheric Background (from image 9) */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-30 mix-blend-screen" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuARrergcPKowhd-qszyaHKVKh8VaXMeMGZ_IAwtzoLWHArjaqn7X0HkbljtMoOTZsOlQrfHWY4n1T9oYWeRLDfH4hg50nMXPRq0MAPQwdi_J_0GDcxVXrlzJ36BPun8UZlHrtbx0IlrqFNqnkTRG7kY5GPH8ptegfo3TgtjqqKpHA8TnbbF7GXAldGDpYLqy_a3jvuNTfynPRhMWO4ioUSBWBNMxroFo12k8rfB-uIQS1r2fDLHXVNAGobgpx1u0doqQBr_ls4_7VqA')", backgroundSize: "cover", backgroundPosition: "center", filter: "blur(40px)" }}></div>

      <div className="relative z-10 space-y-6">
        {/* Translucent Tab Navigation */}
        <div className="flex mb-6 overflow-x-auto hide-scrollbar w-full">
          <div className="glass-panel rounded-full p-1 flex gap-1 items-center whitespace-nowrap min-w-max mx-auto">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`px-4 sm:px-6 py-2 rounded-full font-label-md text-sm transition-all flex items-center gap-2 ${
                    isActive
                      ? "bg-surface-container-high text-on-surface shadow-sm"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* iPadOS Style Split View Container */}
        <div className="grid grid-cols-12 gap-gutter max-w-[1400px] mx-auto h-[calc(100vh-220px)] mt-4">
          {/* Left Pane: Categories */}
          <div className="col-span-12 md:col-span-4 flex flex-col gap-4 overflow-y-auto pr-2 pb-8 h-full">
            <div className="glass-panel rounded-xl overflow-hidden flex flex-col">
              {(subSections[activeTab] || []).map((sub) => {
                const isActive = subTab === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => setSubTab(sub.id)}
                    className={`flex items-center justify-between p-4 transition-colors border-b border-outline-variant/20 last:border-none text-left ${
                      isActive ? "bg-surface-variant/40 text-on-surface" : "hover:bg-surface-variant/20 text-on-surface-variant"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg ${sub.bg} flex items-center justify-center`}>
                        <span className="material-symbols-outlined text-sm">{sub.icon}</span>
                      </div>
                      <span className="font-body-md text-body-md font-bold">{sub.label}</span>
                    </div>
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Pane: Details Area */}
          <div className="col-span-12 md:col-span-8 overflow-y-auto pb-12 pr-1 h-full">
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
