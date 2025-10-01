import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Sparkles } from 'lucide-react';
import { APIKeySetup } from './APIKeySetup';
import { FileUploadZone } from './FileUploadZone';
import { InstructionsInput } from './InstructionsInput';
import { ReviewPanel } from './ReviewPanel';
import { UploadedFile, GPTModel, AIAnalysisResult, FieldReview, AIProcessingStatus } from '@/types/ai.types';
import { getStoredAPIKey, hasStoredAPIKey } from '@/services/apiKeyStorage';
import { analyzeDocuments, estimateCost } from '@/services/openaiService';

interface AIAssistantProps {
  open: boolean;
  onClose: () => void;
  onApplyData: (data: Record<string, any>) => void;
}

type Step = 'api-key' | 'upload' | 'processing' | 'review';

export function AIAssistant({ open, onClose, onApplyData }: AIAssistantProps) {
  const [step, setStep] = useState<Step>('api-key');
  const [apiKey, setApiKey] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<GPTModel>(GPTModel.GPT4O);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [instructions, setInstructions] = useState('');
  const [processingStatus, setProcessingStatus] = useState<AIProcessingStatus | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [costEstimate, setCostEstimate] = useState<{ min: number; max: number } | null>(null);

  // Check for stored API key on mount
  useEffect(() => {
    const checkAPIKey = async () => {
      const hasKey = await hasStoredAPIKey();
      if (hasKey) {
        const storedKey = await getStoredAPIKey();
        if (storedKey) {
          setApiKey(storedKey);
          setStep('upload');
        }
      }
    };

    if (open) {
      checkAPIKey();
    }
  }, [open]);

  // Estimate cost when files change
  useEffect(() => {
    if (files.length > 0) {
      // Rough estimation based on file sizes
      const documentLengths = files.map((f) => f.size);
      const estimate = estimateCost(selectedModel, documentLengths, 40); // 40 core fields
      setCostEstimate({ min: estimate.minCost, max: estimate.maxCost });
    } else {
      setCostEstimate(null);
    }
  }, [files, selectedModel]);

  const handleAPIKeySetup = (key: string, model: GPTModel) => {
    setApiKey(key);
    setSelectedModel(model);
    setStep('upload');
  };

  const handleAnalyze = async () => {
    if (files.length === 0) {
      setError('Please upload at least one document');
      return;
    }

    setError(null);
    setStep('processing');

    try {
      setProcessingStatus({
        stage: 'uploading',
        progress: 10,
        message: 'Reading uploaded files...'
      });

      // Process documents using main process (supports PDF, DOCX, Excel, etc.)
      const documents: { filename: string; content: string }[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setProcessingStatus({
          stage: 'uploading',
          progress: 10 + (i / files.length) * 20,
          message: `Processing ${file.name}...`
        });

        try {
          const result = await window.electronAPI.processDocument(file.path);
          if (result.success && result.content) {
            documents.push({
              filename: file.name,
              content: result.content
            });
          } else {
            throw new Error(result.error || 'Unknown error');
          }
        } catch (error: any) {
          console.error(`Failed to process ${file.name}:`, error);
          setError(`Failed to process ${file.name}: ${error.message || 'Unknown error'}`);
          setStep('upload');
          return;
        }
      }

      setProcessingStatus({
        stage: 'processing',
        progress: 30,
        message: 'Analyzing documents with AI...'
      });

      const result = await analyzeDocuments(
        apiKey,
        selectedModel,
        documents,
        instructions,
        (progress, message) => {
          setProcessingStatus({
            stage: progress < 40 ? 'uploading' : progress < 70 ? 'processing' : 'extracting',
            progress,
            message
          });
        }
      );

      setAnalysisResult(result);
      setStep('review');
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err.message || 'Failed to analyze documents');
      setStep('upload');
    } finally {
      setProcessingStatus(null);
    }
  };

  const handleApplyReviews = (reviews: FieldReview[]) => {
    const formData: Record<string, any> = {};

    reviews.forEach((review) => {
      if (review.userAction === 'accept') {
        formData[review.field.fieldName] = review.field.value;
      } else if (review.userAction === 'modify') {
        formData[review.field.fieldName] = review.modifiedValue;
      }
    });

    onApplyData(formData);
    onClose();

    // Reset state
    setFiles([]);
    setInstructions('');
    setAnalysisResult(null);
    setStep('upload');
  };

  const handleClose = () => {
    onClose();
    // Reset to upload if API key is configured
    if (apiKey) {
      setStep('upload');
    } else {
      setStep('api-key');
    }
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            AI Assistant - Automatic Form Filling
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* API Key Setup Step */}
          {step === 'api-key' && (
            <APIKeySetup
              onComplete={handleAPIKeySetup}
              onCancel={handleClose}
            />
          )}

          {/* Upload Step */}
          {step === 'upload' && (
            <>
              <FileUploadZone files={files} onFilesChange={setFiles} />

              <InstructionsInput value={instructions} onChange={setInstructions} />

              {costEstimate && (
                <Alert>
                  <AlertDescription>
                    <strong>Estimated Cost:</strong> ${costEstimate.min.toFixed(3)} - $
                    {costEstimate.max.toFixed(3)}
                    <p className="text-xs mt-1">Actual cost may vary based on document complexity</p>
                  </AlertDescription>
                </Alert>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button onClick={handleAnalyze} disabled={files.length === 0}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Analyze Documents
                </Button>
              </div>
            </>
          )}

          {/* Processing Step */}
          {step === 'processing' && processingStatus && (
            <div className="space-y-4 py-8">
              <div className="flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <div className="text-center space-y-2">
                  <p className="font-medium">{processingStatus.message}</p>
                  <Progress value={processingStatus.progress} className="w-64" />
                  <p className="text-sm text-muted-foreground">{processingStatus.progress}%</p>
                </div>
              </div>
            </div>
          )}

          {/* Review Step */}
          {step === 'review' && analysisResult && (
            <ReviewPanel
              result={analysisResult}
              onApply={handleApplyReviews}
              onCancel={() => setStep('upload')}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
