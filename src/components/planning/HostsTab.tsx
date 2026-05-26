import { motion, AnimatePresence } from "framer-motion";
import {
  Home, Building2, Utensils, Phone, MessageSquare, Pencil, Check, X,
  Users, AlertTriangle, MapPin,
} from "lucide-react";
import type { Visit, HostAssignment, Speaker, Host } from "../../store/visitTypes";
import { useSettingsStore, type SettingsState } from "../../store/useSettingsStore";

interface HostsTabProps {
  viewVisit: Visit;
  detailForm: Partial<Visit>;
  setDetailForm: (f: Partial<Visit>) => void;
  currentSpeaker: Speaker | null | undefined;
  hostCount: number;
  allHosts: Host[];
  locale: string;
  totalPeople: number;
  editingHostIdx: number | null;
  setEditingHostIdx: (n: number | null) => void;
  showAssignHost: boolean;
  setShowAssignHost: (v: boolean) => void;
  assignHostId: string;
  setAssignHostId: (v: string) => void;
  assignRole: HostAssignment["role"];
  setAssignRole: (v: HostAssignment["role"]) => void;
  assignDay: string;
  setAssignDay: (v: string) => void;
  assignTime: string;
  setAssignTime: (v: string) => void;
  addHostAssignment: () => void;
  removeHostAssignment: (idx: number) => void;
  updateHostAssignment: (idx: number, field: string, value: string) => void;
  getHostLastVisitDate: (id: string) => string | null;
  sendWhatsApp: (phone: string, text: string) => void;
  roleColor: (r: string) => string;
  t: (k: string) => string;
}

export function HostsTab(props: HostsTabProps) {
  const {
    viewVisit, detailForm, setDetailForm, currentSpeaker, hostCount, allHosts,
    locale, totalPeople, editingHostIdx, setEditingHostIdx,
    showAssignHost, setShowAssignHost, assignHostId, setAssignHostId,
    assignRole, setAssignRole, assignDay, setAssignDay, assignTime, setAssignTime,
    addHostAssignment, removeHostAssignment, updateHostAssignment,
    getHostLastVisitDate, sendWhatsApp, roleColor, t,
  } = props;

  const kingdomHallAddress = useSettingsStore((s: SettingsState) => s.settings.congregation.kingdomHallAddress);
  const isLocal = viewVisit.localSpeaker || currentSpeaker?.localSpeaker;

  if (isLocal) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
        <div className="rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 p-5 text-white">
          <div className="flex items-start gap-3">
            <Home className="w-6 h-6 flex-shrink-0 mt-1" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/80">{t("local_speaker_badge")}</p>
              <p className="text-lg font-black mt-1">{t("local_speaker_no_logistics_title")}</p>
              <p className="text-xs text-white/90 mt-2 leading-snug">{t("local_speaker_no_logistics_desc")}</p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 p-5 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/80">{t("reception_logistics")}</p>
            <p className="text-2xl font-black mt-1">{hostCount} {t("hosts")}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/70 mt-1">{t("hebergement")} · {t("transport")} · {t("repas")}</p>
          </div>
          <button onClick={() => setShowAssignHost(true)} className="px-4 py-2 rounded-xl bg-white/20 text-white text-xs font-bold uppercase tracking-wider hover:bg-white/30 transition-colors">
            + {t("assign")}
          </button>
        </div>
      </div>

      <div className="premium-card p-4 space-y-3 border-2 border-dashed border-amber-300/30">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-600">{t("group_meal")}</p>
        <p className="text-sm text-muted-foreground">{t("group_meal_desc")}</p>
        <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
          <button onClick={() => {
            const newAssignment: HostAssignment = {
              hostName: "Repas Salle du Royaume", role: "repas",
              day: detailForm.visitDate || "", time: "12:00", origin: "kingdom_hall",
            };
            setDetailForm({ ...detailForm, groupMealType: "salle_du_royaume", hostAssignments: [...(detailForm.hostAssignments || []), newAssignment] });
          }}
            className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${detailForm.groupMealType === "salle_du_royaume" ? "border-amber-500 bg-amber-50 dark:bg-amber-500/10" : "border-border"}`}>
            <Building2 className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div className="text-left"><p className="text-sm font-bold text-foreground">{t("kingdom_hall")}</p><p className="text-[10px] text-muted-foreground line-clamp-1">{t("meal_kingdom_hall_desc")}</p></div>
          </button>
          <button onClick={() => {
            const newAssignment: HostAssignment = {
              hostName: "Repas Restaurant", role: "repas",
              day: detailForm.visitDate || "", time: "12:00", origin: "restaurant",
            };
            setDetailForm({ ...detailForm, groupMealType: "restaurant", hostAssignments: [...(detailForm.hostAssignments || []), newAssignment] });
          }}
            className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${detailForm.groupMealType === "restaurant" ? "border-amber-500 bg-amber-50 dark:bg-amber-500/10" : "border-border"}`}>
            <Utensils className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div className="text-left"><p className="text-sm font-bold text-foreground">{t("meal_restaurant")}</p><p className="text-[10px] text-muted-foreground line-clamp-1">{t("meal_restaurant_desc")}</p></div>
          </button>
        </div>
      </div>

      {[...(detailForm.hostAssignments || [])].sort((a, b) => {
        const da = a.day ? new Date(a.day).getTime() : 0;
        const db = b.day ? new Date(b.day).getTime() : 0;
        if (da !== db) return da - db;
        return (a.time || "").localeCompare(b.time || "");
      }).map((ha) => {
        const origIdx = (detailForm.hostAssignments || []).indexOf(ha);
        const resolvedPhoto = ha.hostPhotoUrl || (ha.hostId ? allHosts.find((h) => h.id === ha.hostId)?.photoUrl : undefined);
        const isEditing = editingHostIdx === origIdx;
        const formattedDay = ha.day ? new Date(ha.day + "T00:00:00").toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long" }) : "";
        return (
          <div key={origIdx} className="premium-card p-4 space-y-3">
            <div className="flex items-center gap-3">
              {resolvedPhoto ? (
                <img src={resolvedPhoto} alt={ha.hostName || ""} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
              ) : ha.origin === "kingdom_hall" ? (
                <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center flex-shrink-0"><Building2 className="w-5 h-5 text-amber-600" /></div>
              ) : ha.origin === "restaurant" ? (
                <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center flex-shrink-0"><Utensils className="w-5 h-5 text-orange-600" /></div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <Home className="w-6 h-6 text-muted-foreground/30" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-foreground uppercase">{ha.hostName}</p>
                {!isEditing && (
                  <>
                    <p className={`text-[10px] font-bold uppercase tracking-widest ${roleColor(ha.role)}`}>{t(ha.role)}</p>
                    {formattedDay && <p className="text-[10px] text-muted-foreground capitalize">{formattedDay} {ha.time && `· ${ha.time}`}</p>}
                    {ha.hostPhone && <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" /> {ha.hostPhone}</p>}
                  </>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setEditingHostIdx(isEditing ? null : origIdx)} className={`p-1.5 rounded-lg transition-colors ${isEditing ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}>
                  {isEditing ? <Check className="w-4 h-4" /> : <Pencil className="w-4 h-4 text-muted-foreground" />}
                </button>
                {!isEditing && ha.hostPhone && (
                  <>
                    <button onClick={() => sendWhatsApp(ha.hostPhone!, "")} className="p-1.5 rounded-lg hover:bg-emerald-500/10 transition-colors" title="Envoyer WhatsApp"><MessageSquare className="w-4 h-4 text-emerald-600" /></button>
                    <a href={`tel:${ha.hostPhone}`} className="p-1.5 rounded-lg hover:bg-primary/10 transition-colors" title="Appeler"><Phone className="w-4 h-4 text-primary" /></a>
                  </>
                )}
                <button onClick={() => removeHostAssignment(origIdx)} className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors" title="Retirer"><X className="w-4 h-4 text-muted-foreground" /></button>
              </div>
            </div>
            {isEditing && (
              <div className="space-y-2 pt-1">
                <div className="grid grid-cols-1 xs:grid-cols-3 gap-2">
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{t("role")}</label>
                    <select className="input-soft text-sm" value={ha.role} onChange={(e) => updateHostAssignment(origIdx, "role", e.target.value)} title={t("role")}>
                      <option value="hebergement">{t("hebergement")}</option>
                      <option value="transport">{t("transport")}</option>
                      <option value="repas">{t("repas")}</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{t("date")}</label>
                    <input type="date" className="input-soft text-sm" value={ha.day || ""} onChange={(e) => updateHostAssignment(origIdx, "day", e.target.value)} onClick={(e) => (e.target as HTMLInputElement).showPicker?.()} title={t("date")} />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{t("time")}</label>
                    <input type="time" className="input-soft text-sm" value={ha.time || ""} onChange={(e) => updateHostAssignment(origIdx, "time", e.target.value)} onClick={(e) => (e.target as HTMLInputElement).showPicker?.()} title={t("time")} />
                  </div>
                </div>
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Origine</label>
                  <select className="input-soft text-sm" value={ha.origin || "host"} onChange={(e) => updateHostAssignment(origIdx, "origin", e.target.value)} title="Origine">
                    <option value="host">{t("hosts")}</option>
                    <option value="kingdom_hall">Salle du Royaume</option>
                    <option value="restaurant">Restaurant</option>
                  </select>
                </div>
                {(ha.origin === "restaurant") && (
                  <div className="grid grid-cols-1 xs:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Nom restaurant</label>
                      <input type="text" className="input-soft text-sm" placeholder="Ex: La Brasserie" value={ha.hostName || ""} onChange={(e) => updateHostAssignment(origIdx, "hostName", e.target.value)} />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Adresse</label>
                      <input type="text" className="input-soft text-sm" placeholder="Adresse du restaurant" value={ha.hostAddress || ""} onChange={(e) => updateHostAssignment(origIdx, "hostAddress", e.target.value)} />
                    </div>
                  </div>
                )}
              </div>
            )}
            {!isEditing && ha.hostAddress && <p className="text-xs text-muted-foreground flex items-center gap-1.5"><Home className="w-3.5 h-3.5 flex-shrink-0" /> {ha.hostAddress}</p>}
            {!isEditing && ha.origin === "kingdom_hall" && kingdomHallAddress && (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 flex-shrink-0" /> {kingdomHallAddress}</p>
            )}
          </div>
        );
      })}

      {hostCount === 0 && (
        <div className="text-center py-6 text-muted-foreground"><Users className="w-10 h-10 mx-auto mb-2 opacity-30" /><p className="text-sm">{t("no_hosts_assigned")}</p></div>
      )}

      <AnimatePresence>
        {showAssignHost && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="premium-card p-4 space-y-3 overflow-hidden">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">{t("assign_host")}</p>
            <select className="input-soft text-sm" value={assignHostId} onChange={(e) => setAssignHostId(e.target.value)} title={t("select_host")}>
              <option value="">{t("select_host")}</option>
              {allHosts.map((h) => {
                const lastDate = getHostLastVisitDate(h.id);
                const formattedLast = lastDate ? ` (${t("last")}: ${new Date(lastDate).toLocaleDateString(locale, { day: 'numeric', month: 'short' })})` : "";
                return <option key={h.id} value={h.id}>{h.nom}{formattedLast}</option>;
              })}
            </select>
            <select className="input-soft text-sm" value={assignRole} onChange={(e) => setAssignRole(e.target.value as HostAssignment["role"])} title={t("role")}>
              <option value="hebergement">{t("hebergement")}</option>
              <option value="transport">{t("transport")}</option>
              <option value="repas">{t("repas")}</option>
            </select>
            <div className="grid grid-cols-2 gap-2">
              <input className="input-soft text-sm" type="date" placeholder={t("day")} value={assignDay} onChange={(e) => setAssignDay(e.target.value)} onClick={(e) => (e.target as HTMLInputElement).showPicker?.()} />
              <input className="input-soft text-sm" type="time" placeholder={t("time")} value={assignTime} onChange={(e) => setAssignTime(e.target.value)} onClick={(e) => (e.target as HTMLInputElement).showPicker?.()} />
            </div>

            {assignRole === "hebergement" && assignHostId && (() => {
              const selectedHost = allHosts.find(h => h.id === assignHostId);
              if (selectedHost?.capacity && selectedHost.capacity < totalPeople) {
                return (
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400">
                    <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p className="text-[10px] font-bold leading-tight">
                      Capacité insuffisante : L'hôte peut accueillir {selectedHost.capacity} personnes, mais la visite compte {totalPeople} personnes.
                    </p>
                  </div>
                );
              }
              return null;
            })()}

            <div className="flex gap-2">
              <button onClick={addHostAssignment} className="flex-1 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold">{t("add")}</button>
              <button onClick={() => setShowAssignHost(false)} className="px-4 py-2 rounded-xl bg-muted text-muted-foreground text-xs font-bold">{t("cancel")}</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}