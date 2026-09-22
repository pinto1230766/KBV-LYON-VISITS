import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import type { Visit } from "../store/visitTypes";
import { logger } from "./logger";

/**
 * Computes a deterministic 31-bit integer ID from a visitId and reminder type.
 * Capacitor LocalNotifications requires 32-bit integer IDs.
 */
export function getNotificationId(visitId: string, type: "j7" | "j2" | "test"): number {
  if (type === "test") return 999999;
  let hash = 0;
  const str = `${visitId}_${type}`;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash) % 2147483647;
}

/**
 * Configures the Android Notification Channel with custom sound & priority.
 */
let channelCreated = false;
export async function setupNotificationChannel(): Promise<void> {
  if (!Capacitor.isNativePlatform() || channelCreated) return;
  try {
    await LocalNotifications.createChannel({
      id: "kbv_reminders",
      name: "Rappels Visites KBV",
      description: "Notifications pour les rappels de visites et orateurs",
      importance: 4, // High importance (heads-up notification)
      visibility: 1, // Public
      vibration: true,
    });
    channelCreated = true;
  } catch (err) {
    logger.warn("Impossible de créer le canal de notification Android :", err);
  }
}

/**
 * Requests notification permissions across platforms (Native and Web).
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  if (Capacitor.isNativePlatform()) {
    try {
      const status = await LocalNotifications.requestPermissions();
      return status.display === "granted";
    } catch (err) {
      logger.error("Erreur lors de la demande de permission de notification native :", err);
      return false;
    }
  }

  if (typeof window !== "undefined" && "Notification" in window) {
    try {
      const status = await Notification.requestPermission();
      return status === "granted";
    } catch {
      return false;
    }
  }

  return false;
}

/**
 * Checks current notification permission status.
 */
export async function checkNotificationPermissions(): Promise<boolean> {
  if (Capacitor.isNativePlatform()) {
    try {
      const status = await LocalNotifications.checkPermissions();
      return status.display === "granted";
    } catch {
      return false;
    }
  }

  if (typeof window !== "undefined" && "Notification" in window) {
    return Notification.permission === "granted";
  }

  return false;
}

export interface ScheduleOptions {
  enabled: boolean;
  remindJ7: boolean;
  remindJ2: boolean;
  language?: string;
}

/**
 * Schedules native offline OS alarms for upcoming visits.
 * If running on Android/iOS via Capacitor, alarms persist and wake the device even if app is closed.
 */
export async function scheduleVisitAlarms(
  visits: Visit[],
  options: ScheduleOptions
): Promise<{ scheduledCount: number }> {
  if (!Capacitor.isNativePlatform()) {
    return { scheduledCount: 0 };
  }

  try {
    await setupNotificationChannel();

    // Clear previously scheduled notifications to avoid duplicates or outdated times
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel({ notifications: pending.notifications });
    }

    if (!options.enabled) {
      return { scheduledCount: 0 };
    }

    const now = new Date();
    const toSchedule = [];

    for (const visit of visits) {
      if (visit.status === "cancelled" || visit.status === "completed") continue;
      if (!visit.visitDate) continue;

      const visitDate = new Date(`${visit.visitDate}T00:00:00`);
      if (isNaN(visitDate.getTime())) continue;

      const formattedDate = visitDate.toLocaleDateString(
        options.language === "pt" ? "pt-PT" : options.language === "cv" ? "pt-CV" : "fr-FR",
        { weekday: "long", day: "numeric", month: "long" }
      );

      // J-7 Reminder: 7 days before at 09:00 AM
      if (options.remindJ7) {
        const j7Date = new Date(visitDate.getTime());
        j7Date.setDate(j7Date.getDate() - 7);
        j7Date.setHours(9, 0, 0, 0);

        if (j7Date > now) {
          const title =
            options.language === "cv"
              ? `🔔 Lembransa J-7: ${visit.nom}`
              : options.language === "pt"
              ? `🔔 Lembrete J-7: ${visit.nom}`
              : `🔔 Rappel J-7 : ${visit.nom}`;
          const body =
            options.language === "cv"
              ? `Vizita programadu pa ${formattedDate}. Lembra di kontakta orador.`
              : options.language === "pt"
              ? `Visita programada para ${formattedDate}. Não se esqueça de contactar o orador.`
              : `Visite prévue le ${formattedDate}. Pensez à contacter l'orateur pour confirmer.`;

          toSchedule.push({
            id: getNotificationId(visit.visitId, "j7"),
            title,
            body,
            schedule: { at: j7Date },
            channelId: "kbv_reminders",
            extra: { visitId: visit.visitId, type: "j7" },
          });
        }
      }

      // J-2 Reminder: 2 days before at 09:00 AM
      if (options.remindJ2) {
        const j2Date = new Date(visitDate.getTime());
        j2Date.setDate(j2Date.getDate() - 2);
        j2Date.setHours(9, 0, 0, 0);

        if (j2Date > now) {
          const title =
            options.language === "cv"
              ? `🔔 Lembransa J-2: ${visit.nom}`
              : options.language === "pt"
              ? `🔔 Lembrete J-2: ${visit.nom}`
              : `🔔 Rappel J-2 : ${visit.nom}`;
          const body =
            options.language === "cv"
              ? `Vizita é dja na 48h (${formattedDate}). Konfirma ku famílias ki ta resebe.`
              : options.language === "pt"
              ? `A visita é daqui a 48h (${formattedDate}). Confirme o acolhimento com os anfitriões.`
              : `La visite a lieu dans 48h (${formattedDate}). Vérifiez l'accueil avec les familles.`;

          toSchedule.push({
            id: getNotificationId(visit.visitId, "j2"),
            title,
            body,
            schedule: { at: j2Date },
            channelId: "kbv_reminders",
            extra: { visitId: visit.visitId, type: "j2" },
          });
        }
      }
    }

    if (toSchedule.length > 0) {
      await LocalNotifications.schedule({ notifications: toSchedule });
      logger.info(`[Notifications] ${toSchedule.length} rappels locaux programmés avec succès.`);
    }

    return { scheduledCount: toSchedule.length };
  } catch (err) {
    logger.error("Erreur lors de la programmation des rappels locaux :", err);
    return { scheduledCount: 0 };
  }
}

/**
 * Sends or schedules an immediate test notification to verify audio/vibration and OS display.
 */
export async function sendTestLocalNotification(lang = "fr"): Promise<boolean> {
  const hasPermission = await checkNotificationPermissions();
  if (!hasPermission) {
    const granted = await requestNotificationPermissions();
    if (!granted) return false;
  }

  const title =
    lang === "cv"
      ? "🔔 Testi di Notifikason KBV"
      : lang === "pt"
      ? "🔔 Teste de Notificação KBV"
      : "🔔 Test de Notification KBV";
  const body =
    lang === "cv"
      ? "Sistema di notifikason lokal sta funsiona 100% offline!"
      : lang === "pt"
      ? "O sistema de notificações locais está a funcionar 100% offline!"
      : "Le système de notifications locales fonctionne parfaitement à 100% hors-ligne !";

  if (Capacitor.isNativePlatform()) {
    try {
      await setupNotificationChannel();
      await LocalNotifications.schedule({
        notifications: [
          {
            id: getNotificationId("test", "test"),
            title,
            body,
            schedule: { at: new Date(Date.now() + 1500) }, // in 1.5 seconds
            channelId: "kbv_reminders",
          },
        ],
      });
      return true;
    } catch (err) {
      logger.error("Erreur envoi test notification native :", err);
      return false;
    }
  }

  // Web fallback
  if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
    try {
      if ("serviceWorker" in navigator) {
        const reg = await navigator.serviceWorker.ready;
        if (reg) {
          reg.showNotification(title, {
            body,
            icon: "/pwa-192x192.png",
            badge: "/favicon.ico",
          });
          return true;
        }
      }
      new Notification(title, {
        body,
        icon: "/pwa-192x192.png",
      });
      return true;
    } catch {
      return false;
    }
  }

  return false;
}
