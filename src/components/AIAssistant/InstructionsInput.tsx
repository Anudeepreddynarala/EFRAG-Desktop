import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { InfoIcon } from 'lucide-react';

interface InstructionsInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function InstructionsInput({ value, onChange }: InstructionsInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="instructions" className="flex items-center gap-2">
        Additional Instructions (Optional)
        <InfoIcon className="w-4 h-4 text-muted-foreground" />
      </Label>
      <Textarea
        id="instructions"
        placeholder="E.g., 'Focus on Q1 2024 data' or 'Company name is Acme Corp' or 'Data is in EUR currency'"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="resize-none"
      />
      <p className="text-xs text-muted-foreground">
        Provide any additional context that helps the AI understand your documents better.
      </p>
    </div>
  );
}
