# EFRAG Desktop - Development Documentation

## Current Status
- **Branch**: `main`
- **Version**: 1.0.0
- **Last Updated**: 2025-09-30

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
- **Feature**: Experimental AI-powered form autofill functionality
- **Priority**: Future enhancement

## Feature Overview
Add an experimental feature that allows users to:
1. Download a local LLM (not packaged with app)
2. Upload files or paste text to the AI
3. Auto-fill VSME sustainability reporting form
4. Get feedback on what was identified and what needs attention

## Implementation Plan

### Phase 1: UI/UX Design
- [ ] Add "Use AI" button/link in the VSME form
- [ ] Create AI setup wizard/modal with instructions
- [ ] Design file upload interface
- [ ] Design text paste interface
- [ ] Create feedback/review panel showing:
  - What the AI identified
  - What fields were filled
  - What needs user attention/review

### Phase 2: Local LLM Integration
- [ ] Research recommended local LLM options (Ollama, LM Studio, etc.)
- [ ] Create setup guide for chosen LLM
- [ ] Implement LLM communication layer (likely REST API)
- [ ] Handle LLM connection status
- [ ] Error handling for when LLM is not running

### Phase 3: Document Processing
- [ ] Implement file upload functionality
- [ ] Support common document formats (PDF, TXT, CSV, etc.)
- [ ] Extract text from uploaded documents
- [ ] Implement text paste functionality
- [ ] Prepare context/prompts for LLM

### Phase 4: Form Auto-fill Logic
- [ ] Design prompt engineering for VSME form fields
- [ ] Map LLM responses to form fields
- [ ] Implement field population logic
- [ ] Add validation layer
- [ ] Track what was auto-filled vs. manual

### Phase 5: Feedback System
- [ ] Create confidence scoring for auto-filled fields
- [ ] Highlight fields needing review
- [ ] Show extraction summary
- [ ] Allow users to accept/reject suggestions
- [ ] Provide explanations for field mappings

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
- [ ] Test with different LLM models
- [ ] Error handling improvements
- [ ] Performance optimization
- [ ] User documentation

## Technical Considerations

### Recommended LLM Approach - 100% LOCAL PROCESSING
**All data stays on user's computer - zero external API calls**

#### Multi-Tier Model Support (auto-detected based on RAM)
**Models specifically chosen for data extraction performance:**
- **Tier 1 (4-8GB RAM)**: Qwen 2.5 3B (2.0GB) or Gemma 2B (1.7GB)
  - Qwen 3B beats even Llama 70B at extraction tasks
- **Tier 2 (8-16GB RAM)**: Mistral 7B (4.4GB) or Qwen 2.5 7B (4.7GB)
  - Mistral: Best for structured data extraction (fast & precise)
  - Qwen: Superior extraction with hybrid reasoning modes
- **Tier 3 (16GB+ RAM)**: Qwen 2.5 14B (8.2GB) or Mistral Nemo 12B (7.1GB)
  - Maximum accuracy for complex sustainability reports

#### Supported LLM Backends (user choice)
- **Ollama** (Primary): CLI-based, easy install, REST API, cross-platform
- **LM Studio** (Alternative): GUI app, user-friendly, drag-and-drop models
- **Jan** (Alternative): Fully offline ChatGPT-like interface

All backends run 100% locally with no internet connection required.

### Architecture
```
EFRAG Desktop (Electron)
    ↓
Local LLM Server (Ollama/similar)
    ↓ REST API
Document → Extract Text → Send to LLM → Parse Response → Fill Form
```

### Data Privacy & Security
- **100% local processing** - All AI computation happens on user's machine
- **Zero external API calls** - No data ever sent to cloud/external servers
- **Offline capable** - Works without internet connection after model download
- **Sensitive data safe** - Sustainability reports may contain proprietary business data
- **Model storage** - All AI models stored locally on user's disk
- **No telemetry** - No usage data collected or transmitted

### User Flow
1. User clicks "Use AI" in VSME form
2. If LLM not detected → Show setup instructions with download link
3. If LLM running → Show upload/paste interface
4. User provides documents/text
5. AI processes and suggests form values
6. User reviews suggestions in feedback panel
7. User accepts/rejects/modifies before final submission

## Files to Create/Modify

### New Files
- `src/components/AIAssistant/AISetupWizard.tsx`
- `src/components/AIAssistant/AIUploadInterface.tsx`
- `src/components/AIAssistant/AIFeedbackPanel.tsx`
- `src/services/llmService.ts`
- `src/services/documentExtractor.ts`
- `src/utils/formMapper.ts`
- `src/types/ai.types.ts`

### Files to Modify
- `src/components/VSMEForm.tsx` - Add AI integration
- Main Electron process - Add file reading capabilities
- Package.json - Add any necessary dependencies

## Dependencies to Add
- `pdf-parse` or `pdfjs-dist` - PDF text extraction
- `mammoth` - DOCX support (if needed)
- `axios` - HTTP client for LLM API calls

## Notes
- Keep the feature clearly marked as "Experimental"
- Make it easy to enable/disable
- Ensure all AI operations are non-blocking
- Provide clear progress indicators
- Keep setup steps minimal (goal: <3 steps to get running)

## Next Steps
1. Finalize LLM choice (Ollama recommended)
2. Create AI setup wizard UI
3. Implement LLM connection service
4. Build document upload/text paste interface
5. Design prompt templates for form extraction
6. Implement auto-fill logic
7. Create feedback/review panel
8. Test and iterate
