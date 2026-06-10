import { useState } from "react";
import { Bell, Database, Sun, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";
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
  const soundEnabled = settings.soundEnabled;
  const vibrationEnabled = settings.vibrationEnabled;

  const themeMode = settings.themeMode || "system";

  const tabs: Array<{ id: SettingsTab; label: string; icon: LucideIcon }> = [
    { id: "general", label: t("general"), icon: User },
    { id: "appearance", label: t("appearance"), icon: Sun },
    { id: "notifications", label: t("notifications_label"), icon: Bell },
    { id: "data", label: t("import_export"), icon: Database },
  ];

  return (
    <div className="py-4 md:py-6 space-y-5 md:space-y-6">
      {/* Tabs */}
      <div className="flex justify-around items-stretch border-b border-border pb-0 px-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center gap-1 py-3 px-1 min-w-0 flex-1 transition-colors border-b-2 -mb-[1px] touch-manipulation ${
              activeTab === tab.id
                ? "text-primary border-primary bg-primary/5"
                : "text-muted-foreground border-transparent hover:text-foreground"
            }`}
          >
            <tab.icon className={`w-5 h-5 flex-shrink-0 ${activeTab === tab.id ? "text-primary" : ""}`} />
            <span className="text-[10px] md:text-sm font-bold uppercase tracking-tight leading-none text-center">{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === "general" && (
        <GeneralSection
          t={t}
          congregation={congregation}
          updateCongregation={updateCongregation}
          onShowUserManual={onShowUserManual}
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
  );
}
