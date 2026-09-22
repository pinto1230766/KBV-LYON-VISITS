import { motion } from "framer-motion";
import {
  AlertTriangle, Check, ChevronRight, Trash2, Clock, MapPin,
  Home, Utensils, Car, CalendarDays,
} from "lucide-react";
import type { Visit } from "../../store/visitTypes";
import type { Speaker } from "../../store/visitTypes";
import { isEventVisit } from "../../lib/eventDetection";
import { locationLabel as locationLabelHelper } from "../../lib/planningHelpers";
import { haptic } from "../../lib/haptics";

interface VisitCardProps {
  visit: Visit;
  index: number;
  locale: string;
  allVisits: Visit[];
  getSpeakerForVisit: (v: Visit) => Speaker | undefined;
  t: (k: string) => string;
  onOpen: (v: Visit) => void;
  onConfirm: (id: string) => void;
  onAskDelete: (id: string) => void;
  congregationName?: string;
}

export function VisitCard({
  visit, index, locale = "fr-FR", allVisits, getSpeakerForVisit, t,
  onOpen, onConfirm, onAskDelete, congregationName,
}: VisitCardProps) {
  const d = new Date(visit.visitDate);
  
  // Custom month names matching the mockup's style (e.g. "JUIN", "JUIL", "SEPT")
  const months = ["JANV", "FÉVR", "MARS", "AVR", "MAI", "JUIN", "JUIL", "AOÛT", "SEPT", "OCT", "NOV", "DÉC"];
  const monthShort = months[d.getMonth()];
  const dayNum = d.getDate();

  const sameNameNearby = allVisits.some(v =>
    v.visitId !== visit.visitId &&
    v.status !== "cancelled" &&
    v.nom.toLowerCase().trim() === visit.nom.toLowerCase().trim() &&
    Math.abs(new Date(v.visitDate).getTime() - new Date(visit.visitDate).getTime()) < 7 * 24 * 60 * 60 * 1000
  );
  
  const conflictSameDay = allVisits.some(v =>
    v.visitId !== visit.visitId &&
    v.status !== "cancelled" &&
    v.visitDate === visit.visitDate &&
    v.nom.toLowerCase().trim() !== visit.nom.toLowerCase().trim()
  );

  const locationLabel = (loc: string) => locationLabelHelper(loc, t);

  const renderBadge = () => {
    const assignments = visit.hostAssignments || [];
    const hasH = assignments.some(a => a.role === 'hebergement');
    const hasR = assignments.some(a => a.role === 'repas');
    const hasT = assignments.some(a => a.role === 'transport');
    const isOnline = visit.locationType === 'zoom' || visit.locationType === 'streaming';
    const isLocal = visit.localSpeaker || 
                   getSpeakerForVisit(visit)?.localSpeaker || 
                   (congregationName && visit.congregation?.toLowerCase().trim() === congregationName.toLowerCase().trim());
    
    if (isEventVisit(visit)) {
      return (
        <span className="px-2.5 py-0.5 bg-purple-100 text-purple-900 border border-purple-300 dark:bg-purple-950/70 dark:text-purple-300 dark:border-purple-600/70 text-[10px] font-bold rounded-full uppercase flex items-center gap-1 shadow-2xs">
          <CalendarDays className="w-2.5 h-2.5" /> ÉVÉNEMENT
        </span>
      );
    }
    if (isOnline) return null;
    if (isLocal) {
      return (
        <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-600/70 text-[10px] font-bold rounded-full uppercase shadow-2xs">
          LOCAL
        </span>
      );
    }
    
    return (
      <div className="flex items-center gap-1.5 ml-1 pl-2 border-l border-border">
        <Home className={`w-3.5 h-3.5 ${hasH ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground/35'}`} />
        <Utensils className={`w-3.5 h-3.5 ${hasR ? 'text-blue-600 dark:text-blue-400' : 'text-muted-foreground/35'}`} />
        <Car className={`w-3.5 h-3.5 ${hasT ? 'text-purple-600 dark:text-purple-400' : 'text-muted-foreground/35'}`} />
      </div>
    );
  };

  const isConfirmed = visit.status === "confirmed";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.02 }}
      className={`ios-card p-5 rounded-2xl relative overflow-hidden group hover:border-primary/50 transition-all cursor-pointer flex flex-col justify-between ${
        (sameNameNearby || conflictSameDay) ? "ring-2 ring-red-500/30" : ""
      }`}
      onClick={() => { haptic("selection"); onOpen(visit); }}
    >
      {/* Top row: Date block & Action buttons */}
      <div className="flex justify-between items-center mb-4">
        {/* Apple Calendar Icon style date block */}
        <div className="flex flex-col items-center bg-card rounded-xl border border-border/80 shadow-2xs relative min-w-[58px] overflow-hidden">
          <div className="w-full bg-[#FF3B30] text-white text-[9px] font-black tracking-wider uppercase py-0.5 text-center shadow-xs">
            {monthShort}
          </div>
          <div className="py-1 px-2 flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-foreground tracking-tight leading-none">{dayNum}</span>
            <span className="text-[9px] font-semibold text-muted-foreground uppercase mt-0.5">
              {d.toLocaleDateString(locale, { weekday: "short" }).replace(".", "")}
            </span>
          </div>
          {sameNameNearby && (
            <div className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-amber-500 rounded-full flex items-center justify-center border-2 border-background shadow-xs" title="Doublon potentiel (même orateur à une date proche)">
              <AlertTriangle className="w-2.5 h-2.5 text-white" />
            </div>
          )}
          {conflictSameDay && (
            <div className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-red-500 rounded-full flex items-center justify-center border-2 border-background shadow-xs" title="Conflit : un autre orateur est déjà prévu ce jour-là">
              <AlertTriangle className="w-2.5 h-2.5 text-white" />
            </div>
          )}
        </div>

        <div className="flex gap-1.5">
          {/* Confirm Button */}
          {!isConfirmed && visit.status !== "completed" && visit.status !== "cancelled" && (
            <button
              onClick={(e) => { e.stopPropagation(); haptic("success"); onConfirm(visit.visitId); }}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-500/10 hover:bg-blue-500/25 text-blue-600 dark:text-blue-400 border border-blue-500/20 transition-colors touch-manipulation active:scale-95"
              title="Confirmer"
              aria-label="Confirmer la visite"
            >
              <Check className="w-4 h-4" />
            </button>
          )}
          {/* Delete Button */}
          <button
            onClick={(e) => { e.stopPropagation(); haptic("warning"); onAskDelete(visit.visitId); }}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-500/10 hover:bg-red-500/25 text-red-600 dark:text-red-400 border border-red-500/20 transition-colors touch-manipulation active:scale-95"
            title="Supprimer"
            aria-label="Supprimer la visite"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Center: Speaker name & Talk theme */}
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors">{visit.nom}</h3>
        <p className="text-xs text-foreground/80 italic line-clamp-2 min-h-[32px] flex items-center justify-center font-medium">
          {visit.talkTheme || "---"}
        </p>
      </div>

      {/* Badges row */}
      <div className="flex flex-wrap justify-center items-center gap-2 mb-4">
        <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border uppercase shadow-2xs ${
          isConfirmed 
            ? "bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-600/70" 
            : visit.status === "completed" 
            ? "bg-slate-200 text-slate-900 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600"
            : visit.status === "cancelled"
            ? "bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-600/70"
            : "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-600/70"
        }`}>
          {t(visit.status)}
        </span>
        <span className="px-2.5 py-0.5 bg-background text-foreground text-[10px] font-bold rounded-full border border-border uppercase shadow-2xs">
          {locationLabel(visit.locationType)}
        </span>
        {renderBadge()}
      </div>

      {/* Bottom info row (separated by border) */}
      <div className="flex justify-between items-center text-xs text-muted-foreground mt-2 border-t border-border pt-3">
        <span className="flex items-center gap-1.5 font-medium">
          <Clock className="w-3.5 h-3.5 text-primary" /> 
          {visit.heure_visite || "11:30"}
        </span>
        <span className="flex items-center gap-1.5 font-medium max-w-[150px] truncate">
          <MapPin className="w-3.5 h-3.5 text-primary" /> 
          {visit.congregation}
        </span>
        <ChevronRight className="w-4 h-4 text-muted-foreground/60 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
      </div>
    </motion.div>
  );
}
