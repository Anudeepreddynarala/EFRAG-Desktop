import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { TooltipField } from "@/components/ui/tooltip-field";
import { Trash2, Plus } from "lucide-react";

interface RepeatableSectionItem {
  id: string;
  description: string;
  target: string;
  accountable: string;
}

interface RepeatableSectionProps {
  title: string;
  tooltip: string;
  items: RepeatableSectionItem[];
  onItemsChange: (items: RepeatableSectionItem[]) => void;
  className?: string;
}

export function RepeatableSection({ title, tooltip, items, onItemsChange, className = "" }: RepeatableSectionProps) {
  const addSection = () => {
    const newItem: RepeatableSectionItem = {
      id: Date.now().toString(),
      description: '',
      target: '',
      accountable: ''
    };
    onItemsChange([...items, newItem]);
  };

  const removeSection = (id: string) => {
    onItemsChange(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof RepeatableSectionItem, value: string) => {
    onItemsChange(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <TooltipField tooltip={tooltip}>
        <div className="flex items-center justify-between">
          <h3 className="text-base font-medium text-vsme-secondary">{title}</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addSection}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Section
          </Button>
        </div>
      </TooltipField>

      {items.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground text-sm">
              No sections added yet. Click "Add Section" to get started.
            </p>
          </CardContent>
        </Card>
      )}

      {items.map((item, index) => (
        <Card key={item.id} className="shadow-sm border-form-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                Section {index + 1}
              </CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeSection(item.id)}
                className="h-8 w-8 p-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-foreground">
                Description of a practice, policy and/or future initiative (mention if it covers suppliers or clients)
              </Label>
              <Textarea
                placeholder="Describe the practice, policy, or future initiative..."
                value={item.description}
                onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-foreground">
                Description of target related to a policy
              </Label>
              <Textarea
                placeholder="Describe any targets related to this policy..."
                value={item.target}
                onChange={(e) => updateItem(item.id, 'target', e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-foreground">
                Most senior level accountable for implementing practices/policies/future initiatives
              </Label>
              <Textarea
                placeholder="Describe the most senior level responsible..."
                value={item.accountable}
                onChange={(e) => updateItem(item.id, 'accountable', e.target.value)}
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}