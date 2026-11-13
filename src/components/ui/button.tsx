import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#0F4C81] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-[#00355F] text-white hover:bg-[#0F4C81] active:bg-[#002240] shadow-xs",
        secondary:
          "bg-[#F1F4F6] text-[#181C1E] hover:bg-[#E2E8F0] active:bg-[#CBD5E1] border border-[#E2E8F0]",
        outline:
          "border border-[#E2E8F0] bg-white text-[#181C1E] hover:bg-[#F7FAFC] hover:border-[#CBD5E1]",
        destructive:
          "bg-[#BA1A1A] text-white hover:bg-[#93000A] shadow-xs",
        ghost:
          "text-[#545F72] hover:bg-[#F1F4F6] hover:text-[#181C1E]",
        link:
          "text-[#0F4C81] underline-offset-4 hover:underline p-0 h-auto font-medium",
      },
      size: {
        default: "h-11 px-4 py-2 min-h-[44px]",
        sm: "h-9 px-3 text-xs rounded-md",
        lg: "h-12 px-6 text-base rounded-lg",
        icon: "h-10 w-10 min-h-[40px] min-w-[40px] rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };

