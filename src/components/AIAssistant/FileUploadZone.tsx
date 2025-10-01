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

        // In Electron, File objects may have a `path` property with the full file path
        // Try multiple ways to get the file path
        let filePath = (file as any).path;

        if (!filePath && 'path' in file) {
          filePath = (file as any).path;
        }

        // Log for debugging
        console.log('🔵 File:', file.name, 'Path:', filePath, 'Keys:', Object.keys(file));

        // If no path (drag-and-drop), write to temp file
        if (!filePath || filePath === '') {
          console.log('🔵 No path found, writing to temp file...');
          try {
            const arrayBuffer = await file.arrayBuffer();
            const result = await window.electronAPI.writeTempFile(arrayBuffer, file.name);

            if (result.success && result.path) {
              filePath = result.path;
              console.log('🟢 Temp file created:', filePath);
            } else {
              errors.push(`${file.name}: ${result.error || 'Failed to create temp file'}`);
              continue;
            }
          } catch (error) {
            console.error('🔴 Error creating temp file:', error);
            errors.push(`${file.name}: Failed to process file`);
            continue;
          }
        }

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

        // Create uploaded file object with file path
        const uploadedFile: UploadedFile = {
          id: `${Date.now()}-${i}`,
          name: file.name,
          size: file.size,
          type: file.type,
          path: filePath
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
    console.log('🔵 Browse Files button clicked');
    console.log('🔵 window.electronAPI:', window.electronAPI);
    console.log('🔵 Available methods:', window.electronAPI ? Object.keys(window.electronAPI) : 'electronAPI is undefined!');
    console.log('🔵 selectFilesForAI exists?', typeof window.electronAPI?.selectFilesForAI);

    try {
      // Check if the API is available
      if (!window.electronAPI) {
        throw new Error('Electron API not available. This app must run in Electron, not a web browser.');
      }

      if (!window.electronAPI.selectFilesForAI) {
        throw new Error('File picker not available. Please restart the application.');
      }

      console.log('🔵 Calling selectFilesForAI...');
      const result = await window.electronAPI.selectFilesForAI();
      console.log('🔵 selectFilesForAI result:', result);

      if (result && result.filePaths && result.filePaths.length > 0) {
        const newFiles: UploadedFile[] = result.filePaths.map((filePath, index) => {
          const fileName = filePath.split(/[\\/]/).pop() || filePath;
          // Determine file type from extension
          const ext = filePath.split('.').pop()?.toLowerCase() || '';
          const typeMap: Record<string, string> = {
            'pdf': 'application/pdf',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'csv': 'text/csv',
            'txt': 'text/plain',
            'json': 'application/json'
          };

          return {
            id: `${Date.now()}-${index}`,
            name: fileName,
            size: 0, // Will be determined when processing
            type: typeMap[ext] || '',
            path: filePath
          };
        });

        console.log('🔵 Adding files:', newFiles);
        onFilesChange([...files, ...newFiles]);
      } else {
        console.log('🔵 No files selected or user cancelled');
      }
    } catch (error) {
      console.error('🔴 Error selecting files:', error);
      setError(`Failed to select files: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
