import { useCallback, useState } from 'react';
import { Upload, X, FileText, File, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UploadedFile } from '@/types/ai.types';

// Validation functions (moved from documentProcessor to avoid Node.js deps in renderer)
function validateFileSize(size: number): boolean {
  const maxSize = 10 * 1024 * 1024; // 10MB
  return size <= maxSize;
}

function validateFileType(type: string, name: string): boolean {
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/plain',
    'text/csv',
    'application/json'
  ];

  const allowedExtensions = ['.pdf', '.docx', '.doc', '.xlsx', '.xls', '.csv', '.txt', '.json'];

  return (
    allowedTypes.includes(type.toLowerCase()) ||
    allowedExtensions.some((ext) => name.toLowerCase().endsWith(ext))
  );
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

interface FileUploadZoneProps {
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
  maxFiles?: number;
}

export function FileUploadZone({ files, onFilesChange, maxFiles = 10 }: FileUploadZoneProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback(
    async (fileList: FileList) => {
      setError(null);

      const newFiles: UploadedFile[] = [];
      const errors: string[] = [];

      // Check max files limit
      if (files.length + fileList.length > maxFiles) {
        setError(`Maximum ${maxFiles} files allowed`);
        return;
      }

      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];

        // Validate file type
        if (!validateFileType(file.type, file.name)) {
          errors.push(`${file.name}: Unsupported file type`);
          continue;
        }

        // Validate file size
        if (!validateFileSize(file.size)) {
          errors.push(`${file.name}: File too large (max 10MB)`);
          continue;
        }

        // Check for duplicates
        if (files.some((f) => f.name === file.name)) {
          errors.push(`${file.name}: File already added`);
          continue;
        }

        // Create uploaded file object
        const uploadedFile: UploadedFile = {
          id: `${Date.now()}-${i}`,
          name: file.name,
          size: file.size,
          type: file.type,
          path: '' // Will be set by Electron
        };

        newFiles.push(uploadedFile);
      }

      if (errors.length > 0) {
        setError(errors.join('; '));
      }

      if (newFiles.length > 0) {
        onFilesChange([...files, ...newFiles]);
      }
    },
    [files, maxFiles, onFilesChange]
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();

      if (e.target.files && e.target.files.length > 0) {
        handleFiles(e.target.files);
      }
    },
    [handleFiles]
  );

  const handleElectronFilePicker = useCallback(async () => {
    try {
      const result = await window.electronAPI.selectFilesForAI();

      if (result && result.filePaths.length > 0) {
        const newFiles: UploadedFile[] = result.filePaths.map((filePath, index) => {
          const fileName = filePath.split(/[\\/]/).pop() || filePath;
          // Get file stats to determine size
          return {
            id: `${Date.now()}-${index}`,
            name: fileName,
            size: 0, // Will be determined when reading
            type: '', // Will be determined from extension
            path: filePath
          };
        });

        onFilesChange([...files, ...newFiles]);
      }
    } catch (error) {
      console.error('Error selecting files:', error);
      setError('Failed to select files');
    }
  }, [files, onFilesChange]);

  const removeFile = useCallback(
    (fileId: string) => {
      onFilesChange(files.filter((f) => f.id !== fileId));
      setError(null);
    },
    [files, onFilesChange]
  );

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) {
      return <FileText className="w-8 h-8 text-red-500" />;
    } else if (type.includes('word') || type.includes('document')) {
      return <FileText className="w-8 h-8 text-blue-500" />;
    } else if (type.includes('sheet') || type.includes('excel') || type.includes('csv')) {
      return <FileText className="w-8 h-8 text-green-500" />;
    } else {
      return <File className="w-8 h-8 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${dragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload className={`w-12 h-12 mx-auto mb-4 ${dragActive ? 'text-primary' : 'text-muted-foreground'}`} />

        <div className="space-y-2">
          <p className="text-sm font-medium">
            {dragActive ? 'Drop files here' : 'Drag & drop files here'}
          </p>
          <p className="text-xs text-muted-foreground">or</p>
          <Button variant="outline" size="sm" onClick={handleElectronFilePicker}>
            Browse Files
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-4">
          Supported: PDF, DOCX, XLSX, CSV, TXT, JSON (max 10MB each, {maxFiles} files max)
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Uploaded Files List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Uploaded Files ({files.length})</p>
          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                {getFileIcon(file.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(file.id)}
                  className="shrink-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
