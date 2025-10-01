# EFRAG Desktop - Development Documentation

## Current Status
- **Branch**: `main`
- **Version**: 1.0.0
- **Last Updated**: 2025-10-01

## ✅ AI Assistant Feature - IMPLEMENTED (2025-10-01)

The ChatGPT-powered AI Assistant for automatic form filling is now **fully implemented** and ready for testing.

### What Was Built

**Complete End-to-End Flow:**
1. User clicks "Use AI Assistant" button in VSME form
2. API key setup (one-time) with connection testing
3. File upload via drag & drop or native file picker (PDF, DOCX, XLSX, CSV, TXT, JSON)
4. Optional user instructions for context
5. Document processing and AI analysis via ChatGPT
6. Review panel with confidence scores, source citations, and exact quotes
7. Accept/Edit/Reject workflow for each extracted field
8. Automatic form population with approved data

**Key Features Implemented:**
- ✅ Secure encrypted API key storage
- ✅ Multi-format document processing (PDF, Word, Excel, CSV, text)
- ✅ ChatGPT integration (GPT-4 Turbo, GPT-4o, GPT-3.5)
- ✅ Cost estimation before processing
- ✅ Zero-hallucination extraction (only explicit facts)
- ✅ Source attribution with exact quotes and page numbers
- ✅ Confidence scoring (HIGH/MEDIUM/LOW)
- ✅ Field-by-field review and approval
- ✅ Token usage and cost tracking
- ✅ Progress indicators and error handling

**Files Created/Modified:**
- 7 new service/utility files
- 5 new UI components
- Electron IPC handlers for file operations
- VSMEForm integration
- Comprehensive TypeScript types

**Dependencies Added:**
- `openai ^6.0.0` - ChatGPT API integration
- `pdf-parse ^1.1.1` - PDF text extraction
- `mammoth ^1.11.0` - DOCX text extraction
- `xlsx ^0.18.5` - Excel/CSV parsing
- `crypto-js ^4.2.0` - API key encryption

See implementation details below ⬇️

## Build System

### Cross-Platform Build Configuration (Updated 2025-09-30)

#### Problem Solved: Windows Build with Native Modules
The app uses `better-sqlite3`, a native C++ module that must be compiled for each platform. Building Windows installers from macOS was packaging macOS-compiled native modules, causing installation failures on Windows.

**Solution Implemented:**
- Added `@electron/rebuild` to properly rebuild native modules for target platforms
- Added `postinstall` script to automatically install app dependencies for correct Electron version
- Configured `asarUnpack` for better-sqlite3 to ensure native modules are accessible
- Set explicit architecture targets (x64 for Windows, x64/arm64 for macOS)

#### Build Commands
- **Mac**: `npm run build:mac` - Builds DMG and ZIP for Intel (x64) and Apple Silicon (arm64)
- **Windows**: `npm run build:win` - Builds NSIS installer and portable exe for x64
- **All platforms**: `npm run build` - Builds for current platform

#### Key Configuration (package.json)
```json
{
  "scripts": {
    "postinstall": "electron-builder install-app-deps",
    "build:win": "vite build && electron-builder --win --x64",
    "build:mac": "vite build && electron-builder --mac"
  },
  "build": {
    "asarUnpack": [
      "node_modules/better-sqlite3/**/*"
    ],
    "mac": {
      "target": [
        { "target": "dmg", "arch": ["x64", "arm64"] },
        { "target": "zip", "arch": ["x64", "arm64"] }
      ]
    },
    "win": {
      "target": [
        { "target": "nsis", "arch": ["x64"] },
        { "target": "portable", "arch": ["x64"] }
      ]
    }
  }
}
```

#### Verification
After building, verify native modules are correctly compiled:
```bash
# Check Windows build (should show "PE32+ executable... x86-64, for MS Windows")
file release/win-unpacked/resources/app.asar.unpacked/node_modules/better-sqlite3/build/Release/better_sqlite3.node

# Check Mac build (should show "Mach-O 64-bit bundle arm64" or "x86_64")
file release/mac-arm64/EFRAG\ Desktop.app/Contents/Resources/app.asar.unpacked/node_modules/better-sqlite3/build/Release/better_sqlite3.node
```

#### Build Outputs
- **Windows**: `release/EFRAG Desktop Setup 1.0.0.exe` (NSIS installer), `release/EFRAG Desktop 1.0.0.exe` (portable)
- **Mac**: `release/EFRAG Desktop-1.0.0-arm64.dmg`, `release/EFRAG Desktop-1.0.0.dmg`, ZIP variants

---

# EFRAG Desktop - AI Autofill Feature Development

## Planned Feature Status
- **Branch**: TBD (not yet started)
- **Feature**: ChatGPT API-powered form autofill functionality
- **Priority**: Future enhancement

## Feature Overview
Add a feature that allows users to:
1. Configure their OpenAI API key
2. Upload files (PDF, DOCX, TXT, CSV, Excel) to the AI assistant
3. Provide additional instructions/context
4. Auto-fill VSME sustainability reporting form using ChatGPT
5. Review what was identified and what needs attention

## Implementation Plan

### Phase 1: UI/UX Design
- [ ] Add "Use AI Assistant" button in the VSME form
- [ ] Create API key configuration interface (with secure storage)
- [ ] Design file upload interface (drag & drop + file picker)
  - Support multiple files
  - Show file list with remove option
  - Display file size limits
- [ ] Design text instruction interface (additional context for AI)
- [ ] Create feedback/review panel showing:
  - What the AI identified from documents
  - What fields were filled
  - Source citations for each filled field
  - What needs user attention/review

### Phase 2: ChatGPT API Integration
- [ ] Implement secure API key storage (encrypted in local DB)
- [ ] Create OpenAI API service layer
- [ ] Use GPT-4 with vision for document analysis (supports images of documents)
- [ ] Use Assistants API with file uploads for multi-document processing
- [ ] Handle API errors (invalid key, rate limits, network issues)
- [ ] Add loading states and progress indicators

### Phase 3: Document Processing
- [ ] Implement file upload functionality (Electron IPC)
- [ ] Support document formats:
  - PDF (text extraction + OCR for images)
  - DOCX/DOC (Microsoft Word)
  - TXT (plain text)
  - CSV/Excel (tabular data)
  - Images (JPG, PNG) via vision API
- [ ] Extract text from uploaded documents
- [ ] Prepare files for ChatGPT upload
- [ ] Create context/prompts for GPT

### Phase 4: Form Auto-fill Logic
- [ ] Design prompt engineering for VSME form fields
- [ ] Send form schema + documents + user instructions to ChatGPT
- [ ] Parse structured JSON response from GPT
- [ ] Map GPT responses to form fields
- [ ] Implement field population logic
- [ ] Add validation layer
- [ ] Track what was auto-filled vs. manual

### Phase 5: Feedback System
- [ ] Create confidence scoring for auto-filled fields
- [ ] Highlight fields needing review
- [ ] Show extraction summary with sources
- [ ] Allow users to accept/reject/modify suggestions
- [ ] Provide explanations for field mappings
- [ ] Show API usage costs (token count)

## CRITICAL: AI Behavior Rules

### Zero Hallucination Policy
**The AI must NEVER make up or guess data. This is sustainability reporting and accuracy is legally critical.**

1. **Only Extract, Never Infer**
   - If data is not explicitly in the document, mark field as "NOT FOUND"
   - Never calculate, estimate, or guess values
   - Never fill fields with placeholder or example data
   - If uncertain about a value, err on the side of caution and don't fill it

2. **Source Attribution (Mandatory)**
   - Every filled field MUST include:
     - Exact quote from source document
     - Page number or section reference
     - Confidence level (high/medium/low)
   - Format: "Found in [filename], page X: '[exact quote]'"

3. **Transparency Report**
   The AI must provide:
   - **Fields Successfully Filled**: List with sources
   - **Fields Not Found**: Clear list of missing data
   - **Fields Requiring Verification**: Ambiguous or low-confidence matches
   - **Source Summary**: Which documents were most useful

4. **Prompt Design Principles**
   ```
   You are a data extraction assistant for sustainability reporting.

   CRITICAL RULES:
   - Extract ONLY facts explicitly stated in the documents
   - NEVER infer, calculate, or estimate values
   - If data is not found, respond with "NOT_FOUND"
   - Always cite exact source: filename, location, and quote
   - Mark confidence: HIGH (exact match), MEDIUM (needs verification), LOW (uncertain)

   For each form field, respond in JSON:
   {
     "field_name": "companyName",
     "value": "Acme Corp" | null,
     "found": true | false,
     "source": "annual_report.pdf, page 3",
     "quote": "Acme Corp is a leading...",
     "confidence": "HIGH" | "MEDIUM" | "LOW",
     "notes": "Additional context if needed"
   }
   ```

5. **Validation Checks**
   - Flag if multiple conflicting values found for same field
   - Flag if value format doesn't match expected type (e.g., text in number field)
   - Flag if extracted value seems unusual (outliers, unexpected units)

6. **User Review Required**
   - Show side-by-side: Extracted value vs. Source quote
   - Allow user to accept, edit, or reject each field
   - Don't auto-save; require explicit user confirmation
   - Maintain audit trail of what was auto-filled vs. manually entered

### Phase 6: Testing & Polish
- [ ] Test with various document types
- [ ] Test with different API key scenarios
- [ ] Error handling improvements
- [ ] Performance optimization
- [ ] User documentation

## Technical Considerations

### ChatGPT API Approach
**Uses OpenAI API for intelligent document processing**

#### Model Selection
- **Primary**: GPT-4 Turbo (gpt-4-turbo-preview)
  - Best for complex document analysis
  - 128K context window (handles large documents)
  - Vision capabilities for image/PDF analysis
- **Alternative**: GPT-4o (gpt-4o)
  - Faster and cheaper than GPT-4 Turbo
  - Excellent for structured data extraction
- **Fallback**: GPT-3.5 Turbo
  - If user wants lower cost option

#### OpenAI Features to Use
1. **Chat Completions API** - Main interface for form filling
2. **Vision API** - For processing document images/scanned PDFs
3. **Assistants API** - For multi-document context management
4. **File Upload API** - Direct file processing by OpenAI
5. **Function Calling** - Structured output for form fields

### Architecture
```
EFRAG Desktop (Electron)
    ↓ API Key
OpenAI API (ChatGPT)
    ↓ JSON Response
Document Upload → GPT Processing → Structured Data → Fill Form
```

### Data Privacy & Security
- **API key encryption** - Stored encrypted in local SQLite DB
- **User owns their data** - Documents sent to OpenAI with user consent
- **No app telemetry** - We don't track what users send to OpenAI
- **OpenAI privacy policy applies** - Users should review OpenAI's data policies
- **Opt-in feature** - Users must explicitly enable and configure
- **Clear warnings** - Inform users data will be sent to OpenAI
- **API key security** - Never logged or transmitted except to OpenAI

### User Flow
1. User clicks "Use AI Assistant" in VSME form
2. If no API key → Show API key setup modal
   - Link to OpenAI API keys page
   - Instructions on getting an API key
   - Input field with masked display
   - "Test Connection" button
3. User uploads files (drag & drop or file picker)
   - Show upload progress
   - Display file list with sizes
4. User provides additional instructions (optional text field)
   - Example: "Focus on Q1 2024 data" or "Company name is Acme Corp"
5. Click "Analyze Documents"
   - Show progress: "Uploading files..." → "Analyzing..." → "Extracting data..."
6. AI processes and returns suggestions
7. User reviews in feedback panel
   - See which fields were filled
   - View source citations
   - Accept/reject/modify each field
8. User saves finalized form

## Files to Create/Modify

### New Files
- `src/components/AIAssistant/AIAssistant.tsx` - Main AI assistant modal
- `src/components/AIAssistant/APIKeySetup.tsx` - API key configuration
- `src/components/AIAssistant/FileUploadZone.tsx` - Drag & drop file upload
- `src/components/AIAssistant/InstructionsInput.tsx` - User instruction text area
- `src/components/AIAssistant/ReviewPanel.tsx` - Review extracted data
- `src/services/openaiService.ts` - OpenAI API integration
- `src/services/documentProcessor.ts` - File reading and processing
- `src/services/apiKeyStorage.ts` - Secure API key encryption/storage
- `src/utils/formMapper.ts` - Map GPT response to VSME form fields
- `src/utils/promptTemplates.ts` - GPT prompt engineering
- `src/types/ai.types.ts` - TypeScript types for AI feature
- `electron/ipc/fileHandler.ts` - IPC for file operations

### Files to Modify
- `src/components/VSMEForm.tsx` - Add "Use AI Assistant" button
- `src/database/schema.ts` - Add table for encrypted API keys
- `electron/main.ts` - Add IPC handlers for file reading
- `package.json` - Add dependencies

## Dependencies to Add
```json
{
  "dependencies": {
    "openai": "^4.20.0",
    "pdf-parse": "^1.1.1",
    "mammoth": "^1.6.0",
    "xlsx": "^0.18.5",
    "crypto-js": "^4.2.0"
  }
}
```

## Cost Estimation
- **GPT-4 Turbo**: ~$10 per 1M input tokens, ~$30 per 1M output tokens
- **GPT-4o**: ~$5 per 1M input tokens, ~$15 per 1M output tokens
- **Typical form fill**: 5,000-20,000 input tokens (depending on document size)
- **Estimated cost per form**: $0.05 - $0.50

## Notes
- Clearly inform users data will be sent to OpenAI
- Show estimated cost before processing
- Ensure all AI operations are non-blocking
- Provide clear progress indicators
- Allow users to cancel mid-processing
- Cache API key securely (encrypted)
- Handle API rate limits gracefully

## Implementation Status (Updated 2025-10-01)

### ✅ Completed Components

#### Backend Services
- **`src/types/ai.types.ts`** - Complete type definitions for ChatGPT API integration
  - GPT model enums and configs
  - Extracted field types with confidence levels and source citations
  - AI analysis result structures
  - VSME form field schema (40+ core fields)
  - System prompt for EFRAG VSME extraction

- **`src/services/apiKeyStorage.ts`** - Secure API key management
  - AES encryption for API keys
  - localStorage storage (TODO: migrate to SQLite)
  - API key validation with OpenAI
  - Last used tracking

- **`src/services/documentProcessor.ts`** - Multi-format document processing
  - PDF text extraction (pdf-parse)
  - DOCX text extraction (mammoth)
  - Excel/CSV parsing (xlsx)
  - Plain text support
  - File validation and size limits

- **`src/services/openaiService.ts`** - OpenAI API integration
  - Chat completions with GPT-4/GPT-4o/GPT-3.5
  - Structured prompt building with EFRAG context
  - JSON response parsing and validation
  - Cost estimation before processing
  - Progress callbacks

#### UI Components
- **`src/components/AIAssistant/APIKeySetup.tsx`** - API key configuration
  - Masked API key input
  - Connection testing
  - Model selection (GPT-4 Turbo, GPT-4o, GPT-3.5)
  - Privacy warnings with links to OpenAI policies

- **`src/components/AIAssistant/FileUploadZone.tsx`** - File upload interface
  - Drag & drop support
  - Electron native file picker integration
  - Multi-file support (up to 10 files)
  - File type validation
  - Size limit enforcement (10MB per file)

- **`src/components/AIAssistant/InstructionsInput.tsx`** - User instructions input
  - Optional context for AI
  - Examples provided

- **`src/components/AIAssistant/ReviewPanel.tsx`** - Extraction review interface
  - Summary statistics (filled, not found, needs review)
  - Confidence badges (HIGH/MEDIUM/LOW)
  - Source citations with exact quotes
  - Accept/Reject/Edit actions for each field
  - Cost and token usage display
  - Processing time tracking

- **`src/components/AIAssistant/AIAssistant.tsx`** - Main orchestration component
  - Multi-step wizard (API setup → Upload → Processing → Review)
  - Progress indicators
  - Cost estimation
  - Error handling
  - Integration with VSMEForm

#### Electron Integration
- **`electron/preload.ts`** - IPC bridge additions
  - `readFileBuffer` - Read file as buffer for document processing
  - `selectFilesForAI` - Native file picker for AI documents
  - `processDocument` - Process documents in main process (PDF, DOCX, Excel)

- **`electron/main.ts`** - IPC handler implementations
  - File buffer reading with error handling
  - Multi-file selection dialog with format filters
  - Document processing with native modules (pdf-parse, mammoth, xlsx)
  - Support for PDF, DOCX, DOC, XLSX, XLS, CSV, TXT, JSON formats

#### Form Integration
- **`src/components/VSMEForm.tsx`** - AI Assistant integration
  - "Use AI Assistant" button in header
  - Modal integration
  - Form data application from AI results

### ✅ Document Processing Fully Implemented (2025-10-01)

**All document formats now supported via main process:**
- ✅ **PDF files** - Text extraction using pdf-parse
- ✅ **Word documents** - DOCX/DOC text extraction using mammoth
- ✅ **Excel/CSV files** - XLSX/XLS/CSV parsing using xlsx library
- ✅ **Text files** - TXT, JSON direct reading

**Implementation:**
- `electron/main.ts` - Added `process-document` IPC handler with native modules
- `electron/preload.ts` - Added `processDocument` method to API bridge
- `src/components/AIAssistant/AIAssistant.tsx` - Updated to use IPC for all file processing

All document processing now happens securely in the main Electron process, with extracted text sent to the renderer for AI analysis.

### 🔄 Next Steps
1. ~~**PRIORITY**: Move document processing to main process for PDF/DOCX/XLSX support~~ ✅ COMPLETED
2. Test AI Assistant end-to-end with real sustainability report documents
3. Add loading states and better error messages
4. Migrate API key storage to SQLite (encrypted table)
5. Add usage tracking and cost reporting
6. Test with various EFRAG sustainability report formats
