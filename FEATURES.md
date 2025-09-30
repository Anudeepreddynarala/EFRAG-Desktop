# EFRAG Desktop - Features Overview

## Core Features from Original Web App

### 1. VSME Sustainability Reporting Form
Complete implementation of the Voluntary Sustainability Reporting Standard for Medium-sized Entities.

**General Information Section:**
- Entity name and identifier
- Legal form
- Reporting period (start/end dates)
- Country of operation
- NACE sector classification
- Number and geolocation of sites

**Environmental Disclosures:**
- Energy consumption tracking (total and renewable)
- Greenhouse gas emissions (Scope 1, 2, and 3)
- Water usage monitoring
- Waste management data
- Biodiversity impact assessment
- Circular economy principles
- Climate risk assessment
- Automatic emissions intensity calculations

**Social Disclosures:**
- Total workforce numbers
- Employment contract types (full-time, part-time, temporary)
- Employee demographics
- Worker safety metrics

### 2. Fuel Converter
Convert various fuel types to energy measurements.

**Features:**
- Support for 50+ fuel types
- Multiple fuel states (solid, liquid, gaseous)
- Automatic Net Calorific Value (NCV) calculations
- Density-based conversions
- Renewable vs non-renewable tracking
- Multiple fuel entry support
- Total energy summation
- Real-time calculations

**Supported Fuel Types:**
- Natural gas, LPG, petroleum products
- Coal, biomass, biofuels
- Industrial waste fuels
- Renewable energy sources

### 3. Unit Converter
Multi-category measurement conversion tool.

**Conversion Categories:**
- **Mass:** kg, g, tonnes, pounds, ounces
- **Volume:** liters, m³, gallons, barrels
- **Energy Consumption:** MWh, kWh, GJ, TJ
- **Density:** kg/m³, g/cm³, kg/L
- **Net Calorific Value:** MJ/kg, MJ/m³, kWh/kg

**Features:**
- Bidirectional conversion
- Multiple conversion rows
- Real-time calculation
- High precision results

## New Desktop-Only Features

### 4. Local Data Persistence
**SQLite Database:**
- All reports saved locally
- No internet required
- Fast query performance
- Reliable data storage
- Automatic backup capability

**Database Features:**
- Reports table with full history
- Settings storage
- Timestamps for created/updated
- Efficient indexing
- ACID compliance

### 5. Native File Operations
**Save & Load:**
- Native OS file dialogs
- Choose custom save locations
- Quick access to recent files
- Automatic file naming
- Extension filtering

**Supported Operations:**
- Save report to database
- Load report by ID
- List all reports
- Delete reports
- Export to file system
- Import from file system

### 6. PDF Export
Professional PDF generation for reports.

**PDF Features:**
- Formatted title and headers
- Structured data tables
- Auto-pagination
- Page numbering
- Professional styling
- Color-coded sections
- Report metadata
- Generation timestamp

**Sections Included:**
- Cover page with report name
- General information table
- Environmental metrics table
- Social disclosures table
- Automatic page breaks
- Footer with page numbers

### 7. JSON Import/Export
**Export Features:**
- Complete report data
- Formatted JSON (readable)
- Native save dialog
- Custom file naming

**Import Features:**
- Parse and validate JSON
- Error handling for invalid files
- Native file picker
- Restore all form data

**Use Cases:**
- Report backups
- Data sharing
- Version control
- Migration between systems
- Template creation

### 8. CSV Export
**Features:**
- Export tabular data
- Comma-separated values
- Excel-compatible
- Custom delimiters
- Quote escaping

**Use Cases:**
- Data analysis
- Spreadsheet import
- Reporting to stakeholders
- Integration with other tools

### 9. Native Application Menu
**File Menu:**
- New Report (Ctrl/Cmd+N)
- Open Report (Ctrl/Cmd+O)
- Save Report (Ctrl/Cmd+S)
- Export as PDF (Ctrl/Cmd+E)
- Export as JSON
- Import
- Quit

**Edit Menu:**
- Undo/Redo
- Cut/Copy/Paste
- Select All
- Standard editing operations

**View Menu:**
- Reload
- Force Reload
- Toggle DevTools
- Zoom In/Out/Reset
- Toggle Fullscreen

**Window Menu:**
- Minimize
- Zoom
- Bring All to Front (macOS)
- Close

**Help Menu:**
- About EFRAG Desktop
- Version information

### 10. Keyboard Shortcuts
Full keyboard navigation support:
- `Ctrl/Cmd+N` - New Report
- `Ctrl/Cmd+O` - Open Report
- `Ctrl/Cmd+S` - Save Report
- `Ctrl/Cmd+E` - Export PDF
- `Ctrl/Cmd+Q` - Quit (macOS)
- `Alt+F4` - Quit (Windows)

### 11. Cross-Platform Support
**macOS:**
- Apple Silicon (M1/M2/M3) native
- Intel x64 support
- DMG installer
- ZIP distribution
- Native menu bar
- macOS conventions

**Windows:**
- Windows 10/11 support
- NSIS installer
- Portable executable
- No-install option
- Windows conventions
- Start menu integration

### 12. Offline-First Architecture
- No internet connection required
- All data stored locally
- No external API dependencies
- Fast performance
- Privacy-focused
- Works anywhere

### 13. Auto-Save & Data Recovery
- Local database transactions
- Data integrity checks
- Crash recovery
- No data loss
- Reliable storage

### 14. Multi-Window Support (Future)
- Open multiple reports
- Compare reports side-by-side
- Independent windows
- Shared database

## Technical Features

### Security
- Context isolation enabled
- No remote code execution
- Sandboxed renderer process
- Secure IPC communication
- No eval() usage
- Content Security Policy

### Performance
- Fast startup time
- Lazy loading
- Code splitting
- Optimized builds
- Native modules
- Hardware acceleration

### Developer Experience
- Hot Module Replacement (HMR)
- TypeScript support
- ESLint configuration
- Automatic type checking
- Source maps
- DevTools integration

### UI/UX
- Shadcn UI components
- Tailwind CSS styling
- Responsive design
- Dark mode support (inherited)
- Smooth animations
- Accessibility features

## Planned Features (Future Releases)

1. **Auto-Updates**
   - Automatic version checking
   - Background downloads
   - One-click updates

2. **Cloud Sync (Optional)**
   - Backup to cloud
   - Sync across devices
   - Encryption at rest

3. **Templates**
   - Report templates
   - Quick start presets
   - Industry-specific templates

4. **Data Visualization**
   - Charts and graphs
   - Trend analysis
   - Comparative reporting

5. **Multi-Language Support**
   - Internationalization
   - Multiple language packs
   - RTL support

6. **Advanced Analytics**
   - Year-over-year comparison
   - Benchmark against industry
   - Predictive analysis

7. **Collaboration**
   - Multi-user editing
   - Comments and notes
   - Approval workflows

8. **API Integration**
   - REST API
   - Webhook support
   - Third-party integrations

## Feature Comparison

| Feature | Web App | Desktop App |
|---------|---------|-------------|
| VSME Form | ✅ | ✅ |
| Fuel Converter | ✅ | ✅ |
| Unit Converter | ✅ | ✅ |
| Local Database | ❌ | ✅ |
| PDF Export | ❌ | ✅ |
| File Operations | ❌ | ✅ |
| Native Menus | ❌ | ✅ |
| Keyboard Shortcuts | Limited | ✅ |
| Offline Support | Partial | ✅ Full |
| Auto-Save | ❌ | ✅ |
| Import/Export | ❌ | ✅ |
| Cross-Platform | Browser | ✅ Native |
