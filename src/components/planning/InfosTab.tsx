import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Phone, Car, Train, Plane, MoreHorizontal } from "lucide-react";
import type { Visit, VisitStatus } from "../../store/visitTypes";
import { isEventVisit } from "../../lib/eventDetection";

interface InfosTabProps {
  viewVisit: Visit;
  detailForm: Partial<Visit>;
  setDetailForm: (f: Partial<Visit>) => void;
  visits: Visit[];
  locale: string;
  t: (k: string) => string;
  congregationName?: string;
}

export function InfosTab({
  viewVisit, detailForm, setDetailForm, visits, locale, t, congregationName,
}: InfosTabProps) {
  const isEvent = isEventVisit(viewVisit);
  const isLocal = viewVisit.localSpeaker || 
                 (congregationName && viewVisit.congregation?.toLowerCase().trim() === congregationName.toLowerCase().trim());

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      {!isEvent && (() => {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const pastVisits = visits
          .filter(v => v.nom.toLowerCase() === viewVisit.nom.toLowerCase() && v.visitId !== viewVisit.visitId && new Date(v.visitDate) < new Date(viewVisit.visitDate))
          .sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime());
        const lastVisit = pastVisits[0];
        const isRecent = lastVisit && new Date(lastVisit.visitDate) > sixMonthsAgo;
        if (isRecent) {
          return (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
              <p className="text-[11px] font-bold text-amber-600 leading-tight uppercase">
                Attention : Cet orateur est venu récemment ({new Date(lastVisit.visitDate).toLocaleDateString(locale, { month: 'long', year: 'numeric' })}).
              </p>
            </div>
          );
        }
        return null;
      })()}

      {isLocal && !isEvent && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
            <span className="text-emerald-600 font-bold text-xs">L</span>
          </div>
          <div>
            <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">{t("local_speaker_no_logistics_title")}</p>
            <p className="text-[10px] text-emerald-600/80 leading-tight mt-0.5">{t("local_speaker_no_logistics_desc")}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Colonne Gauche : Thème, Téléphone, Dates/Horaires */}
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-muted/20 border border-border/30 space-y-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{t("visit_details")}</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-[3] space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t("talk_theme")}</p>
                <input className="input-soft text-base font-bold" value={detailForm.talkTheme || ""} onChange={(e) => setDetailForm({ ...detailForm, talkTheme: e.target.value })} placeholder={t("talk_theme")} />
              </div>
              {!isEvent && (
                <div className="flex-1 space-y-1 min-w-[100px]">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t("talk_number")}</p>
                  <input className="input-soft text-2xl font-black w-full" value={detailForm.talkNoOrType || ""} onChange={(e) => setDetailForm({ ...detailForm, talkNoOrType: e.target.value })} placeholder={t("talk_number")} />
                </div>
              )}
            </div>
            {!isEvent && (
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t("speaker_phone")}</p>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                  <input className="input-soft text-sm" value={detailForm.speakerPhone || ""} onChange={(e) => setDetailForm({ ...detailForm, speakerPhone: e.target.value })} placeholder={t("phone")} />
                </div>
                <p className="text-[10px] text-muted-foreground">{t("phone_whatsapp_hint")}</p>
              </div>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-muted/20 border border-border/30 space-y-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{t("planning") || "Planification"}</p>
            {!isEvent && (
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70 mb-1">{t("arrival")}</p>
                <div className="flex flex-col xs:flex-row gap-2">
                  <div className="flex-1">
                    <input className="input-soft text-sm" type="date" value={detailForm.date_arrivee || ""} onChange={(e) => setDetailForm({ ...detailForm, date_arrivee: e.target.value })} title={t("arrival_date")} />
                  </div>
                  <div className="xs:w-32">
                    <input className="input-soft text-sm" type="time" value={detailForm.heure_arrivee || ""} onChange={(e) => setDetailForm({ ...detailForm, heure_arrivee: e.target.value })} title={t("arrival_time")} />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70 mb-1">{t("meeting")}</p>
              <div className="flex flex-col xs:flex-row gap-2">
                <div className="flex-1">
                  <input className="input-soft text-sm" type="date" value={detailForm.visitDate || ""} onChange={(e) => setDetailForm({ ...detailForm, visitDate: e.target.value })} title={t("meeting_date")} />
                </div>
                <div className="xs:w-32">
                  <input className="input-soft text-sm" type="time" value={detailForm.heure_visite || ""} onChange={(e) => setDetailForm({ ...detailForm, heure_visite: e.target.value })} title={t("meeting_time")} />
                </div>
              </div>
            </div>

            {!isEvent && (
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70 mb-1">{t("departure")}</p>
                <div className="flex flex-col xs:flex-row gap-2">
                  <div className="flex-1">
                    <input className="input-soft text-sm" type="date" value={detailForm.date_depart || ""} onChange={(e) => setDetailForm({ ...detailForm, date_depart: e.target.value })} title={t("departure_date")} />
                  </div>
                  <div className="xs:w-32">
                    <input className="input-soft text-sm" type="time" value={detailForm.heure_depart || ""} onChange={(e) => setDetailForm({ ...detailForm, heure_depart: e.target.value })} title={t("departure_time")} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Colonne Droite : Logistique, Enfants, Régime, Notes */}
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-muted/20 border border-border/30 space-y-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{t("reception_logistics") || "Logistique"}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t("location")}</p>
                <select className="input-soft text-sm" value={detailForm.locationType || "kingdom_hall"} onChange={(e) => setDetailForm({ ...detailForm, locationType: e.target.value as Visit["locationType"] })} title={t("location")}>
                  <option value="kingdom_hall">{t("in_person")}</option><option value="zoom">Zoom</option><option value="streaming">Streaming</option><option value="other">{t("other")}</option>
                </select>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t("status")}</p>
                <select className="input-soft text-sm" value={detailForm.status || "scheduled"} onChange={(e) => setDetailForm({ ...detailForm, status: e.target.value as VisitStatus })} title={t("status")}>
                  <option value="scheduled">{t("scheduled")}</option><option value="confirmed">{t("confirmed")}</option><option value="completed">{t("completed")}</option><option value="cancelled">{t("cancelled")}</option>
                </select>
              </div>
            </div>

            {!isEvent && (
              <div className="space-y-2 pt-2 border-t border-border/40">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t("transport_type")}</p>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: "car", icon: Car, label: t("car") },
                    { id: "train", icon: Train, label: t("train") },
                    { id: "plane", icon: Plane, label: t("plane") },
                    { id: "other", icon: MoreHorizontal, label: t("other_transport") },
                  ].map((tr) => (
                    <button
                      key={tr.id}
                      onClick={() => setDetailForm({ ...detailForm, transportType: tr.id as Visit["transportType"] })}
                      className={`flex flex-col items-center gap-1.5 p-2 rounded-2xl border-2 transition-all ${
                        (detailForm.transportType || "car") === tr.id
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border text-muted-foreground hover:border-muted-foreground/30"
                      }`}
                    >
                      <tr.icon className="w-4 h-4" />
                      <span className="text-[9px] font-bold uppercase">{tr.label}</span>
                    </button>
                  ))}
                </div>
                <AnimatePresence>
                  {["train", "plane"].includes(detailForm.transportType || "") && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-1 mt-2 overflow-hidden">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t("transport_details")}</p>
                      <input
                        className="input-soft text-sm"
                        placeholder={t("transport_details_placeholder")}
                        value={detailForm.transportDetails || ""}
                        onChange={(e) => setDetailForm({ ...detailForm, transportDetails: e.target.value })}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {!isEvent && (
            <div className="p-4 rounded-2xl bg-muted/20 border border-border/30 space-y-4">
              <div className="space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary flex items-center gap-2">👶 {t("children")}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t("children_count")}</p>
                    <div className="flex gap-1">
                      {[0, 1, 2, 3, 4].map((n) => (
                        <button
                          key={n}
                          onClick={() => setDetailForm({ ...detailForm, childrenCount: n })}
                          className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all ${
                            (detailForm.childrenCount ?? 0) === n
                              ? "bg-amber-500 text-white shadow-sm"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {n === 4 ? "4+" : n}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t("children_ages")}</p>
                    <input
                      className="input-soft text-sm"
                      placeholder={t("children_ages_placeholder")}
                      value={detailForm.childrenAges || ""}
                      onChange={(e) => setDetailForm({ ...detailForm, childrenAges: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-border/40">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">{t("dietary_allergies")}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-muted-foreground">{t("speaker_label")}</p>
                    <input className="input-soft text-xs" placeholder={t("speaker_allergies_placeholder")} value={detailForm.speakerDietary || ""} onChange={(e) => setDetailForm({ ...detailForm, speakerDietary: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-muted-foreground">{t("spouse_label")}</p>
                    <input className="input-soft text-xs" placeholder={t("spouse_allergies_placeholder")} value={detailForm.spouseDietary || ""} onChange={(e) => setDetailForm({ ...detailForm, spouseDietary: e.target.value })} />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="p-4 rounded-2xl bg-muted/20 border border-border/30 space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t("visit_notes")}</p>
            <textarea className="input-soft text-sm min-h-[70px] resize-none w-full" placeholder={t("add_notes_placeholder")} value={detailForm.notes || ""} onChange={(e) => setDetailForm({ ...detailForm, notes: e.target.value })} />
            <p className="text-[9px] text-muted-foreground">{t("visit_notes_hint")}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
