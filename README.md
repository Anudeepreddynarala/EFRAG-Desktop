# EFRAG Desktop

A desktop application for sustainability reporting following EFRAG (European Financial Reporting Advisory Group) standards.

## 📥 Download

**[→ Download EFRAG Desktop](QUICKSTART.md)** - Get started in minutes

- ✅ Windows 10/11 (x64)
- ✅ macOS (Apple Silicon & Intel)
- ✅ Offline-first, local data storage
- ✅ Free and open source

## What is EFRAG Desktop?

EFRAG Desktop helps companies create sustainability reports that meet European reporting standards. It's a simple application that runs on your computer (Windows or Mac) without needing an internet connection.

## Features

### 🤖 AI-Powered Form Filling
**NEW!** Let AI help fill out your sustainability form automatically:
- Upload documents (PDF, DOCX, XLSX, CSV, TXT, JSON)
- ChatGPT extracts data from your sustainability reports
- Zero hallucination policy - AI never guesses or infers data
- Every extracted value includes source citation and confidence score
- Clear transparency reports showing what was found vs. not found
- Review and approve each field before applying to form

**How it Works:**
1. Configure your OpenAI API key (one-time setup)
2. Upload sustainability reports or financial documents
3. Optionally add instructions (e.g., "Focus on Q1 2024 data")
4. AI analyzes documents and extracts form data
5. Review results with confidence scores and source citations
6. Accept, edit, or reject each field
7. Apply approved data to your form

**Powered by ChatGPT:**
- Uses GPT-4 Turbo, GPT-4o, or GPT-3.5 models
- Supports complex multi-document analysis
- Estimates cost before processing (~$0.05-$0.50 per form)
- Secure encrypted API key storage

**Supported File Formats:**
- ✅ Text files: TXT, CSV, JSON (fully supported)
- 🚧 Binary files: PDF, DOCX, XLSX (coming soon - requires main process integration)

**Privacy Notice:**
- Requires OpenAI API key (you control your data)
- Documents are sent to OpenAI for processing
- See [OpenAI Privacy Policy](https://openai.com/policies/privacy-policy)

### VSME Sustainability Form
Complete your Voluntary Sustainability Reporting Standard for Medium-sized Entities with an easy-to-use form that covers:
- Company information
- Environmental data (energy, emissions, water, waste)
- Social information (workforce, employment)
- Governance information
- Automatic calculations

### Fuel Converter
Convert over 50 different fuel types to energy measurements (MWh). Simply select your fuel type, enter the amount, and get instant calculations.

### Unit Converter
Convert between different measurement units across 5 categories:
- Mass (kg, tonnes, pounds)
- Volume (liters, gallons, barrels)
- Energy (MWh, kWh, GJ)
- Density
- Net Calorific Value

### Save Your Work
All your reports are saved automatically on your computer. You can:
- Save and load reports anytime
- Export reports as PDF files
- Share data as JSON files
- Work completely offline

## Technology

Built with modern web technologies wrapped in a desktop application:
- **Frontend**: React 18 + TypeScript
- **Desktop**: Electron 32
- **Database**: SQLite (local storage)
- **Styling**: Tailwind CSS + shadcn/ui
- **AI Integration**: OpenAI API (ChatGPT) - optional

## For Developers

### Quick Start
```bash
# Install dependencies
npm install

# Run in development mode
npm run dev
```

### Building for Production
```bash
# Build for current platform
npm run build

# Build for macOS
npm run build:mac

# Build for Windows
npm run build:win
```

Built applications will be in the `release/` directory.

### Project Structure
```
EFRAG-app/
├── electron/          # Electron main and preload scripts
├── src/              # React application
│   ├── components/   # React components
│   │   └── AIAssistant/  # AI form autofill components
│   ├── pages/        # Page components
│   ├── services/     # Business logic and AI services
│   ├── types/        # TypeScript type definitions
│   ├── hooks/        # Custom hooks
│   └── utils/        # Utilities
├── public/           # Static assets
└── release/          # Built applications
```

### Documentation
- [README.md](README.md) - This file
- [QUICKSTART.md](QUICKSTART.md) - Quick start guide
- [FEATURES.md](FEATURES.md) - Complete feature list
- [BUILD.md](BUILD.md) - Build instructions
- [CLAUDE.md](CLAUDE.md) - Development documentation and AI feature implementation

## License

Copyright © 2025 EFRAG Team

## Support

For technical issues, please check the [Quick Start Guide](QUICKSTART.md) or contact support.
