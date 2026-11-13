import React from "react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  description?: string;
  className?: string;
}

export function KpiCard({
  label,
  value,
  icon,
  description,
  className,
}: KpiCardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-[#EDF2F7] p-5 shadow-[0_2px_4px_rgba(0,0,0,0.05)] flex items-start justify-between gap-4 transition-all hover:shadow-xs",
        className
      )}
    >
      <div>
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#545F72] block">
          {label}
        </span>
        <div className="font-heading text-3xl font-bold tracking-tight text-[#181C1E] mt-1.5">
          {value}
        </div>
        {description && (
          <p className="text-xs text-[#94A3B8] mt-1">{description}</p>
        )}
      </div>

      <div className="w-11 h-11 rounded-xl bg-[#0F4C81]/10 text-[#00355F] flex items-center justify-center shrink-0">
        {icon}
      </div>
    </div>
  );
}

