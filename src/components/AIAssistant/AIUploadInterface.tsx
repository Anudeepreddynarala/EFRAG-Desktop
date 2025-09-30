import React, { useState, useCallback } from 'react';
import { Upload, FileText, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface AIUploadInterfaceProps {
  onClose: () => void;
  onAnalyze: (content: string, filename?: string) => void;
  isAnalyzing?: boolean;
}

interface UploadedFile {
  name: string;
  size: number;
  content: string;
  type: string;
}

export const AIUploadInterface: React.FC<AIUploadInterfaceProps> = ({
  onClose,
  onAnalyze,
  isAnalyzing = false
}) => {
  const [mode, setMode] = useState<'upload' | 'paste'>('upload');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [pastedText, setPastedText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);

    const files = Array.from(e.dataTransfer.files);
    await processFiles(files);
  }, []);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const files = Array.from(e.target.files || []);
    await processFiles(files);
  }, []);

  const processFiles = async (files: File[]) => {
    const supportedTypes = [
      'text/plain',
      'application/pdf',
      'application/json',
      'text/csv',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    for (const file of files) {
      // Check file type
      if (!supportedTypes.includes(file.type) && !file.name.match(/\.(txt|pdf|json|csv|docx)$/i)) {
        setError(`Unsupported file type: ${file.name}. Please use TXT, PDF, CSV, JSON, or DOCX files.`);
        continue;
      }

      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError(`File too large: ${file.name}. Maximum size is 10MB.`);
        continue;
      }

      try {
        let content = '';

        if (file.type === 'text/plain' || file.type === 'text/csv' || file.type === 'application/json') {
          content = await file.text();
        } else if (file.type === 'application/pdf') {
          // PDF extraction will be handled by electron main process
          content = await readPDFFile(file);
        } else {
          setError(`Cannot extract text from ${file.name}. Please convert to TXT or PDF first.`);
          continue;
        }

        const uploadedFile: UploadedFile = {
          name: file.name,
          size: file.size,
          content,
          type: file.type
        };

        setUploadedFiles(prev => [...prev, uploadedFile]);
      } catch (err) {
        console.error('Error reading file:', err);
        setError(`Failed to read ${file.name}`);
      }
    }
  };

  const readPDFFile = async (file: File): Promise<string> => {
    // For now, just read as text. In production, use pdf-parse or similar
    // This is a placeholder - we'll implement proper PDF extraction next
    const arrayBuffer = await file.arrayBuffer();
    const text = new TextDecoder().decode(arrayBuffer);

    // Try to extract readable text (very basic extraction)
    const matches = text.match(/[A-Za-z0-9\s.,;:!?()\-\[\]{}'"]+/g);
    return matches ? matches.join(' ') : text;
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleAnalyze = () => {
    if (mode === 'upload' && uploadedFiles.length > 0) {
      // Combine all uploaded files
      const combinedContent = uploadedFiles.map(f =>
        `=== File: ${f.name} ===\n${f.content}`
      ).join('\n\n');

      onAnalyze(combinedContent, uploadedFiles[0].name);
    } else if (mode === 'paste' && pastedText.trim()) {
      onAnalyze(pastedText.trim(), 'Pasted Text');
    }
  };

  const canAnalyze = (mode === 'upload' && uploadedFiles.length > 0) ||
                     (mode === 'paste' && pastedText.trim().length > 0);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-background rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-border">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">AI Document Analysis</h2>
              <p className="text-blue-100 mt-1">Upload your sustainability documents or paste text</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
              disabled={isAnalyzing}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Mode Toggle */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setMode('upload')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${
                mode === 'upload'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
              disabled={isAnalyzing}
            >
              <Upload className="w-4 h-4 inline mr-2" />
              Upload Files
            </button>
            <button
              onClick={() => setMode('paste')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${
                mode === 'paste'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
              disabled={isAnalyzing}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Paste Text
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Upload Mode */}
          {mode === 'upload' && (
            <div>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragging
                    ? 'border-primary bg-accent'
                    : 'border-border hover:border-primary/50'
                } ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <input
                  type="file"
                  id="file-input"
                  className="hidden"
                  onChange={handleFileSelect}
                  multiple
                  accept=".txt,.pdf,.json,.csv,.docx"
                  disabled={isAnalyzing}
                />
                <label htmlFor="file-input" className="cursor-pointer">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-semibold text-foreground mb-2">
                    Drop files here or click to browse
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Supports: TXT, PDF, CSV, JSON, DOCX (max 10MB each)
                  </p>
                </label>
              </div>

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h3 className="font-semibold text-foreground mb-2">
                    Uploaded Files ({uploadedFiles.length})
                  </h3>
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-accent border border-border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="font-medium text-foreground">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                        disabled={isAnalyzing}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Paste Mode */}
          {mode === 'paste' && (
            <div>
              <Textarea
                placeholder="Paste your sustainability report text here...&#10;&#10;You can include emissions data, employee counts, energy usage, governance policies, or any other sustainability information. The AI will extract relevant data for your VSME form."
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                className="min-h-[300px] font-mono text-sm"
                disabled={isAnalyzing}
              />
              <p className="text-xs text-muted-foreground mt-2">
                {pastedText.length} characters
              </p>
            </div>
          )}

          {/* Privacy Notice */}
          <div className="mt-6 p-4 bg-accent border border-border rounded-lg">
            <div className="flex items-start gap-2">
              <div className="text-2xl">🔒</div>
              <div>
                <p className="font-semibold text-foreground mb-1">
                  100% Local Processing
                </p>
                <p className="text-sm text-muted-foreground">
                  Your documents are processed entirely on your computer. No data is sent to external servers.
                  The AI model runs locally and all extracted information stays on your machine.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
              disabled={isAnalyzing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAnalyze}
              disabled={!canAnalyze || isAnalyzing}
              className="flex-1 font-semibold"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Analyze with AI
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
