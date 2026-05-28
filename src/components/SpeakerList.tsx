import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Users, Plus, Trash2, Phone, ChevronRight, AlertTriangle, Search, Camera, Upload, MapPin, UserCircle, Home, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSpeakerStore } from "../store/useSpeakerStore";
import { useSettingsStore } from "../store/useSettingsStore";
import { useTranslation } from "../hooks/useTranslation";
import { toast } from "sonner";
import type { Speaker, HouseholdType } from "../store/visitTypes";
import { generateId } from "../lib/sheetUtils";
import { isEventName } from "../lib/eventDetection";
import { speakerSchema, type SpeakerFormData } from "../lib/validation";
import { haptic } from "../lib/haptics";

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

const staggerItem = {
  hidden: { opacity: 0, y: 15, scale: 0.98 },
  show: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 260,
      damping: 20
    }
  }
};

/* Mini photo uploader for the fiche */
function AvatarUpload({ photoUrl, onPhotoChange, label }: { photoUrl?: string; onPhotoChange: (url: string | undefined) => void; label: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.size > 15 * 1024 * 1024) return;
    const { compressImage } = await import("../lib/imageCompress");
    const dataUrl = await compressImage(file, { maxDim: 800, quality: 0.82 });
    onPhotoChange(dataUrl);
    e.target.value = "";
  };
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="w-16 h-16 rounded-2xl bg-muted border-2 border-dashed border-border hover:border-primary/50 flex items-center justify-center relative group cursor-pointer overflow-hidden transition-colors"
        onClick={() => inputRef.current?.click()}
      >
        {photoUrl ? (
          <>
            <img src={photoUrl} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" />
            </div>
          </>
        ) : (
          <UserCircle className="w-10 h-10 text-muted-foreground" />
        )}
        <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center translate-x-1 translate-y-1">
          <Upload className="w-3 h-3 text-primary-foreground" />
        </div>
      </div>
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} aria-label={label} title={label} />
    </div>
  );
}

export function SpeakerList() {
  const speakers = useSpeakerStore((s) => s.speakers);
  const addSpeaker = useSpeakerStore((s) => s.addSpeaker);
  const updateSpeaker = useSpeakerStore((s) => s.updateSpeaker);
  const deleteSpeaker = useSpeakerStore((s) => s.deleteSpeaker);
  const { t } = useTranslation();
  const settings = useSettingsStore((s) => s.settings);
  const congregationName = settings?.congregation?.name || "";

  const [viewSpeaker, setViewSpeaker] = useState<Speaker | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Speaker | null>(null);
  const [search, setSearch] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState(false);

  const { register, handleSubmit: handleZodSubmit, formState: { errors }, reset: resetZodForm, watch } = useForm<SpeakerFormData>({
    resolver: zodResolver(speakerSchema),
    defaultValues: {
      nom: "",
      congregation: congregationName,
      telephone: "",
      email: "",
      notes: "",
      householdType: "single",
      spouseName: "",
    },
  });

  const watchedNotes = watch("notes") || "";
  const watchedCongregation = watch("congregation") || "";

  const [form, setForm] = useState({
    nom: "", congregation: "", telephone: "", email: "", notes: "",
    photoUrl: undefined as string | undefined,
    spousePhotoUrl: undefined as string | undefined,
    householdType: "single" as HouseholdType,
    spouseName: "",
    childrenCount: 0,
    childrenAges: "",
    dietary: "",
    spouseDietary: "",
    localSpeaker: false,
  });

  const resetForm = () => {
    setForm({ nom: "", congregation: "", telephone: "", email: "", notes: "", photoUrl: undefined, spousePhotoUrl: undefined, householdType: "single", spouseName: "", childrenCount: 0, childrenAges: "", dietary: "", spouseDietary: "", localSpeaker: false });
    resetZodForm({
      nom: "",
      congregation: congregationName,
      telephone: "",
      email: "",
      notes: "",
      householdType: "single",
      spouseName: "",
      dietary: "",
      spouseDietary: "",
    });
    setEditing(null);
    setShowForm(false);
    setViewSpeaker(null);
    setEditingNotes(false);
  };

  const openFiche = (sp: Speaker) => {
    setForm({
      nom: sp.nom,
      congregation: sp.congregation,
      telephone: sp.telephone || "",
      email: sp.email || "",
      notes: sp.notes || "",
      photoUrl: sp.photoUrl,
      spousePhotoUrl: sp.spousePhotoUrl,
      householdType: sp.householdType || "single",
      spouseName: sp.spouseName || "",
      childrenCount: sp.childrenCount ?? 0,
      childrenAges: sp.childrenAges || "",
      dietary: sp.dietary || "",
      spouseDietary: sp.spouseDietary || "",
      localSpeaker: sp.localSpeaker ?? false,
    });
    resetZodForm({
      nom: sp.nom,
      congregation: sp.congregation,
      telephone: sp.telephone || "",
      email: sp.email || "",
      notes: sp.notes || "",
      householdType: sp.householdType || "single",
      spouseName: sp.spouseName || "",
      dietary: sp.dietary || "",
      spouseDietary: sp.spouseDietary || "",
    });
    setEditing(sp);
    setViewSpeaker(sp);
    setEditingNotes(false);
  };

  const openAddForm = () => {
    setForm({ nom: "", congregation: congregationName, telephone: "", email: "", notes: "", photoUrl: undefined, spousePhotoUrl: undefined, householdType: "single", spouseName: "", childrenCount: 0, childrenAges: "", dietary: "", spouseDietary: "", localSpeaker: false });
    resetZodForm({
      nom: "",
      congregation: congregationName,
      telephone: "",
      email: "",
      notes: "",
      householdType: "single",
      spouseName: "",
      dietary: "",
      spouseDietary: "",
    });
    setEditing(null);
    setShowForm(true);
    setViewSpeaker(null);
    setEditingNotes(false);
  };

  const handleSave = (data?: SpeakerFormData) => {
    if (!data) return;
    // Merge explicitly: text inputs come from react-hook-form (data),
    // button/photo-controlled fields come from local form state.
    const merged = {
      ...data,
      photoUrl: form.photoUrl,
      spousePhotoUrl: form.spousePhotoUrl,
      householdType: form.householdType,
      childrenCount: form.childrenCount,
      localSpeaker: form.localSpeaker,
    };
    if (editing) {
      updateSpeaker(editing.id, merged);
      haptic("success");
      toast.success(t("speaker_updated"));
    } else {
      addSpeaker({ ...merged, id: generateId() } as Speaker);
      haptic("success");
      toast.success(t("speaker_added"));
    }
    resetForm();
  };

  const handleDelete = (id: string) => {
    deleteSpeaker(id);
    setConfirmDeleteId(null);
    resetForm();
    haptic("warning");
    toast.success(t("speaker_deleted"));
  };

  // Exclure les événements (congrès, asenbleias, visites SC, etc.) qui ne sont pas de vrais orateurs
  const realSpeakers = speakers.filter((sp) => !isEventName(sp.nom));
  const filtered = realSpeakers
    .filter((sp) => sp.nom.toLowerCase().includes(search.toLowerCase()) || sp.congregation.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.nom.localeCompare(b.nom));

  const uniqueFiltered = Array.from(new Map(filtered.map(item => [item.id, item])).values());

  return (
    <div className="py-4 md:py-6 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 md:gap-4">
        <div className="mr-auto">
          <p className="text-xs md:text-sm font-bold uppercase tracking-wider text-muted-foreground">{t("repertoire")}</p>
          <p className="text-2xl md:text-3xl font-black text-foreground">{realSpeakers.length} <span className="text-base md:text-lg font-bold text-muted-foreground uppercase">{t("speakers")}</span></p>
        </div>
        <motion.button whileTap={{ scale: 0.97 }} onClick={openAddForm}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-500 text-white text-sm font-bold hover:bg-amber-600 transition-colors touch-manipulation">
          <Plus className="w-5 h-5" /> {t("add")}
        </motion.button>
      </div>

      <div className="relative group/search">
        <input 
          className="input-soft text-base py-2 pl-4 pr-12" 
          placeholder={t("search_speaker")} 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
        />
        <div className="absolute right-0 top-0 bottom-0 px-4 flex items-center bg-muted/50 rounded-r-xl border-l border-border/50">
          <Search className="w-4 h-4 text-muted-foreground/50" />
        </div>
      </div>

      {/* Grid */}
      {uniqueFiltered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-base">{t("no_results")}</p>
        </div>
      ) : (
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3"
        >
          <AnimatePresence mode="popLayout">
            {uniqueFiltered.map((sp) => (
              <motion.div
                key={`speaker-${sp.id}`}
                variants={staggerItem}
                exit={{ opacity: 0, scale: 0.95 }}
                className="premium-card p-3 cursor-pointer hover:ring-1 hover:ring-primary/30 transition-all group relative overflow-hidden"
                onClick={() => openFiche(sp)}
              >
                {/* Subtle glass highlight on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                
                <div className="flex items-center gap-4 relative z-10">
                  {/* Photos/Avatars avec support couple */}
                  <div className="flex gap-1.5 flex-shrink-0">
                    {sp.householdType === "couple" ? (
                      <>
                        <div className="w-12 h-14 rounded-xl bg-muted overflow-hidden flex-shrink-0 shadow-sm border border-border/50">
                          {sp.photoUrl ? (
                            <img src={sp.photoUrl} alt={sp.nom} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><Users className="w-6 h-6 text-muted-foreground/30" /></div>
                          )}
                        </div>
                        <div className="w-12 h-14 rounded-xl bg-muted overflow-hidden flex-shrink-0 shadow-sm border border-border/50">
                          {sp.spousePhotoUrl ? (
                            <img src={sp.spousePhotoUrl} alt={sp.spouseName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><Users className="w-6 h-6 text-muted-foreground/30" /></div>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="w-12 h-14 rounded-xl bg-muted overflow-hidden flex-shrink-0 shadow-sm">
                        {sp.photoUrl ? (
                          <img src={sp.photoUrl} alt={sp.nom} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><Users className="w-6 h-6 text-muted-foreground/30" /></div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 text-center">
                    <p className="text-sm font-black text-foreground truncate">{sp.nom}</p>
                    {sp.householdType === "couple" && sp.spouseName && (
                      <p className="text-[11px] font-bold text-primary/80 -mt-0.5">{t("with")} {sp.spouseName}</p>
                    )}
                    <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5 truncate mt-1">
                      <Home className="w-3.5 h-3.5 flex-shrink-0 text-primary/50" /> {sp.congregation}
                    </p>
                    {(sp.childrenCount ?? 0) > 0 && (
                      <p className="text-[10px] font-bold text-amber-600/80 flex items-center justify-center gap-1 mt-0.5">
                        👶 {sp.childrenCount} {t("children")}
                      </p>
                    )}
                    {sp.telephone && (
                      <p className="text-[10px] text-muted-foreground/70 flex items-center justify-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3" /> {sp.telephone}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-center justify-between gap-2 self-stretch">
                    <button onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(sp.id); }} aria-label={t("delete")} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive/70 transition-colors" title={t("delete")}>
                      <Trash2 aria-hidden="true" className="w-4 h-4" />
                    </button>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/30" />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <AnimatePresence>
        {viewSpeaker && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50" onClick={resetForm}>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="w-full max-w-4xl bg-card rounded-t-[28px] sm:rounded-2xl shadow-2xl max-h-[85vh] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* iOS Style Sticky Header */}
              <div className="ios-sheet-header flex items-center justify-between">
                <button onClick={resetForm} className="text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground">
                  {t("close")}
                </button>
                <h3 className="text-xs font-black uppercase tracking-widest text-foreground">
                  {t("speaker_card")}
                </h3>
                <div className="flex items-center gap-3">
                  <button onClick={() => setConfirmDeleteId(viewSpeaker.id)} className="text-xs font-bold uppercase tracking-wider text-destructive hover:underline">
                    {t("delete")}
                  </button>
                  <button onClick={handleZodSubmit(handleSave)} className="text-xs font-black uppercase tracking-widest text-primary hover:opacity-80">
                    {t("save")}
                  </button>
                </div>
              </div>

              {/* Scrollable Form Content */}
              <div className="ios-sheet-content p-6 space-y-6">
                <div className="flex flex-col items-center justify-center pb-2 border-b border-border/40">
                  <h2 className="text-xl font-black text-foreground">{form.nom}</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">{watchedCongregation}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Colonne Gauche : Coordonnées, Photos, Type de foyer */}
                  <div className="space-y-4">
                    {/* Photos du couple */}
                    <div className="p-4 rounded-2xl bg-muted/20 border border-border/30 space-y-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t("couple_photos")}</p>
                      <div className="flex gap-4 justify-center">
                        <AvatarUpload
                          photoUrl={form.photoUrl}
                          onPhotoChange={(url) => setForm({ ...form, photoUrl: url })}
                          label={t("speaker_label")}
                        />
                        <AvatarUpload
                          photoUrl={form.spousePhotoUrl}
                          onPhotoChange={(url) => setForm({ ...form, spousePhotoUrl: url })}
                          label={t("spouse_label")}
                        />
                      </div>
                    </div>

                    {/* Congrégation + Téléphone */}
                    <div className="p-4 rounded-2xl bg-muted/20 border border-border/30 space-y-4">
                      <div className="space-y-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t("congregation")}</p>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <input className="input-soft text-sm" placeholder={t("congregation")} {...register("congregation")} />
                        </div>
                        {errors.congregation && <p className="text-xs text-destructive">{errors.congregation.message}</p>}
                      </div>
                      <div className="space-y-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t("phone")}</p>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                          <input className="input-soft text-sm" placeholder={t("phone")} {...register("telephone")} />
                        </div>
                        {errors.telephone && <p className="text-xs text-destructive">{errors.telephone.message}</p>}
                      </div>
                      <div className="space-y-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t("email") || "Email"}</p>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                          <input className="input-soft text-sm" placeholder={t("email") || "Email"} {...register("email")} />
                        </div>
                        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                      </div>
                    </div>

                    {/* Orateur local */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 p-3 rounded-2xl border border-border bg-muted/30 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.localSpeaker ?? false}
                          onChange={(e) => setForm({ ...form, localSpeaker: e.target.checked })}
                          className="w-5 h-5 rounded accent-primary flex-shrink-0"
                        />
                        <div>
                          <p className="text-sm font-bold text-foreground">{t("local_speaker") || "Orateur local"}</p>
                          <p className="text-[10px] text-muted-foreground">{t("local_speaker_desc") || "Membre de la congrégation — pas besoin d'hébergement, repas ou transport"}</p>
                        </div>
                      </label>
                    </div>

                    {/* Type de foyer */}
                    <div className="p-4 rounded-2xl bg-muted/20 border border-border/30 space-y-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t("household_type")}</p>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, householdType: "single" })}
                          className={`py-2.5 rounded-2xl text-xs font-bold transition-all ${
                            form.householdType === "single"
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          }`}
                        >
                          {t("brother_alone")}
                        </button>
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, householdType: "couple" })}
                          className={`py-2.5 rounded-2xl text-xs font-bold transition-all ${
                            form.householdType === "couple"
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          }`}
                        >
                          {t("couple")}
                        </button>
                      </div>
                      <AnimatePresence>
                        {form.householdType === "couple" && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-2 overflow-hidden pt-2">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t("spouse_name")}</p>
                            <input className="input-soft text-sm" placeholder={t("spouse_name_placeholder")} {...register("spouseName")} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Colonne Droite : Enfants, Allergies, Notes */}
                  <div className="space-y-4">
                    {/* Enfants */}
                    <div className="p-4 rounded-2xl bg-muted/20 border border-border/30 space-y-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t("children_count")}</p>
                      <div className="flex gap-1.5 flex-wrap">
                        {[0, 1, 2, 3, 4].map((n) => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setForm({ ...form, childrenCount: n, childrenAges: n === 0 ? "" : form.childrenAges })}
                            className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${
                              form.childrenCount === n
                                ? "bg-amber-500 text-white shadow-sm"
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                            }`}
                          >
                            {n === 4 ? "4+" : n}
                          </button>
                        ))}
                      </div>
                      <AnimatePresence>
                        {(form.childrenCount ?? 0) > 0 && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-1 overflow-hidden pt-1">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t("children_ages")}</p>
                            <input
                              className="input-soft text-sm"
                              placeholder={t("children_ages_placeholder")}
                              {...register("childrenAges")}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Allergies / Régimes Alimentaires */}
                    <div className="p-4 rounded-2xl bg-muted/20 border border-border/30 space-y-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t("dietary_allergies")}</p>
                      <div className="flex flex-col gap-3">
                        <div className="space-y-1">
                          <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-muted-foreground">{t("speaker_label")}</p>
                          <input
                            className="input-soft text-sm"
                            placeholder={t("speaker_allergies_placeholder")}
                            {...register("dietary")}
                          />
                        </div>
                        {form.householdType === "couple" && (
                          <div className="space-y-1">
                            <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-muted-foreground">{t("spouse_label")}</p>
                            <input
                              className="input-soft text-sm"
                              placeholder={t("spouse_allergies_placeholder")}
                              {...register("spouseDietary")}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="p-4 rounded-2xl bg-muted/20 border border-border/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t("notes")}</p>
                        <button onClick={() => setEditingNotes(!editingNotes)} className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline">
                          {editingNotes ? t("done") : t("edit")}
                        </button>
                      </div>
                      {editingNotes ? (
                        <textarea
                          className="input-soft text-sm min-h-[80px] resize-none w-full"
                          placeholder={t("notes")}
                          {...register("notes")}
                          autoFocus
                        />
                      ) : (
                        <p className="text-sm text-foreground p-3 rounded-xl bg-card border border-border/50 min-h-[40px] whitespace-pre-wrap">
                          {watchedNotes || <span className="text-muted-foreground italic text-xs">{t("no_notes")}</span>}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============ ADD FORM MODAL (simple) ============ */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50" onClick={resetForm}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-card rounded-t-[28px] sm:rounded-2xl shadow-2xl max-h-[85vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
              
              {/* iOS Style Action Header */}
              <div className="ios-sheet-header flex items-center justify-between">
                <button onClick={resetForm} className="text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground">
                  {t("cancel") || "Annuler"}
                </button>
                <h3 className="text-xs font-black uppercase tracking-widest text-foreground">{editing ? t("edit") : t("add_speaker")}</h3>
                <button onClick={handleZodSubmit(handleSave)} className="text-xs font-black uppercase tracking-widest text-primary hover:opacity-80">
                  {editing ? t("save") : t("add")}
                </button>
              </div>

              {/* Scrollable Form Content */}
              <div className="ios-sheet-content p-6 space-y-4">
                {/* Photo */}
                <div className="flex justify-center">
                  <AvatarUpload photoUrl={form.photoUrl} onPhotoChange={(url) => setForm({ ...form, photoUrl: url })} label={t("photo")} />
                </div>
                
                <div className="space-y-1">
                  <label htmlFor="speaker-nom" className="sr-only">{t("speaker_name")}</label>
                  <input id="speaker-nom" className="input-soft text-sm" placeholder={t("speaker_name")} {...register("nom")} />
                </div>
                {errors.nom && <p className="text-xs text-destructive">{errors.nom.message}</p>}
                <div className="space-y-1">
                  <label htmlFor="speaker-congregation" className="sr-only">{t("congregation")}</label>
                  <input id="speaker-congregation" className="input-soft text-sm" placeholder={t("congregation")} {...register("congregation")} />
                </div>
                {errors.congregation && <p className="text-xs text-destructive">{errors.congregation.message}</p>}
                <div className="space-y-1">
                  <label htmlFor="speaker-telephone" className="sr-only">{t("phone")}</label>
                  <input id="speaker-telephone" className="input-soft text-sm" placeholder={t("phone")} {...register("telephone")} />
                </div>
                {errors.telephone && <p className="text-xs text-destructive">{errors.telephone.message}</p>}
                <div className="space-y-1">
                  <label htmlFor="speaker-email" className="sr-only">{t("email")}</label>
                  <input id="speaker-email" className="input-soft text-sm" placeholder={t("email")} {...register("email")} />
                </div>
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                
                {/* Type de foyer */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t("household_type")}</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, householdType: "single" })}
                      className={`py-2 rounded-xl text-xs font-bold transition-all ${
                        form.householdType === "single"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {t("brother_alone")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, householdType: "couple" })}
                      className={`py-2 rounded-xl text-xs font-bold transition-all ${
                        form.householdType === "couple"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {t("couple")}
                    </button>
                  </div>
                </div>
                
                {/* Nom du conjoint */}
                <input className="input-soft text-sm" placeholder={t("spouse_name")} {...register("spouseName")} />

                {/* Enfants — sélecteur rapide */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t("children_count")}</label>
                  <div className="flex gap-2">
                    {[0, 1, 2, 3, 4].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setForm({ ...form, childrenCount: n })}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                          form.childrenCount === n
                            ? "bg-amber-500 text-white"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {n === 4 ? "4+" : n}
                      </button>
                    ))}
                  </div>
                </div>

                <AnimatePresence>
                  {(form.childrenCount ?? 0) > 0 && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-1 overflow-hidden pt-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t("children_ages")}</label>
                      <input
                        className="input-soft text-sm"
                        placeholder={t("children_ages_placeholder")}
                        {...register("childrenAges")}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Allergies / Régimes Alimentaires */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t("dietary_allergies")}</label>
                  <div className="flex flex-col gap-2">
                    <input className="input-soft text-sm" placeholder={t("speaker_allergies_placeholder")} {...register("dietary")} />
                    {form.householdType === "couple" && (
                      <input className="input-soft text-sm" placeholder={t("spouse_allergies_placeholder")} {...register("spouseDietary")} />
                    )}
                  </div>
                </div>
                
                {/* Notes */}
                <textarea className="input-soft text-sm min-h-[60px] resize-none" placeholder={t("notes")} {...register("notes")} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {confirmDeleteId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50" onClick={() => setConfirmDeleteId(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-card rounded-2xl p-6 space-y-4 shadow-2xl text-center" onClick={(e) => e.stopPropagation()}>
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <p className="text-sm font-bold text-foreground">{t("confirm_delete_speaker")}</p>
              <div className="flex gap-2">
                <button onClick={() => handleDelete(confirmDeleteId)} className="flex-1 py-2.5 rounded-xl bg-destructive text-destructive-foreground text-xs font-bold">{t("yes_delete")}</button>
                <button onClick={() => { setConfirmDeleteId(null); }} className="flex-1 py-2.5 rounded-xl bg-muted text-muted-foreground text-xs font-bold">{t("cancel")}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}