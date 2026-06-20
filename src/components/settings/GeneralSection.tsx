import { motion } from "framer-motion";
import { KbvLogo } from "../KbvLogo";
import type { CongregationProfile } from "../../store/settingsTypes";

interface Props {
  t: (k: string) => string;
  congregation: CongregationProfile;
  updateCongregation: (patch: Partial<CongregationProfile>) => void;
  onShowUserManual?: () => void;
  activeSubTab?: string;
}

export function GeneralSection({ t, congregation, updateCongregation, onShowUserManual, activeSubTab }: Props) {
  const showProfile = !activeSubTab || activeSubTab === "profile";
  const showReception = !activeSubTab || activeSubTab === "reception";
  const showManual = !activeSubTab || activeSubTab === "manual";
  const showLegal = !activeSubTab || activeSubTab === "legal";

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 md:space-y-6">
      {/* Version Card */}
      {showManual && (
        <div className="glass-panel rounded-xl p-4 md:p-5 text-center">
          <div className="flex items-center justify-center gap-4 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center overflow-hidden">
              <KbvLogo className="w-full h-full" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground leading-none">KBV-LYON-VISITS</p>
              <h2 className="text-lg font-black text-foreground">Version 2.2.1</h2>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4">
            <div className="p-2 rounded-xl bg-muted/50 text-left">
              <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">{t("developer")}</p>
              <p className="text-xs font-bold text-foreground">Pinto Francisco</p>
            </div>
            <div className="p-2 rounded-xl bg-muted/50 text-left">
              <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">{t("last_update")}</p>
              <p className="text-xs font-bold text-foreground">Juin 2026</p>
            </div>
            <div className="p-2 rounded-xl bg-muted/50 text-left col-span-2 flex items-center justify-between">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Contact / Support</p>
                <p className="text-xs font-bold text-foreground">pinto12397@gmail.com</p>
              </div>
              <p className="text-[8px] text-muted-foreground uppercase tracking-wider text-right">© 2025-2026</p>
            </div>
          </div>
        </div>
      )}

      {/* User Manual Button */}
      {showManual && onShowUserManual && (
        <button
          onClick={onShowUserManual}
          className="w-full glass-panel rounded-xl p-4 md:p-5 flex items-center gap-4 hover:bg-surface-variant/40 transition-colors touch-manipulation"
        >
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-2xl">book_2</span>
          </div>
          <div className="text-left">
            <h3 className="text-base font-bold text-foreground">{t("user_manual")}</h3>
            <p className="text-sm text-muted-foreground">{t("user_manual_desc")}</p>
          </div>
        </button>
      )}

      {/* RGPD & Legal Info */}
      {showLegal && (
        <div className="glass-panel rounded-xl p-4 md:p-5 space-y-3">
          <h3 className="text-base font-black text-foreground flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">shield_person</span>
            <span>{t("legal_info")}</span>
          </h3>
          <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
            <p>
              <strong className="text-foreground">{t("rgpd_protection")}:</strong> {t("rgpd_desc")}
            </p>
            <p>
              <strong className="text-foreground">{t("right_access")}:</strong> {t("right_access_desc")}
            </p>
            <p>
              <strong className="text-foreground">{t("contact_info")}:</strong> {t("contact_rgpd")}{" "}
              <a href="mailto:pinto12397@gmail.com" className="text-primary hover:underline">pinto12397@gmail.com</a>
            </p>
          </div>
          <div className="pt-2 border-t border-border flex justify-between items-center">
            <button onClick={() => alert(t("export_coming_soon"))} className="text-[10px] uppercase font-bold text-primary hover:underline">
              {t("export_data_rgpd")}
            </button>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">RGPD Compliance</span>
          </div>
        </div>
      )}

      {/* Congregation Profile */}
      {showProfile && (
        <div className="glass-panel rounded-xl p-4 md:p-5 space-y-4">
          <h3 className="text-sm font-black text-foreground flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">groups</span>
            <span>{t("congregation_profile")}</span>
          </h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <div className="col-span-1">
              <label htmlFor="cong-name" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t("congregation_name")}</label>
              <input id="cong-name" className="input-soft text-sm mt-1" value={congregation.name} onChange={(e) => updateCongregation({ name: e.target.value })} />
            </div>
            <div className="col-span-1">
              <label htmlFor="cong-city" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t("city")}</label>
              <input id="cong-city" className="input-soft text-sm mt-1" value={congregation.city} onChange={(e) => updateCongregation({ city: e.target.value })} />
            </div>
            <div className="col-span-1">
              <label htmlFor="cong-day" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t("day")}</label>
              <select id="cong-day" className="input-soft text-sm mt-1 cursor-pointer" value={congregation.day} onChange={(e) => updateCongregation({ day: e.target.value })}>
                {["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"].map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div className="col-span-1">
              <label htmlFor="cong-time" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t("time")}</label>
              <input id="cong-time" className="input-soft text-sm mt-1" type="time" value={congregation.time} onChange={(e) => updateCongregation({ time: e.target.value })} />
            </div>
            <div className="col-span-2">
              <label htmlFor="kingdom-hall-address" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t("kingdom_hall_address")}</label>
              <input id="kingdom-hall-address" className="input-soft text-sm mt-1" value={congregation.kingdomHallAddress} onChange={(e) => updateCongregation({ kingdomHallAddress: e.target.value })} />
            </div>
          </div>
        </div>
      )}

      {/* Responsable Accueil */}
      {showReception && (
        <div className="glass-panel rounded-xl p-4 md:p-5 space-y-4">
          <h3 className="text-sm font-black text-foreground flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">support_agent</span>
            <span>{t("reception_manager")}</span>
          </h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <div className="col-span-1">
              <label htmlFor="resp-name" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t("full_name")}</label>
              <input id="resp-name" className="input-soft text-sm mt-1" value={congregation.responsableName} onChange={(e) => updateCongregation({ responsableName: e.target.value })} />
            </div>
            <div className="col-span-1">
              <label htmlFor="resp-phone" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t("phone")}</label>
              <input id="resp-phone" className="input-soft text-sm mt-1" value={congregation.responsablePhone} onChange={(e) => updateCongregation({ responsablePhone: e.target.value })} />
            </div>
            <div className="col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t("whatsapp_group")}</label>
              <div className="grid grid-cols-2 gap-3 mt-1">
                <input className="input-soft text-xs" placeholder="Groupe/Admin" value={congregation.whatsappGroup} onChange={(e) => updateCongregation({ whatsappGroup: e.target.value })} />
                <input id="whatsapp-invite" className="input-soft text-xs" placeholder="Invite ID" value={congregation.whatsappInviteId} onChange={(e) => updateCongregation({ whatsappInviteId: e.target.value })} />
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}