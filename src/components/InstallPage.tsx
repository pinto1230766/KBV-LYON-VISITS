import { useState } from "react";
import { Download, Smartphone, Share, Plus, ArrowLeft, Copy, Check, Apple, Monitor, Shield, Users, Database } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePWA } from "@/hooks/usePWA";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/store/useUIStore";
import { QRCodeSVG } from "qrcode.react";

export function InstallPage() {
  const { canInstall, promptInstall, isIOS, isInstalled } = usePWA();
  const setActiveTab = useUIStore((s) => s.setActiveTab);
  const [copied, setCopied] = useState(false);
  
  const appUrl = typeof window !== "undefined" ? window.location.origin : "";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="py-2 sm:py-4 bg-background pb-12">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4 py-4 flex items-center gap-4 border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-10 safe-top"
      >
        <button
          onClick={() => setActiveTab("dashboard")}
          className="p-2 rounded-xl hover:bg-muted transition-colors touch-manipulation"
          aria-label="Retour au tableau de bord"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div>
          <h1 className="text-xl font-black text-foreground leading-tight">Installer l'application</h1>
          <p className="text-xs text-muted-foreground">Partagez KBV-LYON-VISITS avec d'autres</p>
        </div>
      </motion.div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-lg mx-auto px-4 py-6 space-y-6"
      >
        {/* Independence notice */}
        <motion.div variants={item} className="premium-card p-5 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Installation indépendante</h2>
              <p className="text-sm text-muted-foreground">
                Vos données restent locales et privées.
              </p>
            </div>
          </div>
          <div className="grid gap-3">
            {[
              { icon: Database, text: "Chaque appareil gère ses propres données" },
              { icon: Shield, text: "Aucune donnée n'est partagée en ligne" },
              { icon: Users, text: "Idéal pour les coordinateurs de congrégation" },
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-xs text-muted-foreground bg-muted/30 p-2.5 rounded-lg">
                <feature.icon className="w-4 h-4 text-primary shrink-0" />
                <span>{feature.text}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* QR Code Card */}
        <motion.div variants={item} className="premium-card p-6 flex flex-col items-center gap-6 text-center">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <Smartphone className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-black text-foreground">Scanner pour installer</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Scannez ce code pour ouvrir l'application sur un autre téléphone
            </p>
          </div>
          
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="p-5 bg-white rounded-3xl border-2 border-primary/5 shadow-xl"
          >
            <QRCodeSVG
              value={appUrl}
              size={180}
              level="H"
              includeMargin={false}
              fgColor="#000000"
              data-qr-code-value={appUrl}
            />
          </motion.div>

          <div className="flex items-center gap-2 w-full max-w-sm">
            <div className="flex-1 px-4 py-3 bg-muted rounded-2xl text-xs font-mono text-muted-foreground truncate border border-border">
              {appUrl}
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleCopy}
              className="px-4 py-3 bg-primary text-primary-foreground rounded-2xl font-bold text-xs flex items-center gap-2 transition-opacity hover:opacity-90"
            >
              <AnimatePresence mode="wait">
                {copied ? (
                  <motion.div
                    key="check"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" /> <span>Copié</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="copy"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" /> <span>Copier</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </motion.div>

        {/* Install on this device */}
        {!isInstalled && (
          <motion.div variants={item} className="premium-card p-6 space-y-5">
            <div className="flex items-center gap-3">
              <Download className="w-5 h-5 text-primary" />
              <h3 className="text-base font-bold text-foreground">Installer sur cet appareil</h3>
            </div>

            {canInstall && (
              <Button onClick={promptInstall} className="w-full h-12 rounded-2xl text-sm font-bold gap-2 bg-primary shadow-lg shadow-primary/20">
                <Download className="w-5 h-5" />
                Installer KBV-LYON-VISITS maintenant
              </Button>
            )}

            {isIOS && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Sur iOS (Safari), suivez ces étapes :
                </p>
                <div className="space-y-3">
                  {[
                    { icon: Share, text: "Appuyez sur Partager de Safari" },
                    { icon: Plus, text: "Choisissez « Sur l'écran d'accueil »" },
                    { icon: Check, text: "Confirmez en haut à droite" },
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 bg-muted/40 rounded-2xl">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <step.icon className="w-5 h-5 text-primary" />
                      </div>
                      <p className="text-sm font-semibold text-foreground">{step.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!canInstall && !isIOS && (
              <div className="p-4 bg-muted/40 rounded-2xl border border-dashed border-border">
                <p className="text-xs text-muted-foreground text-center">
                  Ouvrez ce lien dans <span className="font-bold text-foreground">Chrome</span> ou <span className="font-bold text-foreground">Edge</span> pour installer l'application.
                </p>
              </div>
            )}
          </motion.div>
        )}

        {isInstalled && (
          <motion.div 
            variants={item}
            className="premium-card p-6 bg-emerald-500/10 border-emerald-500/20"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                <Check className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-base font-bold text-foreground">Déjà installée</p>
                <p className="text-sm text-muted-foreground">
                  L'application est prête sur cet appareil.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Instructions for hosts */}
        <motion.div variants={item} className="premium-card p-6 space-y-4">
          <h3 className="text-base font-bold text-foreground">Guides rapides</h3>
          <div className="grid gap-3">
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-muted/30 border border-border/50">
              <Monitor className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-foreground">Android</p>
                <p className="text-xs text-muted-foreground mt-0.5">Utilisez Chrome pour voir la bannière d'installation automatique.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-muted/30 border border-border/50">
              <Apple className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-foreground">iPhone / iPad</p>
                <p className="text-xs text-muted-foreground mt-0.5">Utilisez Safari et l'option « Sur l'écran d'accueil ».</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Share button */}
        {"share" in navigator && (
          <motion.div variants={item}>
            <Button
              variant="outline"
              className="w-full h-12 rounded-2xl border-2 font-bold gap-2 hover:bg-muted transition-colors"
              onClick={() =>
                navigator.share({
                  title: "KBV-LYON-VISITS",
                  text: "Installez l'application KBV-LYON-VISITS pour gérer vos visites.",
                  url: appUrl,
                })
              }
            >
              <Share className="w-5 h-5" />
              Partager le lien direct
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
