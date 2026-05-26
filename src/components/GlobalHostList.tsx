import { useState } from "react";
import { Home, Plus, Trash2, Phone, MapPin, ChevronRight, AlertTriangle, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PhotoUpload } from "./PhotoUpload";
import { useHostStore } from "../store/useHostStore";
import { useTranslation } from "../hooks/useTranslation";
import { toast } from "sonner";
import type { Host } from "../store/visitTypes";
import { generateId } from "../lib/sheetUtils";
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
    <div className="py-4 md:py-6 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 md:gap-4">
        <div className="mr-auto">
          <h2 className="text-2xl md:text-3xl font-black text-foreground">{t("hosts")}</h2>
          <p className="text-xs md:text-sm font-bold uppercase tracking-wider text-muted-foreground">
            {t("global_repertoire")} <span className="text-primary">{hosts.length}/{hosts.length}</span>
          </p>
        </div>
        <motion.button whileTap={{ scale: 0.97 }} onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-500 text-white text-sm font-bold hover:bg-amber-600 transition-colors touch-manipulation">
          <Plus className="w-5 h-5" /> {t("add")}
        </motion.button>
      </div>

      <div className="relative group/search">
        <input 
          className="input-soft text-base py-2 pl-4 pr-12" 
          placeholder={t("search_host")} 
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
          <Home className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">{t("no_results")}</p>
        </div>
      ) : (
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3"
        >
          <AnimatePresence mode="popLayout">
            {uniqueFiltered.map((h) => (
              <motion.div
                key={`host-${h.id}`}
                variants={staggerItem}
                exit={{ opacity: 0, scale: 0.95 }}
                className="premium-card p-3 cursor-pointer hover:ring-1 hover:ring-primary/30 transition-all group relative overflow-hidden"
                onClick={() => openEdit(h)}
              >
                {/* Subtle glass highlight on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                
                <div className="flex items-center gap-4 relative z-10">
                  {h.photoUrl ? (
                    <img src={h.photoUrl} alt={h.nom} className="w-12 h-14 rounded-xl object-cover flex-shrink-0 shadow-sm" />
                  ) : (
                    <div className="w-12 h-14 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                      <Home className="w-6 h-6 text-muted-foreground/30" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0 text-center">
                    <p className="text-sm font-black text-foreground truncate">{h.nom}</p>
                    {(h.adresse) && (
                      <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5 truncate mt-1">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-primary/50" /> {h.adresse}
                      </p>
                    )}
                    {h.telephone && (
                      <p className="text-[10px] text-muted-foreground/70 flex items-center justify-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3" /> {h.telephone}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-center justify-between gap-2 self-stretch">
                    <button onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(h.id); }} aria-label={t("delete")} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive/70 transition-colors" title={t("delete")}>
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

      {/* Form Modal */}
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
                <h3 className="text-xs font-black uppercase tracking-widest text-foreground">{editing ? t("edit") : t("add_host")}</h3>
                <button onClick={handleSubmit} className="text-xs font-black uppercase tracking-widest text-primary hover:opacity-80">
                  {editing ? t("save") : t("add")}
                </button>
              </div>

              {/* Scrollable Form Content */}
              <div className="ios-sheet-content p-6 space-y-4">
                <PhotoUpload photoUrl={form.photoUrl} onPhotoChange={(url) => setForm({ ...form, photoUrl: url })} />
                <input className="input-soft text-base" placeholder={t("name")} value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
                <input className="input-soft text-base" placeholder={t("phone")} value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} />
                <input className="input-soft text-base" placeholder={t("email")} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                <input className="input-soft text-base" placeholder={t("address")} value={form.adresse} onChange={(e) => setForm({ ...form, adresse: e.target.value })} />
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("capacity")}</label>
                    <input className="input-soft text-base" type="number" min={1} value={form.capacity} onChange={(e) => setForm({ ...form, capacity: +e.target.value })} title={t("capacity")} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("role")}</label>
                    <select className="input-soft text-base" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Host["role"] })} title={t("role")}>
                      <option value="hebergement">{t("hebergement")}</option>
                      <option value="transport">{t("transport")}</option>
                      <option value="repas">{t("repas")}</option>
                    </select>
                  </div>
                </div>
                <textarea className="input-soft text-base min-h-[80px] resize-none" placeholder={t("notes")} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
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
                <button onClick={() => setConfirmDeleteId(null)} className="flex-1 py-2.5 rounded-xl bg-muted text-muted-foreground text-xs font-bold">{t("cancel")}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
