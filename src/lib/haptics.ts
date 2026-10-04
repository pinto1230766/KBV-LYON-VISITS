// Lightweight haptics helper. Uses Capacitor Haptics if available
// (native Android/iOS), otherwise falls back to Web Vibration API.
// All calls are fire-and-forget and never throw.

type Style = "light" | "medium" | "heavy" | "success" | "warning" | "error" | "selection";

let cachedHaptics: unknown = null;
let triedLoad = false;

async function getCapacitorHaptics(): Promise<unknown> {
  if (triedLoad) return cachedHaptics;
  triedLoad = true;
  try {
    const name = "@capacitor/haptics";
    const mod = await import(/* @vite-ignore */ name);
    cachedHaptics = mod;
  } catch {
    cachedHaptics = null;
  }
  return cachedHaptics;
}

export async function haptic(style: Style = "light") {
  // Native first
  const mod = (await getCapacitorHaptics()) as
    | { Haptics?: { impact?: (o: { style: string }) => Promise<void>; notification?: (o: { type: string }) => Promise<void> }; ImpactStyle?: Record<string, string>; NotificationType?: Record<string, string> }
    | null;
  if (mod?.Haptics) {
    try {
      if (style === "success" || style === "warning" || style === "error") {
        const t = (mod.NotificationType ?? {})[style.toUpperCase()] ?? style;
        await mod.Haptics.notification?.({ type: t });
      } else {
        const s = (mod.ImpactStyle ?? {})[style[0].toUpperCase() + style.slice(1)] ?? style;
        await mod.Haptics.impact?.({ style: s });
      }
      return;
    } catch { /* fall through */ }
  }
  // Web fallback
  try {
    const map: Record<Style, number | number[]> = {
      light: 10,
      selection: 10,
      medium: 25,
      heavy: 40,
      success: [10, 30, 10],
      warning: [20, 40, 20],
      error: [40, 60, 40],
    };
    if ("vibrate" in navigator) navigator.vibrate(map[style]);
  } catch { /* noop */ }
}
