import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[100px] w-full rounded-lg border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-sm text-[#181C1E] shadow-xs placeholder:text-[#94A3B8] transition-colors focus-visible:outline-hidden focus-visible:border-[#0F4C81] focus-visible:ring-2 focus-visible:ring-[#0F4C81]/20 disabled:cursor-not-allowed disabled:bg-[#F1F4F6] disabled:text-[#94A3B8]",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };

