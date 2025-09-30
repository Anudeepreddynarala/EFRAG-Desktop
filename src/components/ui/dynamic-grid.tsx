import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus } from "lucide-react";
import { TooltipField } from "./tooltip-field";
import { geocodeAddress } from "@/utils/geolocation";

interface GridColumn {
  key: string;
  label: string;
  type: 'text' | 'select' | 'custom';
  options?: string[];
  required?: boolean;
  calculated?: boolean;
  calculateFrom?: string[];
  calculateFunction?: (...values: string[]) => string;
}

interface DynamicGridProps {
  columns: GridColumn[];
  tooltip?: string;
  onDataChange?: (data: Record<string, any>[]) => void;
  className?: string;
  autoGeolocation?: boolean;
  customRenderers?: Record<string, (value: string, onChange: (value: string) => void) => React.ReactNode>;
}

export function DynamicGrid({ columns, tooltip, onDataChange, className = "", autoGeolocation = false, customRenderers }: DynamicGridProps) {
  const [rows, setRows] = useState<Record<string, any>[]>([{}]);

  // Auto-geocoding effect
  useEffect(() => {
    if (!autoGeolocation) return;

    const geocodeRows = async () => {
      const updatedRows = [...rows];
      let hasChanges = false;

      for (let i = 0; i < updatedRows.length; i++) {
        const row = updatedRows[i];
        const hasCompleteAddress = row.address && row.postalCode && row.city && row.country;
        const hasCoordinates = row.coordinates;

        if (hasCompleteAddress && !hasCoordinates) {
          try {
            const coordinates = await geocodeAddress(
              row.address,
              row.postalCode,
              row.city,
              row.country
            );
            if (coordinates) {
              updatedRows[i] = { ...row, coordinates };
              hasChanges = true;
            }
          } catch (error) {
            console.warn('Failed to geocode address for row', i, error);
          }
        }
      }

      if (hasChanges) {
        setRows(updatedRows);
        onDataChange?.(updatedRows);
      }
    };

    // Debounce the geocoding to avoid too many API calls
    const timeout = setTimeout(geocodeRows, 1000);
    return () => clearTimeout(timeout);
  }, [rows, autoGeolocation, onDataChange]);

  const addRow = () => {
    const newRows = [...rows, {}];
    setRows(newRows);
    onDataChange?.(newRows);
  };

  const removeRow = (index: number) => {
    const newRows = rows.filter((_, i) => i !== index);
    setRows(newRows);
    onDataChange?.(newRows);
  };

  const updateRow = (index: number, key: string, value: string) => {
    const newRows = [...rows];
    newRows[index] = { ...newRows[index], [key]: value };
    
    // Calculate dependent fields
    columns.forEach(col => {
      if (col.calculated && col.calculateFrom && col.calculateFunction) {
        const values = col.calculateFrom.map(fieldKey => newRows[index][fieldKey] || '');
        newRows[index][col.key] = col.calculateFunction(...values);
      }
    });
    
    setRows(newRows);
    onDataChange?.(newRows);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {tooltip && (
        <TooltipField tooltip={tooltip}>
          <div />
        </TooltipField>
      )}
      
      <div className="border border-form-border rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-muted p-3 grid gap-3" style={{ gridTemplateColumns: `auto ${columns.map(() => '1fr').join(' ')} auto` }}>
          <div className="font-medium text-sm">ID</div>
          {columns.map((col) => (
            <div key={col.key} className="font-medium text-sm">
              {col.label}
              {col.required && <span className="text-destructive ml-1">*</span>}
            </div>
          ))}
          <div className="font-medium text-sm">Actions</div>
        </div>

        {/* Rows */}
        {rows.map((row, index) => (
          <div 
            key={index} 
            className="p-3 border-t border-form-border grid gap-3 items-center" 
            style={{ gridTemplateColumns: `auto ${columns.map(() => '1fr').join(' ')} auto` }}
          >
            <div className="text-sm text-muted-foreground font-mono">{index + 1}</div>
            {columns.map((col) => (
              <div key={col.key}>
                {col.type === 'custom' && customRenderers?.[col.key] ? (
                  customRenderers[col.key](row[col.key] || '', (value) => updateRow(index, col.key, value))
                ) : col.type === 'select' ? (
                  <Select
                    value={row[col.key] || ''}
                    onValueChange={(value) => updateRow(index, col.key, value)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder={`Select ${col.label.toLowerCase()}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {col.options?.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    value={row[col.key] || ''}
                    onChange={(e) => updateRow(index, col.key, e.target.value)}
                    placeholder={col.label}
                    className="h-9"
                    readOnly={col.calculated || (col.key === 'coordinates' && autoGeolocation && row.address && row.postalCode && row.city && row.country)}
                  />
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removeRow(index)}
              className="h-9 w-9 p-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={addRow}
        className="flex items-center gap-2"
      >
        <Plus className="h-4 w-4" />
        Add Row
      </Button>
    </div>
  );
}