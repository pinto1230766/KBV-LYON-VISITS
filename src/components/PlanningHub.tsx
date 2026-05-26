import { useState, useMemo, useEffect, useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import {
  Plus, Archive, X, Info, Users, MessageSquare, CreditCard, Star, CalendarDays
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useVisitStore } from "../store/useVisitStore";
import { useSettingsStore } from "../store/useSettingsStore";
import { useUIStore } from "../store/useUIStore";
import { useSpeakerStore } from "../store/useSpeakerStore";
import { useHostStore } from "../store/useHostStore";
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

type DetailTab = "infos" | "hosts" | "messages" | "expenses" | "feedback";


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
    
    // Sync children and dietary info back to speaker if changed
    const speaker = getSpeakerForVisit(viewVisit);
    if (speaker) {
      updateSpeaker(speaker.id, {
        ...speaker,
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

    // Capacity check - ONLY for hebergement as requested
    if (assignRole === "hebergement" && host.capacity && totalPeople > host.capacity) {
      const capacityMsg = templateLang === "cv" ? `⚠️ ${host.nom} ten kapasidadi pa ${host.capacity} pesoas, mas bu ten ${totalPeople}. Kontinia?` :
                         templateLang === "pt" ? `⚠️ ${host.nom} tem capacidade para ${host.capacity} pessoas, mas você tem ${totalPeople}. Continuar?` :
                         `⚠️ ${host.nom} n'a une capacité que de ${host.capacity} personnes, mais vous en avez ${totalPeople}. Continuer ?`;
      if (!window.confirm(capacityMsg)) return;
    }

    const newAssignment: HostAssignment = {
      hostId: host.id, hostName: host.nom, hostPhone: host.telephone,
      hostEmail: host.email, hostAddress: host.adresse,
      hostPhotoUrl: host.photoUrl, role: assignRole, day: assignDay, time: assignTime,
    };
    setDetailForm({ ...detailForm, hostAssignments: [...(detailForm.hostAssignments || []), newAssignment] });
    setShowAssignHost(false);
    setAssignHostId("");
    setAssignDay("");
    setAssignTime("");
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

  const sendWhatsApp = (phone: string, text: string) => {
    // Always copy message first
    navigator.clipboard.writeText(text);
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

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(t("copied"));
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
        const roleEmoji = ha.role === "hebergement" ? "🏠" : ha.role === "transport" ? "🚗" : "🍽️";
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
  const nbAccompagnants = (detailForm.companions || []).length;
  const totalPeople = 1 + (isCouple ? 1 : 0) + childrenCount + nbAccompagnants;

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

  return (
    <div className="py-6 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="mr-auto">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t("upcoming")}</p>
          <p className="text-3xl font-black text-foreground">{upcomingVisits.length}</p>
        </div>
        <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-500 text-white text-sm font-bold hover:bg-amber-600 transition-colors shadow-lg active:scale-95">
          <Plus className="w-5 h-5 flex-shrink-0" /> {t("add")}
        </motion.button>
        <button onClick={() => setShowArchived(!showArchived)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${showArchived ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
          <Archive className="w-4 h-4" /> {t("archived")} ({archivedVisits.length})
        </button>
      </div>

      {/* Visit Grid */}
      {displayedVisits.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground"><p className="text-sm">{t("no_visits")}</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
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
        {viewVisit && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50" onClick={closeDetail}>
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
              className="w-full max-w-5xl bg-card rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
              {(() => {
                const speaker = getSpeakerForVisit(viewVisit);
                const visitD = new Date(viewVisit.visitDate);
                const dayLabel = visitD.toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long" });
                const hostCount = (detailForm.hostAssignments || []).length;
                return (
                  <div className="max-h-[90vh] flex flex-col">
                    {/* Header */}
                    <div className="ios-sheet-header">
                      <div className="flex items-start gap-4">
                        {isEventVisit(viewVisit) ? (
                          <div className="w-12 h-12 rounded-full bg-violet-500/15 flex items-center justify-center flex-shrink-0">
                            <CalendarDays className="w-6 h-6 text-violet-600" />
                          </div>
                        ) : speaker?.photoUrl ? (
                          <img src={speaker.photoUrl} alt={viewVisit.nom} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                            <Users className="w-6 h-6 text-muted-foreground/30" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h2 className="text-xl font-black text-foreground truncate">{viewVisit.nom}</h2>
                          {isEventVisit(viewVisit) ? (
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5">
                              <span className="text-[9px] bg-violet-500/15 text-violet-600 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">Événement</span>
                            </div>
                          ) : (() => {
                            const pastVisits = visits
                              .filter(v => v.nom.toLowerCase() === viewVisit.nom.toLowerCase() && v.visitId !== viewVisit.visitId && new Date(v.visitDate) < new Date(viewVisit.visitDate))
                              .sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime());
                            const lastVisit = pastVisits[0];
                            return (
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                                {speaker?.spouseName && <span className="text-xs text-primary font-medium"> avec {speaker.spouseName}</span>}
                                {lastVisit && (
                                  <span className="text-[9px] bg-muted px-1.5 py-0.5 rounded-md text-muted-foreground font-bold uppercase tracking-wider">
                                    Dernière visite : {new Date(lastVisit.visitDate).toLocaleDateString(locale, { month: 'short', year: 'numeric' })}
                                  </span>
                                )}
                              </div>
                            );
                          })()}
                          <p className="text-xs font-semibold text-muted-foreground mt-1">{dayLabel}</p>
                        </div>
                        <button onClick={closeDetail} aria-label={t("close")} className="p-1.5 rounded-xl hover:bg-muted transition-colors" title={t("close")}><X aria-hidden="true" className="w-4 h-4 text-muted-foreground" /></button>
                      </div>
                      <div className="flex gap-1 mt-4 overflow-x-auto scrollbar-hide border-b border-border pb-0 px-1">
                        {visibleDetailTabs.map((tab) => (
                          <button key={tab.id} onClick={() => setDetailTab(tab.id)}
                            className={`flex items-center gap-1.5 px-3 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors border-b-2 flex-shrink-0 -mb-[1px] ${
                              detailTab === tab.id ? "text-primary border-primary" : "text-muted-foreground border-transparent hover:text-foreground"
                            }`}>
                            <tab.icon className="w-3.5 h-3.5" />{tab.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="ios-sheet-content p-6 space-y-5">
                      {/* ---- INFOS TAB ---- */}
                      {detailTab === "infos" && (
                        <InfosTab
                          viewVisit={viewVisit}
                          detailForm={detailForm}
                          setDetailForm={setDetailForm}
                          visits={visits}
                          locale={locale}
                          saveDetail={saveDetail}
                          t={t}
                          congregationName={congregation?.name}
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
                          totalPeople={totalPeople}
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
                          addHostAssignment={addHostAssignment}
                          removeHostAssignment={removeHostAssignment}
                          updateHostAssignment={updateHostAssignment}
                          getHostLastVisitDate={getHostLastVisitDate}
                          sendWhatsApp={sendWhatsApp}
                          saveDetail={saveDetail}
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
                          saveDetail={saveDetail}
                          t={t}
                        />
                      )}

                      {detailTab === "feedback" && (
                        <FeedbackTab
                          detailForm={detailForm}
                          setDetailForm={setDetailForm}
                          saveDetail={saveDetail}
                          t={t}
                        />
                      )}
                    </div>

                    {/* Footer Fixe Apple Style */}
                    <div className="ios-sheet-footer flex items-center justify-between gap-3">
                      <button onClick={closeDetail} className="px-5 py-2.5 rounded-xl bg-muted text-muted-foreground text-xs font-bold uppercase tracking-wider hover:bg-muted/80 transition-colors">
                        {t("cancel") || "Annuler"}
                      </button>
                      <motion.button whileTap={{ scale: 0.97 }} onClick={saveDetail} className="flex-1 max-w-[200px] py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold uppercase tracking-widest shadow-md">
                        {t("save") || "Enregistrer"}
                      </motion.button>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
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
    </div>
  );
}