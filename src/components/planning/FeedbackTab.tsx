import { motion } from "framer-motion";
import { Star } from "lucide-react";
import type { Visit } from "../../store/visitTypes";

interface FeedbackTabProps {
  detailForm: Partial<Visit>;
  setDetailForm: (f: Partial<Visit>) => void;
  t: (k: string) => string;
}

export function FeedbackTab({ detailForm, setDetailForm, t }: FeedbackTabProps) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <div className="rounded-2xl bg-muted/50 p-5 space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">{t("talk_quality")}</p>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <button key={n} onClick={() => setDetailForm({ ...detailForm, feedbackRating: n })} className="transition-transform hover:scale-110" title={`Note ${n}`}>
              <Star className={`w-8 h-8 ${(detailForm.feedbackRating || 0) >= n ? "text-amber-400" : "text-muted-foreground/30"}`}
                fill={(detailForm.feedbackRating || 0) >= n ? "currentColor" : "none"} />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t("comments_followup")}</p>
        <textarea className="input-soft text-sm min-h-[120px] resize-y w-full" placeholder={t("feedback_visit_placeholder")} value={detailForm.feedback || ""} onChange={(e) => setDetailForm({ ...detailForm, feedback: e.target.value })} />
      </div>

    </motion.div>
  );
}
