import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter text-left">
        {/* Left Column: Details & Logistic (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-gutter">
          {/* Détails Section */}
          <section className="bg-surface-container rounded-xl p-4 md:p-card_padding border border-white/5 space-y-4">
            <h2 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2 border-b border-white/10 pb-3">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 0" }}>description</span>
              {t("visit_details")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-stack_gap">
              <div className="flex flex-col gap-2">
                <label className="font-label-md text-label-md text-on-surface-variant">{t("talk_theme")}</label>
                <input className="input-glass rounded-lg px-4 py-3 font-body-md text-body-md w-full" type="text" value={detailForm.talkTheme || ""} onChange={(e) => setDetailForm({ ...detailForm, talkTheme: e.target.value })} placeholder={t("talk_theme")} />
              </div>
              {!isEvent && (
                <div className="flex flex-col gap-2">
                  <label className="font-label-md text-label-md text-on-surface-variant">{t("talk_number")}</label>
                  <input className="input-glass rounded-lg px-4 py-3 font-body-md text-body-md w-full" type="text" value={detailForm.talkNoOrType || ""} onChange={(e) => setDetailForm({ ...detailForm, talkNoOrType: e.target.value })} placeholder={t("talk_number")} />
                </div>
              )}
              {!isEvent && (
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="font-label-md text-label-md text-on-surface-variant">{t("speaker_phone")}</label>
                  <input className="input-glass rounded-lg px-4 py-3 font-body-md text-body-md w-full" type="tel" value={detailForm.speakerPhone || ""} onChange={(e) => setDetailForm({ ...detailForm, speakerPhone: e.target.value })} placeholder={t("phone")} />
                </div>
              )}
            </div>
          </section>

          {/* Accueil & Logistique Section */}
          <section className="bg-surface-container rounded-xl p-4 md:p-card_padding border border-white/5 space-y-4">
            <h2 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2 border-b border-white/10 pb-3">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 0" }}>luggage</span>
              {t("reception_logistics")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-stack_gap">
              <div className="flex flex-col gap-2">
                <label className="font-label-md text-label-md text-on-surface-variant">{t("location")}</label>
                <div className="relative">
                  <select className="input-glass rounded-lg px-4 py-3 pr-10 font-body-md text-body-md w-full appearance-none cursor-pointer" value={detailForm.locationType || "kingdom_hall"} onChange={(e) => setDetailForm({ ...detailForm, locationType: e.target.value as Visit["locationType"] })} title="Lieu">
                    <option value="kingdom_hall">{t("in_person")}</option>
                    <option value="zoom">Zoom</option>
                    <option value="streaming">Streaming</option>
                    <option value="other">{t("other")}</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-3.5 text-on-surface-variant pointer-events-none">expand_more</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-label-md text-label-md text-on-surface-variant">{t("status")}</label>
                <div className="relative">
                  <select className="input-glass rounded-lg px-4 py-3 pr-10 font-body-md text-body-md w-full appearance-none cursor-pointer" value={detailForm.status || "scheduled"} onChange={(e) => setDetailForm({ ...detailForm, status: e.target.value as VisitStatus })} title="Statut">
                    <option value="scheduled">{t("scheduled")}</option>
                    <option value="confirmed">{t("confirmed")}</option>
                    <option value="completed">{t("completed")}</option>
                    <option value="cancelled">{t("cancelled")}</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-3.5 text-on-surface-variant pointer-events-none">expand_more</span>
                </div>
              </div>
            </div>

            {!isEvent && (
              <div className="flex flex-col gap-3 pt-2">
                <label className="font-label-md text-label-md text-on-surface-variant">{t("transport_type")}</label>
                <div className="grid grid-cols-2 md:flex gap-3 md:gap-4">
                  {[
                    { id: "car", icon: "directions_car", label: t("car") },
                    { id: "train", icon: "train", label: t("train") },
                    { id: "plane", icon: "flight", label: t("plane") },
                    { id: "other", icon: "more_horiz", label: t("other_transport") },
                  ].map((tr) => {
                    const isActive = (detailForm.transportType || "car") === tr.id;
                    return (
                      <button
                        key={tr.id}
                        type="button"
                        onClick={() => setDetailForm({ ...detailForm, transportType: tr.id as Visit["transportType"] })}
                        className={`flex-1 flex flex-col items-center justify-center p-3 md:p-4 rounded-xl border transition-all ${
                          isActive
                            ? "border-primary/30 bg-primary/10 text-primary"
                            : "border-white/10 bg-transparent text-on-surface-variant hover:bg-white/5"
                        }`}
                      >
                        <span className="material-symbols-outlined mb-2 text-[32px]">{tr.icon}</span>
                        <span className="font-label-sm text-label-sm">{tr.label}</span>
                      </button>
                    );
                  })}
                </div>
                <AnimatePresence>
                  {["train", "plane"].includes(detailForm.transportType || "") && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-1 mt-2 overflow-hidden">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t("transport_details")}</p>
                      <input
                        className="input-glass rounded-lg px-4 py-3 font-body-md text-body-md w-full"
                        placeholder={t("transport_details_placeholder")}
                        value={detailForm.transportDetails || ""}
                        onChange={(e) => setDetailForm({ ...detailForm, transportDetails: e.target.value })}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Planning, Notes, Reference Image (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-gutter">
          {/* Reference Image */}
          <div className="w-full h-48 rounded-xl overflow-hidden border border-white/10 relative shrink-0 bg-surface-container flex items-center justify-center">
            <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">image</span> {t("reference_document")}
            </span>
          </div>

          {/* Planning Section */}
          <section className="bg-surface-container rounded-xl p-4 md:p-card_padding border border-white/5 space-y-4">
            <h2 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2 border-b border-white/10 pb-3">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 0" }}>schedule</span>
              {t("planning")}
            </h2>
            <div className="flex flex-col gap-4">
              {!isEvent && (
                <div className="flex flex-col gap-2">
                  <label className="font-label-md text-label-md text-on-surface-variant">{t("arrival")}</label>
                  <input 
                    className="input-glass rounded-lg px-4 py-3 font-body-md text-body-md w-full [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert" 
                    type="datetime-local" 
                    value={detailForm.date_arrivee && detailForm.heure_arrivee ? `${detailForm.date_arrivee}T${detailForm.heure_arrivee}` : ""} 
                    onChange={(e) => {
                      const [d, tVal] = e.target.value.split("T");
                      setDetailForm({ ...detailForm, date_arrivee: d || "", heure_arrivee: tVal || "" });
                    }} 
                    title="Arrivée"
                    placeholder="Arrivée"
                  />
                </div>
              )}
              <div className="flex flex-col gap-2">
                <label className="font-label-md text-label-md text-on-surface-variant">{t("meeting")}</label>
                <input 
                  className="input-glass rounded-lg px-4 py-3 font-body-md text-body-md w-full [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert" 
                  type="datetime-local" 
                  value={detailForm.visitDate && detailForm.heure_visite ? `${detailForm.visitDate}T${detailForm.heure_visite}` : ""} 
                  onChange={(e) => {
                    const [d, tVal] = e.target.value.split("T");
                    setDetailForm({ ...detailForm, visitDate: d || "", heure_visite: tVal || "" });
                  }} 
                  title="Réunion"
                  placeholder="Réunion"
                />
              </div>
              {!isEvent && (
                <div className="flex flex-col gap-2">
                  <label className="font-label-md text-label-md text-on-surface-variant">{t("departure")}</label>
                  <input 
                    className="input-glass rounded-lg px-4 py-3 font-body-md text-body-md w-full [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert" 
                    type="datetime-local" 
                    value={detailForm.date_depart && detailForm.heure_depart ? `${detailForm.date_depart}T${detailForm.heure_depart}` : ""} 
                    onChange={(e) => {
                      const [d, tVal] = e.target.value.split("T");
                      setDetailForm({ ...detailForm, date_depart: d || "", heure_depart: tVal || "" });
                    }} 
                    title="Départ"
                    placeholder="Départ"
                  />
                </div>
              )}
            </div>
          </section>

          {/* Enfants, Régime & Allergies et Notes */}
          {!isEvent && (
            <section className="bg-surface-container rounded-xl p-4 md:p-card_padding border border-white/5 space-y-4">
              <h2 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2 border-b border-white/10 pb-3">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 0" }}>info</span>
                {t("additional_information")}
              </h2>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="font-label-md text-label-md text-on-surface-variant">{t("children_count")}</label>
                  <div className="flex gap-1">
                    {[0, 1, 2, 3, 4].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setDetailForm({ ...detailForm, childrenCount: n })}
                        className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all ${
                          (detailForm.childrenCount ?? 0) === n
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "bg-card text-muted-foreground hover:bg-accent/5 border border-border"
                        }`}
                      >
                        {n === 4 ? "4+" : n}
                      </button>
                    ))}
                  </div>
                  <AnimatePresence>
                    {(detailForm.childrenCount ?? 0) > 0 && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-2 mt-1 overflow-hidden">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t("children_ages")}</label>
                          <input
                            className="input-glass rounded-lg px-4 py-2 text-sm w-full"
                            placeholder={t("children_ages_placeholder")}
                            value={detailForm.childrenAges || ""}
                            onChange={(e) => setDetailForm({ ...detailForm, childrenAges: e.target.value })}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t("children_dietary_placeholder").split("...")[0].trim()}</label>
                          <input
                            className="input-glass rounded-lg px-4 py-2 text-sm w-full"
                            placeholder={t("children_dietary_placeholder")}
                            value={detailForm.childrenDietary || ""}
                            onChange={(e) => setDetailForm({ ...detailForm, childrenDietary: e.target.value })}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="font-label-md text-label-md text-on-surface-variant">{t("dietary_allergies")}</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input 
                      className="input-glass rounded-lg px-4 py-2.5 text-xs w-full" 
                      placeholder={t("speaker_allergies_placeholder")}
                      value={detailForm.speakerDietary || ""}
                      onChange={(e) => setDetailForm({ ...detailForm, speakerDietary: e.target.value })}
                    />
                    <input 
                      className="input-glass rounded-lg px-4 py-2.5 text-xs w-full" 
                      placeholder={t("spouse_allergies_placeholder")}
                      value={detailForm.spouseDietary || ""}
                      onChange={(e) => setDetailForm({ ...detailForm, spouseDietary: e.target.value })}
                    />
                  </div>

                  {/* Récapitulatif allergies accompagnants (lecture seule) */}
                  {(detailForm.companions || []).some(c => c.dietary) && (
                    <div className="mt-1 p-3 rounded-lg bg-amber-500/8 border border-amber-500/20 space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500/80">{t("companions_allergies_summary")}</p>
                      {(detailForm.companions || []).filter(c => c.dietary).map(c => (
                        <p key={c.id} className="text-xs text-on-surface-variant flex items-center gap-1.5">
                          <span className="font-semibold text-on-surface">{c.nom}</span>
                          {c.ageGroup === "child" && c.childAge && (
                            <span className="text-[10px] text-violet-400">({c.childAge})</span>
                          )}
                          <span>— {c.dietary}</span>
                        </p>
                      ))}
                      <p className="text-[10px] text-muted-foreground italic mt-1">Modifiable dans l'onglet Accompagnants</p>
                    </div>
                  )}
                </div>

                
                <div className="flex flex-col gap-2">
                  <label className="font-label-md text-label-md text-on-surface-variant">{t("visit_notes")}</label>
                  <textarea 
                    className="input-glass rounded-lg px-4 py-3 font-body-md text-body-md w-full resize-none" 
                    rows={3}
                    value={detailForm.notes || ""}
                    onChange={(e) => setDetailForm({ ...detailForm, notes: e.target.value })}
                    placeholder={t("add_notes_placeholder")}
                  />
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </motion.div>
  );
}
