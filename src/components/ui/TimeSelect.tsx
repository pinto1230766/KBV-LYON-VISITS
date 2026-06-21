import * as React from "react";
import { cn } from "@/lib/utils";

interface TimeSelectProps {
  value: string; // "HH:MM"
  onChange: (value: string) => void;
  className?: string;
  id?: string;
}

export function TimeSelect({ value, onChange, className, id }: TimeSelectProps) {
  // Parse value "HH:MM", default to "12:00" if empty or invalid
  const rawValue = value || "";
  const parts = rawValue.includes(":") ? rawValue.split(":") : ["12", "00"];
  let hours = parts[0] || "12";
  let minutes = parts[1] || "00";

  // Normalize to 2 digits
  if (hours.length === 1) hours = hours.padStart(2, "0");
  if (minutes.length === 1) minutes = minutes.padStart(2, "0");

  const handleHoursChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(`${e.target.value}:${minutes}`);
  };

  const handleMinutesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(`${hours}:${e.target.value}`);
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-1",
        className
      )}
      id={id}
    >
      <select
        value={hours}
        onChange={handleHoursChange}
        className="bg-transparent border-none text-current outline-none font-semibold text-center cursor-pointer flex-1 min-w-[36px] py-1 text-inherit focus:ring-0 [&>option]:bg-neutral-800 [&>option]:text-white dark:[&>option]:bg-neutral-900 appearance-none"
        title="Heures"
      >
        {Array.from({ length: 24 }, (_, i) => {
          const h = String(i).padStart(2, "0");
          return (
            <option key={h} value={h}>
              {h}
            </option>
          );
        })}
      </select>
      <span className="text-current/60 font-bold select-none px-0.5">:</span>
      <select
        value={minutes}
        onChange={handleMinutesChange}
        className="bg-transparent border-none text-current outline-none font-semibold text-center cursor-pointer flex-1 min-w-[36px] py-1 text-inherit focus:ring-0 [&>option]:bg-neutral-800 [&>option]:text-white dark:[&>option]:bg-neutral-900 appearance-none"
        title="Minutes"
      >
        {Array.from({ length: 60 }, (_, i) => {
          const m = String(i).padStart(2, "0");
          return (
            <option key={m} value={m}>
              {m}
            </option>
          );
        })}
      </select>
    </div>
  );
}
