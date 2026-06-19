import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, Camera, Upload, UserCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSpeakerStore } from "../store/useSpeakerStore";
import { useSettingsStore } from "../store/useSettingsStore";
import { useTranslation } from "../hooks/useTranslation";
import { toast } from "sonner";
import type { Speaker, HouseholdType } from "../store/visitTypes";
import { generateId } from "../lib/sheetUtils";
import { isEventName } from "../lib/eventDetection";
import { isExampleName } from "../lib/utils";
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
              <Camera className="w-5 h-5 text-primary-foreground" />
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

  const { register, handleSubmit: handleZodSubmit, formState: { errors }, reset: resetZodForm } = useForm<SpeakerFormData>({
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

  const onInvalid = () => {
    haptic("error");
    toast.error(t("error") || "Veuillez vérifier les champs obligatoires (en rouge)");
  };

  const handleDelete = (id: string) => {
    deleteSpeaker(id);
    setConfirmDeleteId(null);
    resetForm();
    haptic("warning");
    toast.success(t("speaker_deleted"));
  };

  // Exclure les événements et les données d'exemple (Jean Dupont, etc.)
  const realSpeakers = speakers.filter((sp) => !isEventName(sp.nom) && !isExampleName(sp.nom));
  const filtered = realSpeakers
    .filter((sp) => sp.nom.toLowerCase().includes(search.toLowerCase()) || sp.congregation.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.nom.localeCompare(b.nom));

  const uniqueFiltered = Array.from(new Map(filtered.map(item => [item.id, item])).values());

  return (
    <div className="py-4 md:py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-1">
        <div className="flex items-center gap-4">
          <h2 className="text-xl md:text-2xl font-bold text-on-surface tracking-tight flex items-center gap-2">
            <span className="material-symbols-outlined text-primary" data-weight="fill" style={{ fontVariationSettings: "'FILL' 1" }}>contact_page</span>
            Répertoire
          </h2>
          <div className="h-6 w-px bg-outline-variant/30 mx-2 hidden sm:block"></div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-4xl font-display-lg text-display-lg text-primary tracking-tighter">{realSpeakers.length}</span>
            <span className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">{t("speakers") || "Orateurs"}</span>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap">
          {/* Search Pill */}
          <div className="relative group w-64 sm:w-80">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-on-surface-variant group-focus-within:text-tertiary transition-colors">search</span>
            </div>
            <input
              className="block w-full pl-10 pr-12 py-2 border border-outline-variant/50 rounded-full bg-surface-container-high/50 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-1 focus:ring-tertiary focus:border-tertiary text-sm transition-all duration-200 glass-panel"
              placeholder={t("search_speaker") || "Rechercher un orateur..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
              <kbd className="hidden sm:inline-block text-xs font-label-sm text-on-surface-variant/50 border border-outline-variant/50 rounded px-1.5 py-0.5">⌘K</kbd>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={openAddForm}
            className="bg-primary hover:bg-primary/90 text-on-primary font-label-md text-label-md px-5 py-2.5 rounded-full transition-all duration-200 flex items-center gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            <span>{t("add") || "Ajouter"}</span>
          </motion.button>
        </div>
      </div>

      {/* Grid */}
      {uniqueFiltered.length === 0 ? (
        <div className="text-center py-16 text-on-surface-variant/50">
          <span className="material-symbols-outlined text-4xl mx-auto mb-3 opacity-20">person_off</span>
          <p className="text-base font-body-md">{t("no_results")}</p>
        </div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-gutter"
        >
          <AnimatePresence mode="popLayout">
            {uniqueFiltered.map((sp) => {
              const hasLocalStyle = sp.localSpeaker;
              return (
                <motion.div
                  key={`speaker-${sp.id}`}
                  variants={staggerItem}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`glass-panel rounded-2xl p-4 flex items-center gap-4 hover:border-outline-variant/80 transition-all duration-300 group cursor-pointer relative overflow-hidden ${hasLocalStyle ? "border-l-2 border-l-primary/50" : ""
                    }`}
                  onClick={() => openFiche(sp)}
                >
                  {/* Avatar Layout — stacked vertically for couple */}
                  {sp.householdType === "couple" ? (
                    <div className="flex flex-col items-center gap-0.5 flex-shrink-0 w-14">
                      {sp.photoUrl ? (
                        <img alt={sp.nom} className="w-10 h-10 rounded-full border-2 border-surface-container-low object-cover" src={sp.photoUrl} />
                      ) : (
                        <div className="w-10 h-10 rounded-full border-2 border-surface-container-low bg-surface-container-highest flex items-center justify-center">
                          <span className="material-symbols-outlined text-xs text-on-surface-variant">person</span>
                        </div>
                      )}
                      {sp.spousePhotoUrl ? (
                        <img alt={sp.spouseName} className="w-8 h-8 rounded-full border-2 border-surface-container-low object-cover -mt-3" src={sp.spousePhotoUrl} />
                      ) : (
                        <div className="w-8 h-8 rounded-full border-2 border-surface-container-low bg-surface-container-highest flex items-center justify-center -mt-3">
                          <span className="material-symbols-outlined text-[10px] text-on-surface-variant">person</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-surface-container-highest flex-shrink-0 border border-outline-variant/30 flex items-center justify-center overflow-hidden">
                      {sp.photoUrl ? (
                        <img alt={sp.nom} className="w-full h-full object-cover" src={sp.photoUrl} />
                      ) : (
                        <span className="material-symbols-outlined text-on-surface-variant">person</span>
                      )}
                    </div>
                  )}

                  {/* Speaker Details */}
                  <div className="flex-1 min-w-0 text-left">
                    <h3 className="font-headline-md text-[18px] leading-tight text-on-surface font-semibold truncate group-hover:text-primary transition-colors">{sp.nom}</h3>

                    {sp.householdType === "couple" && sp.spouseName && (
                      <div className="inline-flex mt-1 items-center px-2 py-0.5 rounded-full bg-secondary-container/20 border border-secondary/20">
                        <span className="font-label-sm text-[10px] text-secondary capitalize">avec {sp.spouseName.toLowerCase()}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 mt-1 text-on-surface-variant">
                      <span className="material-symbols-outlined text-[14px]">home</span>
                      <span className="font-body-md text-[13px] truncate">{sp.congregation}</span>
                    </div>

                    {sp.telephone && (
                      <div className="flex items-center gap-1.5 mt-0.5 text-on-surface-variant/70">
                        <span className="material-symbols-outlined text-[12px]">call</span>
                        <span className="font-label-sm text-[11px]">{sp.telephone}</span>
                      </div>
                    )}
                  </div>

                  {/* Delete Button on Hover */}
                  <button
                    onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(sp.id); }}
                    className="w-8 h-8 rounded-full hover:bg-error/10 text-on-surface-variant hover:text-error flex items-center justify-center transition-colors absolute top-3 right-3 opacity-0 group-hover:opacity-100"
                    title={t("delete") || "Supprimer"}
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>

                  {/* Chevron Right Indicator */}
                  <span className="material-symbols-outlined text-on-surface-variant/30 absolute right-4 bottom-4 group-hover:translate-x-1 transition-transform">chevron_right</span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      <AnimatePresence>
        {viewSpeaker && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={resetForm}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel w-full max-w-5xl rounded-xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <form className="flex flex-col h-full w-full">
                {/* Modal Header */}
                <div className="flex items-center justify-between px-gutter py-card_padding border-b border-white/10 bg-surface-container/50">
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-primary text-3xl" data-weight="fill" style={{ fontVariationSettings: "'FILL' 1" }}>person_book</span>
                    <div className="text-left">
                      <h2 className="font-headline-lg text-headline-lg text-on-surface m-0">Fiche Orateur</h2>
                      <p className="font-label-md text-label-md text-on-surface-variant m-0">Détails et informations de coordination</p>
                    </div>
                  </div>
                  <button type="button" onClick={resetForm} className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 text-on-surface-variant hover:text-on-surface transition-colors">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                {/* Modal Body */}
                <div className="flex-1 overflow-y-auto p-gutter custom-scrollbar">
                  <div className="grid grid-cols-12 gap-gutter text-left">
                    {/* Left Column: Identity & Primary Info (4 cols) */}
                    <div className="col-span-12 md:col-span-4 flex flex-col gap-stack_gap">
                      {/* Photo Card */}
                      <div className="bg-surface-container rounded-lg p-card_padding border border-white/5 flex flex-col items-center text-center">
                        <div className="flex gap-4 justify-center mb-4">
                          <AvatarUpload
                            photoUrl={form.photoUrl}
                            onPhotoChange={(url) => setForm({ ...form, photoUrl: url })}
                            label={t("speaker_label")}
                          />
                          {form.householdType === "couple" && (
                            <AvatarUpload
                              photoUrl={form.spousePhotoUrl}
                              onPhotoChange={(url) => setForm({ ...form, spousePhotoUrl: url })}
                              label={t("spouse_label")}
                            />
                          )}
                        </div>
                        <input
                          className="text-xl font-black text-foreground bg-transparent border-none text-center focus:ring-0 focus:outline-none w-full"
                          placeholder={t("speaker_name") || "Nom"}
                          {...register("nom")}
                        />
                        {errors.nom && <p className="text-xs text-destructive">{errors.nom.message}</p>}

                        <div className="inline-flex mt-2 items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/10 text-secondary font-label-sm text-label-sm border border-secondary/20">
                          <span className="material-symbols-outlined text-[14px]">church</span>
                          <input
                            className="bg-transparent border-none focus:ring-0 focus:outline-none text-center w-full max-w-[150px] p-0 font-label-sm"
                            placeholder={t("congregation")}
                            {...register("congregation")}
                          />
                        </div>
                        {errors.congregation && <p className="text-xs text-destructive mt-1">{errors.congregation.message}</p>}
                      </div>

                      {/* Contact Card */}
                      <div className="bg-surface-container rounded-lg p-card_padding border border-white/5 flex flex-col gap-4">
                        <h4 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider flex items-center gap-2">
                          <span className="material-symbols-outlined text-[18px]">contact_mail</span> Contact
                        </h4>

                        <div className="flex flex-col gap-1">
                          <label htmlFor="contact-phone" className="font-label-sm text-label-sm text-on-surface-variant">Téléphone</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-[18px]">call</span>
                            <input
                              id="contact-phone"
                              className="input-glass w-full rounded-md py-2 pl-10 pr-3 text-on-surface font-body-md font-medium"
                              type="tel"
                              placeholder={t("phone")}
                              {...register("telephone")}
                            />
                          </div>
                          {errors.telephone && <p className="text-xs text-destructive">{errors.telephone.message}</p>}
                        </div>

                        <div className="flex flex-col gap-1">
                          <label htmlFor="contact-email" className="font-label-sm text-label-sm text-on-surface-variant">Email</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-[18px]">mail</span>
                            <input
                              id="contact-email"
                              className="input-glass w-full rounded-md py-2 pl-10 pr-3 text-on-surface font-body-md font-medium"
                              type="email"
                              placeholder={t("email")}
                              {...register("email")}
                            />
                          </div>
                          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Details & Settings (8 cols) */}
                    <div className="col-span-12 md:col-span-8 flex flex-col gap-stack_gap">
                      {/* Top Row: Status & Family */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-stack_gap">
                        {/* Status */}
                        <div className="bg-surface-container rounded-lg p-card_padding border border-white/5 flex flex-col justify-center">
                          <label className="flex items-center gap-3 cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={form.localSpeaker ?? false}
                              onChange={(e) => setForm({ ...form, localSpeaker: e.target.checked })}
                              className="checkbox-custom"
                            />
                            <div>
                              <span className="font-body-md text-on-surface group-hover:text-primary transition-colors block">Orateur Local</span>
                              <span className="font-label-sm text-label-sm text-on-surface-variant">Membre de la congrégation</span>
                            </div>
                          </label>
                        </div>

                        {/* Family Type */}
                        <div className="bg-surface-container rounded-lg p-card_padding border border-white/5 flex flex-col justify-center gap-2">
                          <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Type de Foyer</label>
                          <div className="flex bg-surface-variant rounded-md p-1">
                            <button
                              type="button"
                              onClick={() => setForm({ ...form, householdType: "single" })}
                              className={`flex-1 py-1.5 rounded text-center font-label-md text-label-md transition-colors ${form.householdType === "single"
                                ? "bg-surface-bright text-on-surface shadow-sm border border-white/5"
                                : "text-on-surface-variant hover:text-on-surface"
                                }`}
                            >
                              Frère seul
                            </button>
                            <button
                              type="button"
                              onClick={() => setForm({ ...form, householdType: "couple" })}
                              className={`flex-1 py-1.5 rounded text-center font-label-md text-label-md transition-colors ${form.householdType === "couple"
                                ? "bg-surface-bright text-on-surface shadow-sm border border-white/5"
                                : "text-on-surface-variant hover:text-on-surface"
                                }`}
                            >
                              Couple
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Spouse Name Input if Couple */}
                      <AnimatePresence>
                        {form.householdType === "couple" && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-surface-container rounded-lg p-card_padding border border-white/5 flex flex-col gap-1 overflow-hidden"
                          >
                            <label htmlFor="resp-spouse" className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">{t("spouse_name")}</label>
                            <input
                              id="resp-spouse"
                              className="input-glass w-full rounded-md py-2 px-3 text-on-surface font-body-md"
                              placeholder={t("spouse_name_placeholder")}
                              {...register("spouseName")}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Logistics */}
                      <div className="bg-surface-container rounded-lg p-card_padding border border-white/5">
                        <h4 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-4 flex items-center gap-2">
                          <span className="material-symbols-outlined text-[18px]">home</span> Logistique &amp; Accueil
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                          <div className="flex flex-col gap-1">
                            <label className="font-label-sm text-label-sm text-on-surface-variant">Nombre d'enfants (voyageant avec)</label>
                            <div className="relative flex items-center">
                              <button
                                type="button"
                                onClick={() => setForm({ ...form, childrenCount: Math.max(0, (form.childrenCount ?? 0) - 1) })}
                                className="absolute left-1 w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-on-surface rounded-md hover:bg-white/5"
                                title={t("remove") || "Retirer"}
                              >
                                <span className="material-symbols-outlined">remove</span>
                              </button>
                              <input
                                className="input-glass w-full rounded-md py-2 px-10 text-center text-on-surface font-body-md font-medium"
                                min="0"
                                type="number"
                                title={t("children_count") || "Nombre d'enfants"}
                                value={form.childrenCount ?? 0}
                                onChange={(e) => setForm({ ...form, childrenCount: Math.max(0, parseInt(e.target.value) || 0) })}
                              />
                              <button
                                type="button"
                                onClick={() => setForm({ ...form, childrenCount: (form.childrenCount ?? 0) + 1 })}
                                className="absolute right-1 w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-on-surface rounded-md hover:bg-white/5"
                                title={t("add") || "Ajouter"}
                              >
                                <span className="material-symbols-outlined">add</span>
                              </button>
                            </div>
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="font-label-sm text-label-sm text-on-surface-variant">Régime &amp; Allergies</label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-[18px]">restaurant</span>
                              <input
                                className="input-glass w-full rounded-md py-2 pl-10 pr-3 text-on-surface font-body-md"
                                placeholder="Ex: Sans gluten, végétarien..."
                                type="text"
                                {...register("dietary")}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Children Ages if children count > 0 */}
                        <AnimatePresence>
                          {(form.childrenCount ?? 0) > 0 && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="flex flex-col gap-1 mt-4 overflow-hidden"
                            >
                              <label className="font-label-sm text-label-sm text-on-surface-variant">{t("children_ages")}</label>
                              <input
                                className="input-glass w-full rounded-md py-2 px-3 text-on-surface font-body-md"
                                placeholder={t("children_ages_placeholder")}
                                {...register("childrenAges")}
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Notes Area */}
                      <div className="bg-surface-container rounded-lg p-card_padding border border-white/5 flex-1 flex flex-col min-h-[140px]">
                        <h4 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-3 flex items-center gap-2">
                          <span className="material-symbols-outlined text-[18px]">notes</span> Notes Complémentaires
                        </h4>
                        <textarea
                          className="input-glass w-full flex-1 rounded-md p-3 text-on-surface font-body-md resize-none"
                          placeholder="Ajoutez des notes sur la disponibilité, les préférences d'hébergement..."
                          {...register("notes")}
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Footer (Actions) */}
                <div className="px-gutter py-4 border-t border-white/10 bg-surface-container/30 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(viewSpeaker.id)}
                    className="px-6 py-2 rounded-md font-label-md text-label-md text-destructive hover:bg-destructive/10 transition-colors mr-auto"
                  >
                    Supprimer
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-2 rounded-md font-label-md text-label-md text-tertiary hover:bg-tertiary/10 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      handleZodSubmit(handleSave, onInvalid)();
                    }}
                    className="px-6 py-2 rounded-md font-label-md text-label-md bg-primary text-on-primary hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">save</span>
                    Enregistrer
                  </button>
                </div>
              </form>
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
              <form onSubmit={handleZodSubmit(handleSave, onInvalid)} className="flex flex-col h-full w-full overflow-hidden">
                {/* iOS Style Action Header */}
                <div className="ios-sheet-header flex items-center justify-between">
                  <button type="button" onClick={resetForm} className="text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground">
                    {t("cancel") || "Annuler"}
                  </button>
                  <h3 className="text-xs font-black uppercase tracking-widest text-foreground">{editing ? t("edit") : t("add_speaker")}</h3>
                  <button
                    type="button"
                    onPointerDown={(e) => {
                      e.preventDefault();
                      handleZodSubmit(handleSave, onInvalid)();
                    }}
                    className="text-xs font-black uppercase tracking-widest text-primary hover:opacity-80"
                  >
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
                        className={`py-2 rounded-xl text-xs font-bold transition-all border ${form.householdType === "single"
                          ? "bg-primary text-primary-foreground border-primary shadow-md"
                          : "bg-white dark:bg-card text-foreground border-border hover:border-primary/40 hover:shadow-sm"
                          }`}
                      >
                        {t("brother_alone")}
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, householdType: "couple" })}
                        className={`py-2 rounded-xl text-xs font-bold transition-all border ${form.householdType === "couple"
                          ? "bg-primary text-primary-foreground border-primary shadow-md"
                          : "bg-white dark:bg-card text-foreground border-border hover:border-primary/40 hover:shadow-sm"
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
                          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border ${form.childrenCount === n
                            ? "bg-primary text-primary-foreground border-primary shadow-md"
                            : "bg-white dark:bg-card text-foreground border-border hover:border-primary/40 hover:shadow-sm"
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
              </form>
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
                <button onClick={() => { setConfirmDeleteId(null); }} className="flex-1 py-2.5 rounded-xl bg-white dark:bg-card text-foreground text-xs font-bold border border-border hover:border-muted-foreground/40">{t("cancel")}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}