import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FormSectionProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}

interface SubsectionProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export function FormSection({ title, subtitle, children, className = "" }: FormSectionProps) {
  return (
    <Card className={`shadow-md border-form-border transition-all duration-200 hover:shadow-lg ${className}`}>
      <CardHeader className="pb-5">
        <CardTitle className="text-xl font-semibold text-foreground tracking-tight">{title}</CardTitle>
        {subtitle && <p className="text-[0.9375rem] text-muted-foreground leading-relaxed mt-2">{subtitle}</p>}
      </CardHeader>
      <CardContent className="space-y-8">
        {children}
      </CardContent>
    </Card>
  );
}

export function Subsection({ title, children, className = "" }: SubsectionProps) {
  return (
    <div className={`space-y-5 ${className}`}>
      <h3 className="text-[1.0625rem] font-semibold text-vsme-secondary border-b-2 border-form-border pb-3">
        {title.replace('(if applicable)', '')}
      </h3>
      <div className="space-y-5">
        {children}
      </div>
    </div>
  );
}