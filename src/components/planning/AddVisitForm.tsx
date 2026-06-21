import { motion } from "framer-motion";
import type { Visit, VisitStatus } from "../../store/visitTypes";
import { TimeSelect } from "../ui/TimeSelect";

export interface AddVisitFormState {
  nom: string;
  congregation: string;
  visitDate: string;
  talkNoOrType: string;
  talkTheme: string;
  locationType: Visit["locationType"];
  speakerPhone: string;
  notes: string;
  status: VisitStatus;
  heure_visite: string;
}

interface AddVisitFormProps {
  form: AddVisitFormState;
  setForm: (f: AddVisitFormState) => void;
  onSubmit: () => void;
  onCancel: () => void;
  t: (k: string) => string;
}

export function AddVisitForm({ form, setForm, onSubmit, onCancel, t }: AddVisitFormProps) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50" onClick={onCancel}>
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-md bg-card rounded-t-[28px] sm:rounded-2xl shadow-2xl max-h-[85vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        
        {/* iOS Style Action Header */}
        <div className="ios-sheet-header flex items-center justify-between">
          <button onClick={onCancel} className="text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground">
            {t("cancel") || "Annuler"}
          </button>
          <h3 className="text-xs font-black uppercase tracking-widest text-foreground">{t("add_visit")}</h3>
          <button onClick={onSubmit} className="text-xs font-black uppercase tracking-widest text-primary hover:opacity-80">
            {t("add") || "Ajouter"}
          </button>
        </div>

        {/* Scrollable Form Content */}
        <div className="ios-sheet-content p-6 space-y-4">
          <input className="input-soft text-sm" placeholder={t("speaker_name")} value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
          <input className="input-soft text-sm" placeholder={t("congregation")} value={form.congregation} onChange={(e) => setForm({ ...form, congregation: e.target.value })} />
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
            <div><label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1 block">{t("visit_date")}</label><input className="input-soft text-sm" type="date" value={form.visitDate} onChange={(e) => setForm({ ...form, visitDate: e.target.value })} onClick={(e) => (e.target as HTMLInputElement).showPicker?.()} title={t("visit_date")} /></div>
            <div><label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1 block">{t("time")}</label><TimeSelect className="input-soft text-sm" value={form.heure_visite} onChange={(val) => setForm({ ...form, heure_visite: val })} /></div>
          </div>
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
            <input className="input-soft text-sm" placeholder={t("talk_number")} value={form.talkNoOrType} onChange={(e) => setForm({ ...form, talkNoOrType: e.target.value })} />
            <input className="input-soft text-sm" placeholder={t("talk_theme")} value={form.talkTheme} onChange={(e) => setForm({ ...form, talkTheme: e.target.value })} />
          </div>
          <input className="input-soft text-sm" placeholder={t("phone")} value={form.speakerPhone} onChange={(e) => setForm({ ...form, speakerPhone: e.target.value })} />
          <select className="input-soft text-sm" value={form.locationType} onChange={(e) => setForm({ ...form, locationType: e.target.value as Visit["locationType"] })} title={t("location")}>
            <option value="kingdom_hall">{t("kingdom_hall")}</option><option value="zoom">Zoom</option><option value="streaming">Streaming</option><option value="other">{t("other")}</option>
          </select>
          <textarea className="input-soft text-sm min-h-[80px] resize-none" placeholder={t("notes")} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>
      </motion.div>
    </motion.div>
  );
}
