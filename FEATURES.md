# EFRAG Desktop - Complete Feature List

## 🤖 AI-Powered Form Filling (Experimental)

### Overview
Automatically extract sustainability data from your documents using local AI models. This feature runs entirely on your computer with zero external API calls, making it suitable for sensitive business data.

### Key Features
- **Document Upload**: Supports PDF, TXT, CSV, JSON, and DOCX files
- **Text Paste**: Direct text input for quick data extraction
- **Multi-Document Analysis**: Upload multiple files for comprehensive extraction
- **Drag & Drop**: Intuitive file upload interface

### AI Models
**Optimized for data extraction tasks:**
- **Qwen 2.5** (3B, 7B, 14B) - Alibaba's specialized extraction models
- **Mistral** (7B, Nemo 12B) - Best-in-class for structured data
- **Gemma** (2B) - Google's efficient small model

**Auto-Detection:**
- Detects your system RAM automatically
- Recommends appropriate model tier (Ultra-light/Balanced/High-performance)
- Models range from 1.7GB to 8.2GB in size

### Zero Hallucination Policy
**The AI NEVER guesses or makes up data:**
- Extracts only explicitly stated facts
- Never infers, calculates, or estimates values
- Provides exact quotes from source documents
- Clear reporting of found vs. not found data
- Confidence scoring for every extracted value

### Transparency & Trust
**Every extracted value includes:**
- Source document reference (filename, page/location)
- Exact quote from the original document
- Confidence score (0-1 scale)
- Needs-review flag for ambiguous extractions

**User receives detailed reports:**
- ✅ Fields successfully filled (with sources)
- ❌ Fields not found in documents
- ⚠️ Fields needing review (low confidence or conflicts)
- 📊 Data quality warnings

### Privacy & Security
- **100% Local Processing**: All AI runs on your computer
- **No External APIs**: Zero data transmission to external servers
- **Offline Capable**: Works without internet after model download
- **Business Data Safe**: Suitable for confidential sustainability reports
- **Open Source AI**: Uses Jan - fully offline ChatGPT alternative

### Setup Process
1. Click "Use AI Assistant" button in the form
2. System auto-detects your RAM and CPU
3. Choose recommended AI model
4. Download and install Jan (user-friendly, no CLI)
5. Start extracting data from documents

### Supported Data Fields
**General Information:**
- Company name, legal form, country
- Reporting period dates
- Employee count, revenue, assets

**Environmental:**
- Energy consumption (total & renewable)
- GHG emissions (Scope 1, 2, 3)
- Water consumption
- Waste generation (total & hazardous)

**Social:**
- Employee turnover
- Collective agreement coverage
- Work-related accidents
- Gender diversity metrics

**Governance:**
- Board composition
- Sustainability committees
- Anti-corruption policies

---

## 📝 VSME Sustainability Form

### Complete Reporting Standard
Digital implementation of EFRAG's Voluntary Sustainability Reporting Standard for Medium-sized Entities (VSME).

### Form Sections
1. **General Information**
   - Entity identification
   - Reporting period
   - Business classification (NACE codes)
   - Contact information

2. **Environmental**
   - Climate change (GHG emissions, energy)
   - Pollution (air, water, soil)
   - Water and marine resources
   - Biodiversity and ecosystems
   - Circular economy (waste, resource use)

3. **Social**
   - Own workforce
   - Workers in value chain
   - Affected communities
   - Consumers and end-users

4. **Governance**
   - Business conduct
   - Risk management
   - Board structure

### Features
- **Auto-save**: Progress saved automatically
- **Validation**: Real-time input validation
- **Calculations**: Automatic computations
- **Dark Mode**: Eye-friendly dark theme
- **Tooltips**: Help text for every field
- **Multi-select**: Complex data entry made easy

---

## 🔥 Fuel Converter

### 50+ Fuel Types Supported
Convert fuel quantities to energy (MWh) for accurate emissions reporting.

### Categories
- **Gaseous Fuels**: Natural gas, LPG, biogas, hydrogen
- **Liquid Fuels**: Petrol, diesel, kerosene, fuel oil, biofuels
- **Solid Fuels**: Coal (various types), wood, biomass
- **Renewable Fuels**: Biodiesel, bioethanol, biogas

### Features
- Instant calculations
- Standard conversion factors
- Copy results for reporting
- Multiple fuel batch conversion

---

## 📏 Unit Converter

### 5 Conversion Categories

**1. Mass Conversions**
- Kilograms (kg)
- Tonnes (metric tons)
- Pounds (lbs)
- Ounces (oz)

**2. Volume Conversions**
- Liters (L)
- Milliliters (mL)
- Gallons (US & Imperial)
- Cubic meters (m³)
- Barrels (bbl)

**3. Energy Conversions**
- Kilowatt-hours (kWh)
- Megawatt-hours (MWh)
- Gigajoules (GJ)
- BTU (British Thermal Units)

**4. Density Conversions**
- kg/m³
- g/cm³
- lb/ft³

**5. Net Calorific Value (NCV)**
- MJ/kg
- kWh/kg
- BTU/lb

### Features
- Bidirectional conversion
- High precision calculations
- Common units for sustainability reporting

---

## 💾 Data Management

### Local Database
- **SQLite Integration**: Fast, reliable local storage
- **No Cloud Required**: Complete offline operation
- **Data Privacy**: Your data never leaves your computer

### Save & Load
- Save multiple reports with custom names
- Quick access to recent reports
- One-click report loading
- Auto-save draft functionality

### Export Options
**PDF Export:**
- Professional formatted reports
- Print-ready output
- Include/exclude sections

**JSON Export:**
- Machine-readable format
- Data portability
- Integration with other tools

**XBRL Export (Planned):**
- Structured data format
- Regulatory compliance
- Automated filing support

---

## 🎨 User Interface

### Modern Design
- **shadcn/ui Components**: Professional, accessible UI
- **Tailwind CSS**: Consistent, responsive design
- **Dark Mode**: Automatic or manual theme switching
- **Responsive**: Works on different screen sizes

### User Experience
- **Tabbed Navigation**: Easy section switching
- **Progress Indicators**: Know where you are
- **Inline Help**: Tooltips and guidance
- **Error Prevention**: Validation before submission

### Accessibility
- Keyboard navigation support
- Screen reader friendly
- High contrast mode
- Clear error messages

---

## 🔒 Privacy & Security

### Local-First Architecture
- **No Cloud Dependencies**: Fully offline capable
- **No Telemetry**: No usage data collected
- **No External APIs**: (Except optional AI feature with local LLM)
- **Your Data Stays Yours**: Complete control

### Data Storage
- Local SQLite database
- Stored in your user data directory
- Encrypted at OS level (system encryption)
- Easy backup and restore

---

## 🔄 Cross-Platform

### Supported Platforms
- **macOS**: Intel & Apple Silicon (M1/M2/M3)
- **Windows**: Windows 10/11 (64-bit)
- **Linux**: (Planned)

### Native Features
- **File System Access**: Native open/save dialogs
- **System Integration**: Menu bar integration
- **Auto-updates**: Easy update mechanism (planned)
- **Performance**: Native app performance

---

## 🚀 Coming Soon

### Planned Features
- XBRL export for regulatory filing
- Template system for repeated reporting
- Data visualization dashboards
- Multi-language support
- Cloud backup option (optional)
- Collaborative features (optional)
- Mobile companion app

### AI Enhancements
- Support for scanned documents (OCR)
- Multi-language document support
- Improved PDF text extraction
- Historical data comparison
- Anomaly detection
- Automated data quality checks

---

## 📊 Technical Specifications

### Performance
- **Startup Time**: < 2 seconds
- **Memory Usage**: ~200MB base, +2-8GB for AI models
- **Database**: SQLite 3.x
- **Concurrent Reports**: Unlimited

### Requirements
**Minimum:**
- 4GB RAM (8GB for AI features)
- 500MB disk space (+ 2-10GB for AI models)
- Modern CPU (2015 or newer)

**Recommended:**
- 16GB RAM (for optimal AI performance)
- SSD storage
- Multi-core CPU

### Data Limits
- Report size: Unlimited
- File upload: 10MB per file
- Database size: Limited only by disk space
- AI document size: 50,000 characters per analysis

---

## 🆘 Support

### Getting Help
- **Quick Start Guide**: [QUICKSTART.md](QUICKSTART.md)
- **AI Setup Guide**: [AI_ASSISTANT.md](AI_ASSISTANT.md)
- **Build Instructions**: [BUILD.md](BUILD.md)
- **GitHub Issues**: Report bugs and request features

### Community
- Open source contributions welcome
- Feature requests encouraged
- Bug reports appreciated

---

*Last Updated: 2025-09-30*
