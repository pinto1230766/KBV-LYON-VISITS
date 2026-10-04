import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, Building2, Utensils, Phone, MessageSquare, Pencil, Check, X,
  Users, AlertTriangle, MapPin,
} from "lucide-react";
import type { Visit, HostAssignment, Speaker, Host } from "../../store/visitTypes";
import { useSettingsStore, type SettingsState } from "../../store/useSettingsStore";
import { TimeSelect } from "../ui/TimeSelect";
import { ImageLightbox } from "../ImageLightbox";
import { ItineraryButton } from "../ui/ItineraryButton";

interface HostsTabProps {
  viewVisit: Visit;
  detailForm: Partial<Visit>;
  setDetailForm: (f: Partial<Visit>) => void;
  currentSpeaker: Speaker | null | undefined;
  hostCount: number;
  allHosts: Host[];
  locale: string;
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
  assignCompanionId: string;
  setAssignCompanionId: (v: string) => void;
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
    locale, editingHostIdx, setEditingHostIdx,
    showAssignHost, setShowAssignHost, assignHostId, setAssignHostId,
    assignRole, setAssignRole, assignDay, setAssignDay, assignTime, setAssignTime,
    assignCompanionId, setAssignCompanionId,
    addHostAssignment, removeHostAssignment, updateHostAssignment,
    getHostLastVisitDate, sendWhatsApp, roleColor, t,
  } = props;

  const kingdomHallAddress = useSettingsStore((s: SettingsState) => s.settings.congregation.kingdomHallAddress);
  const isLocal = viewVisit.localSpeaker || currentSpeaker?.localSpeaker;
  const [lightboxImg, setLightboxImg] = useState<{ src: string; alt: string } | null>(null);

  const handleUpdateAssignment = (idx: number, field: string, value: string) => {
    if (field === "companionId") {
      const companion = (detailForm.companions || []).find((c) => c.id === value);
      const updated = [...(detailForm.hostAssignments || [])];
      updated[idx] = {
        ...updated[idx],
        companionId: value || undefined,
        companionName: companion ? companion.nom : undefined,
      };
      setDetailForm({ ...detailForm, hostAssignments: updated });
    } else {
      updateHostAssignment(idx, field, value);
    }
  };

  if (isLocal) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
        <div className="rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 p-5 text-primary-foreground">
          <div className="flex items-start gap-3">
            <Home className="w-6 h-6 flex-shrink-0 mt-1" />
            <div>
              <p className="text-base font-black uppercase tracking-wide">{t("local_speaker_title")}</p>
              <p className="text-xs text-primary-foreground/80 mt-1">{t("local_speaker_desc")}</p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Quick Assign Buttons */}
      <div className="bg-surface-container rounded-xl p-card_padding border border-white/5 space-y-3">
        <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{t("quick_assign")}</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              const khAssignments = (detailForm.hostAssignments || []).filter((h) => h.origin === "kingdom_hall");
              const targetDay = khAssignments.length === 0 ? detailForm.visitDate : undefined;
              const defaultMealTime = "13:00";
              const newAssignment: HostAssignment = {
                hostId: "kingdom_hall",
                hostName: t("repas_kingdom_hall_title"),
                role: "repas",
                day: targetDay,
                time: defaultMealTime,
                origin: "kingdom_hall",
                hostAddress: kingdomHallAddress,
              };
              setDetailForm({
                ...detailForm,
                hostAssignments: [...(detailForm.hostAssignments || []), newAssignment],
              });
            }}
            className="flex items-center gap-2.5 p-3 rounded-lg bg-surface-container-high hover:bg-surface-container-highest border border-white/5 transition-colors"
          >
            <Building2 className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div className="text-left"><p className="text-sm font-bold text-on-surface">{t("repas_kingdom_hall_title")}</p><p className="text-[10px] text-on-surface-variant line-clamp-1">{t("repas_kingdom_hall_desc")}</p></div>
          </button>
          <button
            onClick={() => {
              const defaultMealTime = "13:00";
              const newAssignment: HostAssignment = {
                hostId: "restaurant",
                hostName: t("meal_restaurant"),
                role: "repas",
                day: detailForm.visitDate,
                time: defaultMealTime,
                origin: "restaurant",
              };
              setDetailForm({
                ...detailForm,
                hostAssignments: [...(detailForm.hostAssignments || []), newAssignment],
              });
            }}
            className="flex items-center gap-2.5 p-3 rounded-lg bg-surface-container-high hover:bg-surface-container-highest border border-white/5 transition-colors"
          >
            <Utensils className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div className="text-left"><p className="text-sm font-bold text-on-surface">{t("meal_restaurant")}</p><p className="text-[10px] text-on-surface-variant line-clamp-1">{t("meal_restaurant_desc")}</p></div>
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
          <div key={origIdx} className="bg-surface-container rounded-xl p-card_padding border border-white/5 space-y-3">
            <div className="flex items-center gap-3">
              {resolvedPhoto ? (
                <div
                  className="relative group/photo cursor-zoom-in hover:scale-105 transition-transform flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxImg({ src: resolvedPhoto, alt: ha.hostName || "Hôte" });
                  }}
                  title="Cliquer pour agrandir la photo"
                >
                  <img src={resolvedPhoto} alt={ha.hostName || ""} className="w-14 h-14 rounded-full object-cover border border-outline-variant shadow-sm" />
                  <div className="absolute inset-0 bg-black/25 rounded-full opacity-0 group-hover/photo:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="material-symbols-outlined text-white text-[16px]">zoom_in</span>
                  </div>
                </div>
              ) : ha.origin === "kingdom_hall" ? (
                <div className="w-14 h-14 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0"><Building2 className="w-6 h-6 text-amber-400" /></div>
              ) : ha.origin === "restaurant" ? (
                <div className="w-14 h-14 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0"><Utensils className="w-6 h-6 text-orange-400" /></div>
              ) : (
                <div className="w-14 h-14 rounded-full bg-surface-variant flex items-center justify-center flex-shrink-0">
                  <Home className="w-7 h-7 text-on-surface-variant/50" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-on-surface uppercase">{ha.hostName}</p>
                {!isEditing && (
                  <>
                    <p className={`font-label-sm text-label-sm ${roleColor(ha.role)}`}>{t(ha.role)}</p>
                    <p className="font-label-sm text-label-sm text-on-surface-variant font-semibold">
                      {t("assignee")} : {ha.companionName || t("speaker_label")}
                    </p>
                    {formattedDay && <p className="font-label-sm text-label-sm text-on-surface-variant capitalize">{formattedDay} {ha.time && `· ${ha.time}`}</p>}
                    {ha.hostPhone && <p className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1"><Phone className="w-3 h-3" /> {ha.hostPhone}</p>}
                  </>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setEditingHostIdx(isEditing ? null : origIdx)} className={`p-1.5 rounded-lg transition-colors ${isEditing ? "bg-primary/10 text-primary" : "hover:bg-white/5"}`}>
                  {isEditing ? <Check className="w-4 h-4" /> : <Pencil className="w-4 h-4 text-on-surface-variant" />}
                </button>
                {!isEditing && ha.hostPhone && (
                  <>
                    <button onClick={() => sendWhatsApp(ha.hostPhone!, "")} className="p-1.5 rounded-lg hover:bg-emerald-500/10 transition-colors" title="Envoyer WhatsApp"><MessageSquare className="w-4 h-4 text-emerald-400" /></button>
                    <a href={`tel:${ha.hostPhone}`} className="p-1.5 rounded-lg hover:bg-primary/10 transition-colors" title="Appeler"><Phone className="w-4 h-4 text-primary" /></a>
                  </>
                )}
                <button onClick={() => removeHostAssignment(origIdx)} className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors" title="Retirer"><X className="w-4 h-4 text-on-surface-variant" /></button>
              </div>
            </div>
            {isEditing && (
              <div className="space-y-3 pt-2 border-t border-white/5">
                <div className="grid grid-cols-1 xs:grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-label-sm text-label-sm text-on-surface-variant">{t("role")}</label>
                    <select className="input-glass rounded-lg px-3 py-2 font-body-md text-body-md w-full" value={ha.role} onChange={(e) => updateHostAssignment(origIdx, "role", e.target.value as HostAssignment["role"])} title={t("role")}>
                      <option value="hebergement">{t("hebergement")}</option>
                      <option value="transport">{t("transport")}</option>
                      <option value="repas">{t("repas")}</option>
                      <option value="visite_lyon">{t("visite_lyon")}</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-label-sm text-label-sm text-on-surface-variant">{t("date")}</label>
                    <input type="date" className="input-glass rounded-lg px-3 py-2 font-body-md text-body-md w-full" value={ha.day || ""} onChange={(e) => updateHostAssignment(origIdx, "day", e.target.value)} onClick={(e) => (e.target as HTMLInputElement).showPicker?.()} title={t("date")} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-label-sm text-label-sm text-on-surface-variant">{t("time")}</label>
                    <TimeSelect className="input-glass rounded-lg px-3 py-2 font-body-md text-body-md w-full" value={ha.time || ""} onChange={(val) => updateHostAssignment(origIdx, "time", val)} />
                  </div>
                </div>
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-label-sm text-label-sm text-on-surface-variant">Origine</label>
                    <select className="input-glass rounded-lg px-3 py-2 font-body-md text-body-md w-full" value={ha.origin || "host"} onChange={(e) => updateHostAssignment(origIdx, "origin", e.target.value)} title="Origine">
                      <option value="host">{t("hosts")}</option>
                      <option value="kingdom_hall">Salle du Royaume</option>
                      <option value="restaurant">Restaurant</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-label-sm text-label-sm text-on-surface-variant">{t("assignee")}</label>
                    <select className="input-glass rounded-lg px-3 py-2 font-body-md text-body-md w-full" value={ha.companionId || ""} onChange={(e) => handleUpdateAssignment(origIdx, "companionId", e.target.value)} title={t("assignee")}>
                      <option value="">{t("speaker_label")}</option>
                      {(detailForm.companions || []).map((c) => (
                        <option key={c.id} value={c.id}>{c.nom}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {(ha.origin === "restaurant") && (
                  <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="font-label-sm text-label-sm text-on-surface-variant">Nom restaurant</label>
                      <input type="text" className="input-glass rounded-lg px-3 py-2 font-body-md text-body-md w-full" placeholder="Ex: La Brasserie" value={ha.hostName || ""} onChange={(e) => updateHostAssignment(origIdx, "hostName", e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="font-label-sm text-label-sm text-on-surface-variant">Adresse</label>
                      <input type="text" className="input-glass rounded-lg px-3 py-2 font-body-md text-body-md w-full" placeholder="Adresse du restaurant" value={ha.hostAddress || ""} onChange={(e) => updateHostAssignment(origIdx, "hostAddress", e.target.value)} />
                    </div>
                  </div>
                )}
              </div>
            )}
            {!isEditing && ha.hostAddress && (
              <div className="flex items-center justify-between gap-2 mt-1">
                <p className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1.5 truncate">
                  <Home className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{ha.hostAddress}</span>
                </p>
                <ItineraryButton address={ha.hostAddress} label="GPS Hôte" variant="pill" />
              </div>
            )}
            {!isEditing && ha.origin === "kingdom_hall" && kingdomHallAddress && (
              <div className="flex items-center justify-between gap-2 mt-1">
                <p className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1.5 truncate">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-primary" />
                  <span className="truncate">{kingdomHallAddress}</span>
                </p>
                <ItineraryButton address={kingdomHallAddress} label="GPS Salle" variant="pill" />
              </div>
            )}
          </div>
        );
      })}

      {hostCount === 0 && (
        <div className="text-center py-6 text-on-surface-variant"><Users className="w-10 h-10 mx-auto mb-2 opacity-30" /><p className="text-sm">{t("no_hosts_assigned")}</p></div>
      )}

      <AnimatePresence>
        {showAssignHost && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="bg-surface-container rounded-xl p-card_padding border border-white/5 space-y-4 overflow-hidden">
            <p className="font-label-sm text-label-sm text-primary uppercase tracking-wider">{t("assign_host")}</p>

            <div className="flex flex-col gap-2">
              <label className="font-label-sm text-label-sm text-on-surface-variant">{t("select_host")}</label>
              <select className="input-glass rounded-lg px-4 py-3 font-body-md text-body-md w-full" value={assignHostId} onChange={(e) => setAssignHostId(e.target.value)} title={t("select_host")}>
                <option value="">{t("select_host")}</option>
                {allHosts.map((h) => {
                  const lastDate = getHostLastVisitDate(h.id);
                  const formattedLast = lastDate ? ` (${t("last")}: ${new Date(lastDate).toLocaleDateString(locale, { day: 'numeric', month: 'short' })})` : "";
                  return <option key={h.id} value={h.id}>{h.nom}{formattedLast}</option>;
                })}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-label-sm text-label-sm text-on-surface-variant">{t("role")}</label>
              <select className="input-glass rounded-lg px-4 py-3 font-body-md text-body-md w-full" value={assignRole} onChange={(e) => setAssignRole(e.target.value as HostAssignment["role"])} title={t("role")}>
                <option value="hebergement">{t("hebergement")}</option>
                <option value="transport">{t("transport")}</option>
                <option value="repas">{t("repas")}</option>
                <option value="visite_lyon">{t("visite_lyon")}</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-label-sm text-label-sm text-on-surface-variant">{t("assignee")}</label>
              <select className="input-glass rounded-lg px-4 py-3 font-body-md text-body-md w-full" value={assignCompanionId} onChange={(e) => setAssignCompanionId(e.target.value)} title={t("assignee")}>
                <option value="">{t("speaker_label")}</option>
                {(detailForm.companions || []).map((c) => (
                  <option key={c.id} value={c.id}>{c.nom}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <label className="font-label-sm text-label-sm text-on-surface-variant">{t("day")}</label>
                <input className="input-glass rounded-lg px-4 py-3 font-body-md text-body-md w-full" type="date" placeholder={t("day")} value={assignDay} onChange={(e) => setAssignDay(e.target.value)} onClick={(e) => (e.target as HTMLInputElement).showPicker?.()} />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-label-sm text-label-sm text-on-surface-variant">{t("time")}</label>
                <TimeSelect className="input-glass rounded-lg px-4 py-3 font-body-md text-body-md w-full" value={assignTime} onChange={(val) => setAssignTime(val)} />
              </div>
            </div>

            {assignRole === "hebergement" && assignHostId && (() => {
              const selectedHost = allHosts.find(h => h.id === assignHostId);
              const groupSize = assignCompanionId ? 1 : (1 + (currentSpeaker?.householdType === "couple" ? 1 : 0) + (detailForm.childrenCount || 0));
              if (selectedHost?.capacity && selectedHost.capacity < groupSize) {
                return (
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
                    <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p className="text-[10px] font-bold leading-tight text-orange-400">
                      Capacité insuffisante : L'hôte peut accueillir {selectedHost.capacity} personnes, mais le groupe assigné compte {groupSize} personnes.
                    </p>
                  </div>
                );
              }
              return null;
            })()}

            <div className="flex gap-2 pt-2">
              <button onClick={addHostAssignment} className="flex-1 py-3 rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 uppercase font-bold">{t("assign")}</button>
              <button onClick={() => setShowAssignHost(false)} className="px-6 py-3 rounded-lg border border-border bg-card text-on-surface-variant font-label-md text-label-md hover:bg-muted transition-colors uppercase">{t("cancel")}</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fullscreen Photo Lightbox */}
      <ImageLightbox
        src={lightboxImg?.src}
        alt={lightboxImg?.alt}
        onClose={() => setLightboxImg(null)}
      />
    </motion.div>
  );
}