import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Edit2, AlertTriangle, FileText, DollarSign } from 'lucide-react';
import { ExtractedField, AIAnalysisResult, FieldReview } from '@/types/ai.types';

interface ReviewPanelProps {
  result: AIAnalysisResult;
  onApply: (reviews: FieldReview[]) => void;
  onCancel: () => void;
}

export function ReviewPanel({ result, onApply, onCancel }: ReviewPanelProps) {
  const [reviews, setReviews] = useState<Map<string, FieldReview>>(new Map());
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const handleAccept = (field: ExtractedField) => {
    const newReviews = new Map(reviews);
    newReviews.set(field.fieldName, {
      field,
      userAction: 'accept'
    });
    setReviews(newReviews);
  };

  const handleReject = (field: ExtractedField) => {
    const newReviews = new Map(reviews);
    newReviews.set(field.fieldName, {
      field,
      userAction: 'reject'
    });
    setReviews(newReviews);
  };

  const handleEdit = (field: ExtractedField) => {
    setEditingField(field.fieldName);
    setEditValue(String(field.value || ''));
  };

  const handleSaveEdit = (field: ExtractedField) => {
    const newReviews = new Map(reviews);
    newReviews.set(field.fieldName, {
      field,
      userAction: 'modify',
      modifiedValue: editValue
    });
    setReviews(newReviews);
    setEditingField(null);
  };

  const handleApply = () => {
    // For fields not explicitly reviewed, auto-accept HIGH confidence fields
    const allReviews: FieldReview[] = [];

    result.fieldsSuccessfullyFilled.forEach((field) => {
      if (reviews.has(field.fieldName)) {
        allReviews.push(reviews.get(field.fieldName)!);
      } else if (field.confidence === 'HIGH') {
        allReviews.push({ field, userAction: 'accept' });
      }
    });

    onApply(allReviews);
  };

  const getConfidenceBadge = (confidence: 'HIGH' | 'MEDIUM' | 'LOW') => {
    const variants = {
      HIGH: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      MEDIUM: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      LOW: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };

    return (
      <Badge className={variants[confidence]} variant="secondary">
        {confidence}
      </Badge>
    );
  };

  const getReviewStatus = (fieldName: string) => {
    const review = reviews.get(fieldName);
    if (!review) return null;

    const icons = {
      accept: <CheckCircle className="w-4 h-4 text-green-600" />,
      reject: <XCircle className="w-4 h-4 text-red-600" />,
      modify: <Edit2 className="w-4 h-4 text-blue-600" />
    };

    return icons[review.userAction];
  };

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-accent/20 rounded-lg">
        <div>
          <p className="text-xs text-muted-foreground">Fields Filled</p>
          <p className="text-2xl font-bold text-green-600">{result.fieldsSuccessfullyFilled.length}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Not Found</p>
          <p className="text-2xl font-bold text-orange-600">{result.fieldsNotFound.length}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Need Review</p>
          <p className="text-2xl font-bold text-yellow-600">{result.fieldsRequiringVerification.length}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Est. Cost</p>
          <p className="text-2xl font-bold flex items-center gap-1">
            <DollarSign className="w-5 h-5" />
            {result.estimatedCost.toFixed(3)}
          </p>
        </div>
      </div>

      {/* Verification Alert */}
      {result.fieldsRequiringVerification.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {result.fieldsRequiringVerification.length} field(s) require verification due to medium/low confidence.
            Please review carefully before applying.
          </AlertDescription>
        </Alert>
      )}

      {/* Fields Successfully Filled */}
      <div>
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          Successfully Extracted ({result.fieldsSuccessfullyFilled.length})
        </h4>
        <ScrollArea className="h-[400px] border rounded-lg p-4">
          <div className="space-y-3">
            {result.fieldsSuccessfullyFilled.map((field) => (
              <div key={field.fieldName} className="p-3 border rounded-lg bg-card space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm">{field.fieldName}</p>
                      {getConfidenceBadge(field.confidence)}
                      {getReviewStatus(field.fieldName)}
                    </div>

                    {editingField === field.fieldName ? (
                      <div className="space-y-2 mt-2">
                        {typeof field.value === 'string' && field.value.length > 50 ? (
                          <Textarea
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            rows={3}
                          />
                        ) : (
                          <Input value={editValue} onChange={(e) => setEditValue(e.target.value)} />
                        )}
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleSaveEdit(field)}>
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingField(null)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm font-mono bg-muted p-2 rounded mt-1">
                          {String(field.value)}
                        </p>
                        <div className="text-xs text-muted-foreground mt-2 space-y-1">
                          <p className="flex items-start gap-1">
                            <FileText className="w-3 h-3 mt-0.5" />
                            <span>
                              <strong>Source:</strong> {field.source}
                            </span>
                          </p>
                          <p className="italic">"{field.quote}"</p>
                          {field.notes && (
                            <p className="text-yellow-600 dark:text-yellow-400">
                              <strong>Note:</strong> {field.notes}
                            </p>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {editingField !== field.fieldName && !reviews.has(field.fieldName) && (
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" variant="outline" onClick={() => handleAccept(field)}>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Accept
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleEdit(field)}>
                      <Edit2 className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleReject(field)}>
                      <XCircle className="w-3 h-3 mr-1" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Fields Not Found */}
      {result.fieldsNotFound.length > 0 && (
        <Alert>
          <AlertDescription>
            <p className="font-semibold mb-2">Fields Not Found ({result.fieldsNotFound.length}):</p>
            <div className="flex flex-wrap gap-2">
              {result.fieldsNotFound.slice(0, 10).map((field) => (
                <Badge key={field} variant="outline">
                  {field}
                </Badge>
              ))}
              {result.fieldsNotFound.length > 10 && (
                <Badge variant="outline">+{result.fieldsNotFound.length - 10} more</Badge>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Actions */}
      <div className="flex justify-between items-center pt-4 border-t">
        <div className="text-sm text-muted-foreground">
          <p>Processing time: {(result.processingTime / 1000).toFixed(1)}s</p>
          <p>Tokens used: {result.totalTokensUsed.toLocaleString()}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleApply}>
            Apply to Form ({reviews.size} reviewed)
          </Button>
        </div>
      </div>
    </div>
  );
}
