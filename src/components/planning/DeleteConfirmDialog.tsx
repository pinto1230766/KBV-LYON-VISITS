import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

interface DeleteConfirmDialogProps {
  onConfirm: () => void;
  onCancel: () => void;
  t: (k: string) => string;
}

export function DeleteConfirmDialog({ onConfirm, onCancel, t }: DeleteConfirmDialogProps) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50" onClick={onCancel}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-sm bg-card rounded-2xl p-6 space-y-4 shadow-2xl text-center" onClick={(e) => e.stopPropagation()}>
        <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto"><AlertTriangle className="w-6 h-6 text-destructive" /></div>
        <p className="text-sm font-bold text-foreground">{t("confirm_delete_visit")}</p>
        <div className="flex gap-2">
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl bg-destructive text-destructive-foreground text-xs font-bold">{t("yes_delete")}</button>
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl bg-white dark:bg-card text-foreground text-xs font-bold border border-border hover:border-muted-foreground/40">{t("cancel")}</button>
        </div>
      </motion.div>
    </motion.div>
  );
}
