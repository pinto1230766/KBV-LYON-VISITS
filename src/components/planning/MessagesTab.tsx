import { motion } from "framer-motion";
import { Phone, MessageSquare, Copy, Send } from "lucide-react";
import type { Visit, Speaker } from "../../store/visitTypes";
import { messageTemplates } from "../../lib/messageTemplates";

const getStepBadgeStyles = (colorClass: string) => {
  if (colorClass.includes("blue")) {
    return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20";
  }
  if (colorClass.includes("primary")) {
    return "bg-primary/10 text-primary border border-primary/20";
  }
  if (colorClass.includes("emerald")) {
    return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20";
  }
  if (colorClass.includes("red")) {
    return "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20";
  }
  if (colorClass.includes("amber")) {
    return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20";
  }
  return "bg-muted text-muted-foreground border border-border";
};

type Lang = "fr" | "cv" | "pt";

interface Recipient {
  label: string;
  phone: string;
  type: string;
  hostName?: string;
}

interface MessagesTabProps {
  viewVisit: Visit;
  detailForm: Partial<Visit>;
  currentSpeaker: Speaker | null | undefined;
  recipients: Recipient[];
  selectedRecipient: string;
  setSelectedRecipient: (v: string) => void;
  messageText: string;
  setMessageText: (v: string) => void;
  templateLang: Lang;
  setTemplateLang: (l: Lang) => void;
  resolveVariables: (text: string) => string;
  copyText: (text: string) => void;
  sendWhatsApp: (phone: string, text: string) => void;
  t: (k: string) => string;
}

export function MessagesTab({
  viewVisit, detailForm, currentSpeaker, recipients,
  selectedRecipient, setSelectedRecipient, messageText, setMessageText,
  templateLang, setTemplateLang, resolveVariables, copyText, sendWhatsApp, t,
}: MessagesTabProps) {
  const getSelectedRecipient = () => recipients.find((r) => r.type === selectedRecipient);

  const buildGroups = () => {
    const isLocal = viewVisit.localSpeaker || currentSpeaker?.localSpeaker;
    const isOnline = detailForm.locationType === "zoom" || detailForm.locationType === "streaming";
    const stepLbl = (n: number, k: string) => `${t("step_label")} ${n} : ${t(k)}`;
    if (isLocal) {
      return [
        { step: 1, color: "bg-blue-500", label: stepLbl(1, "step_planning"), keys: ["confirmation_speaker_local"] },
        { step: 2, color: "bg-primary", label: stepLbl(2, "step_coordination"), keys: ["preparation_speaker_local"] },
        { step: 3, color: "bg-emerald-500", label: stepLbl(3, "step_after_visit"), keys: ["thanks_speaker_local"] },
        { step: 4, color: "bg-red-500", label: stepLbl(4, "step_cancellation"), keys: ["cancellation_speaker"] },
      ];
    }
    if (isOnline) {
      return [
        { step: 1, color: "bg-blue-500", label: stepLbl(1, "step_planning"), keys: ["confirmation_speaker_online"] },
        { step: 2, color: "bg-primary", label: stepLbl(2, "step_briefing_final"), keys: ["preparation_speaker_online"] },
        { step: 3, color: "bg-emerald-500", label: stepLbl(3, "step_after_visit"), keys: ["thanks_speaker_online"] },
        { step: 4, color: "bg-red-500", label: stepLbl(4, "step_cancellation"), keys: ["cancellation_speaker", "cancellation_group"] },
      ];
    }
    return [
      { step: 1, color: "bg-blue-500", label: stepLbl(1, "step_launch_search"), keys: ["confirmation_speaker", "volunteers_group"] },
      { step: 2, color: "bg-amber-500", label: stepLbl(2, "step_host_confirm"), keys: ["logistique_host"] },
      { step: 3, color: "bg-primary", label: stepLbl(3, "step_coordination"), keys: ["preparation_speaker", "preparation_group", "reminder_hosts"] },
      { step: 4, color: "bg-emerald-500", label: stepLbl(4, "step_after_visit"), keys: ["thanks_speaker"] },
      { step: 5, color: "bg-red-500", label: stepLbl(5, "step_cancellation"), keys: ["cancellation_speaker", "cancellation_group"] },
    ];
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      {detailForm.speakerPhone && (
        <div className="flex justify-end">
          <a href={`tel:${detailForm.speakerPhone}`} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-xs font-bold text-foreground hover:bg-muted transition-colors">
            <Phone className="w-4 h-4" /> {t("call")}
          </a>
        </div>
      )}

      <div className="p-4 rounded-2xl bg-primary/5 border border-primary/15 flex gap-3 text-xs text-muted-foreground leading-relaxed">
        <MessageSquare className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-foreground block mb-0.5">{t("whatsapp_redirect_title")}</span>
          {t("whatsapp_redirect_desc")}
        </div>
      </div>

      <div className="premium-card p-4 space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t("compose")}</p>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {t("recipients")}</p>
        <div className="flex flex-wrap gap-2">
          {recipients.map((r, i) => (
            <button key={i} onClick={() => { setSelectedRecipient(r.type); }}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors ${
                selectedRecipient === r.type ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>
              {r.label}
            </button>
          ))}
        </div>
        {(() => {
          const recipient = getSelectedRecipient();
          return (
            <p className="text-[10px] text-muted-foreground">
              {recipient ? `${recipient.label} · ${recipient.phone}` : viewVisit.nom}
            </p>
          );
        })()}
        <textarea ref={(el) => { if (el) { el.style.height = "auto"; el.style.height = Math.max(80, el.scrollHeight) + "px"; } }} className="input-soft text-sm min-h-[80px] max-h-[60vh] resize-y w-full" placeholder={t("write_message")} value={messageText} onChange={(e) => setMessageText(e.target.value)} />
        <div className="flex items-center justify-end gap-2">
          <button onClick={() => copyText(messageText)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border text-xs font-bold text-foreground hover:bg-muted transition-colors">
            <Copy className="w-3.5 h-3.5" /> {t("copy")}
          </button>
          <button onClick={() => { const recipient = getSelectedRecipient(); const phone = recipient?.phone || detailForm.speakerPhone || ""; if (phone) sendWhatsApp(phone, messageText); }}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider">
            <Send className="w-3.5 h-3.5" /> {t("send_whatsapp")}
          </button>
        </div>
      </div>

      <div className="space-y-6 pt-4 border-t border-border mt-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-widest text-foreground">{t("message_timeline")}</h3>
          <select className="input-soft text-xs w-28" value={templateLang} onChange={(e) => setTemplateLang(e.target.value as Lang)} title={t("language_label")}>
            <option value="fr">FR Français</option>
            <option value="cv">CV Kriolu</option>
            <option value="pt">PT Português</option>
          </select>
        </div>

        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
          {buildGroups().map((group) => (
            <div key={group.step} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-card ${getStepBadgeStyles(group.color)} font-bold shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10`}>
                {group.step}
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-border bg-card shadow-sm space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-foreground">{group.label}</h4>
                </div>

                <div className="space-y-3">
                  {group.keys.map((key) => {
                    const templates = messageTemplates[key];
                    if (!templates) return null;
                    const tmpl = templates[templateLang] || templates.fr;
                    if (typeof tmpl === "string") return null;

                    const categoryLabel = templates.category === "speaker" ? t("cat_speaker")
                      : templates.category === "logistique" ? t("cat_logistique")
                      : t("cat_groupe");

                    return (
                      <div key={key} className="bg-muted/30 rounded-xl p-3 border border-border/50 hover:border-primary/30 transition-colors">
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <div>
                            <p className="text-[9px] font-bold uppercase tracking-widest text-primary mb-1">{categoryLabel}</p>
                            <p className="text-sm font-bold text-foreground leading-tight">{tmpl.title}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{tmpl.desc}</p>
                          </div>
                          <button onClick={() => {
                            const resolved = resolveVariables(tmpl.body);
                            setMessageText(resolved);
                            if (templates.category === "speaker") setSelectedRecipient("orateur");
                            else if (templates.category === "logistique") {
                              const idx = (detailForm.hostAssignments || []).findIndex((ha) => ha.role === "repas" || ha.role === "transport" || ha.role === "hebergement");
                              setSelectedRecipient(idx >= 0 ? `host_${idx}` : "groupe");
                            } else if (templates.category === "groupe") setSelectedRecipient("groupe");
                            setTimeout(() => { const ta = document.querySelector('textarea[placeholder]'); if (ta) ta.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 100);
                          }} className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider shrink-0 hover:scale-105 active:scale-95 transition-transform">
                            Insérer
                          </button>
                        </div>
                        <p className="text-[10px] text-foreground/70 whitespace-pre-line line-clamp-3 italic">"{resolveVariables(tmpl.body)}"</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
