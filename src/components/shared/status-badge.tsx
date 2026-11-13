import React from "react";
import { StatusOcorrencia } from "@/types/database.types";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: StatusOcorrencia;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStyles = () => {
    switch (status) {
      case "Resolvida":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/80 ring-emerald-600/20";
      case "Aberta":
        return "bg-amber-50 text-amber-700 border-amber-200/80 ring-amber-600/20";
      case "Em Análise":
        return "bg-sky-50 text-sky-800 border-sky-200/80 ring-sky-600/20";
      case "Em Andamento":
        return "bg-blue-50 text-blue-800 border-blue-200/80 ring-blue-600/20";
      case "Cancelada":
        return "bg-rose-50 text-rose-700 border-rose-200/80 ring-rose-600/20";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200 ring-slate-600/20";
    }
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide border shadow-xs transition-colors",
        getStyles(),
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {status}
    </span>
  );
}

