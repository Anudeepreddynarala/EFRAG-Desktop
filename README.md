# EFRAG Desktop

A desktop application for sustainability reporting following EFRAG (European Financial Reporting Advisory Group) standards.

## What is EFRAG Desktop?

EFRAG Desktop helps companies create sustainability reports that meet European reporting standards. It's a simple application that runs on your computer (Windows or Mac) without needing an internet connection.

## Features

### 🤖 AI-Powered Form Filling (Experimental)
**NEW!** Let AI help fill out your sustainability form automatically:
- Upload documents (PDF, TXT, CSV, JSON, DOCX) or paste text
- AI extracts data from your sustainability reports
- 100% local processing - your data never leaves your computer
- Zero hallucination policy - AI never guesses or infers data
- Every extracted value includes source citation and confidence score
- Clear transparency reports showing what was found vs. not found
- User-friendly setup with [Jan](https://jan.ai) - no command line needed

**Privacy & Security:**
- All AI processing runs locally on your computer
- No external API calls or internet connection required
- Suitable for sensitive business data
- Models optimized for data extraction (Qwen 2.5, Mistral, Gemma)

See [AI Assistant Documentation](AI_ASSISTANT.md) for setup and usage.

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
- **AI Integration**: Local LLM via Jan (optional)

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
- [AI_ASSISTANT.md](AI_ASSISTANT.md) - AI assistant setup and usage
- [BUILD.md](BUILD.md) - Build instructions

## License

Copyright © 2025 EFRAG Team

## Support

For technical issues, please check the [Quick Start Guide](QUICKSTART.md) or contact support.
