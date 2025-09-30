# EFRAG Desktop

A cross-platform desktop application for sustainability reporting following EFRAG (European Financial Reporting Advisory Group) standards.

## Features

### Core Functionality
- **VSME Form**: Comprehensive Voluntary Sustainability Reporting Standard for Medium-sized Entities
  - General company information collection
  - Environmental metrics (energy, emissions, water, waste)
  - Social disclosures (workforce, employment)
  - NACE sector classification
  - Automatic calculations

- **Fuel Converter**: Convert 50+ fuel types to energy measurements (MWh)
  - Multiple fuel states (solid, liquid, gas)
  - Renewable/non-renewable tracking

- **Unit Converter**: Convert measurements across multiple categories
  - Mass, Volume, Energy, Density, Net Calorific Value

### Desktop-Specific Features
- **Local Data Persistence**: SQLite database for storing reports
- **File Operations**: Native save/load dialogs
- **PDF Export**: Generate professional PDF reports
- **JSON Import/Export**: Backup and share report data
- **Native Menus**: OS-integrated application menus
- **Offline Operation**: Full functionality without internet connection
- **Cross-Platform**: Runs on Windows and macOS

## Technology Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Framework**: Tailwind CSS + shadcn-ui
- **Desktop Framework**: Electron
- **Database**: SQLite (better-sqlite3)
- **PDF Generation**: jsPDF + html2canvas
- **State Management**: React Query + React Hook Form

## Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev
```

The application will start in Electron with hot-reload enabled.

### Building

```bash
# Build for current platform
npm run build

# Build for Windows
npm run build:win

# Build for macOS
npm run build:mac

# Build without packaging (for testing)
npm run build:dir
```

Built applications will be in the `release/` directory.

## Project Structure

```
EFRAG-app/
├── electron/           # Electron main and preload scripts
│   ├── main.ts        # Main process
│   ├── preload.ts     # Preload script (IPC bridge)
│   └── tsconfig.json  # TypeScript config for Electron
├── src/               # React application
│   ├── components/    # React components
│   ├── hooks/         # Custom hooks (including Electron hooks)
│   ├── pages/         # Page components
│   ├── utils/         # Utilities (PDF export, file operations)
│   └── data/          # Static data files
├── public/            # Static assets
├── build/             # Build assets (icons)
└── dist/              # Built web app
```

## Building for Distribution

### Windows
The build creates:
- NSIS installer (.exe)
- Portable executable

Requirements:
- Windows 10 or later
- No additional runtime dependencies

### macOS
The build creates:
- DMG disk image
- ZIP archive

Requirements:
- macOS 10.13 or later
- Code signing recommended for distribution

## Database

The application uses SQLite for local storage:
- Location: User data directory (`app.getPath('userData')`)
- File: `efrag.db`
- Tables:
  - `reports`: Saved sustainability reports
  - `settings`: Application settings

## Keyboard Shortcuts

- `Ctrl/Cmd + N`: New Report
- `Ctrl/Cmd + O`: Open Report
- `Ctrl/Cmd + S`: Save Report
- `Ctrl/Cmd + E`: Export as PDF
- `Ctrl/Cmd + Q`: Quit (macOS)

## License

Copyright © 2025 EFRAG Team

## Support

For issues and feature requests, please use the GitHub issue tracker.
