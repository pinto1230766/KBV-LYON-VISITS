import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Database, Download, Upload, Cloud, CloudOff, RefreshCw,
  FileSpreadsheet, FolderArchive, ExternalLink, Search, Trash2,
  Link2, Loader2, AlertTriangle, FileText, CheckCircle, X,
} from "lucide-react";
import { usePdfStore } from "../../store/usePdfStore";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "../ui/alert-dialog";
import { useSettingsData } from "./useSettingsData";

interface Props {
  t: (k: string) => string;
}

export function DataSection({ t }: Props) {
  const d = useSettingsData();

  return (
    <>

      {/* Google Sheet Config Modal */}
      <AnimatePresence>
        {d.showSheetConfig && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="w-full max-w-lg bg-background rounded-3xl border border-border shadow-2xl p-6 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-black text-foreground">{t("configure_google_sheet")}</h3>
                  <p className="text-xs text-muted-foreground">{t("sheet_config_desc")}</p>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t("sheet_url")}</label>
                <input
                  className="input-soft text-sm w-full"
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  value={d.sheetUrlInput}
                  onChange={(e) => d.setSheetUrlInput(e.target.value)}
                />
                <p className="text-[10px] text-muted-foreground">{t("sheet_url_hint")}</p>
              </div>
              <div className="flex gap-3 justify-end">
                <button onClick={() => d.setShowSheetConfig(false)} className="px-4 py-2 rounded-xl text-sm font-bold text-muted-foreground hover:text-foreground transition-colors">
                  {t("cancel")}
                </button>
                <button onClick={d.handleSaveSheetUrl} className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity">
                  {t("save_and_sync")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Supabase Config Modal */}
      <AnimatePresence>
        {d.showSupabaseConfig && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="w-full max-w-lg bg-background rounded-3xl border border-border shadow-2xl p-6 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Cloud className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-black text-foreground">{t("configure_supabase")}</h3>
                  <p className="text-xs text-muted-foreground">{t("supabase_config_desc")}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t("supabase_url")}</label>
                  <input
                    className="input-soft text-sm w-full"
                    placeholder="https://votre-projet.supabase.co"
                    value={d.supabaseUrlInput}
                    onChange={(e) => d.setSupabaseUrlInput(e.target.value)}
                  />
                  <p className="text-[10px] text-muted-foreground">{t("supabase_url_hint")}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t("supabase_anon_key")}</label>
                  <input
                    type="password"
                    className="input-soft text-sm w-full"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={d.supabaseKeyInput}
                    onChange={(e) => d.setSupabaseKeyInput(e.target.value)}
                  />
                  <p className="text-[10px] text-muted-foreground">{t("supabase_key_hint")}</p>
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <button onClick={() => d.setShowSupabaseConfig(false)} className="px-4 py-2 rounded-xl text-sm font-bold text-muted-foreground hover:text-foreground transition-colors">
                  {t("cancel")}
                </button>
                <button onClick={d.handleSaveSupabaseConfig} className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity">
                  {t("save")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Supabase Guide Modal */}
      <AnimatePresence>
        {d.showSupabaseGuide && (
          <GuideModal
            onClose={() => d.setShowSupabaseGuide(false)}
            icon={<Cloud className="w-5 h-5 text-primary" />}
            title={t("supabase_guide_title")}
            desc={t("supabase_guide_desc")}
            steps={[
              { title: t("supabase_step1_title"), desc: t("supabase_step1_desc") },
              { title: t("supabase_step2_title"), desc: t("supabase_step2_desc") },
              { title: t("supabase_step3_title"), desc: t("supabase_step3_desc") },
              { title: t("supabase_step4_title"), desc: t("supabase_step4_desc") },
            ]}
            note={t("supabase_note")}
            closeLabel={t("close")}
          />
        )}
      </AnimatePresence>

      {/* Google Sheet Guide Modal */}
      <AnimatePresence>
        {d.showSheetGuide && (
          <GuideModal
            onClose={() => d.setShowSheetGuide(false)}
            icon={<FileSpreadsheet className="w-5 h-5 text-primary" />}
            title={t("sheet_guide_title")}
            desc={t("sheet_guide_desc")}
            steps={[
              { title: t("sheet_step1_title"), desc: t("sheet_step1_desc") },
              { title: t("sheet_step2_title"), desc: t("sheet_step2_desc"), extra: <div className="p-3 rounded-lg bg-muted/50 border font-mono text-sm">{t("sheet_columns")}</div> },
              { title: t("sheet_step3_title"), desc: t("sheet_step3_desc"), extra: (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">{t("sheet_example_title")}</p>
                  <div className="p-3 rounded-lg bg-muted/50 border font-mono text-sm">{t("sheet_example_data")}</div>
                </div>
              )},
              { title: t("sheet_step4_title"), desc: t("sheet_step4_desc") },
            ]}
            note={t("sheet_note")}
            closeLabel={t("close")}
          />
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

      {/* Import / Export Card */}
      <div className="premium-card p-6 space-y-5">
        <h3 className="text-base font-black text-foreground flex items-center gap-2">
          <Database className="w-5 h-5 text-primary" />
          {t("import_export")}
        </h3>

        {/* Google Sheet Status Banner */}
        {d.congregation.googleSheetUrl ? (
          <div className="flex items-center gap-3 p-2 md:p-3 rounded-2xl bg-primary/5 border border-primary/20">
            <Link2 className="w-4 h-4 text-primary flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-primary truncate">Google Sheet {t("connected")}</p>
              {d.congregation.lastSyncAt && (
                <p className="text-[10px] text-muted-foreground">{t("last_sync")}: {new Date(d.congregation.lastSyncAt).toLocaleString("fr-FR")}</p>
              )}
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => d.setShowSheetGuide(true)} className="text-[10px] font-bold uppercase tracking-widest text-primary/70 hover:text-primary hover:underline">{t("sheet_guide")}</button>
              <button onClick={() => d.setShowSheetConfig(true)} className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline">{t("modify")}</button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-2 md:p-3 rounded-2xl bg-muted/50 border border-border">
            <FileSpreadsheet className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-muted-foreground truncate">Google Sheet non configuré</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => d.setShowSheetGuide(true)} className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline">{t("sheet_guide")}</button>
              <button onClick={() => d.setShowSheetConfig(true)} className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline">Configurer</button>
            </div>
          </div>
        )}

        {/* Supabase Status Banner */}
        {import.meta.env.VITE_SUPABASE_URL || (d.settings.supabaseUrl && d.settings.supabaseAnonKey) ? (
          <div className="flex items-center gap-3 p-2 md:p-3 rounded-2xl bg-primary/5 border border-primary/20">
            <Cloud className="w-4 h-4 text-primary flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-primary truncate">Supabase {t("connected")}</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => d.setShowSupabaseGuide(true)} className="text-[10px] font-bold uppercase tracking-widest text-primary/70 hover:text-primary hover:underline">{t("supabase_guide")}</button>
              <button onClick={() => d.setShowSupabaseConfig(true)} className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline">{t("modify")}</button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-2 md:p-3 rounded-2xl bg-muted/50 border border-border">
            <CloudOff className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-muted-foreground truncate">Supabase non configuré</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => d.setShowSupabaseGuide(true)} className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline">{t("supabase_guide")}</button>
              <button onClick={() => d.setShowSupabaseConfig(true)} className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline">Configurer</button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Cloud Sync Status */}
          <div className="premium-card p-4 rounded-xl flex flex-col justify-between">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 flex-shrink-0 rounded-xl flex items-center justify-center ${d.cloudStatus === "done" ? "bg-emerald-500/10" : d.cloudStatus === "error" ? "bg-destructive/10" : "bg-cyan-500/10"}`}>
                <Cloud className={`w-5 h-5 ${d.cloudStatus === "done" ? "text-emerald-600 dark:text-emerald-400" : d.cloudStatus === "error" ? "text-destructive" : "text-cyan-600 dark:text-cyan-400"}`} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Cloud Sync</p>
                <p className="text-sm font-black text-foreground">
                  {d.cloudStatus === "syncing" ? "En cours..." : d.cloudStatus === "done" ? "Synchronisé" : d.cloudStatus === "error" ? "Erreur" : "En attente"}
                </p>
              </div>
            </div>
            
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1 bg-muted/30 p-3 rounded-lg border border-border">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t("last_sync")}</p>
                <p className="text-xs font-bold text-foreground">
                  {d.congregation.lastSyncAt ? new Date(d.congregation.lastSyncAt).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
                </p>
              </div>
              <button onClick={d.handleCloudSync} disabled={d.isCloudSyncing}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors disabled:opacity-50">
                {d.isCloudSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                {d.isCloudSyncing ? "SYNCHRONISATION..." : "LANCER LA SYNCHRO"}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button onClick={d.handleSyncGoogleSheet} disabled={d.isSyncing}
              className="flex items-center justify-start gap-3 p-3.5 rounded-xl bg-white dark:bg-card border border-border hover:border-emerald-500/50 transition-all text-left group disabled:opacity-50">
              <div className="w-10 h-10 flex-shrink-0 rounded-lg bg-emerald-500/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                {d.isSyncing ? <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" /> : <FileSpreadsheet className="w-5 h-5 text-emerald-600" />}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-foreground truncate">Sync Google Sheet</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{d.isSyncing ? "Synchronisation en cours..." : "Synchroniser avec le fichier Google Sheet"}</p>
              </div>
            </button>
            
            <button onClick={d.handleImport} className="flex items-center justify-start gap-3 p-3.5 rounded-xl bg-white dark:bg-card border border-border hover:border-blue-500/50 transition-all text-left group">
              <div className="w-10 h-10 flex-shrink-0 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Upload className="w-5 h-5 text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-foreground truncate">{t("import_json")}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Importer un fichier de sauvegarde</p>
              </div>
            </button>

            <button onClick={d.handleExport} className="flex items-center justify-start gap-3 p-3.5 rounded-xl bg-white dark:bg-card border border-border hover:border-purple-500/50 transition-all text-left group">
              <div className="w-10 h-10 flex-shrink-0 rounded-lg bg-purple-500/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Download className="w-5 h-5 text-purple-600" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-foreground truncate">{t("full_backup")}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Exporter toutes les données (JSON)</p>
              </div>
            </button>

            <button onClick={d.handleExportRepertoire} className="flex items-center justify-start gap-3 p-3.5 rounded-xl bg-white dark:bg-card border border-border hover:border-amber-500/50 transition-all text-left group">
              <div className="w-10 h-10 flex-shrink-0 rounded-lg bg-amber-500/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                <FolderArchive className="w-5 h-5 text-amber-600" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-foreground truncate">{t("repertoire_speakers_hosts")}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Exporter uniquement la base de contacts</p>
              </div>
            </button>
          </div>
        </div>

        <div className="text-center pt-2">
          <p className="text-sm font-black text-foreground uppercase tracking-widest">
            {d.speakers.length} {t("speakers_count")} · {d.hosts.length} {t("hosts_count")}
          </p>
          <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">{t("export_hint")}</p>
        </div>
      </div>

      {/* Formulaire 3007-f */}
      <Pdf3007fCard />

      {/* Quick Access */}
      <div className="premium-card p-6 space-y-4">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-foreground">{t("quick_access")}</h3>
        <p className="text-sm text-muted-foreground">{t("quick_access_desc")}</p>
        <div className="grid grid-cols-2 gap-3">
          {d.congregation.googleSheetUrl ? (
            <a href={d.congregation.googleSheetUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-between p-4 rounded-2xl border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors">
              <span className="text-sm font-bold text-primary">Google Sheet</span>
              <ExternalLink className="w-4 h-4 text-primary" />
            </a>
          ) : (
            <div className="flex items-center justify-between p-4 rounded-2xl border border-muted bg-muted/50 cursor-not-allowed">
              <span className="text-sm font-bold text-muted-foreground">Google Sheet</span>
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
            </div>
          )}
          <a href="https://jw.org" target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-between p-4 rounded-2xl border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors">
            <span className="text-sm font-bold text-primary">JW.org</span>
            <ExternalLink className="w-4 h-4 text-primary" />
          </a>
        </div>
      </div>

      {/* Duplicate Detection + Reset */}
      <div className="premium-card p-4 md:p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-black text-foreground">{t("duplicate_detection")}</h3>
            <p className="text-sm text-muted-foreground mt-1">{t("duplicate_desc")}</p>
          </div>
          <button onClick={d.findDuplicates} className="flex items-center justify-center gap-2 px-5 py-2 md:py-2.5 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 text-primary-foreground text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity w-full md:w-auto">
            <Search className="w-4 h-4" /> {t("search_duplicates")}
          </button>
        </div>

        {d.duplicates.length > 0 && (
          <div className="space-y-2 mt-3">
            {d.duplicates.map((dup, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border">
                <input
                  id={`dup-${dup.ids[0]}`}
                  type="checkbox"
                  aria-label={`${dup.type === "visit" ? "Visites" : dup.type === "speaker" ? t("speakers") : t("hosts")} ${dup.name}`}
                  checked={dup.ids.slice(1).some((id) => d.selectedDuplicates.includes(id))}
                  onChange={(e) => {
                    const extraIds = dup.ids.slice(1);
                    if (e.target.checked) {
                      d.setSelectedDuplicates((prev) => [...prev, ...extraIds]);
                    } else {
                      d.setSelectedDuplicates((prev) => prev.filter((id) => !extraIds.includes(id)));
                    }
                  }}
                  className="w-4 h-4 accent-primary"
                />
                <span className="text-xs font-bold uppercase text-muted-foreground">{dup.type === "visit" ? "Visites" : dup.type === "speaker" ? t("speakers") : t("hosts")}</span>
                <span className="text-sm font-bold text-foreground capitalize">{dup.name}</span>
                <span className="text-xs text-muted-foreground ml-auto">×{dup.ids.length}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-4">
            {d.duplicates.length > 0 && (
              <button
                onClick={() => {
                  const allExtraIds = d.duplicates.flatMap((dup) => dup.ids.slice(1));
                  const allSelected = allExtraIds.every((id) => d.selectedDuplicates.includes(id));
                  if (allSelected) d.setSelectedDuplicates([]);
                  else d.setSelectedDuplicates(allExtraIds);
                }}
                className="text-xs font-bold uppercase tracking-widest text-primary hover:underline transition-colors"
              >
                {d.duplicates.flatMap((dx) => dx.ids.slice(1)).every((id) => d.selectedDuplicates.includes(id))
                  ? t("deselect_all")
                  : t("select_all")}
              </button>
            )}
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              {d.selectedDuplicates.length > 0 ? `${d.selectedDuplicates.length} ${t("selected")}` : t("no_selection")}
            </p>
          </div>
          <button
            onClick={d.deleteSelectedDuplicates}
            disabled={d.selectedDuplicates.length === 0}
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-destructive disabled:opacity-40 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {t("delete_selection")}
          </button>
        </div>

        {/* Reset All Data */}
        <div className="mt-8 p-5 rounded-2xl border-2 border-destructive/30 bg-destructive/5 space-y-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-base font-black text-destructive">{t("reset_all_data") || "Réinitialiser toutes les données"}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {t("reset_warning") || "Cela supprimera définitivement toutes les visites, intervenants, hébergeurs et paramètres. Cette action est irréversible."}
              </p>
            </div>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-destructive text-destructive-foreground text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity w-full justify-center">
                <Trash2 className="w-4 h-4" />
                {t("reset_button") || "Supprimer toutes les données"}
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("reset_confirm_title") || "Êtes-vous sûr?"}</AlertDialogTitle>
              </AlertDialogHeader>
              <p className="text-sm text-muted-foreground">
                {t("reset_confirm_message") || "Cette action supprimera définitivement toutes vos données locales. Cette action ne peut pas être annulée."}
              </p>
              <AlertDialogFooter>
                <AlertDialogCancel>{t("cancel") || "Annuler"}</AlertDialogCancel>
                <AlertDialogAction onClick={d.handleResetAllData} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  {t("confirm_reset") || "Oui, supprimer tout"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </motion.div>
    </>
  );
}

// ─── PDF 3007-f Upload Card ───────────────────────────────────────────────────
function Pdf3007fCard() {
  const { pdfs, storePdf, removePdf } = usePdfStore();
  const stored = pdfs["3007-f"];
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = (file: File) => {
    if (!file || file.type !== "application/pdf") return;
    if (file.size > 10 * 1024 * 1024) {
      alert("Le fichier PDF ne doit pas dépasser 10 Mo.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      storePdf("3007-f", {
        id: "3007-f",
        name: file.name,
        dataUrl,
        size: file.size,
        uploadedAt: new Date().toISOString(),
      });
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleDownload = () => {
    if (!stored) return;
    const a = document.createElement("a");
    a.href = stored.dataUrl;
    a.download = stored.name;
    a.click();
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
  };

  return (
    <div className="premium-card p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
          <FileText className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h3 className="text-base font-black text-foreground">Formulaire 3007-f</h3>
          <p className="text-xs text-muted-foreground">Formulaire de remboursement des frais de déplacement de l'orateur</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {stored ? (
          <motion.div
            key="stored"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 sm:p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <CheckCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground truncate">{stored.name}</p>
                <p className="text-[10px] text-muted-foreground">
                  {formatSize(stored.size)} · Chargé le {new Date(stored.uploadedAt).toLocaleDateString("fr-FR")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-auto">
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 text-[10px] font-bold uppercase tracking-wider transition-colors touch-manipulation"
                title="Télécharger"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Télécharger</span>
              </button>
              <button
                onClick={() => inputRef.current?.click()}
                className="p-2 min-w-[36px] min-h-[36px] rounded-xl hover:bg-muted text-muted-foreground transition-colors touch-manipulation flex items-center justify-center"
                title="Remplacer"
              >
                <Upload className="w-4 h-4" />
              </button>
              <button
                onClick={() => removePdf("3007-f")}
                className="p-2 min-w-[36px] min-h-[36px] rounded-xl hover:bg-destructive/10 text-destructive/70 transition-colors touch-manipulation flex items-center justify-center"
                title="Supprimer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`border-2 border-dashed rounded-2xl p-5 sm:p-8 text-center transition-colors cursor-pointer touch-manipulation ${
              dragging ? "border-amber-500 bg-amber-500/5" : "border-border hover:border-amber-500/50 hover:bg-amber-500/5"
            }`}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
          >
            <FileText className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 sm:mb-3 text-muted-foreground/40" />
            <p className="text-sm font-bold text-foreground mb-1">Importer le formulaire 3007-f</p>
            <p className="text-xs text-muted-foreground hidden sm:block">Glissez le PDF ici ou cliquez pour choisir un fichier (max 10 Mo)</p>
            <p className="text-xs text-muted-foreground sm:hidden">Appuyez pour choisir le fichier PDF (max 10 Mo)</p>
          </motion.div>
        )}
      </AnimatePresence>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleInputChange}
        aria-label="Importer formulaire 3007-f"
      />
    </div>
  );
}

// Generic guide modal used for both Supabase and Google Sheet guides.
interface GuideStep {
  title: string;
  desc: string;
  extra?: React.ReactNode;
}

function GuideModal({
  onClose, icon, title, desc, steps, note, closeLabel,
}: {
  onClose: () => void;
  icon: React.ReactNode;
  title: string;
  desc: string;
  steps: GuideStep[];
  note: string;
  closeLabel: string;
}) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="w-full max-w-2xl bg-background rounded-3xl border border-border shadow-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">{icon}</div>
          <div>
            <h3 className="text-lg font-black text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground">{desc}</p>
          </div>
        </div>

        <div className="space-y-6">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-primary">{i + 1}</span>
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-foreground">{step.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                {step.extra}
              </div>
            </div>
          ))}

          <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20">
            <p className="text-sm text-primary font-medium">{note}</p>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity">
            {closeLabel}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
