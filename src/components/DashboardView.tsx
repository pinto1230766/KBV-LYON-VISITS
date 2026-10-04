import { useMemo, useState, useLayoutEffect, useRef } from "react";
import { useShallow } from "zustand/react/shallow";
import { Calendar, TrendingUp, ChevronRight, Download, Upload, BookOpen, Check, CreditCard, FileText } from "lucide-react";
import { isEventVisit } from "../lib/eventDetection";
import { motion, AnimatePresence } from "framer-motion";
import { useVisitStore } from "../store/useVisitStore";
import { useHostStore } from "../store/useHostStore";
import { useSpeakerStore } from "../store/useSpeakerStore";
import { useUIStore } from "../store/useUIStore";
import { useSettingsStore } from "../store/useSettingsStore";
import { useTranslation } from "../hooks/useTranslation";
import { toast } from "sonner";
import { exportFullBackup, pickAndImportBackup } from "../lib/backup";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  PieChart, Pie, Cell
} from 'recharts';
import { DashboardFAB } from "./dashboard/DashboardFAB";

export function DashboardView() {
  const visits = useVisitStore(useShallow((s) => s.visits));
  const hosts = useHostStore(useShallow((s) => s.hosts));
  const speakers = useSpeakerStore(useShallow((s) => s.speakers));
  const setActiveTab = useUIStore((s) => s.setActiveTab);
  const setShowUserManual = useUIStore((s) => s.setShowUserManual);
  const { t, language, formatDate, formatNumber } = useTranslation();

  const managerNotes = useSettingsStore((s) => s.settings.managerNotes || "");
  const updateManagerNotes = useSettingsStore((s) => s.updateManagerNotes);

  const [showNotesModal, setShowNotesModal] = useState(false);
  const [notesInput, setNotesInput] = useState(managerNotes);
  
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'confirmed' | 'month'>('all');
  const barRef = useRef<HTMLDivElement>(null);
  const pieRef = useRef<HTMLDivElement>(null);
  const [barSize, setBarSize] = useState({ width: 0, height: 0 });
  const [pieSize, setPieSize] = useState({ width: 0, height: 0 });
  useLayoutEffect(() => {
    const measure = () => {
      if (barRef.current) {
        const { width, height } = barRef.current.getBoundingClientRect();
        if (width > 0 && height > 0) setBarSize({ width, height });
      }
      if (pieRef.current) {
        const { width, height } = pieRef.current.getBoundingClientRect();
        if (width > 0 && height > 0) setPieSize({ width, height });
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (barRef.current) ro.observe(barRef.current);
    if (pieRef.current) ro.observe(pieRef.current);
    return () => ro.disconnect();
  }, []);

  const locale = language === "pt" ? "pt-PT" : language === "cv" ? "pt-CV" : "fr-FR";

  const stats = useMemo(() => {
    const now = new Date();
    const upcoming = visits.filter((v) => new Date(v.visitDate) >= now && v.status !== "cancelled");
    const confirmed = visits.filter((v) => v.status === "confirmed");
    const thisMonth = visits.filter((v) => {
      const d = new Date(v.visitDate);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const monthlyExpenses = thisMonth.reduce((sum, v) => sum + (v.expenses || []).reduce((s, e) => s + e.amount, 0), 0);
    
    const monthsData: Record<string, number> = {};
    const monthsOrder: string[] = [];
    for (let i = -5; i <= 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const key = d.toLocaleDateString(locale, { month: 'short', year: '2-digit' });
      monthsData[key] = 0;
      monthsOrder.push(key);
    }
    visits.forEach(v => {
      const d = new Date(v.visitDate);
      const key = d.toLocaleDateString(locale, { month: 'short', year: '2-digit' });
      if (monthsData[key] !== undefined) monthsData[key]++;
    });
    const visitsByMonth = monthsOrder.map(name => ({ name, visits: monthsData[name] }));

    const visitsWithHousing = visits.filter(v => 
      !isEventVisit(v) && 
      v.status !== "cancelled" && 
      (v.hostAssignments || []).some(ha => ha.role === 'hebergement')
    ).length;
    const visitsWithoutHousing = visits.filter(v => 
      !isEventVisit(v) && 
      v.status !== "cancelled" && 
      v.localSpeaker !== true &&
      !(v.hostAssignments || []).some(ha => ha.role === 'hebergement')
    ).length;
    const hostStats = [
      { name: 'Assignés', value: visitsWithHousing, color: '#10b981' },
      { name: 'Manquants', value: visitsWithoutHousing, color: '#ef4444' }
    ];

    const speakerCounts: Record<string, { count: number; name: string }> = {};
    visits.forEach(v => {
      if (isEventVisit(v)) return;
      const key = v.nom.toLowerCase().trim();
      if (!speakerCounts[key]) speakerCounts[key] = { count: 0, name: v.nom };
      speakerCounts[key].count++;
    });
    const topSpeakers = Object.values(speakerCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return { 
      total: visits.length, 
      upcoming: upcoming.length, 
      confirmed: confirmed.length, 
      thisMonth: thisMonth.length, 
      monthlyExpenses,
      visitsByMonth,
      hostStats,
      topSpeakers
    };
  }, [visits, locale]);

  const handleFilterClick = (newFilter: typeof filter) => {
    setFilter(prev => prev === newFilter ? 'all' : newFilter);
  };

  const filteredVisits = useMemo(() => {
    const sorted = [...visits]
      .sort((a, b) => new Date(a.visitDate).getTime() - new Date(b.visitDate).getTime());
    
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    switch (filter) {
      case 'upcoming':
        return sorted.filter(v => new Date(v.visitDate) >= now && v.status !== "cancelled");
      case 'confirmed':
        return sorted.filter(v => v.status === 'confirmed');
      case 'month':
        return sorted.filter(v => {
          const d = new Date(v.visitDate);
          return d >= startOfMonth && d <= endOfMonth;
        });
      default:
        return sorted.filter(v => new Date(v.visitDate) >= now && v.status !== "cancelled").slice(0, 5);
    }
  }, [visits, filter]);

  const handleExport = async () => {
    try {
      await exportFullBackup(visits, hosts, speakers);
      toast.success(t("export_success"));
    } catch {
      toast.error(t("export_error") || "Erreur lors de l'exportation");
    }
  };

  const handleImport = async () => {
    try {
      const ok = await pickAndImportBackup();
      if (ok) {
        toast.success(t("import_success"));
      } else {
        toast.error(t("import_error"));
      }
    } catch {
      toast.error(t("import_error"));
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.1 }
    }
  };

  const staggerItem = {
    hidden: { opacity: 0, y: 15, scale: 0.98 },
    show: { 
      opacity: 1, y: 0, scale: 1,
      transition: { type: "spring" as const, stiffness: 260, damping: 20 }
    }
  };

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="show" className="py-4 md:py-6 space-y-6 overflow-y-auto h-full pr-1">
      {/* Apple Large Title & Header Action Capsules */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            {t("dashboard") || "Tableau de bord"}
          </h1>
          <p className="text-sm font-medium text-muted-foreground mt-1">
            {t("welcome_back") || "Bienvenue dans votre espace de coordination"}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <button
            onClick={() => { setNotesInput(managerNotes); setShowNotesModal(true); }}
            className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-foreground bg-muted/60 hover:bg-muted border border-border/60 rounded-full transition-all shadow-2xs active:scale-95 touch-manipulation"
            title="Notes diverses"
          >
            <FileText className="w-4 h-4 flex-shrink-0 text-amber-500" />
            <span>Notes</span>
          </button>
          <button
            onClick={() => { setShowUserManual(true); setActiveTab("settings"); }}
            className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-primary-foreground bg-primary hover:opacity-95 rounded-full transition-all shadow-md shadow-primary/20 active:scale-95 touch-manipulation"
            title={t("user_manual") || "Mode d'emploi"}
          >
            <BookOpen className="w-4 h-4 flex-shrink-0" />
            <span>{t("user_manual") || "Guide"}</span>
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <motion.button variants={staggerItem} whileHover={{ y: -2 }} onClick={() => handleFilterClick('upcoming')}
          className={`premium-card p-3.5 xs:p-4 md:p-5 text-left min-h-[85px] md:min-h-[100px] rounded-xl flex flex-col justify-between transition-all ${filter === 'upcoming' ? "border-primary ring-1 ring-primary shadow-lg" : "hover:border-primary/30"}`}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t("upcoming") || "À VENIR"}</p>
          <div className="flex items-center justify-between mt-2">
            <p className="text-2xl xs:text-3xl font-bold text-foreground">{stats.upcoming}</p>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-primary" />
            </div>
          </div>
        </motion.button>

        <motion.button variants={staggerItem} whileHover={{ y: -2 }} onClick={() => handleFilterClick('confirmed')}
          className={`premium-card p-3.5 xs:p-4 md:p-5 text-left min-h-[85px] md:min-h-[100px] rounded-xl flex flex-col justify-between transition-all ${filter === 'confirmed' ? "border-blue-400 ring-1 ring-blue-400 shadow-lg" : "hover:border-blue-400/30"}`}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t("confirmed_count") || "CONFIRMÉS"}</p>
          <div className="flex items-center justify-between mt-2">
            <p className="text-2xl xs:text-3xl font-bold text-blue-500">{stats.confirmed}</p>
            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Check className="w-4 h-4 text-blue-500" />
            </div>
          </div>
        </motion.button>

        <motion.button variants={staggerItem} whileHover={{ y: -2 }} onClick={() => handleFilterClick('month')}
          className={`premium-card p-3.5 xs:p-4 md:p-5 text-left min-h-[85px] md:min-h-[100px] rounded-xl flex flex-col justify-between transition-all ${filter === 'month' ? "border-orange-400 ring-1 ring-orange-400 shadow-lg" : "hover:border-orange-400/30"}`}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t("this_month") || "CE MOIS-CI"}</p>
          <div className="flex items-center justify-between mt-2">
            <p className="text-2xl xs:text-3xl font-bold text-orange-500">{stats.thisMonth}</p>
            <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-orange-500" />
            </div>
          </div>
        </motion.button>

        <motion.div variants={staggerItem} className="bg-gradient-to-br from-primary to-primary/70 p-3.5 xs:p-4 md:p-5 text-left min-h-[85px] md:min-h-[100px] rounded-xl flex flex-col justify-between shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 bg-white/10 rounded-full blur-2xl -mr-6 -mt-6" />
          <p className="text-[10px] font-bold uppercase tracking-wider text-primary-foreground/80 z-10">{t("expenses") || "DÉPENSES"}</p>
          <div className="flex items-center justify-between mt-2 z-10">
            <p className="text-xl xs:text-2xl font-black text-primary-foreground">{formatNumber(stats.monthlyExpenses, { style: 'currency', currency: 'EUR' })}</p>
            <div className="w-8 h-8 rounded-full bg-white/25 flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-primary-foreground" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={staggerItem} className="premium-card p-4 md:p-6 rounded-xl flex flex-col min-h-[260px] md:min-h-[320px]">
          <h3 className="text-xs font-bold text-foreground uppercase tracking-widest mb-6">{t("visits_by_month") || "Visites par mois"}</h3>
          <div ref={barRef} className="h-40 md:h-56 w-full mt-auto">
            {barSize.width > 0 && barSize.height > 0 && (
              <BarChart width={barSize.width} height={barSize.height} data={stats.visitsByMonth}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis fontSize={10} axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <RechartsTooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid hsl(var(--border))', fontSize: '11px', color: 'hsl(var(--foreground))' }} cursor={{ fill: 'hsl(var(--primary))', opacity: 0.05 }} />
                <Bar dataKey="visits" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={18} />
              </BarChart>
            )}
          </div>
        </motion.div>

        <motion.div variants={staggerItem} className="premium-card p-4 md:p-6 rounded-xl min-h-[260px] md:min-h-[320px] flex flex-col">
          <h3 className="text-xs font-bold text-foreground uppercase tracking-widest mb-6">{t("host_assignment_rate") || "Taux d'hébergement"}</h3>
          <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6">
            <div ref={pieRef} className="h-36 w-36 md:h-44 md:w-44">
              {pieSize.width > 0 && pieSize.height > 0 && (
                <PieChart width={pieSize.width} height={pieSize.height}>
                  <Pie data={stats.hostStats} cx="50%" cy="50%" innerRadius="60%" outerRadius="80%" paddingAngle={4} dataKey="value">
                    {stats.hostStats.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <RechartsTooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid hsl(var(--border))', fontSize: '11px', color: 'hsl(var(--foreground))' }} />
                </PieChart>
              )}
            </div>
            <div className="flex flex-col gap-2.5">
              {stats.hostStats.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-xs font-semibold text-foreground">{s.name}: {s.value}</span>
                </div>
              ))}
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">Total Besoins</p>
                <p className="text-xl font-bold text-foreground">{stats.hostStats.reduce((a, b) => a + b.value, 0)}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Speakers */}
        <motion.div variants={staggerItem} className="premium-card p-4 md:p-6 rounded-xl flex flex-col">
          <h3 className="text-xs font-bold text-foreground uppercase tracking-widest mb-4">Orateurs les plus sollicités</h3>
          <div className="space-y-2.5">
            {stats.topSpeakers.map((s, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 md:p-3.5 rounded-xl bg-muted/40 border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">{i + 1}</div>
                  <span className="text-sm font-semibold text-foreground">{s.name}</span>
                </div>
                <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20">{s.count} {s.count > 1 ? "visites" : "visite"}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activities */}
        <motion.div variants={staggerItem} className="flex flex-col">
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-widest">
              {filter === 'all' ? (t("recent_activities") || "Activités récentes") : t(filter)}
            </h3>
            <button onClick={() => filter === 'all' ? setActiveTab("planning") : setFilter('all')} className="text-xs font-bold text-primary flex items-center gap-1 uppercase tracking-wider hover:opacity-80 transition-opacity">
              {filter === 'all' ? <>{t("see_all") || "Voir tout"} <ChevronRight className="w-3.5 h-3.5" /></> : t("all") || "Tout"}
            </button>
          </div>
          
          <div className="space-y-2.5 flex-1">
            {filteredVisits.length === 0 ? (
              <p className="text-xs text-muted-foreground py-12 text-center italic">{t("no_visits") || "Aucune visite"}</p>
            ) : (
              <AnimatePresence mode="popLayout">
                {filteredVisits.map((visit, i) => {
                  const speaker = speakers.find((s) => s.nom.trim().toLowerCase() === visit.nom.trim().toLowerCase());
                  const isCouple = speaker?.householdType === "couple";
                  const d = new Date(visit.visitDate);
                  const monthShort = formatDate(d, { month: "short" }).toUpperCase().replace(".", "");
                  return (
                    <motion.button key={visit.visitId} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                      onClick={() => { useUIStore.getState().setPendingVisit(visit.visitId); setActiveTab("planning"); }}
                      className="w-full premium-card p-2.5 md:p-3.5 flex items-center gap-3.5 text-left hover:border-primary/40 transition-all group relative overflow-hidden rounded-xl"
                    >
                      <div className="w-10 h-12 rounded-lg bg-muted flex flex-col items-center justify-center flex-shrink-0 border border-border">
                        <span className="text-[8px] font-bold uppercase tracking-wider text-muted-foreground">{monthShort}</span>
                        <span className="text-base font-bold text-foreground leading-tight">{d.getDate()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground truncate">{isCouple && speaker?.spouseName ? `${speaker.nom} & ${speaker.spouseName}` : visit.nom}</p>
                        <p className="text-[10px] text-muted-foreground truncate mt-0.5">📍 {visit.congregation}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-lg text-[8px] font-bold uppercase tracking-wider ${visit.status === "confirmed" ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25" : "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/25"}`}>
                        {t(visit.status) || visit.status}
                      </span>
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        </motion.div>
      </div>

      {/* Premium Backup Card */}
      <motion.div variants={staggerItem} className="relative rounded-2xl bg-gradient-to-br from-foreground/90 to-foreground dark:from-card dark:to-card border border-primary/20 p-4 md:p-6 text-primary-foreground dark:text-foreground shadow-xl overflow-hidden group">
        <div className="absolute top-0 right-0 p-16 bg-primary/5 rounded-full blur-3xl -mr-12 -mt-12 transition-transform group-hover:scale-110" />
        <div className="relative z-10">
          <h3 className="text-lg font-bold text-primary mb-1.5">KBV v2 – Coordination Premium</h3>
          <p className="text-xs text-primary-foreground/70 dark:text-muted-foreground mb-6 max-w-md">
            Gérez vos orateurs et hébergements avec fluidité sur tous vos appareils. Vos données sont sécurisées et synchronisées.
          </p>
          <div className="flex flex-wrap gap-3">
            <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2.5 bg-primary-foreground/10 hover:bg-primary-foreground/20 rounded-xl text-xs font-bold transition-all border border-primary-foreground/20 text-primary-foreground">
              <Download className="w-3.5 h-3.5" /> {t("backup") || "Sauvegarder"}
            </button>
            <button onClick={handleImport} className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-xs font-bold shadow-lg transition-all">
              <Upload className="w-3.5 h-3.5" /> Import
            </button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showNotesModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowNotesModal(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="glass-panel w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-secondary" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-base font-bold text-foreground">Notes de gestion</h3>
                    <p className="text-xs text-muted-foreground">Notes diverses utiles pour le gestionnaire de l'application</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowNotesModal(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>

              {/* Body */}
              <div className="p-6 flex-1 flex flex-col">
                <textarea
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  className="w-full flex-1 min-h-[300px] p-4 rounded-xl border border-border bg-muted/30 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary text-sm resize-none font-body-md text-foreground"
                  placeholder="Saisissez vos notes de gestion ici... Ces notes sont sauvegardées localement et incluses dans vos sauvegardes."
                />
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-border bg-card flex justify-end gap-3">
                <button
                  onClick={() => setShowNotesModal(false)}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:bg-muted transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    updateManagerNotes(notesInput);
                    setShowNotesModal(false);
                    toast.success("Notes enregistrées avec succès");
                  }}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-all shadow-md"
                >
                  Enregistrer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Action Button (FAB) for quick creation without navigating tabs */}
      <DashboardFAB />
    </motion.div>
  );
}
