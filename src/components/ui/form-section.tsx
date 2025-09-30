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
    <Card className={`shadow-sm border-form-border ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-foreground">{title}</CardTitle>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </CardHeader>
      <CardContent className="space-y-6">
        {children}
      </CardContent>
    </Card>
  );
}

export function Subsection({ title, children, className = "" }: SubsectionProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-base font-medium text-vsme-secondary border-b border-form-border pb-2">
        {title.replace('(if applicable)', '')}
      </h3>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}