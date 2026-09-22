import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, Camera, UserCircle } from "lucide-react";
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
import { ImageLightbox } from "./ImageLightbox";
import { useVisitStore } from "../store/useVisitStore";
import { useShallow } from "zustand/react/shallow";

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

/* Photo uploader for the fiche with zoom / preview capability */
function AvatarUpload({
  photoUrl,
  onPhotoChange,
  label,
  onZoom,
}: {
  photoUrl?: string;
  onPhotoChange: (url: string | undefined) => void;
  label: string;
  onZoom?: (url: string) => void;
}) {
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
    <div className="flex flex-col items-center gap-2">
      <div className="relative group">
        <div
          className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-muted border-2 border-dashed border-border hover:border-primary/50 flex items-center justify-center relative cursor-pointer overflow-hidden transition-all shadow-md"
          onClick={() => {
            if (photoUrl && onZoom) {
              onZoom(photoUrl);
            } else {
              inputRef.current?.click();
            }
          }}
          title={photoUrl ? "Cliquer pour agrandir la photo" : "Ajouter une photo"}
        >
          {photoUrl ? (
            <>
              <img src={photoUrl} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="p-1.5 bg-black/60 rounded-full text-white" title="Agrandir">
                  <span className="material-symbols-outlined text-xl">zoom_in</span>
                </span>
              </div>
            </>
          ) : (
            <UserCircle className="w-14 h-14 text-muted-foreground" />
          )}
        </div>

        {/* Action button to change/upload */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            inputRef.current?.click();
          }}
          className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg translate-x-1 translate-y-1 hover:scale-105 transition-transform"
          title="Modifier la photo"
        >
          <Camera className="w-3.5 h-3.5" />
        </button>
      </div>
      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
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

  const visits = useVisitStore(useShallow((s) => s.visits));
  const [lightboxImg, setLightboxImg] = useState<{ src: string; alt: string } | null>(null);
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
      spousePhone: "",
      theocraticRole: "",
      childrenAges: "",
      dietary: "",
      spouseDietary: "",
    },
  });

  const [form, setForm] = useState({
    nom: "", congregation: "", telephone: "", email: "", notes: "",
    photoUrl: undefined as string | undefined,
    spousePhotoUrl: undefined as string | undefined,
    householdType: "single" as HouseholdType,
    spouseName: "",
    spousePhone: "",
    theocraticRole: "" as Speaker["theocraticRole"] | "",
    childrenCount: 0,
    childrenAges: "",
    dietary: "",
    spouseDietary: "",
    localSpeaker: false,
  });

  const resetForm = () => {
    setForm({ nom: "", congregation: "", telephone: "", email: "", notes: "", photoUrl: undefined, spousePhotoUrl: undefined, householdType: "single", spouseName: "", spousePhone: "", theocraticRole: "", childrenCount: 0, childrenAges: "", dietary: "", spouseDietary: "", localSpeaker: false });
    resetZodForm({
      nom: "",
      congregation: congregationName,
      telephone: "",
      email: "",
      notes: "",
      householdType: "single",
      spouseName: "",
      spousePhone: "",
      theocraticRole: "",
      childrenAges: "",
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
      spousePhone: sp.spousePhone || "",
      theocraticRole: sp.theocraticRole || "",
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
      spousePhone: sp.spousePhone || "",
      theocraticRole: sp.theocraticRole || "",
      childrenAges: sp.childrenAges || "",
      dietary: sp.dietary || "",
      spouseDietary: sp.spouseDietary || "",
    });
    setEditing(sp);
    setViewSpeaker(sp);
  };

  const openAddForm = () => {
    setForm({ nom: "", congregation: congregationName, telephone: "", email: "", notes: "", photoUrl: undefined, spousePhotoUrl: undefined, householdType: "single", spouseName: "", spousePhone: "", theocraticRole: "", childrenCount: 0, childrenAges: "", dietary: "", spouseDietary: "", localSpeaker: false });
    resetZodForm({
      nom: "",
      congregation: congregationName,
      telephone: "",
      email: "",
      notes: "",
      householdType: "single",
      spouseName: "",
      spousePhone: "",
      theocraticRole: "",
      childrenAges: "",
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
      spousePhone: data.spousePhone || form.spousePhone || undefined,
      theocraticRole: (data.theocraticRole || form.theocraticRole || undefined) as Speaker["theocraticRole"],
      spouseDietary: data.spouseDietary || form.spouseDietary || undefined,
      childrenCount: form.childrenCount,
      childrenAges: data.childrenAges ?? form.childrenAges,
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
    <div className="py-2 sm:py-4 space-y-6">
      {/* Apple Large Title & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            {t("speakers") || "Orateurs"}
          </h1>
          <p className="text-sm font-medium text-muted-foreground mt-1">
            {realSpeakers.length} {realSpeakers.length > 1 ? "orateurs enregistrés" : "orateur enregistré"}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap w-full sm:w-auto">
          {/* Apple Search Pill */}
          <div className="relative group w-full sm:w-72 flex-1 min-w-[200px]">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-muted-foreground group-focus-within:text-primary transition-colors text-base">search</span>
            </div>
            <input
              className="block w-full pl-9 pr-10 py-2 border border-border/60 rounded-full bg-muted/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/50 text-xs sm:text-sm transition-all shadow-2xs"
              placeholder={t("search_speaker") || "Rechercher un orateur..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <kbd className="hidden sm:inline-block text-[10px] font-bold text-muted-foreground border border-border rounded-full px-1.5 py-0.5 bg-card/60">⌘K</kbd>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={openAddForm}
            className="bg-primary hover:opacity-95 text-primary-foreground font-semibold text-xs sm:text-sm px-4 py-2 rounded-full transition-all flex items-center justify-center gap-1.5 shadow-md shadow-primary/25 active:scale-95 touch-manipulation w-full sm:w-auto flex-shrink-0"
          >
            <span className="material-symbols-outlined text-base">add</span>
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
                  className={`ios-card rounded-2xl p-4 flex items-center gap-4 hover:border-primary/50 transition-all group cursor-pointer relative overflow-hidden ${hasLocalStyle ? "border-l-4 border-l-primary" : ""
                    }`}
                  onClick={() => openFiche(sp)}
                >
                  {/* Avatar Layout — enlarged & clickable for fullscreen zoom */}
                  {sp.householdType === "couple" ? (
                    <div className="flex flex-col items-center gap-0.5 flex-shrink-0 w-16">
                      {sp.photoUrl ? (
                        <div
                          className="relative group/avatar cursor-zoom-in hover:scale-105 transition-transform"
                          onClick={(e) => {
                            e.stopPropagation();
                            setLightboxImg({ src: sp.photoUrl!, alt: sp.nom });
                          }}
                          title="Cliquer pour agrandir la photo de l'orateur"
                        >
                          <img alt={sp.nom} className="w-12 h-12 rounded-full border-2 border-surface-container-low object-cover shadow-sm" src={sp.photoUrl} />
                          <div className="absolute inset-0 bg-black/25 rounded-full opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity">
                            <span className="material-symbols-outlined text-white text-[14px]">zoom_in</span>
                          </div>
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-full border-2 border-surface-container-low bg-surface-container-highest flex items-center justify-center">
                          <span className="material-symbols-outlined text-sm text-on-surface-variant">person</span>
                        </div>
                      )}
                      {sp.spousePhotoUrl ? (
                        <div
                          className="relative group/spouse cursor-zoom-in -mt-3 hover:scale-105 transition-transform z-10"
                          onClick={(e) => {
                            e.stopPropagation();
                            setLightboxImg({ src: sp.spousePhotoUrl!, alt: sp.spouseName || "Épouse" });
                          }}
                          title="Cliquer pour agrandir la photo de l'épouse"
                        >
                          <img alt={sp.spouseName || "Épouse"} className="w-10 h-10 rounded-full border-2 border-surface-container-low object-cover shadow-sm" src={sp.spousePhotoUrl} />
                          <div className="absolute inset-0 bg-black/25 rounded-full opacity-0 group-hover/spouse:opacity-100 flex items-center justify-center transition-opacity">
                            <span className="material-symbols-outlined text-white text-[12px]">zoom_in</span>
                          </div>
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full border-2 border-surface-container-low bg-surface-container-highest flex items-center justify-center -mt-3">
                          <span className="material-symbols-outlined text-[12px] text-on-surface-variant">person</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex-shrink-0">
                      {sp.photoUrl ? (
                        <div
                          className="relative group/solo cursor-zoom-in hover:scale-105 transition-transform"
                          onClick={(e) => {
                            e.stopPropagation();
                            setLightboxImg({ src: sp.photoUrl!, alt: sp.nom });
                          }}
                          title="Cliquer pour agrandir la photo"
                        >
                          <img alt={sp.nom} className="w-16 h-16 rounded-full object-cover border-2 border-surface-container-low shadow-sm" src={sp.photoUrl} />
                          <div className="absolute inset-0 bg-black/25 rounded-full opacity-0 group-hover/solo:opacity-100 flex items-center justify-center transition-opacity">
                            <span className="material-symbols-outlined text-white text-[18px]">zoom_in</span>
                          </div>
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-surface-container-highest border border-outline-variant/30 flex items-center justify-center">
                          <span className="material-symbols-outlined text-on-surface-variant text-xl">person</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Speaker Details */}
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-headline-md text-[18px] leading-tight text-on-surface font-semibold truncate group-hover:text-primary transition-colors">{sp.nom}</h3>
                      {sp.theocraticRole && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-600/70 shadow-2xs">
                          {sp.theocraticRole}
                        </span>
                      )}
                    </div>

                    {sp.householdType === "couple" && sp.spouseName && (
                      <div className="inline-flex mt-1 items-center px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-300 dark:bg-purple-950/70 dark:text-purple-300 dark:border-purple-600/70 shadow-2xs">
                        <span className="font-label-sm text-[11px] font-semibold capitalize">avec {sp.spouseName.toLowerCase()}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 mt-1 text-on-surface-variant">
                      <span className="material-symbols-outlined text-[14px]">home</span>
                      <span className="font-body-md text-[13px] truncate">{sp.congregation}</span>
                    </div>

                    {sp.telephone && (
                      <div className="flex items-center gap-1.5 mt-0.5 text-on-surface-variant font-medium">
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
              className="ios-glass w-full max-w-5xl rounded-[28px] shadow-2xl flex flex-col overflow-hidden max-h-[92vh] border border-border/70"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="ios-grabber md:hidden" />
              <form className="flex flex-col h-full w-full">
                {/* Modal Header */}
                <div className="flex items-center justify-between px-gutter py-card_padding border-b border-border/60 bg-surface-container/50">
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-primary text-3xl" data-weight="fill" style={{ fontVariationSettings: "'FILL' 1" }}>person_book</span>
                    <div className="text-left">
                      <h2 className="font-headline-lg text-headline-lg text-on-surface m-0">Fiche Orateur</h2>
                      <p className="font-label-md text-label-md text-on-surface-variant m-0">Détails et informations de coordination</p>
                    </div>
                  </div>
                  <button type="button" onClick={resetForm} className="w-9 h-9 rounded-full flex items-center justify-center bg-muted/60 hover:bg-muted text-on-surface-variant hover:text-on-surface transition-colors">
                    <span className="material-symbols-outlined text-lg">close</span>
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
                            onZoom={(url) => setLightboxImg({ src: url, alt: form.nom })}
                            label={t("speaker_label")}
                          />
                          {form.householdType === "couple" && (
                            <AvatarUpload
                              photoUrl={form.spousePhotoUrl}
                              onPhotoChange={(url) => setForm({ ...form, spousePhotoUrl: url })}
                              onZoom={(url) => setLightboxImg({ src: url, alt: form.spouseName || "Épouse" })}
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
                          <span className="material-symbols-outlined text-[14px]">home</span>
                          <input
                            className="bg-transparent border-none focus:ring-0 focus:outline-none text-center w-full max-w-[150px] p-0 font-label-sm"
                            placeholder={t("congregation")}
                            {...register("congregation")}
                          />
                        </div>
                        {errors.congregation && <p className="text-xs text-destructive mt-1">{errors.congregation.message}</p>}

                        {/* Theocratic Role Selector */}
                        <div className="mt-3 w-full">
                          <label className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider block mb-1">Rôle théocratique</label>
                          <div className="relative">
                            <select
                              value={form.theocraticRole || ""}
                              onChange={(e) => setForm({ ...form, theocraticRole: e.target.value as Speaker["theocraticRole"] })}
                              className="input-glass w-full rounded-md py-1.5 px-2.5 text-xs text-on-surface font-medium cursor-pointer pr-8"
                            >
                              <option value="">Non spécifié</option>
                              <option value="Ancien">Ancien</option>
                              <option value="Serviteur ministériel">Serviteur ministériel</option>
                              <option value="Surveillant de circonscription">Surveillant de circonscription</option>
                              <option value="Pionnier">Pionnier</option>
                              <option value="Autre">Autre</option>
                            </select>
                            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px] pointer-events-none">expand_more</span>
                          </div>
                        </div>
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

                      {/* Spouse Inputs if Couple */}
                      <AnimatePresence>
                        {form.householdType === "couple" && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-surface-container rounded-lg p-card_padding border border-white/5 flex flex-col gap-3 overflow-hidden"
                          >
                            <h4 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider flex items-center gap-2">
                              <span className="material-symbols-outlined text-[18px]">favorite</span> Informations de l'épouse
                            </h4>

                            <div className="flex flex-col gap-1">
                              <label htmlFor="resp-spouse" className="font-label-sm text-label-sm text-on-surface-variant">{t("spouse_name")}</label>
                              <input
                                id="resp-spouse"
                                className="input-glass w-full rounded-md py-2 px-3 text-on-surface font-body-md"
                                placeholder={t("spouse_name_placeholder")}
                                {...register("spouseName")}
                              />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-stack_gap">
                              <div className="flex flex-col gap-1">
                                <label htmlFor="resp-spouse-phone" className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1.5">
                                  <span className="material-symbols-outlined text-[14px]">call</span> Téléphone de l'épouse
                                </label>
                                <input
                                  id="resp-spouse-phone"
                                  className="input-glass w-full rounded-md py-2 px-3 text-on-surface font-body-md"
                                  placeholder="Numéro de mobile..."
                                  type="tel"
                                  {...register("spousePhone")}
                                />
                              </div>
                              <div className="flex flex-col gap-1">
                                <label htmlFor="resp-spouse-dietary" className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1.5">
                                  <span className="material-symbols-outlined text-[14px]">restaurant</span> Régime / Allergies épouse
                                </label>
                                <input
                                  id="resp-spouse-dietary"
                                  className="input-glass w-full rounded-md py-2 px-3 text-on-surface font-body-md"
                                  placeholder="Ex: Végétarienne, sans lactose..."
                                  type="text"
                                  {...register("spouseDietary")}
                                />
                              </div>
                            </div>
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
                      <div className="bg-surface-container rounded-lg p-card_padding border border-white/5 flex flex-col min-h-[120px]">
                        <h4 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-3 flex items-center gap-2">
                          <span className="material-symbols-outlined text-[18px]">notes</span> Notes Complémentaires
                        </h4>
                        <textarea
                          className="input-glass w-full flex-1 rounded-md p-3 text-on-surface font-body-md resize-none"
                          placeholder="Ajoutez des notes sur la disponibilité, les préférences d'hébergement..."
                          {...register("notes")}
                        ></textarea>
                      </div>

                      {/* Historique des visites passées dans la congrégation */}
                      {(() => {
                        const speakerVisits = visits
                          .filter((v) => (v.speakerId && v.speakerId === viewSpeaker.id) || (v.nom && v.nom.toLowerCase().trim() === viewSpeaker.nom.toLowerCase().trim()))
                          .sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime());

                        const sixMonthsAgo = new Date();
                        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
                        const lastVisit = speakerVisits[0];
                        const hasRecentVisit = lastVisit && new Date(lastVisit.visitDate) > sixMonthsAgo;

                        return (
                          <div className="bg-surface-container rounded-lg p-card_padding border border-white/5 flex flex-col gap-3">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <h4 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">history</span> Historique des visites ({speakerVisits.length})
                              </h4>
                              {hasRecentVisit && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30 flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[12px]">schedule</span> Visite récente (&lt; 6 mois)
                                </span>
                              )}
                            </div>

                            {speakerVisits.length === 0 ? (
                              <p className="text-xs text-on-surface-variant/70 italic py-1">Aucune visite passée enregistrée dans le planning pour cet orateur.</p>
                            ) : (
                              <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                                {speakerVisits.map((v) => {
                                  const isConfirmed = v.status === "confirmed";
                                  const formattedDate = new Date(v.visitDate).toLocaleDateString("fr-FR", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  });
                                  return (
                                    <div key={v.visitId} className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-surface-container-high/60 border border-white/5 text-xs">
                                      <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                          <span className="font-bold text-on-surface">{formattedDate}</span>
                                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                                            isConfirmed ? "bg-primary/10 text-primary border border-primary/20" : "bg-muted text-muted-foreground"
                                          }`}>
                                            {v.status === "confirmed" ? "Confirmé" : v.status === "cancelled" ? "Annulé" : "Prévu"}
                                          </span>
                                        </div>
                                        {v.talkTheme ? (
                                          <p className="text-on-surface-variant truncate mt-0.5">
                                            {v.talkNoOrType && <span className="text-primary font-medium">N°{v.talkNoOrType} : </span>}
                                            {v.talkTheme}
                                          </p>
                                        ) : (
                                          <p className="text-on-surface-variant/50 italic text-[11px] mt-0.5">Thème non renseigné</p>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })()}
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
              className="w-full max-w-md bg-card rounded-t-[28px] sm:rounded-3xl shadow-2xl max-h-[88vh] flex flex-col overflow-hidden border-t sm:border border-border/60" onClick={(e) => e.stopPropagation()}>
              <div className="ios-grabber sm:hidden" />
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

                  {/* Rôle théocratique */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Rôle théocratique</label>
                    <select
                      value={form.theocraticRole || ""}
                      onChange={(e) => setForm({ ...form, theocraticRole: e.target.value as Speaker["theocraticRole"] })}
                      className="input-soft text-sm w-full cursor-pointer"
                    >
                      <option value="">Non spécifié</option>
                      <option value="Ancien">Ancien</option>
                      <option value="Serviteur ministériel">Serviteur ministériel</option>
                      <option value="Surveillant de circonscription">Surveillant de circonscription</option>
                      <option value="Pionnier">Pionnier</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>

                  {/* Nom & Téléphone du conjoint si couple */}
                  {form.householdType === "couple" && (
                    <div className="space-y-2 pt-1 border-t border-border/50">
                      <input className="input-soft text-sm" placeholder={t("spouse_name")} {...register("spouseName")} />
                      <input className="input-soft text-sm" placeholder="Téléphone de l'épouse" type="tel" {...register("spousePhone")} />
                    </div>
                  )}

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

      {/* Fullscreen Photo Lightbox */}
      <ImageLightbox
        src={lightboxImg?.src}
        alt={lightboxImg?.alt}
        onClose={() => setLightboxImg(null)}
      />
    </div>
  );
}