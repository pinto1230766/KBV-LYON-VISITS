import { useEffect, useRef } from "react";
import { useVisitStore } from "../store/useVisitStore";
import { useSettingsStore } from "../store/useSettingsStore";
import {
  useNotificationStore,
  type ReminderType,
} from "../store/useNotificationStore";
import { useSpeakerStore } from "../store/useSpeakerStore";
import { generateId } from "../lib/sheetUtils";

function diffDays(dateStr: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + "T00:00:00");
  return Math.round((target.getTime() - now.getTime()) / 86400000);
}

function buildWhatsAppMessage(
  type: ReminderType,
  speakerName: string,
  visitDate: string,
  responsableName: string,
  lang: string,
  spouseName?: string,
  householdType?: string
): string {
  const prenom = speakerName.split(" ")[0] || speakerName;
  const dateFormatted = new Date(visitDate + "T00:00:00").toLocaleDateString(
    lang === "pt" ? "pt-PT" : lang === "cv" ? "pt-CV" : "fr-FR",
    { weekday: "long", day: "numeric", month: "long" }
  );

  let salutation = "";
  if (lang === "cv") {
    salutation = `Kridu irmon ${prenom}`;
    if (householdType === "couple" && spouseName) {
      const spousePrenom = spouseName.split(" ")[0] || spouseName;
      salutation += ` i irmon-fema ${spousePrenom}`;
    }
  } else if (lang === "pt") {
    salutation = `Querido irmão ${prenom}`;
    if (householdType === "couple" && spouseName) {
      const spousePrenom = spouseName.split(" ")[0] || spouseName;
      salutation += ` e irmã ${spousePrenom}`;
    }
  } else {
    // Default to French
    salutation = `Cher frère ${prenom}`;
    if (householdType === "couple" && spouseName) {
      const spousePrenom = spouseName.split(" ")[0] || spouseName;
      salutation += ` et sœur ${spousePrenom}`;
    }
  }

  if (type === "j7") {
    if (lang === "cv")
      return `${salutation},\n\nN spera ki bu sta dretu. N sta kontakta-bu pa lembra-bu di bu vizita ki sta programadu pa ${dateFormatted}.\nFavor konfirma-m si sta tudu dretu di bu ladu.\n\nFraternalmenti,\n${responsableName}`;
    if (lang === "pt")
      return `${salutation},\n\nEspero que estejas bem. Entro em contacto para te relembrar a tua visita programada para ${dateFormatted}.\nPor favor, confirma-me se está tudo em ordem do teu lado.\n\nFraternalmente,\n${responsableName}`;
    return `${salutation},\n\nJ'espère que tu vas bien. Je te contacte pour te rappeler ta visite programmée le ${dateFormatted}.\nPeux-tu simplement me confirmer que tout est toujours bon de ton côté ?\n\nFraternellement,\n${responsableName}`;
  }

  if (type === "j2") {
    const msg = lang === "cv" ? `${salutation},\n\nBu vizita sta pa txiga (${dateFormatted})! \u{1F64F}\nSi bu ten alguma pergunta di ultimu óra, N sta disponivel.\n\nFraternalmenti,\n${responsableName}`
      : lang === "pt" ? `${salutation},\n\nEspero que estejas bem. A tua visita está a chegar (${dateFormatted})! \u{1F64F}\nSe tiveres alguma dúvida de última hora, estou disponível.\n\nFraternalmente,\n${responsableName}`
      : `${salutation},\n\nJ'espère que vous allez bien. Votre visite approche (${dateFormatted}) ! \u{1F64F}\nSi tu as la moindre question de dernière minute, je reste disponible.\n\nFraternellement,\n${responsableName}`;
    return msg;
  }

  // j1_thanks
  const thanksMsg = lang === "cv" ? `${salutation},\n\nNha sinseru obrigadu pa bu presensa i pa diskursu ki fortifika-nu tudu! \u{1F64F}\u{2728}\nFoi un grandi prazer resebe-dos.\n\nFraternalmenti,\n${responsableName}`
    : lang === "pt" ? `${salutation},\n\nO nosso sincero obrigado pela tua presença e pelo discurso que nos fortaleceu a todos! \u{1F64F}\u{2728}\nFoi um grande prazer receber-vos.\n\nFraternalmente,\n${responsableName}`
    : `${salutation},\n\nUn grand merci du fond du cœur pour ta visite (et d'être venus chez nous) ! Ton discours nous a tous fortifiés. \u{1F64F}\u{2728}\nCe fut un véritable plaisir de vous accueillir.\n\nFraternellement,\n${responsableName}`;
  return thanksMsg;
}

/** Request browser notification permission */
function requestPermission() {
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
}

async function sendBrowserNotification(title: string, body: string) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  
  try {
    // Try via ServiceWorker first (better for PWA/Android background)
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      if (registration) {
        // Use a type cast to any only for the specific non-standard properties if needed, 
        // but here we can just use a local interface extension
        interface ExtendedNotificationOptions extends NotificationOptions {
          vibrate?: number[];
          renotify?: boolean;
        }
        registration.showNotification(title, {
          body,
          icon: "/pwa-192x192.png",
          badge: "/favicon.ico",
          vibrate: [200, 100, 200],
          tag: 'kbv-reminder',
          renotify: true
        } as ExtendedNotificationOptions);
        return;
      }
    }
    // Fallback to simple Notification (foreground only)
    new Notification(title, { body, icon: "/pwa-192x192.png" });
  } catch {
    // Silent fail on restricted environments
  }
}

export function useReminderEngine() {
  const visits = useVisitStore((s) => s.visits);
  const settings = useSettingsStore((s) => s.settings);

  const lang = settings.language;
  const responsableName = settings.congregation.responsableName || "Le responsable";
  const notifEnabled = settings.notifications.enabled;
  const remindJ7 = settings.notifications.steps.remindJ7;
  const remindJ2 = settings.notifications.steps.remindJ2;

  // Stable ref for checkReminders to avoid re-creating on every render
  const visitsRef = useRef(visits);
  visitsRef.current = visits;
  const configRef = useRef({ notifEnabled, remindJ7, remindJ2, lang, responsableName });
  configRef.current = { notifEnabled, remindJ7, remindJ2, lang, responsableName };

  useEffect(() => {
    if (notifEnabled) {
      requestPermission();
    }
  }, [notifEnabled]);

  useEffect(() => {
    const check = () => {
      const { notifEnabled: enabled, remindJ7: j7, remindJ2: j2, lang: l, responsableName: rn } = configRef.current;
      if (!enabled) return;

      const { addNotification, hasNotification } = useNotificationStore.getState();
      const currentVisits = visitsRef.current;
      const speakers = useSpeakerStore.getState().speakers;

      currentVisits.forEach((visit) => {
        if (visit.status === "cancelled" || visit.status === "completed") return;
        const days = diffDays(visit.visitDate);
        const speaker = speakers.find((s) => s.nom === visit.nom);

        const createReminder = (type: ReminderType) => {
          if (hasNotification(visit.visitId, type)) return;
          const msg = buildWhatsAppMessage(
            type,
            visit.nom,
            visit.visitDate,
            rn,
            l,
            speaker?.spouseName,
            speaker?.householdType
          );
          addNotification({
            id: generateId(),
            visitId: visit.visitId,
            speakerName: visit.nom,
            visitDate: visit.visitDate,
            type,
            status: "pending",
            createdAt: new Date().toISOString(),
            whatsappMessage: msg,
            whatsappPhone: visit.speakerPhone || "",
          });
          const typeLabel = type === "j7" ? "J-7" : type === "j2" ? "J-2" : "Remerciement";
          sendBrowserNotification(`🔔 ${typeLabel} – ${visit.nom}`, `Visite du ${new Date(visit.visitDate + "T00:00:00").toLocaleDateString("fr-FR")}`);
        };

        if (j7 && days <= 7 && days > 2) createReminder("j7");
        if (j2 && days <= 2 && days >= 0) createReminder("j2");
        if (days <= -1 && days >= -3) createReminder("j1_thanks");
      });
    };

    // Run once after mount, then every 30 min
    const timeout = setTimeout(check, 1000);
    const interval = setInterval(check, 30 * 60 * 1000);
    return () => { clearTimeout(timeout); clearInterval(interval); };
  }, []); // Empty deps - uses refs for current values

  // Read pending count separately (safe, doesn't trigger the check loop)
  const pendingCount = useNotificationStore((s) => s.notifications.filter((n) => n.status === "pending").length);

  return { pendingCount };
}
