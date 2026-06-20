// Pure stateless helpers extracted from PlanningHub.
// Keeping presentational/visual mappings out of the main component.
import { Home, Car, Utensils, MapPin } from "lucide-react";
import type { ReactNode } from "react";

export function locationLabel(loc: string, t: (k: string) => string): string {
  if (loc === "kingdom_hall") return t("in_person");
  if (loc === "zoom") return "Zoom";
  if (loc === "streaming") return "Streaming";
  return t("other");
}

export function roleIcon(role: string): ReactNode {
  if (role === "hebergement") return <Home className="w-3.5 h-3.5" />;
  if (role === "transport") return <Car className="w-3.5 h-3.5" />;
  if (role === "visite_lyon") return <MapPin className="w-3.5 h-3.5" />;
  return <Utensils className="w-3.5 h-3.5" />;
}

export function roleColor(role: string): string {
  if (role === "hebergement") return "text-amber-600";
  if (role === "transport") return "text-blue-600";
  if (role === "visite_lyon") return "text-violet-600";
  return "text-emerald-600";
}

export function formatDateFull(
  dateStr: string | undefined,
  locale: string,
  forcedLocale?: string
): string {
  if (!dateStr) return "___";
  try {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString(forcedLocale || locale, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function formatDayOnly(
  dateStr: string | undefined,
  locale: string,
  forcedLocale?: string
): string {
  if (!dateStr) return "___";
  try {
    return new Date(dateStr + "T00:00:00").toLocaleDateString(
      forcedLocale || locale,
      { weekday: "long" }
    );
  } catch {
    return "___";
  }
}
