import { useMemo, useState, useRef } from "react";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Mail, Bell, User, Send, RefreshCw, Camera } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Visit } from "../store/visitTypes";
import { useTranslation } from "../hooks/useTranslation";
import { useSettingsStore } from "../store/useSettingsStore";
import { useNotificationStore } from "../store/useNotificationStore";
import { useUIStore } from "../store/useUIStore";
import { getSupabase } from "../lib/syncCloud";

interface CalendarSidebarProps {
  visits: Visit[];
  onVisitClick: (visit: Visit) => void;
  onSyncNow?: () => void;
}

export function CalendarSidebar({ visits, onVisitClick, onSyncNow }: CalendarSidebarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { t, language } = useTranslation();
  const [showMessages, setShowMessages] = useState(true);
  const [showReminders, setShowReminders] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const congregation = useSettingsStore((s) => s.settings.congregation);
  const updateCongregation = useSettingsStore((s) => s.updateCongregation);
  const lastSyncAt = congregation.lastSyncAt;
  const allNotifications = useNotificationStore((s) => s.notifications);
  const pendingNotifications = useMemo(() => allNotifications.filter((n) => n.status === "pending"), [allNotifications]);
  const setActiveTab = useUIStore((s) => s.setActiveTab);
  const setPendingVisit = useUIStore((s) => s.setPendingVisit);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const offset = firstDay === 0 ? 6 : firstDay - 1;

  const visitsByDate = useMemo(() => {
    const map: Record<string, Visit[]> = {};
    visits.forEach((v) => {
      const d = v.visitDate.slice(0, 10);
      if (!map[d]) map[d] = [];
      map[d].push(v);
    });
    return map;
  }, [visits]);

  const days = Array.from({ length: 42 }, (_, i) => {
    const dayNum = i - offset + 1;
    if (dayNum < 1 || dayNum > daysInMonth) return null;
    return dayNum;
  });

  const today = new Date();
  const isToday = (day: number) => day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  const dateStr = (day: number) => `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const prev = () => setCurrentMonth(new Date(year, month - 1, 1));
  const next = () => setCurrentMonth(new Date(year, month + 1, 1));

  const locale = language === "pt" ? "pt-PT" : language === "cv" ? "pt-CV" : "fr-FR";
  const monthName = currentMonth.toLocaleDateString(locale, { month: "long", year: "numeric" });
  const weekDays = [t("mon"), t("tue"), t("wed"), t("thu"), t("fri"), t("sat"), t("sun")];

  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const todayVisits = visitsByDate[todayKey] || [];

  // Upcoming visits (next 30 days)
  const upcomingReminders = useMemo(() => {
    const now = new Date();
    const later = new Date(now);
    later.setDate(later.getDate() + 30);
    return visits
      .filter((v) => {
        const d = new Date(v.visitDate);
        return d >= now && d <= later && v.status !== "cancelled";
      })
      .sort((a, b) => new Date(a.visitDate).getTime() - new Date(b.visitDate).getTime())
      .slice(0, 5);
  }, [visits]);

  const pendingMessages = todayVisits.length;
  const reminderCount = pendingNotifications.length;

  const todayDateStr = today.toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long" }).toUpperCase();

  // Format last sync time
  const lastSyncLabel = lastSyncAt
    ? new Date(lastSyncAt).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })
    : null;

  // Open today's first visit in messages tab
  const handleMailClick = () => {
    if (todayVisits.length > 0) {
      setPendingVisit(todayVisits[0].visitId);
      setActiveTab("planning");
    } else {
      toast.info("Aucune visite prévue aujourd'hui");
    }
  };

  // Open the first pending notification's visit
  const handleBellClick = () => {
    if (pendingNotifications.length > 0) {
      const first = pendingNotifications[0];
      setPendingVisit(first.visitId);
      setActiveTab("planning");
    } else {
      toast.info("Aucune notification en attente");
    }
  };

  // Send WhatsApp for a reminder
  const sendQuickWhatsApp = (visit: Visit) => {
    const phone = visit.speakerPhone?.replace(/\s/g, "") || "";
    const prenom = visit.nom.split(" ")[0];
    const dateFormatted = new Date(visit.visitDate + "T00:00:00").toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long" });
    const msg = `Bonjour ${prenom}, un petit rappel pour votre visite prévue le ${dateFormatted}. À bientôt ! \u{1F64F}`;
    
    navigator.clipboard.writeText(msg);
    if (phone) {
      // Use universal API link for better reliability
      const url = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(msg)}`;
      const a = document.createElement("a");
      a.href = url; 
      a.target = "_blank"; 
      a.rel = "noopener noreferrer";
      document.body.appendChild(a); 
      a.click(); 
      document.body.removeChild(a);
    }
  };

  // Handle photo upload
  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      alert("Photo trop volumineuse (max 15Mo)");
      return;
    }
    const { compressImage } = await import("../lib/imageCompress");
    const dataUrl = await compressImage(file, { maxDim: 400, quality: 0.85 });
    const now = new Date().toISOString();
    updateCongregation({ responsablePhoto: dataUrl, lastSyncAt: now });

    // Immédiatement sauvegarder dans Supabase pour que tous les appareils (tablette, mobile) l'aient
    try {
      const supabase = getSupabase();
      if (supabase) {
        const fullCong = useSettingsStore.getState().settings.congregation;
        await supabase.from("congregation").upsert({
          id: "default",
          responsable_name: fullCong.responsableName || "Francisco Pinto",
          responsable_photo: dataUrl,
          last_sync_at: now,
          updated_at: now,
        }, { onConflict: "id" });
      }
    } catch {
      // Si hors-ligne, ce sera poussé lors de la prochaine synchronisation
    }

    event.target.value = "";
  };

  return (
    <div className="p-6 h-full flex flex-col overflow-y-auto bg-card text-foreground">
      {/* ─── Admin Header ─── */}
      <div className="flex items-center justify-between mb-8 border-b border-border/30 pb-4">
        {/* Raccourcis d'actions */}
        <div className="flex items-center gap-2">
          {/* Mail */}
          <button
            onClick={handleMailClick}
            title={t("messages_today")}
            aria-label={t("messages_today")}
            className="relative p-2.5 rounded-xl bg-muted hover:bg-accent transition-colors border border-border/50"
          >
            <Mail className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
            {pendingMessages > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] rounded-full bg-red-400 text-red-950 text-[9px] font-black flex items-center justify-center px-1">
                {pendingMessages}
              </span>
            )}
          </button>
          {/* Bell */}
          <button
            onClick={handleBellClick}
            title={t("upcoming_reminders")}
            aria-label={t("upcoming_reminders")}
            className="relative p-2.5 rounded-xl bg-muted hover:bg-accent transition-colors border border-border/50"
          >
            <Bell className={`w-4 h-4 ${reminderCount > 0 ? "text-primary" : "text-muted-foreground"}`} aria-hidden="true" />
            {reminderCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] rounded-full bg-primary text-primary-foreground text-[9px] font-black flex items-center justify-center px-1 animate-pulse">
                {reminderCount}
              </span>
            )}
          </button>
          {/* Sync */}
          {onSyncNow && (
            <button
              onClick={onSyncNow}
              title="Synchroniser"
              aria-label="Synchroniser"
              className="p-2.5 rounded-xl bg-muted hover:bg-accent transition-colors border border-border/50"
            >
              <RefreshCw className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
            </button>
          )}
        </div>
        
        {/* Admin Profil */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs font-bold text-foreground">{congregation.responsableName || "Francisco Pinto"}</p>
            <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">
              {lastSyncLabel ? `Sync ${lastSyncLabel}` : "SYNC 00:00"}
            </p>
          </div>
          <div className="relative">
            <button 
              onClick={() => fileInputRef.current?.click()}
              aria-label="Changer la photo de l'administrateur"
              title="Changer la photo de l'administrateur"
              className="w-10 h-10 rounded-full border-2 border-[#ffb77d]/20 flex items-center justify-center overflow-hidden shadow-md hover:shadow-lg transition-shadow group"
            >
              {congregation.responsablePhoto ? (
                <img 
                  src={congregation.responsablePhoto} 
                  alt="Photo admin" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-5 h-5 text-[#ffb77d]" aria-hidden="true" />
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-full flex items-center justify-center">
                <Camera className="w-4 h-4 text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
              </div>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
              aria-label="Télécharger une photo"
              title="Télécharger une photo"
            />
          </div>
        </div>
      </div>

      {/* ─── Calendar Header ─── */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-foreground capitalize">{monthName}</h3>
        <div className="flex items-center gap-1">
          <button onClick={prev} aria-label="Mois précédent" title="Mois précédent" className="p-1 rounded-lg hover:bg-accent/50 transition-colors">
            <ChevronLeft className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
          </button>
          <button onClick={next} aria-label="Mois suivant" title="Mois suivant" className="p-1 rounded-lg hover:bg-accent/50 transition-colors">
            <ChevronRight className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
          </button>
          <button onClick={() => setCurrentMonth(new Date())} className="ml-2 text-[10px] font-bold text-primary uppercase tracking-widest hover:text-primary/90 transition-colors">
            {t("today") || "Aujourd'hui"}
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-muted-foreground mb-2 uppercase">
        {weekDays.map((d) => (
          <div key={d} className="py-1">{d}</div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 mb-6">
        {days.map((day, i) => {
          if (!day) return <div key={i} className="py-2" />;
          const ds = dateStr(day);
          const dayVisits = visitsByDate[ds] || [];
          const hasVisit = dayVisits.length > 0;
          const isSunday = new Date(year, month, day).getDay() === 0;
          return (
            <button
              key={i}
              onClick={() => hasVisit && onVisitClick(dayVisits[0])}
              className={`relative py-2 text-xs font-semibold rounded-full transition-all flex items-center justify-center h-8 w-8 mx-auto ${
                isToday(day)
                  ? "bg-[#ff8c00] text-primary-foreground font-bold shadow-lg"
                  : hasVisit
                  ? "text-blue-600 dark:text-blue-300 font-bold bg-blue-500/15 hover:bg-blue-500/25 border border-blue-400/40"
                  : isSunday
                  ? "text-rose-600 dark:text-rose-400 font-bold hover:bg-rose-500/10"
                  : "text-foreground hover:bg-accent/50"
              }`}
            >
              {day}
              {hasVisit && !isToday(day) && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-blue-600 dark:bg-blue-300" />
              )}
            </button>
          );
        })}
      </div>

      {/* ─── Alertes Haute Priorité ─── */}
      {(() => {
        const now = new Date();
        const later = new Date(now);
        later.setDate(later.getDate() + 60);
        const missingHousing = visits.filter(v => {
          const vd = new Date(v.visitDate);
          if (vd < now || vd > later || v.status === "cancelled") return false;
          const isLocal = v.localSpeaker || (congregation?.name && v.congregation?.toLowerCase().trim() === congregation.name.toLowerCase().trim());
          if (isLocal) return false;
          return !(v.hostAssignments || []).some(ha => ha.role === 'hebergement');
        });

        if (missingHousing.length === 0) return null;

        return (
          <div className="mb-6">
            <button 
              onClick={() => {
                setActiveTab("planning");
              }}
              className="w-full bg-rose-50 dark:bg-[#93000a]/20 border border-rose-300 dark:border-[#93000a]/50 p-4 rounded-xl flex justify-between items-center cursor-pointer hover:bg-rose-100 dark:hover:bg-[#93000a]/30 transition-all group shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 bg-rose-500 dark:bg-[#ffb4ab] rounded-full animate-pulse" />
                <div className="flex flex-col text-left">
                  <span className="text-[10px] text-rose-800 dark:text-[#ffb4ab] font-bold uppercase tracking-widest">Priorité Haute</span>
                  <span className="text-xs font-semibold text-rose-950 dark:text-[#ffdad6]">
                    {missingHousing.length} {missingHousing.length > 1 ? "visites sans hébergement" : "visite sans hébergement"}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-rose-700 dark:text-[#ffb4ab] transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        );
      })()}

      {/* ─── Programme du jour ─── */}
      <div className="mb-6 flex flex-col gap-3">
        <span className="text-xs font-bold text-foreground uppercase tracking-wider">{t("program_today") || "Programme du jour"}</span>
        <div className="flex flex-col gap-2">
          <p className="text-[10px] text-muted-foreground font-bold uppercase">{todayDateStr}</p>
          {todayVisits.length === 0 ? (
            <div className="p-4 border border-border/50 rounded-lg text-center bg-muted">
              <p className="text-xs text-muted-foreground italic">{t("no_visits_today") || "Aucune visite aujourd'hui"}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {todayVisits.map((v) => (
                <button key={v.visitId} onClick={() => onVisitClick(v)} className="w-full flex items-center gap-3 text-left bg-muted hover:bg-accent/50 border border-border/50 rounded-xl p-3.5 transition-colors">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-primary">{v.heure_visite || "11:30"}</p>
                    <p className="text-xs font-bold text-foreground truncate">{v.nom}</p>
                    <p className="text-[10px] text-muted-foreground font-medium truncate">{v.talkTheme || v.congregation}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── Messages du jour ─── */}
      {todayVisits.length > 0 && (
        <div className="mb-6 bg-muted border border-border/30 p-4 rounded-xl flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t("messages_today") || "Messages du jour"}</span>
            <button onClick={() => setShowMessages(!showMessages)} className="text-[10px] font-bold text-primary">
              {showMessages ? (t("close") || "Fermer") : (t("view") || "Voir")}
            </button>
          </div>
          <AnimatePresence>
            {showMessages && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="space-y-2.5 pt-1">
                  {todayVisits.map((v) => (
                    <div key={v.visitId} className="flex items-center gap-3 border-b border-border/20 pb-2 last:border-0 last:pb-0">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <User className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-foreground truncate">{v.nom}</p>
                        <p className="text-[11px] text-muted-foreground font-medium truncate">{v.congregation}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => sendQuickWhatsApp(v)}
                          title="Envoyer rappel WhatsApp"
                          className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 transition-colors"
                        >
                          <Send className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => onVisitClick(v)}
                          title="Voir détails"
                          className="p-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-colors"
                        >
                          <Mail className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ─── Rappels à venir ─── */}
      <div className="bg-muted border border-border/50 p-4 rounded-xl flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t("upcoming_reminders") || "Rappels à venir"}</span>
          <button onClick={() => setShowReminders(!showReminders)} className="text-[10px] font-bold text-primary">
            {showReminders ? (t("close") || "Fermer") : (t("view") || "Voir")}
          </button>
        </div>
        <AnimatePresence>
          {showReminders && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="space-y-3 pt-2">
                {upcomingReminders.length === 0 && (
                  <p className="text-xs text-muted-foreground italic">{t("no_visits") || "Aucune visite"}</p>
                )}
                {upcomingReminders.map((v, index) => {
                  const d = new Date(v.visitDate);
                  const daysUntil = Math.ceil((d.getTime() - today.getTime()) / 86400000);
                  const dateLabel = d.toLocaleDateString(locale, { weekday: "long", day: "2-digit", month: "2-digit" }).toUpperCase();
                  
                  // Color codes from mockup
                  const colors = ["border-primary", "border-blue-400", "border-purple-400"];
                  const borderClass = colors[index % colors.length];
                  
                  return (
                    <button 
                      key={v.visitId} 
                      onClick={() => onVisitClick(v)} 
                      className={`w-full text-left bg-card p-3.5 rounded-xl border-l-4 ${borderClass} border border-border/60 hover:bg-accent/40 transition-colors flex flex-col shadow-2xs`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-bold text-foreground">{v.nom}</span>
                        <span className="text-[10px] font-bold text-primary">J-{daysUntil}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground font-semibold uppercase mb-1">{dateLabel} - {v.congregation}</p>
                      {v.talkTheme && (
                        <p className="text-[11px] text-foreground/80 italic truncate w-full font-medium">{v.talkTheme}</p>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
