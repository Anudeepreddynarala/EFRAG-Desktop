import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface MatrixInputProps {
  options: string[];
  selected: string[];
  onSelectionChange: (selected: string[]) => void;
  className?: string;
}

export function MatrixInput({ options, selected, onSelectionChange, className = "" }: MatrixInputProps) {
  const handleToggle = (option: string) => {
    const newSelected = selected.includes(option)
      ? selected.filter(item => item !== option)
      : [...selected, option];
    onSelectionChange(newSelected);
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-3 ${className}`}>
      {options.map((option) => (
        <div key={option} className="flex items-center space-x-2">
          <Checkbox
            id={option}
            checked={selected.includes(option)}
            onCheckedChange={() => handleToggle(option)}
          />
          <Label htmlFor={option} className="text-sm leading-tight">
            {option}
          </Label>
        </div>
      ))}
    </div>
  );
}