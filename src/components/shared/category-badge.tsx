import React from "react";
import { CategoriaOcorrencia } from "@/types/database.types";
import { 
  Volume2, 
  Wrench, 
  ShieldAlert, 
  Sparkles, 
  Users, 
  HelpCircle 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryBadgeProps {
  categoria: CategoriaOcorrencia;
  showIcon?: boolean;
  className?: string;
}

export function CategoryBadge({
  categoria,
  showIcon = true,
  className,
}: CategoryBadgeProps) {
  const getIcon = () => {
    switch (categoria) {
      case "Barulho":
        return <Volume2 className="w-3.5 h-3.5 text-purple-600" />;
      case "Manutenção":
        return <Wrench className="w-3.5 h-3.5 text-blue-600" />;
      case "Segurança":
        return <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />;
      case "Limpeza":
        return <Sparkles className="w-3.5 h-3.5 text-teal-600" />;
      case "Convivência":
        return <Users className="w-3.5 h-3.5 text-indigo-600" />;
      default:
        return <HelpCircle className="w-3.5 h-3.5 text-slate-600" />;
    }
  };

  const getStyle = () => {
    switch (categoria) {
      case "Barulho":
        return "bg-purple-50 text-purple-700 border-purple-200/60";
      case "Manutenção":
        return "bg-blue-50 text-blue-700 border-blue-200/60";
      case "Segurança":
        return "bg-amber-50 text-amber-800 border-amber-200/60";
      case "Limpeza":
        return "bg-teal-50 text-teal-700 border-teal-200/60";
      case "Convivência":
        return "bg-indigo-50 text-indigo-700 border-indigo-200/60";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200/60";
    }
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium border shadow-2xs",
        getStyle(),
        className
      )}
    >
      {showIcon && getIcon()}
      {categoria}
    </span>
  );
}

