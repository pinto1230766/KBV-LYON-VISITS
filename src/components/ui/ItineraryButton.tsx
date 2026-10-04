import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navigation, MapPin, Copy, Check, ExternalLink, X } from "lucide-react";
import { toast } from "sonner";
import { haptic } from "../../lib/haptics";

interface ItineraryButtonProps {
  address: string;
  label?: string;
  variant?: "button" | "pill" | "icon" | "inline";
  className?: string;
  title?: string;
}

export function ItineraryButton({
  address,
  label = "Itinéraire",
  variant = "pill",
  className = "",
  title,
}: ItineraryButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!address || !address.trim()) return null;

  const encodedAddress = encodeURIComponent(address.trim());

  // Links for GPS navigation apps
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
  const appleMapsUrl = `https://maps.apple.com/?daddr=${encodedAddress}`;
  const wazeUrl = `https://waze.com/ul?q=${encodedAddress}&navigate=yes`;

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      haptic("success");
      toast.success("Adresse copiée dans le presse-papiers !", {
        description: address,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Impossible de copier l'adresse");
    }
  };

  const handleOpenApp = (url: string) => {
    haptic("selection");
    setIsOpen(false);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      {/* Trigger Button based on variant */}
      {variant === "icon" ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            haptic("light");
            setIsOpen(true);
          }}
          className={`w-7 h-7 rounded-lg flex items-center justify-center bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/25 transition-all active:scale-95 touch-manipulation ${className}`}
          title={title || `Itinéraire GPS vers : ${address}`}
          aria-label="Ouvrir itinéraire GPS"
        >
          <Navigation className="w-3.5 h-3.5 fill-current" />
        </button>
      ) : variant === "inline" ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            haptic("light");
            setIsOpen(true);
          }}
          className={`inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline active:scale-95 touch-manipulation ${className}`}
          title={title || `Itinéraire GPS vers : ${address}`}
        >
          <Navigation className="w-3 h-3 fill-current" />
          <span>{label}</span>
        </button>
      ) : variant === "button" ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            haptic("light");
            setIsOpen(true);
          }}
          className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all touch-manipulation ${className}`}
          title={title || `Itinéraire GPS vers : ${address}`}
        >
          <Navigation className="w-3.5 h-3.5 fill-current" />
          <span>{label}</span>
        </button>
      ) : (
        /* Default: Pill style */
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            haptic("light");
            setIsOpen(true);
          }}
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 transition-all active:scale-95 touch-manipulation shadow-2xs ${className}`}
          title={title || `Itinéraire GPS vers : ${address}`}
        >
          <Navigation className="w-2.5 h-2.5 fill-current" />
          <span>{label}</span>
        </button>
      )}

      {/* GPS Chooser Modal */}
      <AnimatePresence>
        {isOpen && (
          <div
            className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs select-none"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="w-full max-w-sm bg-card rounded-t-[28px] sm:rounded-2xl shadow-2xl overflow-hidden border border-border/80 flex flex-col p-5 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Navigation className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Itinéraire 1-clic</h3>
                    <p className="text-[11px] text-muted-foreground">Choisir votre application GPS</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-7 h-7 rounded-full flex items-center justify-center bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Fermer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Destination Address Pill */}
              <div className="p-3 rounded-xl bg-muted/50 border border-border flex items-start gap-2 text-xs">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Destination
                  </span>
                  <p className="font-semibold text-foreground break-words leading-snug mt-0.5">
                    {address}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
                  title="Copier l'adresse"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* GPS Navigation Apps List */}
              <div className="space-y-2 pt-1">
                {/* 1. Google Maps */}
                <button
                  type="button"
                  onClick={() => handleOpenApp(googleMapsUrl)}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-border/80 hover:border-red-500/40 bg-card hover:bg-red-500/5 transition-all text-left group active:scale-98 touch-manipulation shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center font-bold text-sm">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-foreground block group-hover:text-red-500 transition-colors">
                        Google Maps
                      </span>
                      <span className="text-[10px] text-muted-foreground">Navigation & trafic en direct</span>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </button>

                {/* 2. Apple Maps */}
                <button
                  type="button"
                  onClick={() => handleOpenApp(appleMapsUrl)}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-border/80 hover:border-blue-500/40 bg-card hover:bg-blue-500/5 transition-all text-left group active:scale-98 touch-manipulation shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-sm">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.74 1.02-1.77.91-2.8-.88.04-1.95.59-2.58 1.33-.56.64-.99 1.68-.86 2.69.98.08 1.92-.48 2.53-1.22z" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-foreground block group-hover:text-blue-500 transition-colors">
                        Apple Plans (Maps)
                      </span>
                      <span className="text-[10px] text-muted-foreground">Idéal sur iPhone, iPad & CarPlay</span>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </button>

                {/* 3. Waze */}
                <button
                  type="button"
                  onClick={() => handleOpenApp(wazeUrl)}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-border/80 hover:border-cyan-500/40 bg-card hover:bg-cyan-500/5 transition-all text-left group active:scale-98 touch-manipulation shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold text-sm">
                      <Navigation className="w-5 h-5 fill-current" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-foreground block group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                        Waze
                      </span>
                      <span className="text-[10px] text-muted-foreground">Alertes radars & dangers</span>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </button>
              </div>

              {/* Copy Address footer */}
              <button
                type="button"
                onClick={handleCopy}
                className="w-full py-2.5 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center justify-center gap-1.5 active:scale-98"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Adresse copiée !</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copier l'adresse texte</span>
                  </>
                )}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
