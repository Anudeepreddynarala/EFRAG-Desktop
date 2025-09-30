import { HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ReactNode } from "react";

interface TooltipFieldProps {
  children: ReactNode;
  tooltip: string | ReactNode;
  label?: string;
  required?: boolean;
  className?: string;
}

export function TooltipField({ children, tooltip, label, required, className = "" }: TooltipFieldProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-foreground">
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" className="text-muted-foreground hover:text-foreground transition-colors">
                  <HelpCircle className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent 
                className="max-w-sm bg-tooltip-bg text-tooltip-text p-3 rounded-lg shadow-lg border-0"
                side="right"
                align="start"
              >
                <div className="text-sm leading-relaxed">{tooltip}</div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
      {children}
    </div>
  );
}