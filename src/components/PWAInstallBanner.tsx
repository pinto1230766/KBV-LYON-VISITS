import { useState } from "react";
import { Download, X, Share, Plus, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { usePWA } from "@/hooks/usePWA";
import { useUIStore } from "@/store/useUIStore";
import { useTranslation } from "@/hooks/useTranslation";
import { motion, AnimatePresence } from "framer-motion";

export function PWAInstallBanner() {
  const { canInstall, isInstalled, showIOSInstallGuide, updateAvailable, promptInstall, applyUpdate } = usePWA();
  const { t } = useTranslation();
  const isOnline = useUIStore((s) => s.isOnline);
  const [dismissed, setDismissed] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

   // Update banner — always show
   if (updateAvailable) {
     return (
       <motion.div
         initial={{ y: -40, opacity: 0 }}
         animate={{ y: 0, opacity: 1 }}
         className="mx-2 mt-2 md:mx-4 md:mt-3 lg:mx-8 flex items-center gap-2 md:gap-3 rounded-2xl bg-primary/10 border border-primary/20 px-3 md:px-4 py-2 md:py-3"
       >
         <RefreshCw className="w-4 h-4 md:w-5 md:h-5 text-primary flex-shrink-0" />
         <p className="text-[10px] md:text-xs font-semibold text-foreground flex-1">
           Mise à jour disponible
         </p>
         <button
           onClick={applyUpdate}
           className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
         >
           Mettre à jour
         </button>
       </motion.div>
     );
   }

   // Offline indicator
   if (!isOnline) {
     return (
       <motion.div
         initial={{ y: -40, opacity: 0 }}
         animate={{ y: 0, opacity: 1 }}
         className="mx-2 mt-2 md:mx-4 md:mt-3 lg:mx-8 flex items-center gap-2 md:gap-3 rounded-2xl bg-accent-amber/10 border border-accent-amber/20 px-3 md:px-4 py-2 md:py-3"
         style={{ background: "hsl(38 92% 50% / 0.1)", borderColor: "hsl(38 92% 50% / 0.2)" }}
       >
         <WifiOff className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" style={{ color: "hsl(38 92% 50%)" }} />
         <p className="text-[10px] md:text-xs font-semibold text-foreground flex-1">
           Mode hors-ligne — données locales disponibles
         </p>
         <Wifi className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground animate-pulse" />
       </motion.div>
     );
   }

  // Already installed or dismissed
  if (isInstalled || dismissed) return null;

   // iOS install guide
   if (showIOSInstallGuide) {
     return (
       <AnimatePresence>
         {!showIOSGuide ? (
           <motion.div
             key="ios-prompt"
             initial={{ y: -40, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             exit={{ y: -40, opacity: 0 }}
             className="mx-2 mt-2 md:mx-4 md:mt-3 lg:mx-8 flex items-center gap-2 md:gap-3 rounded-2xl bg-primary/10 border border-primary/20 px-3 md:px-4 py-2 md:py-3"
           >
             <Download className="w-4 h-4 md:w-5 md:h-5 text-primary flex-shrink-0" />
             <p className="text-[10px] md:text-xs font-semibold text-foreground flex-1">
               Installer KBV-LYON-VISITS sur votre iPhone
             </p>
             <button
               onClick={() => setShowIOSGuide(true)}
               className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
             >
               Comment faire
             </button>
             <button
               onClick={() => setDismissed(true)}
               className="text-muted-foreground hover:text-foreground p-1"
               title={t("close")}
               aria-label={t("close")}
             >
               <X className="w-3 h-3 md:w-4 md:h-4" />
             </button>
           </motion.div>
         ) : (
           <motion.div
             key="ios-guide"
             initial={{ height: 0, opacity: 0 }}
             animate={{ height: "auto", opacity: 1 }}
             exit={{ height: 0, opacity: 0 }}
             className="mx-2 mt-2 md:mx-4 md:mt-3 lg:mx-8 rounded-2xl bg-card border border-border p-4 md:p-5 shadow-lg"
           >
             <div className="flex items-center justify-between mb-3 md:mb-4">
               <h3 className="text-sm md:text-base font-black text-foreground">Installer sur iPhone</h3>
               <button
                 onClick={() => { setShowIOSGuide(false); setDismissed(true); }}
                 className="text-muted-foreground hover:text-foreground"
                 title={t("close")}
                 aria-label={t("close")}
               >
                 <X className="w-4 h-4 md:w-5 md:h-5" />
               </button>
             </div>
             <div className="space-y-2 md:space-y-3">
               <div className="flex items-center gap-2 md:gap-3">
                 <span className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[9px] md:text-xs font-black">1</span>
                 <p className="text-[10px] md:text-xs text-foreground flex items-center gap-1 md:gap-2">
                   Appuyez sur <Share className="w-3 h-3 md:w-4 md:h-4 text-primary inline" /> <strong>Partager</strong> en bas de Safari
                 </p>
               </div>
               <div className="flex items-center gap-2 md:gap-3">
                 <span className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[9px] md:text-xs font-black">2</span>
                 <p className="text-[10px] md:text-xs text-foreground flex items-center gap-1 md:gap-2">
                   Faites défiler et appuyez <Plus className="w-3 h-3 md:w-4 md:h-4 text-primary inline" /> <strong>Sur l'écran d'accueil</strong>
                 </p>
               </div>
               <div className="flex items-center gap-2 md:gap-3">
                 <span className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[9px] md:text-xs font-black">3</span>
                 <p className="text-[10px] md:text-xs text-foreground">
                   Confirmez en appuyant <strong>Ajouter</strong>
                 </p>
               </div>
             </div>
           </motion.div>
         )}
       </AnimatePresence>
     );
   }

   // Android / Desktop install prompt
   if (!canInstall) return null;

   return (
     <motion.div
       initial={{ y: -40, opacity: 0 }}
       animate={{ y: 0, opacity: 1 }}
       className="mx-2 mt-2 md:mx-4 md:mt-3 lg:mx-8 flex items-center gap-2 md:gap-3 rounded-2xl bg-primary/10 border border-primary/20 px-3 md:px-4 py-2 md:py-3"
     >
       <Download className="w-4 h-4 md:w-5 md:h-5 text-primary flex-shrink-0" />
       <p className="text-[10px] md:text-xs font-semibold text-foreground flex-1">
         Installer KBV-LYON-VISITS pour un accès rapide
       </p>
       <button
         onClick={promptInstall}
         className="px-3 md:px-4 py-1 md:py-1.5 rounded-xl bg-primary text-primary-foreground text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-opacity"
       >
         Installer
       </button>
       <button
         onClick={() => setDismissed(true)}
         className="text-muted-foreground hover:text-foreground p-1"
         title={t("close")}
         aria-label={t("close")}
       >
         <X className="w-3 h-3 md:w-4 md:h-4" />
       </button>
     </motion.div>
   );
}
