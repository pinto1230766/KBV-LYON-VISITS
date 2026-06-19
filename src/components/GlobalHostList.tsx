import { useState, useRef } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useHostStore } from "../store/useHostStore";
import { useTranslation } from "../hooks/useTranslation";
import { toast } from "sonner";
import type { Host } from "../store/visitTypes";
import { generateId } from "../lib/sheetUtils";
import { haptic } from "../lib/haptics";
import { compressImage } from "../lib/imageCompress";


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

export function GlobalHostList() {
  const hosts = useHostStore((s) => s.hosts);
  const addHost = useHostStore((s) => s.addHost);
  const updateHost = useHostStore((s) => s.updateHost);
  const deleteHost = useHostStore((s) => s.deleteHost);
  const { t } = useTranslation();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Host | null>(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ nom: "", telephone: "", email: "", adresse: "", capacity: 2, notes: "", role: "hebergement" as Host["role"], photoUrl: undefined as string | undefined });
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) return;
    setBusy(true);
    try {
      const dataUrl = await compressImage(file, { maxDim: 800, quality: 0.82 });
      setForm((prev) => ({ ...prev, photoUrl: dataUrl }));
    } catch (err) {
      console.error(err);
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  };


  const resetForm = () => {
    setForm({ nom: "", telephone: "", email: "", adresse: "", capacity: 2, notes: "", role: "hebergement", photoUrl: undefined });
    setEditing(null);
    setShowForm(false);
  };

  const handleSubmit = () => {
    if (!form.nom) return;
    if (editing) {
      updateHost(editing.id, form);
      haptic("success");
      toast.success(t("host_updated"));
    } else {
      addHost({ ...form, id: generateId() } as Host);
      haptic("success");
      toast.success(t("host_added"));
    }
    resetForm();
  };

  const handleDelete = (id: string) => {
    deleteHost(id);
    setConfirmDeleteId(null);
    haptic("warning");
    toast.success(t("host_deleted"));
  };

  const openEdit = (h: Host) => {
    setForm({
      nom: h.nom, telephone: h.telephone, email: h.email || "",
      adresse: h.adresse || "", capacity: h.capacity || 2,
      notes: h.notes || "", role: h.role || "hebergement", photoUrl: h.photoUrl,
    });
    setEditing(h);
    setShowForm(true);
  };

  const filtered = hosts
    .filter((h) => h.nom.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.nom.localeCompare(b.nom));

  const uniqueFiltered = Array.from(new Map(filtered.map(item => [item.id, item])).values());


  return (
    <div className="relative min-h-[calc(100vh-10rem)] py-4 md:py-6 space-y-6">
      <div className="relative z-10 space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-headline-lg font-headline-lg text-on-surface mb-1">{t("hosts")}</h2>
            <p className="text-label-sm font-label-sm text-primary uppercase tracking-widest">
              {t("global_repertoire")} <span className="text-primary-fixed">{hosts.length}/{hosts.length}</span>
            </p>
          </div>
          
          <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap">
            {/* Search Pill */}
            <div className="relative group w-64 sm:w-80">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-on-surface-variant group-focus-within:text-tertiary transition-colors">search</span>
              </div>
              <input 
                className="block w-full pl-11 pr-4 py-2 border border-outline-variant/50 rounded-full bg-surface-container-high/50 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-1 focus:ring-tertiary focus:border-tertiary text-sm transition-all duration-200 glass-panel" 
                placeholder={t("search_host") || "Chercher un hôte..."} 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
              />
            </div>

            <motion.button 
              whileTap={{ scale: 0.97 }} 
              onClick={() => { resetForm(); setShowForm(true); }}
              className="bg-primary text-on-primary font-label-md px-6 py-2.5 rounded-full flex items-center gap-2 hover:bg-primary-fixed transition-colors active:scale-95 shadow-lg shadow-primary/20"
            >
              <span className="material-symbols-outlined">add</span> 
              <span className="uppercase">{t("add") || "Ajouter"}</span>
            </motion.button>
          </div>
        </div>

        {/* Grid */}
        {uniqueFiltered.length === 0 ? (
          <div className="text-center py-16 text-on-surface-variant/50 glass-panel rounded-2xl">
            <span className="material-symbols-outlined text-4xl mx-auto mb-3 opacity-20">home</span>
            <p className="text-base font-body-md">{t("no_results")}</p>
          </div>
        ) : (
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 xl:grid-cols-2 gap-stack_gap"
          >
            <AnimatePresence mode="popLayout">
              {uniqueFiltered.map((h) => (
                <motion.div
                  key={`host-${h.id}`}
                  variants={staggerItem}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="glass-panel rounded-xl p-4 flex items-center gap-4 hover:border-primary/50 transition-all cursor-pointer group relative overflow-hidden"
                  onClick={() => openEdit(h)}
                >
                  {h.photoUrl ? (
                    <img src={h.photoUrl} alt={h.nom} className="w-12 h-12 rounded-full object-cover border border-outline-variant flex-shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center flex-shrink-0 border border-outline-variant">
                      <span className="material-symbols-outlined text-on-surface-variant">home</span>
                    </div>
                  )}

                  <div className="flex-1 min-w-0 text-left">
                    <h3 className="text-label-md font-label-md font-bold mb-1 uppercase text-on-surface">{h.nom}</h3>
                    {h.adresse && (
                      <div className="flex items-center gap-1 text-[11px] text-on-surface-variant mb-0.5 truncate">
                        <span className="material-symbols-outlined text-[14px]">location_on</span>
                        <span>{h.adresse}</span>
                      </div>
                    )}
                    {h.telephone && (
                      <div className="flex items-center gap-1 text-[11px] text-on-surface-variant truncate">
                        <span className="material-symbols-outlined text-[14px]">call</span>
                        <span>{h.telephone}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2 self-stretch justify-between">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(h.id); }} 
                      aria-label={t("delete")} 
                      className="text-error opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-error/10 rounded-full" 
                      title={t("delete")}
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                    <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 md:p-margin_edge"
            onClick={resetForm}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card rounded-32 border border-border shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden relative" 
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-center px-8 py-6 border-b border-border bg-card/50 shrink-0">
                <h2 className="font-headline-md text-headline-md text-on-surface">
                  {editing ? t("edit_host") || "Modifier Hôte" : t("add_host") || "Ajouter Hôte"}
                </h2>
                <button onClick={resetForm} className="p-2 rounded-full hover:bg-white/5 transition-colors text-on-surface-variant hover:text-on-surface">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>close</span>
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-8 flex flex-col md:flex-row gap-gutter text-left">
                {/* Left Column: Avatar & Basic Info */}
                <div className="w-full md:w-1/3 flex flex-col gap-stack_gap items-center md:items-start border-r border-white/5 pr-gutter">
                  {/* Avatar Upload/Display */}
                  <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <div className="w-32 h-32 rounded-full border-2 border-border overflow-hidden bg-muted flex items-center justify-center relative">
                      {form.photoUrl ? (
                        <img alt="Avatar" className="w-full h-full object-cover" src={form.photoUrl} />
                      ) : busy ? (
                        <Loader2 className="w-8 h-8 text-on-surface-variant animate-spin" />
                      ) : (
                        <span className="material-symbols-outlined text-[48px] text-on-surface-variant">home</span>
                      )}
                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <span className="material-symbols-outlined text-primary-foreground">edit</span>
                      </div>
                    </div>
                    
                    {form.photoUrl && (
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setForm((prev) => ({ ...prev, photoUrl: undefined }));
                        }}
                        className="absolute top-0 right-0 bg-error text-on-error rounded-full w-8 h-8 flex items-center justify-center shadow-lg border-2 border-surface-container hover:bg-error/80 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">close</span>
                      </button>
                    )}
                    <p className="text-center font-label-sm text-label-sm text-on-surface-variant mt-2 w-full">Photo de profil</p>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} title="Photo de profil" placeholder="Photo de profil" />

                  {/* Role Selection */}
                  <div className="w-full mt-stack_gap">
                    <label className="block font-label-md text-label-md text-on-surface-variant mb-2">{t("role") || "Rôle"}</label>
                    <div className="relative">
                      <select 
                        className="w-full bg-white dark:bg-[#020617] border border-border rounded-xl px-4 py-3 text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors appearance-none font-body-md cursor-pointer pr-10"
                        value={form.role} 
                        onChange={(e) => setForm({ ...form, role: e.target.value as Host["role"] })}
                        title="Rôle"
                      >
                        <option value="hebergement">{t("hebergement") || "Hébergement"}</option>
                        <option value="transport">{t("transport") || "Transport"}</option>
                        <option value="repas">{t("repas") || "Logistique / Repas"}</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-3.5 text-on-surface-variant pointer-events-none">expand_more</span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Form Fields */}
                <div className="w-full md:w-2/3 flex flex-col gap-stack_gap text-left">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-stack_gap">
                    {/* Nom */}
                    <div>
                      <label className="block font-label-md text-label-md text-on-surface-variant mb-2">{t("name") || "Nom complet"}</label>
                      <input 
                        className="w-full bg-white dark:bg-[#020617] border border-border rounded-xl px-4 py-3 text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors font-body-md" 
                        placeholder="Prénom Nom" 
                        type="text" 
                        value={form.nom} 
                        onChange={(e) => setForm({ ...form, nom: e.target.value })} 
                      />
                    </div>
                    {/* Téléphone */}
                    <div>
                      <label className="block font-label-md text-label-md text-on-surface-variant mb-2">{t("phone") || "Téléphone"}</label>
                      <input 
                        className="w-full bg-white dark:bg-[#020617] border border-border rounded-xl px-4 py-3 text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors font-body-md" 
                        placeholder="+33..." 
                        type="tel" 
                        value={form.telephone} 
                        onChange={(e) => setForm({ ...form, telephone: e.target.value })} 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-stack_gap">
                    {/* Email */}
                    <div>
                      <label className="block font-label-md text-label-md text-on-surface-variant mb-2">{t("email") || "Email"}</label>
                      <input 
                        className="w-full bg-white dark:bg-[#020617] border border-border rounded-xl px-4 py-3 text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors font-body-md" 
                        placeholder="email@domaine.com" 
                        type="email" 
                        value={form.email} 
                        onChange={(e) => setForm({ ...form, email: e.target.value })} 
                      />
                    </div>
                    {/* Capacité */}
                    <div>
                      <label className="block font-label-md text-label-md text-on-surface-variant mb-2">{t("capacity") || "Capacité d'accueil"}</label>
                      <div className="relative">
                        <select 
                          className="w-full bg-white dark:bg-[#020617] border border-border rounded-xl px-4 py-3 text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors appearance-none font-body-md cursor-pointer pr-10"
                          value={form.capacity} 
                          onChange={(e) => setForm({ ...form, capacity: +e.target.value })}
                          title="Capacité d'accueil"
                        >
                          <option value="1">1 Personne</option>
                          <option value="2">2 Personnes</option>
                          <option value="3">3 Personnes</option>
                          <option value="4">4+ Personnes</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-3.5 text-on-surface-variant pointer-events-none">expand_more</span>
                      </div>
                    </div>
                  </div>

                  {/* Adresse */}
                  <div>
                    <label className="block font-label-md text-label-md text-on-surface-variant mb-2">{t("address") || "Adresse"}</label>
                    <input 
                      className="w-full bg-white dark:bg-[#020617] border border-border rounded-xl px-4 py-3 text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors font-body-md" 
                      placeholder="Numéro, Rue, Ville..." 
                      type="text" 
                      value={form.adresse} 
                      onChange={(e) => setForm({ ...form, adresse: e.target.value })} 
                    />
                  </div>

                  {/* Notes */}
                  <div className="flex-1 flex flex-col">
                    <label className="block font-label-md text-label-md text-on-surface-variant mb-2">{t("notes") || "Notes & Préférences"}</label>
                    <textarea 
                      className="w-full h-32 bg-white dark:bg-[#020617] border border-border rounded-xl px-4 py-3 text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors font-body-md resize-none flex-1" 
                      placeholder="Allergies, conditions spécifiques d'hébergement, disponibilités de transport..."
                      value={form.notes} 
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Footer / Actions */}
              <div className="px-8 py-4 border-t border-border bg-card/50 flex justify-end gap-4 items-center shrink-0">
                <button 
                  type="button"
                  onClick={resetForm} 
                  className="px-6 py-3 rounded-xl font-label-md text-label-md text-foreground bg-white dark:bg-card border border-border hover:border-muted-foreground/40 transition-colors uppercase"
                >
                  {t("cancel") || "ANNULER"}
                </button>
                <button 
                  type="button"
                  onClick={handleSubmit} 
                  className="px-6 py-3 rounded-xl font-label-md text-label-md bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95 uppercase font-bold"
                >
                  {editing ? t("save") || "ENREGISTRER" : t("add") || "AJOUTER"}
                </button>
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
              <p className="text-sm font-bold text-foreground">{t("confirm_delete_host")}</p>
              <div className="flex gap-2">
                <button onClick={() => handleDelete(confirmDeleteId)} className="flex-1 py-2.5 rounded-xl bg-destructive text-destructive-foreground text-xs font-bold">{t("yes_delete")}</button>
                <button onClick={() => setConfirmDeleteId(null)} className="flex-1 py-2.5 rounded-xl bg-white dark:bg-card text-foreground text-xs font-bold border border-border hover:border-muted-foreground/40">{t("cancel")}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
