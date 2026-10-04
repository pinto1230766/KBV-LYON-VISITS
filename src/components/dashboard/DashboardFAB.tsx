import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  CalendarDays,
  UserPlus,
  Home,
  X,
  Camera,
  Check,
  MapPin,
  Clock,
  Sparkles,
} from "lucide-react";
import { useVisitStore } from "../../store/useVisitStore";
import { useSpeakerStore } from "../../store/useSpeakerStore";
import { useHostStore } from "../../store/useHostStore";
import { useSettingsStore } from "../../store/useSettingsStore";
import { useUIStore } from "../../store/useUIStore";
import { useTranslation } from "../../hooks/useTranslation";
import { generateId } from "../../lib/sheetUtils";
import { haptic } from "../../lib/haptics";
import { compressImage } from "../../lib/imageCompress";
import { toast } from "sonner";
import type { Visit, Speaker, Host, VisitHostRole, LocationType } from "../../store/visitTypes";

type ModalType = "visit" | "speaker" | "host" | null;

export function DashboardFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const { t } = useTranslation();

  // Stores
  const addVisit = useVisitStore((s) => s.addVisit);
  const speakers = useSpeakerStore((s) => s.speakers);
  const addSpeaker = useSpeakerStore((s) => s.addSpeaker);
  const addHost = useHostStore((s) => s.addHost);
  const congregationSettings = useSettingsStore((s) => s.settings.congregation);

  const pendingAction = useUIStore((s) => s.pendingAction);
  const setPendingAction = useUIStore((s) => s.setPendingAction);

  useEffect(() => {
    if (pendingAction === "new-visit") {
      setActiveModal("visit");
      setPendingAction(null);
    }
  }, [pendingAction, setPendingAction]);

  // Close speed dial on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (activeModal) {
          setActiveModal(null);
        } else if (isOpen) {
          setIsOpen(false);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, activeModal]);

  // ---------------------------------------------------------------------------
  // Visit Form State
  // ---------------------------------------------------------------------------
  const [visitForm, setVisitForm] = useState({
    nom: "",
    congregation: "",
    visitDate: "",
    heure_visite: congregationSettings.time || "11:30",
    talkNoOrType: "",
    talkTheme: "",
    locationType: "kingdom_hall" as LocationType,
    speakerPhone: "",
    notes: "",
  });
  const [filteredSpeakerSuggestions, setFilteredSpeakerSuggestions] = useState<Speaker[]>([]);
  const [showSpeakerSuggestions, setShowSpeakerSuggestions] = useState(false);

  const resetVisitForm = () => {
    setVisitForm({
      nom: "",
      congregation: "",
      visitDate: "",
      heure_visite: congregationSettings.time || "11:30",
      talkNoOrType: "",
      talkTheme: "",
      locationType: "kingdom_hall",
      speakerPhone: "",
      notes: "",
    });
    setFilteredSpeakerSuggestions([]);
    setShowSpeakerSuggestions(false);
  };

  const handleSpeakerNameChange = (val: string) => {
    setVisitForm((prev) => ({ ...prev, nom: val }));
    if (val.trim().length > 0) {
      const query = val.toLowerCase().trim();
      const matches = speakers
        .filter((sp) => sp.nom.toLowerCase().includes(query))
        .slice(0, 5);
      setFilteredSpeakerSuggestions(matches);
      setShowSpeakerSuggestions(matches.length > 0);
    } else {
      setShowSpeakerSuggestions(false);
    }
  };

  const selectExistingSpeaker = (sp: Speaker) => {
    setVisitForm((prev) => ({
      ...prev,
      nom: sp.nom,
      congregation: sp.congregation || prev.congregation,
      speakerPhone: sp.telephone || prev.speakerPhone,
    }));
    setShowSpeakerSuggestions(false);
    haptic("selection");
  };

  const handleCreateVisit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitForm.nom.trim()) {
      toast.error("Veuillez saisir le nom de l'orateur");
      haptic("error");
      return;
    }
    if (!visitForm.visitDate) {
      toast.error("Veuillez choisir une date pour la visite");
      haptic("error");
      return;
    }

    const matchedSpeaker = speakers.find(
      (s) => s.nom.toLowerCase().trim() === visitForm.nom.toLowerCase().trim()
    );

    const newVisit: Visit = {
      visitId: generateId(),
      nom: visitForm.nom.trim(),
      congregation: visitForm.congregation.trim() || congregationSettings.name || "Lyon KBV",
      visitDate: visitForm.visitDate,
      heure_visite: visitForm.heure_visite || congregationSettings.time || "11:30",
      talkNoOrType: visitForm.talkNoOrType.trim(),
      talkTheme: visitForm.talkTheme.trim(),
      locationType: visitForm.locationType,
      status: "scheduled",
      speakerPhone: visitForm.speakerPhone.trim(),
      notes: visitForm.notes.trim(),
      speakerId: matchedSpeaker?.id,
      localSpeaker: matchedSpeaker?.localSpeaker || false,
      hostAssignments: [],
      companions: [],
      expenses: [],
      updatedAt: new Date().toISOString(),
    };

    addVisit(newVisit);
    haptic("success");
    toast.success(`Visite de ${newVisit.nom} enregistrée avec succès !`);
    resetVisitForm();
    setActiveModal(null);
  };

  // ---------------------------------------------------------------------------
  // Speaker Form State
  // ---------------------------------------------------------------------------
  const [speakerForm, setSpeakerForm] = useState({
    nom: "",
    congregation: "",
    telephone: "",
    email: "",
    photoUrl: undefined as string | undefined,
    householdType: "single" as "single" | "couple",
    spouseName: "",
    spousePhone: "",
    theocraticRole: "ancien" as "ancien" | "serviteur_ministeriel" | "pionnier" | "autre",
    localSpeaker: false,
    notes: "",
  });
  const speakerPhotoInputRef = useRef<HTMLInputElement>(null);

  const resetSpeakerForm = () => {
    setSpeakerForm({
      nom: "",
      congregation: "",
      telephone: "",
      email: "",
      photoUrl: undefined,
      householdType: "single",
      spouseName: "",
      spousePhone: "",
      theocraticRole: "ancien",
      localSpeaker: false,
      notes: "",
    });
  };

  const handleSpeakerPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImage(file, { maxDim: 800, quality: 0.82 });
      setSpeakerForm((prev) => ({ ...prev, photoUrl: dataUrl }));
      haptic("selection");
    } catch (err) {
      console.error(err);
      toast.error("Impossible de charger la photo");
    } finally {
      e.target.value = "";
    }
  };

  const handleCreateSpeaker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!speakerForm.nom.trim()) {
      toast.error("Veuillez saisir le nom de l'orateur");
      haptic("error");
      return;
    }

    const newSpeaker: Speaker = {
      id: generateId(),
      nom: speakerForm.nom.trim(),
      congregation: speakerForm.congregation.trim() || congregationSettings.name || "Lyon KBV",
      telephone: speakerForm.telephone.trim() || undefined,
      email: speakerForm.email.trim() || undefined,
      photoUrl: speakerForm.photoUrl,
      householdType: speakerForm.householdType,
      spouseName: speakerForm.householdType === "couple" ? speakerForm.spouseName.trim() : undefined,
      spousePhone: speakerForm.householdType === "couple" ? speakerForm.spousePhone.trim() : undefined,
      theocraticRole: speakerForm.theocraticRole,
      localSpeaker: speakerForm.localSpeaker,
      notes: speakerForm.notes.trim() || undefined,
      updatedAt: new Date().toISOString(),
    };

    addSpeaker(newSpeaker);
    haptic("success");
    toast.success(`Orateur ${newSpeaker.nom} ajouté avec succès !`);
    resetSpeakerForm();
    setActiveModal(null);
  };

  // ---------------------------------------------------------------------------
  // Host Form State
  // ---------------------------------------------------------------------------
  const [hostForm, setHostForm] = useState({
    nom: "",
    telephone: "",
    email: "",
    adresse: "",
    role: "hebergement" as VisitHostRole,
    capacity: 2,
    photoUrl: undefined as string | undefined,
    notes: "",
  });
  const hostPhotoInputRef = useRef<HTMLInputElement>(null);

  const resetHostForm = () => {
    setHostForm({
      nom: "",
      telephone: "",
      email: "",
      adresse: "",
      role: "hebergement",
      capacity: 2,
      photoUrl: undefined,
      notes: "",
    });
  };

  const handleHostPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImage(file, { maxDim: 800, quality: 0.82 });
      setHostForm((prev) => ({ ...prev, photoUrl: dataUrl }));
      haptic("selection");
    } catch (err) {
      console.error(err);
      toast.error("Impossible de charger la photo");
    } finally {
      e.target.value = "";
    }
  };

  const handleCreateHost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hostForm.nom.trim()) {
      toast.error("Veuillez saisir le nom de la famille ou de l'hôte");
      haptic("error");
      return;
    }

    const newHost: Host = {
      id: generateId(),
      nom: hostForm.nom.trim(),
      telephone: hostForm.telephone.trim(),
      email: hostForm.email.trim() || undefined,
      adresse: hostForm.adresse.trim() || undefined,
      role: hostForm.role,
      capacity: Number(hostForm.capacity) || 2,
      photoUrl: hostForm.photoUrl,
      notes: hostForm.notes.trim() || undefined,
      updatedAt: new Date().toISOString(),
    };

    addHost(newHost);
    haptic("success");
    toast.success(`Hôte ${newHost.nom} ajouté avec succès !`);
    resetHostForm();
    setActiveModal(null);
  };

  // ---------------------------------------------------------------------------
  // Actions List for Speed Dial
  // ---------------------------------------------------------------------------
  const speedDialActions = [
    {
      id: "visit" as const,
      label: "Nouvelle visite",
      desc: "Programmer une visite",
      icon: CalendarDays,
      color: "bg-[#5856D6] text-white shadow-indigo-500/30",
      border: "border-indigo-500/25",
    },
    {
      id: "speaker" as const,
      label: "Nouvel orateur",
      desc: "Enregistrer un frère orateur",
      icon: UserPlus,
      color: "bg-[#FF9500] text-white shadow-orange-500/30",
      border: "border-orange-500/25",
    },
    {
      id: "host" as const,
      label: "Nouvel hôte",
      desc: "Ajouter une famille d'accueil",
      icon: Home,
      color: "bg-[#34C759] text-white shadow-emerald-500/30",
      border: "border-emerald-500/25",
    },
  ];

  return (
    <>
      {/* Backdrop overlay when speed dial is open */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              haptic("selection");
              setIsOpen(false);
            }}
            className="fixed inset-0 bg-black/45 backdrop-blur-[2px] z-40 transition-opacity"
          />
        )}
      </AnimatePresence>

      {/* Speed Dial Menu & Floating Action Button */}
      <div className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 lg:bottom-8 lg:right-8 z-40 flex flex-col items-end gap-3 select-none pointer-events-auto">
        {/* Speed Dial Action Items */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={{
                open: {
                  transition: { staggerChildren: 0.06, staggerDirection: -1 },
                },
                closed: {
                  transition: { staggerChildren: 0.04, staggerDirection: 1 },
                },
              }}
              className="flex flex-col items-end gap-2.5 mb-1"
            >
              {speedDialActions.map((action) => {
                const Icon = action.icon;
                return (
                  <motion.button
                    type="button"
                    key={action.id}
                    variants={{
                      open: { opacity: 1, y: 0, scale: 1 },
                      closed: { opacity: 0, y: 15, scale: 0.85 },
                    }}
                    className="flex items-center gap-3 group cursor-pointer text-left focus:outline-none touch-manipulation"
                    onClick={() => {
                      haptic("medium");
                      setIsOpen(false);
                      setActiveModal(action.id);
                    }}
                  >
                    {/* Tooltip / Label pill */}
                    <div className="bg-card/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-border/70 shadow-lg text-right pointer-events-auto flex flex-col items-end transition-all group-hover:border-primary/40 group-hover:scale-105 active:scale-95">
                      <span className="text-xs font-bold text-foreground tracking-tight leading-tight">
                        {action.label}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-medium leading-tight">
                        {action.desc}
                      </span>
                    </div>

                    {/* Circular Action Badge */}
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 active:scale-95 touch-manipulation ${action.color}`}
                      aria-label={action.label}
                      title={action.label}
                    >
                      <Icon className="w-5 h-5 stroke-[2.2]" />
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Floating Trigger Button */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.92 }}
          onClick={() => {
            haptic("medium");
            setIsOpen(!isOpen);
          }}
          className={`relative w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary/20 ${
            isOpen
              ? "bg-neutral-800 dark:bg-neutral-700 shadow-neutral-900/30"
              : "bg-gradient-to-tr from-primary via-primary to-blue-600 shadow-primary/35 hover:shadow-primary/50"
          }`}
          aria-label={isOpen ? "Fermer les actions rapides" : "Créer rapidement (visite, orateur, hôte)"}
          title={isOpen ? "Fermer" : "Actions rapides (Visite, Orateur, Hôte)"}
        >
          {/* Subtle glow ping animation when closed */}
          {!isOpen && (
            <span className="absolute -inset-0.5 rounded-full bg-primary/30 animate-pulse pointer-events-none" />
          )}

          <motion.div
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 22 }}
            className="flex items-center justify-center"
          >
            <Plus className="w-7 h-7 stroke-[2.6]" />
          </motion.div>
        </motion.button>
      </div>

      {/* ===================================================================== */}
      {/* 1. Modal "Nouvelle Visite" */}
      {/* ===================================================================== */}
      <AnimatePresence>
        {activeModal === "visit" && (
          <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 25 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 25 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="w-full max-w-lg bg-card rounded-t-[28px] sm:rounded-2xl shadow-2xl max-h-[95dvh] flex flex-col overflow-hidden border border-border/80"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <CalendarDays className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">Programmer une visite</h3>
                    <p className="text-xs text-muted-foreground">Création rapide sans quitter le tableau de bord</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-all"
                  aria-label="Fermer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleCreateVisit} className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4 overscroll-contain">
                {/* Speaker Name with Autocomplete */}
                <div className="relative">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                    {t("speaker_name") || "Nom de l'orateur"} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    className="input-soft text-sm w-full"
                    placeholder="ex: Jean Dupont"
                    value={visitForm.nom}
                    onChange={(e) => handleSpeakerNameChange(e.target.value)}
                    onFocus={() => {
                      if (visitForm.nom.trim().length > 0 && filteredSpeakerSuggestions.length > 0) {
                        setShowSpeakerSuggestions(true);
                      }
                    }}
                  />

                  {/* Autocomplete Dropdown */}
                  {showSpeakerSuggestions && filteredSpeakerSuggestions.length > 0 && (
                    <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-xl overflow-hidden divide-y divide-border/60">
                      <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted/40">
                        Orateurs existants suggérés
                      </div>
                      {filteredSpeakerSuggestions.map((sp) => (
                        <div
                          key={sp.id}
                          onClick={() => selectExistingSpeaker(sp)}
                          className="px-3 py-2 text-xs hover:bg-primary/10 cursor-pointer flex items-center justify-between transition-colors"
                        >
                          <div className="font-semibold text-foreground flex items-center gap-2">
                            <span>{sp.nom}</span>
                            {sp.localSpeaker && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary font-bold">
                                Local
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-muted-foreground">{sp.congregation}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Congregation */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                    {t("congregation") || "Congrégation"}
                  </label>
                  <input
                    type="text"
                    className="input-soft text-sm w-full"
                    placeholder="ex: Lyon Ouest / Lyon KBV"
                    value={visitForm.congregation}
                    onChange={(e) => setVisitForm({ ...visitForm, congregation: e.target.value })}
                  />
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                      {t("visit_date") || "Date de visite"} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        required
                        className="input-soft text-sm w-full dark:[&::-webkit-calendar-picker-indicator]:filter dark:[&::-webkit-calendar-picker-indicator]:invert"
                        value={visitForm.visitDate}
                        onChange={(e) => setVisitForm({ ...visitForm, visitDate: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                      {t("meeting_time") || "Heure de la réunion"}
                    </label>
                    <div className="relative flex items-center">
                      <Clock className="w-4 h-4 absolute left-3 text-muted-foreground pointer-events-none" />
                      <input
                        type="time"
                        className="input-soft text-sm w-full pl-9 dark:[&::-webkit-calendar-picker-indicator]:filter dark:[&::-webkit-calendar-picker-indicator]:invert"
                        value={visitForm.heure_visite}
                        onChange={(e) => setVisitForm({ ...visitForm, heure_visite: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Talk number & Theme */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                      {t("talk_number") || "N° Discours"}
                    </label>
                    <input
                      type="text"
                      className="input-soft text-sm w-full"
                      placeholder="ex: 142"
                      value={visitForm.talkNoOrType}
                      onChange={(e) => setVisitForm({ ...visitForm, talkNoOrType: e.target.value })}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                      {t("talk_theme") || "Thème du discours"}
                    </label>
                    <input
                      type="text"
                      className="input-soft text-sm w-full"
                      placeholder="ex: Pourquoi craindre le vrai Dieu ?"
                      value={visitForm.talkTheme}
                      onChange={(e) => setVisitForm({ ...visitForm, talkTheme: e.target.value })}
                    />
                  </div>
                </div>

                {/* Phone & Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                      {t("phone") || "Téléphone orateur"}
                    </label>
                    <input
                      type="tel"
                      className="input-soft text-sm w-full"
                      placeholder="ex: 06 12 34 56 78"
                      value={visitForm.speakerPhone}
                      onChange={(e) => setVisitForm({ ...visitForm, speakerPhone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                      {t("location") || "Lieu de la réunion"}
                    </label>
                    <select
                      className="input-soft text-sm w-full"
                      value={visitForm.locationType}
                      onChange={(e) => setVisitForm({ ...visitForm, locationType: e.target.value as LocationType })}
                    >
                      <option value="kingdom_hall">Salle du Royaume</option>
                      <option value="zoom">Zoom</option>
                      <option value="streaming">Streaming</option>
                      <option value="other">Autre lieu</option>
                    </select>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                    {t("notes") || "Remarques / Besoins"}
                  </label>
                  <textarea
                    rows={2}
                    className="input-soft text-sm w-full resize-none"
                    placeholder="Précisions sur l'accueil, l'accompagnant ou le transport..."
                    value={visitForm.notes}
                    onChange={(e) => setVisitForm({ ...visitForm, notes: e.target.value })}
                  />
                </div>

                {/* Footer Buttons */}
                <div className="pt-2 border-t border-border flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-muted-foreground hover:bg-muted transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#5856D6] hover:bg-[#5856D6]/90 text-white transition-all shadow-md flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Enregistrer la visite</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ===================================================================== */}
      {/* 2. Modal "Nouvel Orateur" */}
      {/* ===================================================================== */}
      <AnimatePresence>
        {activeModal === "speaker" && (
          <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 25 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 25 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="w-full max-w-lg bg-card rounded-t-[28px] sm:rounded-2xl shadow-2xl max-h-[95dvh] flex flex-col overflow-hidden border border-border/80"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-500/15 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">Ajouter un orateur</h3>
                    <p className="text-xs text-muted-foreground">Enregistrement direct dans le répertoire des frères</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-all"
                  aria-label="Fermer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleCreateSpeaker} className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4 overscroll-contain">
                {/* Photo & Identity row */}
                <div className="flex items-center gap-4">
                  <div className="relative group shrink-0">
                    <input
                      type="file"
                      ref={speakerPhotoInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={handleSpeakerPhotoUpload}
                    />
                    <div
                      onClick={() => speakerPhotoInputRef.current?.click()}
                      className="w-16 h-16 rounded-2xl bg-muted border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all shadow-xs relative"
                      title="Ajouter une photo de l'orateur"
                    >
                      {speakerForm.photoUrl ? (
                        <img
                          src={speakerForm.photoUrl}
                          alt="Orateur"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <Camera className="w-5 h-5" />
                          <span className="text-[8px] font-bold uppercase mt-0.5">Photo</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 space-y-2">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                        {t("name") || "Nom et Prénom"} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        autoFocus
                        className="input-soft text-sm w-full"
                        placeholder="ex: Frère Jean Dupont"
                        value={speakerForm.nom}
                        onChange={(e) => setSpeakerForm({ ...speakerForm, nom: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Congregation & Theocratic Role */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                      {t("congregation") || "Congrégation"}
                    </label>
                    <input
                      type="text"
                      className="input-soft text-sm w-full"
                      placeholder="ex: Valence Est"
                      value={speakerForm.congregation}
                      onChange={(e) => setSpeakerForm({ ...speakerForm, congregation: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                      Rôle théocratique
                    </label>
                    <select
                      className="input-soft text-sm w-full"
                      value={speakerForm.theocraticRole}
                      onChange={(e) => setSpeakerForm({ ...speakerForm, theocraticRole: e.target.value as any })}
                    >
                      <option value="ancien">Ancien</option>
                      <option value="serviteur_ministeriel">Assistant ministériel</option>
                      <option value="pionnier">Pionnier</option>
                      <option value="autre">Autre</option>
                    </select>
                  </div>
                </div>

                {/* Telephone & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                      {t("phone") || "Téléphone"}
                    </label>
                    <input
                      type="tel"
                      className="input-soft text-sm w-full"
                      placeholder="ex: 06 12 34 56 78"
                      value={speakerForm.telephone}
                      onChange={(e) => setSpeakerForm({ ...speakerForm, telephone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                      {t("email") || "Email"}
                    </label>
                    <input
                      type="email"
                      className="input-soft text-sm w-full"
                      placeholder="ex: jean.dupont@email.com"
                      value={speakerForm.email}
                      onChange={(e) => setSpeakerForm({ ...speakerForm, email: e.target.value })}
                    />
                  </div>
                </div>

                {/* Household Type */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                    {t("household_type") || "Type de foyer"}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSpeakerForm({ ...speakerForm, householdType: "single" })}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                        speakerForm.householdType === "single"
                          ? "bg-primary/15 border-primary text-primary shadow-xs"
                          : "border-border text-muted-foreground hover:bg-muted/50"
                      }`}
                    >
                      Frère seul
                    </button>
                    <button
                      type="button"
                      onClick={() => setSpeakerForm({ ...speakerForm, householdType: "couple" })}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                        speakerForm.householdType === "couple"
                          ? "bg-primary/15 border-primary text-primary shadow-xs"
                          : "border-border text-muted-foreground hover:bg-muted/50"
                      }`}
                    >
                      En couple
                    </button>
                  </div>
                </div>

                {/* Spouse Info if Couple */}
                {speakerForm.householdType === "couple" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-muted/40 rounded-xl border border-border/70"
                  >
                    <div>
                      <label className="text-[11px] font-bold text-muted-foreground mb-1 block">
                        Prénom de l'épouse
                      </label>
                      <input
                        type="text"
                        className="input-soft text-xs w-full"
                        placeholder="ex: Marie"
                        value={speakerForm.spouseName}
                        onChange={(e) => setSpeakerForm({ ...speakerForm, spouseName: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-muted-foreground mb-1 block">
                        Téléphone de l'épouse
                      </label>
                      <input
                        type="tel"
                        className="input-soft text-xs w-full"
                        placeholder="ex: 06 98 76 54 32"
                        value={speakerForm.spousePhone}
                        onChange={(e) => setSpeakerForm({ ...speakerForm, spousePhone: e.target.value })}
                      />
                    </div>
                  </motion.div>
                )}

                {/* Local speaker switch */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/70">
                  <div>
                    <span className="text-xs font-bold text-foreground block">Orateur local (Lyon KBV)</span>
                    <span className="text-[11px] text-muted-foreground block">
                      Membre de la congrégation locale (pas besoin d'hébergement)
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    className="toggle toggle-primary h-5 w-9"
                    checked={speakerForm.localSpeaker}
                    onChange={(e) => setSpeakerForm({ ...speakerForm, localSpeaker: e.target.checked })}
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                    {t("notes") || "Remarques / Discours connus"}
                  </label>
                  <textarea
                    rows={2}
                    className="input-soft text-sm w-full resize-none"
                    placeholder="Numéros de discours habituels, régime ou préférences..."
                    value={speakerForm.notes}
                    onChange={(e) => setSpeakerForm({ ...speakerForm, notes: e.target.value })}
                  />
                </div>

                {/* Footer Buttons */}
                <div className="pt-2 border-t border-border flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-muted-foreground hover:bg-muted transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#FF9500] hover:bg-[#FF9500]/90 text-white transition-all shadow-md flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Enregistrer l'orateur</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ===================================================================== */}
      {/* 3. Modal "Nouvel Hôte" */}
      {/* ===================================================================== */}
      <AnimatePresence>
        {activeModal === "host" && (
          <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 25 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 25 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="w-full max-w-lg bg-card rounded-t-[28px] sm:rounded-2xl shadow-2xl max-h-[95dvh] flex flex-col overflow-hidden border border-border/80"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Home className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">Ajouter une famille d'accueil</h3>
                    <p className="text-xs text-muted-foreground">Enregistrement direct dans le répertoire des hôtes</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-all"
                  aria-label="Fermer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleCreateHost} className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4 overscroll-contain">
                {/* Photo & Name */}
                <div className="flex items-center gap-4">
                  <div className="relative group shrink-0">
                    <input
                      type="file"
                      ref={hostPhotoInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={handleHostPhotoUpload}
                    />
                    <div
                      onClick={() => hostPhotoInputRef.current?.click()}
                      className="w-16 h-16 rounded-2xl bg-muted border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all shadow-xs relative"
                      title="Ajouter une photo de la famille ou du foyer"
                    >
                      {hostForm.photoUrl ? (
                        <img
                          src={hostForm.photoUrl}
                          alt="Hôte"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <Camera className="w-5 h-5" />
                          <span className="text-[8px] font-bold uppercase mt-0.5">Photo</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 space-y-2">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                        {t("name") || "Nom de famille / Hôte"} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        autoFocus
                        className="input-soft text-sm w-full"
                        placeholder="ex: Famille Martin / David & Sarah"
                        value={hostForm.nom}
                        onChange={(e) => setHostForm({ ...hostForm, nom: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Role & Capacity */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                      Rôle principal d'accueil
                    </label>
                    <select
                      className="input-soft text-sm w-full"
                      value={hostForm.role}
                      onChange={(e) => setHostForm({ ...hostForm, role: e.target.value as VisitHostRole })}
                    >
                      <option value="hebergement">Hébergement complet</option>
                      <option value="repas">Repas (midi / soir)</option>
                      <option value="transport">Transport / Chauffeur</option>
                      <option value="visite_lyon">Visite de Lyon / Détente</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                      Capacité d'accueil (personnes)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      className="input-soft text-sm w-full"
                      value={hostForm.capacity}
                      onChange={(e) => setHostForm({ ...hostForm, capacity: Number(e.target.value) })}
                    />
                  </div>
                </div>

                {/* Phone & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                      {t("phone") || "Téléphone"} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      className="input-soft text-sm w-full"
                      placeholder="ex: 06 12 34 56 78"
                      value={hostForm.telephone}
                      onChange={(e) => setHostForm({ ...hostForm, telephone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                      {t("email") || "Email"}
                    </label>
                    <input
                      type="email"
                      className="input-soft text-sm w-full"
                      placeholder="ex: contact@famille.fr"
                      value={hostForm.email}
                      onChange={(e) => setHostForm({ ...hostForm, email: e.target.value })}
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                    {t("address") || "Adresse postale"}
                  </label>
                  <div className="relative flex items-center">
                    <MapPin className="w-4 h-4 absolute left-3 text-muted-foreground pointer-events-none" />
                    <input
                      type="text"
                      className="input-soft text-sm w-full pl-9"
                      placeholder="ex: 12 Rue des Oliviers, 69007 Lyon"
                      value={hostForm.adresse}
                      onChange={(e) => setHostForm({ ...hostForm, adresse: e.target.value })}
                    />
                  </div>
                </div>

                {/* Notes / Particulars */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                    {t("notes") || "Particularités / Spécificités"}
                  </label>
                  <textarea
                    rows={2}
                    className="input-soft text-sm w-full resize-none"
                    placeholder="Animaux (chat, chien), enfants, ascenseur, place de parking..."
                    value={hostForm.notes}
                    onChange={(e) => setHostForm({ ...hostForm, notes: e.target.value })}
                  />
                </div>

                {/* Footer Buttons */}
                <div className="pt-2 border-t border-border flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-muted-foreground hover:bg-muted transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#34C759] hover:bg-[#34C759]/90 text-white transition-all shadow-md flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Enregistrer l'hôte</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
