import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import { UploadedFile } from '@/types/ai.types';

/**
 * Extract text content from a PDF file
 */
async function extractPDFText(buffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

/**
 * Extract text content from a DOCX file
 */
async function extractDOCXText(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    console.error('Error extracting DOCX text:', error);
    throw new Error('Failed to extract text from DOCX');
  }
}

/**
 * Extract text content from an Excel file
 */
function extractExcelText(buffer: Buffer): string {
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    let text = '';

    workbook.SheetNames.forEach((sheetName) => {
      const sheet = workbook.Sheets[sheetName];
      text += `\n\n=== Sheet: ${sheetName} ===\n`;
      text += XLSX.utils.sheet_to_csv(sheet);
    });

    return text;
  } catch (error) {
    console.error('Error extracting Excel text:', error);
    throw new Error('Failed to extract text from Excel file');
  }
}

/**
 * Extract text content from a plain text file
 */
function extractPlainText(buffer: Buffer): string {
  return buffer.toString('utf-8');
}

/**
 * Process uploaded file and extract text content
 */
export async function processDocument(file: UploadedFile, fileBuffer: Buffer): Promise<string> {
  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();

  try {
    // PDF files
    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      return await extractPDFText(fileBuffer);
    }

    // Word documents
    if (
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileName.endsWith('.docx')
    ) {
      return await extractDOCXText(fileBuffer);
    }

    // Excel files
    if (
      fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      fileType === 'application/vnd.ms-excel' ||
      fileName.endsWith('.xlsx') ||
      fileName.endsWith('.xls') ||
      fileName.endsWith('.csv')
    ) {
      return extractExcelText(fileBuffer);
    }

    // Plain text files
    if (
      fileType === 'text/plain' ||
      fileType === 'text/csv' ||
      fileName.endsWith('.txt') ||
      fileName.endsWith('.csv') ||
      fileName.endsWith('.json')
    ) {
      return extractPlainText(fileBuffer);
    }

    throw new Error(`Unsupported file type: ${fileType}`);
  } catch (error) {
    console.error(`Error processing file ${file.name}:`, error);
    throw error;
  }
}

/**
 * Process multiple documents and return combined text
 */
export async function processMultipleDocuments(
  files: UploadedFile[],
  fileBuffers: Buffer[]
): Promise<{ filename: string; content: string }[]> {
  const processedDocs: { filename: string; content: string }[] = [];

  for (let i = 0; i < files.length; i++) {
    try {
      const content = await processDocument(files[i], fileBuffers[i]);
      processedDocs.push({
        filename: files[i].name,
        content
      });
    } catch (error) {
      console.error(`Failed to process ${files[i].name}:`, error);
      // Add error placeholder instead of failing completely
      processedDocs.push({
        filename: files[i].name,
        content: `[ERROR: Could not extract text from this file - ${error}]`
      });
    }
  }

  return processedDocs;
}

/**
 * Validate file size (max 10MB per file)
 */
export function validateFileSize(size: number): boolean {
  const maxSize = 10 * 1024 * 1024; // 10MB
  return size <= maxSize;
}

/**
 * Validate file type
 */
export function validateFileType(type: string, name: string): boolean {
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

/**
 * Get human-readable file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
