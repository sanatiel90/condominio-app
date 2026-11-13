import React from "react";
import { FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 sm:p-12 bg-white rounded-xl border border-[#EDF2F7] shadow-xs",
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-[#F1F4F6] text-[#545F72] flex items-center justify-center mb-4">
        {icon || <FolderOpen className="w-6 h-6 text-[#545F72]" />}
      </div>
      <h3 className="text-base font-semibold text-[#181C1E] mb-1 font-heading">
        {title}
      </h3>
      <p className="text-sm text-[#545F72] max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}

