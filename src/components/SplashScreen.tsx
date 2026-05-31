import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { KbvLogo } from "./KbvLogo";

export function SplashScreen({ onFinished }: { onFinished: () => void }) {
  const [phase, setPhase] = useState<"logo" | "text" | "exit">("logo");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("text"), 600);
    const t2 = setTimeout(() => setPhase("exit"), 1800);
    const t3 = setTimeout(onFinished, 2300);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onFinished]);

  return (
    <AnimatePresence>
      <motion.div
        key="splash"
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
        initial={{ opacity: 1 }}
        animate={{ opacity: phase === "exit" ? 0 : 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Cape Verde flag background */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(to bottom, #003893 33.33%, #ffffff 33.33%, #ffffff 66.66%, #ce1126 66.66%)'
        }} />

        {/* Modern Logo KBV FP */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
          className="relative z-10"
        >
          {/* Logo container with white border */}
          <div className="relative">
            {/* White border effect */}
            <div className="absolute -inset-1 rounded-3xl bg-white opacity-50 blur-sm" />
            
            {/* Main logo SVG */}
            <div className="relative w-28 h-28 rounded-3xl shadow-2xl border-4 border-white overflow-hidden bg-white/10 backdrop-blur-sm">
              <KbvLogo className="w-full h-full" />
            </div>
          </div>
        </motion.div>

        {/* App name */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: phase === "text" || phase === "exit" ? 1 : 0, y: phase === "text" || phase === "exit" ? 0 : 20 }}
          transition={{ duration: 0.4 }}
          className="relative z-10 mt-8 text-center"
        >
          <h1 className="text-3xl font-black text-white drop-shadow-md tracking-tight">
            KBV-LYON-VISITS
          </h1>
          <p className="mt-2 text-xs font-bold uppercase tracking-[0.4em] text-white/80 drop-shadow-md">
            Coordination
          </p>
        </motion.div>

        {/* Loading bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: phase === "text" || phase === "exit" ? 1 : 0 }}
          transition={{ delay: 0.2 }}
          className="relative z-10 mt-10 w-40 h-1 rounded-full bg-primary-foreground/20 overflow-hidden"
        >
          <motion.div
            className="h-full bg-primary-foreground/60 rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
