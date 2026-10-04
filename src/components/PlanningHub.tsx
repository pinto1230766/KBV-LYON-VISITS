import { useState, useMemo, useEffect, useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import {
  Plus, Archive, Info, Users, MessageSquare, CreditCard, Star, X, Calendar, CalendarDays, Mic,
} from "lucide-react";
import { generateVisitIcs, generateScheduleIcs, downloadOrShareIcs } from "../lib/icalendar";
import type { LucideIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useVisitStore } from "../store/useVisitStore";
import { useSettingsStore } from "../store/useSettingsStore";
import { useUIStore } from "../store/useUIStore";
import { useSpeakerStore } from "../store/useSpeakerStore";
import { useHostStore } from "../store/useHostStore";
import { useAudioStore } from "../store/useAudioStore";
import { useTranslation } from "../hooks/useTranslation";
import { toast } from "sonner";
import type { Visit, VisitStatus, HostAssignment } from "../store/visitTypes";
import { generateId } from "../lib/sheetUtils";
import { isEventVisit } from "../lib/eventDetection";
import {
  roleColor as roleColorHelper,
  formatDateFull as formatDateFullHelper,
  formatDayOnly as formatDayOnlyHelper,
} from "../lib/planningHelpers";
import { resolveVariables as resolveVariablesHelper } from "../lib/variableResolver";
import { VisitCard } from "./planning/VisitCard";
import { AddVisitForm } from "./planning/AddVisitForm";
import { DeleteConfirmDialog } from "./planning/DeleteConfirmDialog";
import { ExpensesTab } from "./planning/ExpensesTab";
import { FeedbackTab } from "./planning/FeedbackTab";
import { MessagesTab } from "./planning/MessagesTab";
import { HostsTab } from "./planning/HostsTab";
import { InfosTab } from "./planning/InfosTab";
import { CompanionsTab } from "./planning/CompanionsTab";
import { SamsungVoiceRecorderModal } from "./audio/SamsungVoiceRecorderModal";

type DetailTab = "infos" | "hosts" | "companions" | "messages" | "expenses" | "feedback";


export function PlanningHub() {
  const visits = useVisitStore(useShallow((s) => s.visits));
  const addVisit = useVisitStore((s) => s.addVisit);
  const updateVisit = useVisitStore((s) => s.updateVisit);
  const deleteVisit = useVisitStore((s) => s.deleteVisit);
  const pendingVisitId = useUIStore((s) => s.pendingVisitId);
  const setPendingVisit = useUIStore((s) => s.setPendingVisit);
  const congregation = useSettingsStore((s) => s.settings.congregation);
  const speakers = useSpeakerStore(useShallow((s) => s.speakers));
  const updateSpeaker = useSpeakerStore((s) => s.updateSpeaker);
  const allHosts = useHostStore(useShallow((s) => s.hosts));
  const openRecorder = useAudioStore((s) => s.openRecorder);
  const { t, language } = useTranslation();

  const [showForm, setShowForm] = useState(false);
  const [editingVisit, setEditingVisit] = useState<Visit | null>(null);
  const [viewVisit, setViewVisit] = useState<Visit | null>(null);
  const [detailTab, setDetailTab] = useState<DetailTab>("infos");
  const [showArchived, setShowArchived] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);



  // Detail form
  const [detailForm, setDetailForm] = useState<Partial<Visit>>({});
  // Messages
  const [messageText, setMessageText] = useState("");
  const [selectedRecipient, setSelectedRecipient] = useState("orateur");
  const [templateLang, setTemplateLang] = useState(language);
  // Expenses
  const [newExpenseLabel, setNewExpenseLabel] = useState("");
  const [newExpenseAmount, setNewExpenseAmount] = useState("");
  const [newExpenseCategory, setNewExpenseCategory] = useState("carburant");
  // Host assignment
  const [showAssignHost, setShowAssignHost] = useState(false);
  const [assignHostId, setAssignHostId] = useState("");
  const [assignRole, setAssignRole] = useState<HostAssignment["role"]>("hebergement");
  const [assignDay, setAssignDay] = useState("");
  const [assignTime, setAssignTime] = useState("");
  const [assignCompanionId, setAssignCompanionId] = useState<string>("");
  const [editingHostIdx, setEditingHostIdx] = useState<number | null>(null);

  const locale = language === "pt" ? "pt-PT" : language === "cv" ? "pt-CV" : "fr-FR";

  const { upcomingVisits, archivedVisits } = useMemo(() => {
    const now = new Date();
    const sorted = [...visits].sort((a, b) => new Date(a.visitDate).getTime() - new Date(b.visitDate).getTime());
    const upcoming = sorted.filter((v) => new Date(v.visitDate) >= now || v.status === "scheduled" || v.status === "confirmed");
    const archived = sorted.filter((v) => v.status === "completed" || v.status === "cancelled");
    return { upcomingVisits: upcoming, archivedVisits: archived };
  }, [visits]);

  const displayedVisits = showArchived ? archivedVisits : upcomingVisits;

  const [form, setForm] = useState({
    nom: "", congregation: "", visitDate: "", talkNoOrType: "", talkTheme: "",
    locationType: "kingdom_hall" as Visit["locationType"],
    speakerPhone: "", notes: "", status: "scheduled" as VisitStatus, heure_visite: congregation?.time || "11:30",
  });

  // Helper to find the last date a host was assigned
  const getHostLastVisitDate = (hostId: string) => {
    const assignments = visits
      .filter(v => v.status !== "cancelled")
      .flatMap(v => (v.hostAssignments || []).map(ha => ({ ...ha, visitDate: v.visitDate })))
      .filter(ha => ha.hostId === hostId && new Date(ha.visitDate) < new Date());
    
    if (assignments.length === 0) return null;
    const last = assignments.sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime())[0];
    return last.visitDate;
  };

  const resetForm = () => {
    setForm({ nom: "", congregation: "", visitDate: "", talkNoOrType: "", talkTheme: "", locationType: "kingdom_hall", speakerPhone: "", notes: "", status: "scheduled", heure_visite: congregation?.time || "11:30" });
    setEditingVisit(null);
    setShowForm(false);
  };

  const handleSubmit = () => {
    if (!form.nom || !form.visitDate) return;
    const matchingSpeaker = speakers.find((s) => s.nom.toLowerCase() === form.nom.toLowerCase());
    const enriched = {
      ...form,
      speakerPhone: form.speakerPhone || matchingSpeaker?.telephone || "",
      localSpeaker: form.nom && matchingSpeaker?.localSpeaker ? true : (form as Visit).localSpeaker,
    };
    if (editingVisit) {
      updateVisit(editingVisit.visitId, enriched);
      toast.success(t("visit_updated"));
    } else {
      addVisit({ ...enriched, visitId: generateId() } as Visit);
      toast.success(t("visit_added"));
    }
    
    // Also sync the typed phone number back to the speaker database if speaker exists
    if (matchingSpeaker && form.speakerPhone) {
      updateSpeaker(matchingSpeaker.id, {
        ...matchingSpeaker,
        telephone: form.speakerPhone,
      });
    }
    
    resetForm();
  };

  const handleDelete = (visitId: string) => {
    deleteVisit(visitId);
    setConfirmDeleteId(null);
    setViewVisit(null);
    toast.success(t("visit_deleted"));
  };

  const getSpeakerForVisit = useCallback((visit: Visit) => 
    speakers.find((s) => s.nom.toLowerCase() === visit.nom.toLowerCase()),
  [speakers]);

  const openDetail = useCallback((visit: Visit) => {
    setViewVisit(visit);
    // Format dates for date inputs (yyyy-MM-dd)
    const formatDateForInput = (dateStr?: string) => {
      if (!dateStr) return "";
      // If already in yyyy-MM-dd format, return as-is
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
      // If ISO format, extract just the date part
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "";
      return d.toISOString().split("T")[0];
    };
    const sp = getSpeakerForVisit(visit);
    setDetailForm({ 
      ...visit,
      visitDate: formatDateForInput(visit.visitDate),
      date_arrivee: formatDateForInput(visit.date_arrivee),
      date_depart: formatDateForInput(visit.date_depart),
      transportType: visit.transportType || "car",
      speakerPhone: visit.speakerPhone || sp?.telephone || "",
      childrenCount: visit.childrenCount ?? sp?.childrenCount,
      childrenAges: visit.childrenAges ?? sp?.childrenAges,
      childrenDietary: visit.childrenDietary,
      speakerDietary: visit.speakerDietary ?? sp?.dietary,
      spouseDietary: visit.spouseDietary ?? sp?.spouseDietary,
    });
    setDetailTab("infos");
    setMessageText("");
    setSelectedRecipient("orateur");
    setTemplateLang(language);
    setShowAssignHost(false);
  }, [language, setViewVisit, setDetailForm, setDetailTab, setMessageText, setSelectedRecipient, setTemplateLang, setShowAssignHost, getSpeakerForVisit]);

  // Auto-open visit when clicking from calendar (without scroll)
  useEffect(() => {
    if (pendingVisitId) {
      const visit = visits.find((v) => v.visitId === pendingVisitId);
      if (visit) {
        openDetail(visit);
        setPendingVisit(null); // Clear pending after opening
      }
    }
  }, [pendingVisitId, visits, setPendingVisit, openDetail]);

  const saveDetail = () => {
    if (!viewVisit) return;
    updateVisit(viewVisit.visitId, detailForm);
    
    // Sync children, phone and dietary info back to speaker if changed
    const speaker = getSpeakerForVisit(viewVisit);
    if (speaker) {
      updateSpeaker(speaker.id, {
        ...speaker,
        telephone: detailForm.speakerPhone,
        childrenCount: detailForm.childrenCount,
        childrenAges: detailForm.childrenAges,
        dietary: detailForm.speakerDietary,
        spouseDietary: detailForm.spouseDietary,
      });
    }
    
    toast.success(t("visit_updated"));
    setViewVisit(null);
  };

  const closeDetail = () => { setViewVisit(null); setDetailForm({}); };


  const roleColor = roleColorHelper;

  // Add expense
  const addExpense = () => {
    if (!newExpenseLabel || !newExpenseAmount) return;
    const expenses = [...(detailForm.expenses || []), { id: generateId(), label: newExpenseLabel, amount: parseFloat(newExpenseAmount) || 0, category: newExpenseCategory }];
    setDetailForm({ ...detailForm, expenses });
    setNewExpenseLabel("");
    setNewExpenseAmount("");
  };

  const removeExpense = (id: string) => {
    setDetailForm({ ...detailForm, expenses: (detailForm.expenses || []).filter((e) => e.id !== id) });
  };

  const totalExpenses = (detailForm.expenses || []).reduce((sum, e) => sum + e.amount, 0);

  // Add host assignment
  const addHostAssignment = () => {
    if (!assignHostId) return;
    const host = allHosts.find((h) => h.id === assignHostId);
    if (!host) return;

    // Conflict detection: check if host is already assigned to another visit on the same day
    const hasConflict = visits.some(v => 
      v.visitId !== viewVisit?.visitId && 
      v.status !== "cancelled" &&
      v.hostAssignments?.some(ha => ha.hostId === host.id && ha.day === assignDay)
    );
    
    if (hasConflict && assignDay) {
      const confirmMsg = templateLang === "cv" ? `⚠️ ${host.nom} dja sta atribuidu na otu vizita na dia ${formatDateFull(assignDay)}. Bu kre kontinia?` : 
                        templateLang === "pt" ? `⚠️ ${host.nom} já está atribuído(a) a outra visita no dia ${formatDateFull(assignDay)}. Deseja continuar?` :
                        `⚠️ ${host.nom} est déjà assigné(e) à une autre visite le ${formatDateFull(assignDay)}. Voulez-vous continuer ?`;
      if (!window.confirm(confirmMsg)) return;
    }

    const groupSize = assignCompanionId ? 1 : (1 + (isCouple ? 1 : 0) + childrenCount);

    // Capacity check - ONLY for hebergement as requested
    if (assignRole === "hebergement" && host.capacity && groupSize > host.capacity) {
      const capacityMsg = templateLang === "cv" ? `⚠️ ${host.nom} ten kapasidadi pa ${host.capacity} pesoas, mas bu ten ${groupSize}. Kontinia?` :
                         templateLang === "pt" ? `⚠️ ${host.nom} tem capacidade para ${host.capacity} pessoas, mas vous avez ${groupSize}. Continuar?` :
                         `⚠️ ${host.nom} n'a une capacité que de ${host.capacity} personnes, mais vous en avez ${groupSize}. Continuer ?`;
      if (!window.confirm(capacityMsg)) return;
    }

    const currentCompanion = (detailForm.companions || []).find((c) => c.id === assignCompanionId);

    const newAssignment: HostAssignment = {
      hostId: host.id, hostName: host.nom, hostPhone: host.telephone,
      hostEmail: host.email, hostAddress: host.adresse,
      hostPhotoUrl: host.photoUrl, role: assignRole, day: assignDay, time: assignTime,
      companionId: assignCompanionId || undefined,
      companionName: currentCompanion ? currentCompanion.nom : undefined,
    };
    setDetailForm({ ...detailForm, hostAssignments: [...(detailForm.hostAssignments || []), newAssignment] });
    setShowAssignHost(false);
    setAssignHostId("");
    setAssignDay("");
    setAssignTime("");
    setAssignCompanionId("");
  };

  const removeHostAssignment = (idx: number) => {
    const updated = [...(detailForm.hostAssignments || [])];
    updated.splice(idx, 1);
    setDetailForm({ ...detailForm, hostAssignments: updated });
  };

  const updateHostAssignment = (idx: number, field: string, value: string) => {
    const updated = [...(detailForm.hostAssignments || [])];
    updated[idx] = { ...updated[idx], [field]: value };
    setDetailForm({ ...detailForm, hostAssignments: updated });
  };

  const copyText = async (text: string) => {
    try {
      // Create HTML version of the text
      let htmlText = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\n/g, "<br>");

      // Regex to find "Raccourci Google Maps : (https?://)?(maps.google.com/[a-zA-Z0-9./?+=\-,&;%]+)"
      // and turn it into <a href="https://maps.google.com/...">Raccourci Google Maps</a>
      const mapsRegex = /(Raccourci Google Maps\s*:\s*)(https?:\/\/)?(maps\.google\.com\/[a-zA-Z0-9./?+=\-,&;%]+)/g;
      if (mapsRegex.test(text)) {
        htmlText = text
          .replace(mapsRegex, (_match, _prefix, _protocol, urlPath) => {
            return `<a href="https://${urlPath}">Raccourci Google Maps</a>`;
          })
          .replace(/\n/g, "<br>");
      }

      const ClipboardItem = (window as unknown as { ClipboardItem?: new (items: Record<string, Blob>) => ClipboardItem }).ClipboardItem;
      if (ClipboardItem) {
        const textBlob = new Blob([text], { type: "text/plain" });
        const htmlBlob = new Blob([htmlText], { type: "text/html" });
        await navigator.clipboard.write([
          new ClipboardItem({
            "text/plain": textBlob,
            "text/html": htmlBlob
          })
        ]);
      } else {
        await navigator.clipboard.writeText(text);
      }
      toast.success(t("copied"));
    } catch {
      navigator.clipboard.writeText(text);
      toast.success(t("copied"));
    }
  };

  const sendWhatsApp = async (phone: string, text: string) => {
    // Always copy message first using our rich copy
    await copyText(text);
    const cleaned = phone.replace(/\s/g, "");
    
    // Use https://api.whatsapp.com/send which is more robust for cross-platform app triggering
    const baseUrl = (phone === WHATSAPP_INVITE_ID || phone.length < 6) 
      ? `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`
      : `https://api.whatsapp.com/send?phone=${cleaned}&text=${encodeURIComponent(text)}`;

    const a = document.createElement("a");
    a.href = baseUrl; 
    a.target = "_blank"; 
    a.rel = "noopener noreferrer";
    document.body.appendChild(a); 
    a.click(); 
    document.body.removeChild(a);
    
    toast.success(phone === WHATSAPP_INVITE_ID ? "✅ Message copié – Choisissez le groupe" : "✅ Message copié + WhatsApp ouvert");
  };

  const { settings } = useSettingsStore();
  const WHATSAPP_INVITE_ID = settings.congregation.whatsappInviteId || "Di5J5Jl4VjU4e9QURFHsrf";

  // Get recipients for messages
  const getRecipients = () => {
    const recipients: Array<{ label: string; phone: string; type: string; hostName?: string }> = [];
    if (detailForm.speakerPhone) {
      recipients.push({ label: `🎤 ${viewVisit?.nom || t("speaker_label")}`, phone: detailForm.speakerPhone, type: "orateur" });
    }
    (detailForm.hostAssignments || []).forEach((ha, i) => {
      if (ha.hostPhone) {
        const roleEmoji = ha.role === "hebergement" ? "🏠" : ha.role === "transport" ? "🚗" : ha.role === "visite_lyon" ? "📍" : "🍽️";
        recipients.push({ label: `${roleEmoji} ${ha.hostName || ""} (${t(ha.role)})`, phone: ha.hostPhone, type: `host_${i}`, hostName: ha.hostName });
      }
    });
    recipients.push({ label: "👥 Groupe WhatsApp", phone: WHATSAPP_INVITE_ID, type: "groupe" });
    return recipients;
  };


  // Format a date string to French full format
  // Format a date string to specific locale
  const formatDateFull = (dateStr?: string, forcedLocale?: string) =>
    formatDateFullHelper(dateStr, locale, forcedLocale);
  const formatDayOnly = (dateStr?: string, forcedLocale?: string) =>
    formatDayOnlyHelper(dateStr, locale, forcedLocale);

  // Total people calculation (used for messages and capacity warnings)
  const currentSpeaker = viewVisit ? getSpeakerForVisit(viewVisit) : null;
  const isCouple = currentSpeaker?.householdType === "couple";
  const childrenCount = detailForm.childrenCount ?? currentSpeaker?.childrenCount ?? 0;

  // Resolve all template variables with real data (extracted to lib/variableResolver)
  const resolveVariables = (text: string): string => {
    if (!viewVisit) return text;
    return resolveVariablesHelper(text, {
      viewVisit,
      detailForm,
      templateLang,
      speakers,
      congregation,
      formatDateFull,
      formatDayOnly,
      t,
    });
  };

  const detailTabs: Array<{ id: DetailTab; label: string; icon: LucideIcon }> = [
    { id: "infos", label: t("infos"), icon: Info },
    { id: "companions", label: t("companions_tab"), icon: Users },
    { id: "hosts", label: t("hosts"), icon: Users },
    { id: "messages", label: t("messages_tab"), icon: MessageSquare },
    { id: "expenses", label: t("expenses"), icon: CreditCard },
    { id: "feedback", label: t("feedback_label"), icon: Star },
  ];

  const visibleDetailTabs = isEventVisit(viewVisit)
    ? detailTabs.filter((tab) => tab.id === "infos" || tab.id === "messages")
    : detailTabs;

  useEffect(() => {
    if (isEventVisit(viewVisit) && !visibleDetailTabs.some((t) => t.id === detailTab)) {
      setDetailTab("infos");
    }
  }, [viewVisit, detailTab, visibleDetailTabs]);

  const handleExportFullScheduleIcs = async () => {
    try {
      const activeVisits = upcomingVisits.length > 0 ? upcomingVisits : visits;
      if (activeVisits.length === 0) {
        toast.info(t("no_visits") || "Aucune visite à exporter");
        return;
      }
      const ics = generateScheduleIcs(activeVisits, congregation);
      await downloadOrShareIcs("planning-visites-kbv.ics", ics, "Planning Visites KBV Lyon");
      toast.success(t("schedule_exported_ics") || "Planning exporté vers l'agenda (.ics) !");
    } catch {
      toast.error("Erreur lors de l'export du calendrier");
    }
  };

  const handleExportSingleVisitIcs = async () => {
    if (!viewVisit) return;
    try {
      const ics = generateVisitIcs(viewVisit, congregation);
      const safeName = (viewVisit.nom || "visite").replace(/[^a-zA-Z0-9_-]/g, "_");
      const filename = `visite-${viewVisit.visitDate}-${safeName}.ics`;
      await downloadOrShareIcs(filename, ics, `Visite ${viewVisit.nom}`);
      toast.success(t("visit_exported_ics") || "Visite exportée vers l'agenda (.ics) !");
    } catch {
      toast.error("Erreur lors de l'export de la visite");
    }
  };

  return (
    <div className="py-2 sm:py-4 space-y-6">
      {/* Apple Large Title & Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            {t("planning") || "Planning"}
          </h1>
          <p className="text-sm font-medium text-muted-foreground mt-1">
            {upcomingVisits.length} {upcomingVisits.length > 1 ? "visites programmées" : "visite programmée"}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Apple iOS Segmented Control */}
          <div className="ios-segmented">
            <button
              onClick={() => setShowArchived(false)}
              className={`ios-segmented-btn ${!showArchived ? "active" : ""}`}
            >
              {t("upcoming") || "À venir"} ({upcomingVisits.length})
            </button>
            <button
              onClick={() => setShowArchived(true)}
              className={`ios-segmented-btn ${showArchived ? "active" : ""}`}
            >
              <Archive className="w-3.5 h-3.5 inline mr-1" />
              {t("archived") || "Archivés"} ({archivedVisits.length})
            </button>
          </div>

          {/* Export Full Schedule to iCalendar */}
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={handleExportFullScheduleIcs}
            className="flex items-center gap-1.5 bg-muted/80 hover:bg-muted text-foreground px-3.5 py-2 rounded-full font-semibold border border-border/60 transition-all text-xs sm:text-sm touch-manipulation shadow-2xs"
            title={t("export_all_ics") || "Exporter tout le planning vers l'agenda (.ics)"}
          >
            <CalendarDays className="w-4 h-4 flex-shrink-0 text-primary" />
            <span className="hidden xs:inline">{t("export_ics") || "Exporter (.ics)"}</span>
          </motion.button>

          {/* Apple Action Button */}
          <motion.button 
            whileTap={{ scale: 0.94 }} 
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-full font-semibold hover:opacity-95 transition-all shadow-md shadow-primary/25 text-xs sm:text-sm touch-manipulation"
          >
            <Plus className="w-4 h-4 flex-shrink-0 stroke-[2.5]" /> 
            <span>{t("add") || "Ajouter"}</span>
          </motion.button>
        </div>
      </div>

      {/* Visit Grid */}
      {displayedVisits.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground/60 italic"><p className="text-sm">{t("no_visits")}</p></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {displayedVisits.map((visit, i) => (
              <VisitCard
                key={visit.visitId}
                visit={visit}
                index={i}
                locale={locale}
                allVisits={visits}
                getSpeakerForVisit={getSpeakerForVisit}
                t={t}
                onOpen={openDetail}
                onConfirm={(id) => { updateVisit(id, { status: "confirmed" }); toast.success(t("visit_confirmed")); }}
                onAskDelete={(id) => setConfirmDeleteId(id)}
                congregationName={congregation?.name}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ============ VISIT DETAIL MODAL ============ */}
      <AnimatePresence>
        {viewVisit && (() => {
          const hostCount = (detailForm.hostAssignments || []).length;
          return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 md:p-margin_edge" onClick={closeDetail}>
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-[1200px] max-h-[95dvh] ios-glass rounded-[28px] border border-border/70 flex flex-col overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="ios-grabber md:hidden" />
                <div className="flex-1 flex flex-col overflow-hidden min-h-0">
                  {/* Header & Tabs */}
                  <div className="flex flex-col border-b border-border/60 px-4 md:px-gutter pt-3 md:pt-card_padding pb-0 shrink-0 bg-surface-container/50">
                    <div className="flex justify-between items-start mb-4 md:mb-6">
                      <div className="text-left">
                        <h1 className="font-headline-lg text-xl xs:text-2xl md:text-headline-lg text-on-surface mb-1">{t("visit_details")}</h1>
                        <p className="font-body-md text-xs xs:text-sm md:text-body-md text-on-surface-variant flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                          {t("scheduled_visit_for")} {viewVisit.nom}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openRecorder(viewVisit)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-600/10 hover:bg-red-600/20 text-red-600 dark:text-red-400 border border-red-500/30 font-semibold text-xs transition-all active:scale-95 touch-manipulation shadow-2xs"
                          title="Enregistrer en audio le discours du frère (Samsung Voice Recorder)"
                        >
                          <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                          <Mic className="w-3.5 h-3.5 text-red-500" />
                          <span className="hidden sm:inline">Enregistrer le discours</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-red-500/20 text-red-500 font-black uppercase">Samsung Rec</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleExportSingleVisitIcs}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/25 font-semibold text-xs transition-all active:scale-95 touch-manipulation shadow-2xs"
                          title={t("export_visit_ics") || "Ajouter cette visite à l'agenda (.ics)"}
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">{t("add_to_calendar") || "Agenda (.ics)"}</span>
                        </button>
                        <button 
                          onClick={closeDetail} 
                          className="w-8 h-8 rounded-full flex items-center justify-center bg-muted/80 hover:bg-muted transition-all text-foreground active:scale-90 touch-manipulation shadow-2xs"
                          title="Fermer"
                          aria-label="Fermer la fiche"
                        >
                          <X className="w-4 h-4 stroke-[2.5]" />
                        </button>
                      </div>
                    </div>

                    {/* Tabs */}
                    <nav className="flex gap-4 md:gap-8 font-label-md text-label-md overflow-x-auto hide-scrollbar w-full">
                      {visibleDetailTabs.map((tab) => {
                        const isActive = detailTab === tab.id;
                        return (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setDetailTab(tab.id)}
                            className={`pb-4 px-2 tracking-wider transition-colors uppercase whitespace-nowrap shrink-0 ${
                              isActive ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {tab.label}
                          </button>
                        );
                      })}
                    </nav>
                  </div>

                    {/* Scrollable Content Area */}
                    <div className="flex-1 min-h-0 overflow-y-auto p-4 md:p-gutter pb-8 md:pb-12 overscroll-contain">
                      {/* ---- INFOS TAB ---- */}
                      {detailTab === "infos" && (
                        <InfosTab
                          viewVisit={viewVisit}
                          detailForm={detailForm}
                          setDetailForm={setDetailForm}
                          visits={visits}
                          locale={locale}
                          t={t}
                          congregationName={congregation?.name}
                        />
                      )}

                      {/* ---- COMPANIONS TAB ---- */}
                      {detailTab === "companions" && (
                        <CompanionsTab
                          detailForm={detailForm}
                          setDetailForm={setDetailForm}
                          t={t}
                        />
                      )}

                      {/* ---- HOSTS TAB ---- */}
                      {detailTab === "hosts" && (
                        <HostsTab
                          viewVisit={viewVisit}
                          detailForm={detailForm}
                          setDetailForm={setDetailForm}
                          currentSpeaker={currentSpeaker}
                          hostCount={hostCount}
                          allHosts={allHosts}
                          locale={locale}
                          editingHostIdx={editingHostIdx}
                          setEditingHostIdx={setEditingHostIdx}
                          showAssignHost={showAssignHost}
                          setShowAssignHost={setShowAssignHost}
                          assignHostId={assignHostId}
                          setAssignHostId={setAssignHostId}
                          assignRole={assignRole}
                          setAssignRole={setAssignRole}
                          assignDay={assignDay}
                          setAssignDay={setAssignDay}
                          assignTime={assignTime}
                          setAssignTime={setAssignTime}
                          assignCompanionId={assignCompanionId}
                          setAssignCompanionId={setAssignCompanionId}
                          addHostAssignment={addHostAssignment}
                          removeHostAssignment={removeHostAssignment}
                          updateHostAssignment={updateHostAssignment}
                          getHostLastVisitDate={getHostLastVisitDate}
                          sendWhatsApp={sendWhatsApp}
                          roleColor={roleColor}
                          t={t}
                        />
                      )}

                      {/* ---- MESSAGES TAB ---- */}
                      {detailTab === "messages" && (
                        <MessagesTab
                          viewVisit={viewVisit}
                          detailForm={detailForm}
                          currentSpeaker={currentSpeaker}
                          recipients={getRecipients()}
                          selectedRecipient={selectedRecipient}
                          setSelectedRecipient={setSelectedRecipient}
                          messageText={messageText}
                          setMessageText={setMessageText}
                          templateLang={templateLang as "fr" | "cv" | "pt"}
                          setTemplateLang={setTemplateLang}
                          resolveVariables={resolveVariables}
                          copyText={copyText}
                          sendWhatsApp={sendWhatsApp}
                          t={t}
                        />
                      )}

                      {/* ---- EXPENSES TAB ---- */}
                      {detailTab === "expenses" && (
                        <ExpensesTab
                          detailForm={detailForm}
                          totalExpenses={totalExpenses}
                          removeExpense={removeExpense}
                          newExpenseLabel={newExpenseLabel}
                          setNewExpenseLabel={setNewExpenseLabel}
                          newExpenseAmount={newExpenseAmount}
                          setNewExpenseAmount={setNewExpenseAmount}
                          newExpenseCategory={newExpenseCategory}
                          setNewExpenseCategory={setNewExpenseCategory}
                          addExpense={addExpense}
                          t={t}
                        />
                      )}

                      {detailTab === "feedback" && (
                        <FeedbackTab
                          detailForm={detailForm}
                          setDetailForm={setDetailForm}
                          t={t}
                        />
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div className="border-t border-white/10 px-gutter py-4 shrink-0 bg-surface-container/50 flex justify-end gap-4">
                      <button type="button" onClick={closeDetail} className="px-6 py-3 rounded-lg border border-secondary/30 text-secondary font-label-md text-label-md hover:bg-secondary/10 transition-colors uppercase">
                        {t("cancel") || "Annuler"}
                      </button>
                      <button type="button" onClick={saveDetail} className="px-6 py-3 rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 uppercase font-bold active:scale-95">
                        {t("save_changes") || "Enregistrer les modifications"}
                      </button>
                    </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* Quick Add Form */}
      <AnimatePresence>
        {showForm && (
          <AddVisitForm form={form} setForm={setForm} onSubmit={handleSubmit} onCancel={resetForm} t={t} />
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {confirmDeleteId && (
          <DeleteConfirmDialog
            onConfirm={() => handleDelete(confirmDeleteId)}
            onCancel={() => setConfirmDeleteId(null)}
            t={t}
          />
        )}
      </AnimatePresence>

      {/* Samsung Galaxy Tab S10 / S26 Ultra Voice Recorder Modal */}
      <SamsungVoiceRecorderModal />
    </div>
  );
}