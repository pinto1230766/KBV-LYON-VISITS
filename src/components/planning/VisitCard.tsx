import { motion } from "framer-motion";
import {
  AlertTriangle, Check, ChevronRight, Trash2, Clock, MapPin,
  Home, Utensils, Car, CalendarDays,
} from "lucide-react";
import type { Visit } from "../../store/visitTypes";
import type { Speaker } from "../../store/visitTypes";
import { isEventVisit } from "../../lib/eventDetection";
import { locationLabel as locationLabelHelper } from "../../lib/planningHelpers";

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
  visit, index, allVisits, getSpeakerForVisit, t,
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
        <span className="px-2 py-0.5 bg-secondary-container/20 text-secondary-container text-[10px] font-bold rounded border border-secondary-container/30 uppercase flex items-center gap-1">
          <CalendarDays className="w-2.5 h-2.5" /> ÉVÉNEMENT
        </span>
      );
    }
    if (isOnline) return null;
    if (isLocal) {
      return (
        <span className="px-2 py-0.5 bg-tertiary-container/20 text-tertiary-container text-[10px] font-bold rounded border border-tertiary-container/30 uppercase">
          LOCAL
        </span>
      );
    }
    
    return (
      <div className="flex items-center gap-1.5 ml-1 pl-2 border-l border-border/50">
        <Home className={`w-3.5 h-3.5 ${hasH ? 'text-primary' : 'text-muted-foreground/20'}`} />
        <Utensils className={`w-3.5 h-3.5 ${hasR ? 'text-blue-400' : 'text-muted-foreground/20'}`} />
        <Car className={`w-3.5 h-3.5 ${hasT ? 'text-purple-400' : 'text-muted-foreground/20'}`} />
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
      className={`glass-panel p-5 rounded-xl relative overflow-hidden group hover:border-[#ffb77d]/40 transition-all cursor-pointer flex flex-col justify-between ${
        (sameNameNearby || conflictSameDay) ? "ring-2 ring-red-500/20" : ""
      }`}
      onClick={() => onOpen(visit)}
    >
      {/* Top row: Date block & Action buttons */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex flex-col items-center justify-center bg-card px-3 py-1.5 rounded-lg relative min-w-[56px]">
          <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">{monthShort}</span>
          <span className="text-xl font-bold text-foreground leading-tight">{dayNum}</span>
          {sameNameNearby && (
            <div className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-amber-500 rounded-full flex items-center justify-center border-2 border-background" title="Doublon potentiel (même orateur à une date proche)">
              <AlertTriangle className="w-2.5 h-2.5 text-white" />
            </div>
          )}
          {conflictSameDay && (
            <div className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-red-500 rounded-full flex items-center justify-center border-2 border-background" title="Conflit : un autre orateur est déjà prévu ce jour-là">
              <AlertTriangle className="w-2.5 h-2.5 text-white" />
            </div>
          )}
        </div>

        <div className="flex gap-1.5">
          {/* Confirm Button */}
          {!isConfirmed && visit.status !== "completed" && visit.status !== "cancelled" && (
            <button
              onClick={(e) => { e.stopPropagation(); onConfirm(visit.visitId); }}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-500/10 hover:bg-blue-500/25 text-blue-500 transition-colors touch-manipulation active:scale-95"
              title="Confirmer"
              aria-label="Confirmer la visite"
            >
              <Check className="w-4 h-4" />
            </button>
          )}
          {/* Delete Button */}
          <button
            onClick={(e) => { e.stopPropagation(); onAskDelete(visit.visitId); }}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-500/10 hover:bg-red-500/25 text-red-400 transition-colors touch-manipulation active:scale-95"
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
        <p className="text-xs text-muted-foreground italic line-clamp-2 min-h-[32px] flex items-center justify-center">
          {visit.talkTheme || "---"}
        </p>
      </div>

      {/* Badges row */}
      <div className="flex flex-wrap justify-center items-center gap-2 mb-4">
        <span className={`px-2 py-0.5 text-[10px] font-bold rounded border uppercase ${
          isConfirmed 
            ? "bg-blue-500/20 text-blue-500 border-blue-500/30" 
            : visit.status === "completed" 
            ? "bg-slate-500/20 text-foreground border-slate-500/30"
            : visit.status === "cancelled"
            ? "bg-red-500/20 text-red-400 border-red-500/30"
            : "bg-primary/20 text-primary border-primary/30"
        }`}>
          {t(visit.status)}
        </span>
        <span className="px-2 py-0.5 bg-card text-muted-foreground text-[10px] font-bold rounded border border-border uppercase">
          {locationLabel(visit.locationType)}
        </span>
        {renderBadge()}
      </div>

      {/* Bottom info row (separated by border) */}
      <div className="flex justify-between items-center text-xs text-muted-foreground mt-2 border-t border-border/50 pt-3">
        <span className="flex items-center gap-1.5 font-medium">
          <Clock className="w-3.5 h-3.5 text-primary/80" /> 
          {visit.heure_visite || "11:30"}
        </span>
        <span className="flex items-center gap-1.5 font-medium max-w-[150px] truncate">
          <MapPin className="w-3.5 h-3.5 text-primary/80" /> 
          {visit.congregation}
        </span>
        <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
      </div>
    </motion.div>
  );
}
