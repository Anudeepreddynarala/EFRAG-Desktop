# EFRAG Desktop

A desktop application for sustainability reporting following EFRAG (European Financial Reporting Advisory Group) standards.

## What is EFRAG Desktop?

EFRAG Desktop helps companies create sustainability reports that meet European reporting standards. It's a simple application that runs on your computer (Windows or Mac) without needing an internet connection.

## Features

### VSME Sustainability Form
Complete your Voluntary Sustainability Reporting Standard for Medium-sized Entities with an easy-to-use form that covers:
- Company information
- Environmental data (energy, emissions, water, waste)
- Social information (workforce, employment)
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
- **Desktop**: Electron
- **Database**: SQLite (local storage)
- **Styling**: Tailwind CSS

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
│   ├── pages/        # Page components
│   ├── hooks/        # Custom hooks
│   └── utils/        # Utilities
├── public/           # Static assets
└── release/          # Built applications
```

## License

Copyright © 2025 EFRAG Team

## Support

For technical issues, please check the [Quick Start Guide](QUICKSTART.md) or contact support.
