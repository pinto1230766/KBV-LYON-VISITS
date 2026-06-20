import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Trash2, Edit2, Plus, Check, Heart, Car, User, Briefcase
} from "lucide-react";
import type { Visit, Companion } from "../../store/visitTypes";
import { generateId } from "../../lib/sheetUtils";

interface CompanionsTabProps {
  detailForm: Partial<Visit>;
  setDetailForm: (f: Partial<Visit>) => void;
  t: (k: string) => string;
}

export function CompanionsTab({ detailForm, setDetailForm, t }: CompanionsTabProps) {
  const companions = detailForm.companions || [];
  const [editingCompanion, setEditingCompanion] = useState<Companion | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [gender, setGender] = useState("M");
  const [ageGroup, setAgeGroup] = useState<"adult" | "child">("adult");
  const [dietary, setDietary] = useState("");
  const [transportType, setTransportType] = useState<Companion["transportType"]>("car");
  const [transportDetails, setTransportDetails] = useState("");
  const [needsHosting, setNeedsHosting] = useState(true);
  const [accompaniedByFamily, setAccompaniedByFamily] = useState(false);
  const [familyDetails, setFamilyDetails] = useState("");

  const resetForm = () => {
    setName("");
    setPhone("");
    setEmail("");
    setNotes("");
    setGender("M");
    setAgeGroup("adult");
    setDietary("");
    setTransportType("car");
    setTransportDetails("");
    setNeedsHosting(true);
    setAccompaniedByFamily(false);
    setFamilyDetails("");
    setEditingCompanion(null);
    setShowForm(false);
  };

  const handleEdit = (comp: Companion) => {
    setEditingCompanion(comp);
    setName(comp.nom || "");
    setPhone(comp.telephone || "");
    setEmail(comp.email || "");
    setNotes(comp.notes || "");
    setGender(comp.gender || "M");
    setAgeGroup(comp.ageGroup || "adult");
    setDietary(comp.dietary || "");
    setTransportType(comp.transportType || "car");
    setTransportDetails(comp.transportDetails || "");
    setNeedsHosting(comp.needsHosting ?? true);
    setAccompaniedByFamily(comp.accompaniedByFamily ?? false);
    setFamilyDetails(comp.familyDetails || "");
    setShowForm(true);
  };

  const handleSave = () => {
    if (!name.trim()) return;

    let updatedList: Companion[];

    if (editingCompanion) {
      updatedList = companions.map((c) =>
        c.id === editingCompanion.id
          ? {
              ...c,
              nom: name,
              telephone: phone,
              email: email,
              notes: notes,
              gender: gender,
              ageGroup: ageGroup,
              dietary: dietary,
              transportType: transportType,
              transportDetails: transportDetails,
              needsHosting: needsHosting,
              accompaniedByFamily: accompaniedByFamily,
              familyDetails: familyDetails,
            }
          : c
      );
    } else {
      const newCompanion: Companion = {
        id: generateId(),
        nom: name,
        telephone: phone,
        email: email,
        notes: notes,
        gender: gender,
        ageGroup: ageGroup,
        dietary: dietary,
        transportType: transportType,
        transportDetails: transportDetails,
        needsHosting: needsHosting,
        accompaniedByFamily: accompaniedByFamily,
        familyDetails: familyDetails,
      };
      updatedList = [...companions, newCompanion];
    }

    setDetailForm({ ...detailForm, companions: updatedList });
    resetForm();
  };

  const handleDelete = (id: string) => {
    const updatedList = companions.filter((c) => c.id !== id);
    // Also remove from hostAssignments if assigned
    const updatedAssignments = (detailForm.hostAssignments || []).filter(
      (ha) => ha.companionId !== id
    );
    setDetailForm({
      ...detailForm,
      companions: updatedList,
      hostAssignments: updatedAssignments,
    });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      {/* Header and Add Button */}
      <div className="rounded-2xl bg-gradient-to-r from-violet-500 to-purple-500 p-5 text-primary-foreground flex justify-between items-center">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary-foreground/80">{t("companions_tab")}</p>
          <p className="text-2xl font-black mt-1">{companions.length} {companions.length > 1 ? t("companions_tab").toLowerCase() : t("companions_tab").toLowerCase().replace(/s$/, "")}</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 rounded-xl bg-white/20 text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-white/30 transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> {t("add")}
          </button>
        )}
      </div>

      {/* Add / Edit Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-surface-container rounded-xl p-card_padding border border-white/5 space-y-4 overflow-hidden text-left"
          >
            <h3 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2 border-b border-white/10 pb-3">
              <User className="w-5 h-5 text-primary" />
              {editingCompanion ? t("edit_companion") : t("add_companion")}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-stack_gap">
              <div className="flex flex-col gap-2">
                <label className="font-label-md text-label-md text-on-surface-variant">{t("companion_name")} *</label>
                <input
                  className="input-glass rounded-lg px-4 py-3 font-body-md text-body-md w-full"
                  type="text"
                  placeholder={t("companion_name")}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-label-md text-label-md text-on-surface-variant">{t("phone")}</label>
                <input
                  className="input-glass rounded-lg px-4 py-3 font-body-md text-body-md w-full"
                  type="tel"
                  placeholder={t("phone")}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-label-md text-label-md text-on-surface-variant">{t("email")}</label>
                <input
                  className="input-glass rounded-lg px-4 py-3 font-body-md text-body-md w-full"
                  type="email"
                  placeholder={t("email")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-2">
                  <label className="font-label-md text-label-md text-on-surface-variant">Genre</label>
                  <select
                    className="input-glass rounded-lg px-4 py-3 font-body-md text-body-md w-full"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    title="Genre"
                  >
                    <option value="M">Frère (M)</option>
                    <option value="F">Sœur (F)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-label-md text-label-md text-on-surface-variant">{t("age_group")}</label>
                  <select
                    className="input-glass rounded-lg px-4 py-3 font-body-md text-body-md w-full"
                    value={ageGroup}
                    onChange={(e) => setAgeGroup(e.target.value as "adult" | "child")}
                    title={t("age_group")}
                  >
                    <option value="adult">{t("adult")}</option>
                    <option value="child">{t("child")}</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-label-md text-label-md text-on-surface-variant">{t("dietary_allergies")}</label>
                <input
                  className="input-glass rounded-lg px-4 py-3 font-body-md text-body-md w-full"
                  type="text"
                  placeholder={t("speaker_allergies_placeholder")}
                  value={dietary}
                  onChange={(e) => setDietary(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-label-md text-label-md text-on-surface-variant">{t("transport_type")}</label>
                <select
                  className="input-glass rounded-lg px-4 py-3 font-body-md text-body-md w-full"
                  value={transportType || "car"}
                  onChange={(e) => setTransportType(e.target.value as Companion["transportType"])}
                  title={t("transport_type")}
                >
                  <option value="car">{t("car")}</option>
                  <option value="train">{t("train")}</option>
                  <option value="plane">{t("plane")}</option>
                  <option value="with_speaker">{t("with_speaker")}</option>
                  <option value="other">{t("other_transport")}</option>
                </select>
              </div>

              {transportType !== "car" && (
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="font-label-md text-label-md text-on-surface-variant">{t("transport_details")}</label>
                  <input
                    className="input-glass rounded-lg px-4 py-3 font-body-md text-body-md w-full"
                    type="text"
                    placeholder={t("transport_details_placeholder")}
                    value={transportDetails}
                    onChange={(e) => setTransportDetails(e.target.value)}
                  />
                </div>
              )}

              <div className="flex flex-col gap-3 py-2 md:col-span-2 border-t border-white/10 mt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={needsHosting}
                    onChange={(e) => setNeedsHosting(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="font-label-md text-label-md text-on-surface">{t("needs_hosting")}</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer mt-1">
                  <input
                    type="checkbox"
                    checked={accompaniedByFamily}
                    onChange={(e) => setAccompaniedByFamily(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="font-label-md text-label-md text-on-surface">{t("accompanied_by_family")}</span>
                </label>

                <AnimatePresence>
                  {accompaniedByFamily && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-1 mt-1 overflow-hidden"
                    >
                      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t("family_details")}</label>
                      <input
                        className="input-glass rounded-lg px-4 py-2 text-sm w-full"
                        placeholder="Ex: Conjointe et 2 enfants de 5 et 8 ans..."
                        value={familyDetails}
                        onChange={(e) => setFamilyDetails(e.target.value)}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="font-label-md text-label-md text-on-surface-variant">{t("companion_notes")}</label>
                <textarea
                  className="input-glass rounded-lg px-4 py-3 font-body-md text-body-md w-full resize-none"
                  rows={2}
                  placeholder={t("add_notes_placeholder")}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2 justify-end">
              <button
                onClick={resetForm}
                className="px-6 py-3 rounded-lg border border-white/10 text-on-surface-variant font-label-md text-label-md hover:bg-white/5 transition-colors uppercase"
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleSave}
                disabled={!name.trim()}
                className="px-6 py-3 rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-primary/90 transition-colors uppercase font-bold active:scale-95 disabled:opacity-50"
              >
                {t("save")}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Companions List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
        {companions.map((comp) => {
          // Find host assignment for this companion
          const assignments = (detailForm.hostAssignments || []).filter(
            (ha) => ha.companionId === comp.id
          );
          
          return (
            <div
              key={comp.id}
              className="bg-surface-container rounded-xl p-card_padding border border-white/5 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-base font-black text-on-surface flex items-center gap-2">
                      {comp.nom}
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 uppercase tracking-widest font-black">
                        {comp.ageGroup === "child" ? t("child") : t("adult")}
                      </span>
                    </h4>
                    {comp.telephone && (
                      <p className="text-xs text-on-surface-variant font-medium mt-0.5">{comp.telephone}</p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(comp)}
                      className="p-1 rounded hover:bg-white/5 text-on-surface-variant hover:text-on-surface transition-colors"
                      title={t("edit")}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(comp.id)}
                      className="p-1 rounded hover:bg-destructive/10 text-on-surface-variant hover:text-destructive transition-colors"
                      title={t("delete")}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1 pt-1 border-t border-white/5 text-xs text-on-surface-variant">
                  {comp.dietary && (
                    <p className="flex items-center gap-1.5">
                      <Heart className="w-3 h-3 text-red-400" />
                      <span>{comp.dietary}</span>
                    </p>
                  )}
                  <p className="flex items-center gap-1.5">
                    <Car className="w-3 h-3 text-blue-400" />
                    <span>
                      {t(comp.transportType === "other" ? "other_transport" : (comp.transportType || "car"))}
                      {comp.transportDetails ? ` (${comp.transportDetails})` : ""}
                    </span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Check className={`w-3 h-3 ${comp.needsHosting ? "text-emerald-400" : "text-on-surface-variant/40"}`} />
                    <span>
                      {comp.needsHosting ? t("needs_hosting") : "Pas besoin d'hébergement"}
                    </span>
                  </p>
                  {comp.accompaniedByFamily && (
                    <p className="flex items-center gap-1.5">
                      <Users className="w-3 h-3 text-amber-400" />
                      <span>
                        {t("accompanied_by_family")} : {comp.familyDetails || "Oui"}
                      </span>
                    </p>
                  )}
                  {comp.notes && (
                    <p className="flex items-start gap-1.5 italic opacity-85 mt-1">
                      <Briefcase className="w-3 h-3 mt-0.5" />
                      <span>{comp.notes}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Host assignments for companion */}
              {assignments.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-white/5 space-y-1">
                  <p className="text-[10px] font-black uppercase text-primary/70 tracking-widest">{t("hosts")}</p>
                  {assignments.map((ha, i) => (
                    <div key={i} className="flex justify-between items-center text-xs bg-white/5 rounded px-2.5 py-1.5 mt-1">
                      <span className="font-semibold text-on-surface">{ha.hostName}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-bold uppercase">
                        {t(ha.role)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {companions.length === 0 && !showForm && (
        <div className="text-center py-8 text-on-surface-variant">
          <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">{t("no_results")}</p>
        </div>
      )}
    </motion.div>
  );
}
