# Quick Start Guide - EFRAG Desktop

## For Users

### Installation

#### macOS
1. Download `EFRAG Desktop-1.0.0-arm64.dmg` (for Apple Silicon) or `-x64.dmg` (for Intel)
2. Open the DMG file
3. Drag "EFRAG Desktop" to your Applications folder
4. Launch from Applications

**Note:** First time you may see a security warning. Go to System Preferences > Security & Privacy and click "Open Anyway".

#### Windows
1. Download `EFRAG Desktop Setup 1.0.0.exe`
2. Run the installer
3. Choose installation directory
4. Launch from Start Menu or Desktop shortcut

**Alternative:** Download the portable version (`EFRAG Desktop 1.0.0.exe`) which doesn't require installation.

### First Launch

When you first open EFRAG Desktop:
1. The app creates a local database in your user data folder
2. All your reports are saved locally
3. No internet connection required

### Creating Your First Report

1. Click **File > New Report** (or press Ctrl/Cmd+N)
2. Fill in the VSME Sustainability Form:
   - General Information (company details, reporting period)
   - Environmental Disclosures (energy, emissions, water, waste)
   - Social Disclosures (workforce, employment)
3. Click **Save** to store locally (or press Ctrl/Cmd+S)

### Using the Converters

#### Fuel Converter
1. Click **Fuel Converter** in the navigation
2. Select fuel type from dropdown
3. Choose unit of measurement
4. Enter amount
5. View energy calculation in MWh
6. Add multiple fuel types as needed

#### Unit Converter
1. Click **Unit Converter** in the navigation
2. Select category (Mass, Volume, Energy, etc.)
3. Choose "from" and "to" units
4. Enter value
5. See instant conversion result

### Saving & Loading Reports

**Save Report:**
- Menu: File > Save Report
- Keyboard: Ctrl/Cmd+S
- Saves to local database

**Load Report:**
- Menu: File > Open Report
- Keyboard: Ctrl/Cmd+O
- Browse saved reports by date

### Exporting Reports

**Export as PDF:**
- Menu: File > Export as PDF
- Keyboard: Ctrl/Cmd+E
- Choose save location
- Professional formatted PDF created

**Export as JSON:**
- Menu: File > Export as JSON
- Save report data for backup or sharing
- Can be imported later

### Importing Reports

**Import JSON:**
- Menu: File > Import
- Select JSON file previously exported
- Data loaded into form

### Keyboard Shortcuts

| Action | Windows/Linux | macOS |
|--------|---------------|-------|
| New Report | Ctrl+N | Cmd+N |
| Open Report | Ctrl+O | Cmd+O |
| Save Report | Ctrl+S | Cmd+S |
| Export PDF | Ctrl+E | Cmd+E |
| Quit | Alt+F4 | Cmd+Q |

### Data Location

Your reports are stored locally at:
- **macOS:** `~/Library/Application Support/efrag-desktop/efrag.db`
- **Windows:** `%APPDATA%\efrag-desktop\efrag.db`

**Backup:** Simply copy the `efrag.db` file to backup all reports.

## For Developers

### Quick Setup

```bash
# Clone repository
git clone <repo-url>
cd EFRAG-app

# Install dependencies
npm install

# Run in development mode
npm run dev
```

The app will launch in Electron with hot-reload enabled.

### Development Workflow

1. **Frontend changes:** Edit files in `src/` - auto-reload
2. **Electron changes:** Edit `electron/main.ts` - restart app
3. **Database changes:** Modify schema in `electron/main.ts` `initDatabase()`

### Testing Changes

```bash
# Build and test
npm run build:dir

# Run the built app
open release/mac-arm64/EFRAG\ Desktop.app
```

### Adding Features

#### Add New Form Field
1. Edit `src/components/VSMEForm.tsx`
2. Add state variable
3. Add input component
4. Include in save/load logic

#### Add New Menu Item
1. Edit `electron/main.ts` in `createMenu()`
2. Add menu item definition
3. Create IPC handler if needed
4. Add corresponding function in React

#### Modify Database Schema
1. Edit `electron/main.ts` in `initDatabase()`
2. Consider migration for existing users
3. Update types in `electron/preload.ts`

### Building for Distribution

```bash
# Build for current platform
npm run build

# Build for macOS
npm run build:mac

# Build for Windows
npm run build:win
```

See `BUILD.md` for detailed build instructions.

## Troubleshooting

### App Won't Launch (macOS)
```bash
# Remove quarantine flag
xattr -cr "/Applications/EFRAG Desktop.app"
```

### Database Locked Error
- Close all instances of the app
- Restart the application
- If persists, delete `.db-shm` and `.db-wal` files

### Missing Reports
- Check data location (see above)
- Restore from backup if available
- Check for multiple installations

### Export Fails
- Ensure write permissions for target directory
- Check disk space
- Try different save location

## Getting Help

- **Issues:** Report bugs on GitHub Issues
- **Documentation:** See README.md and BUILD.md
- **Updates:** Check for new releases regularly

## Tips

1. **Regular Backups:** Export important reports as JSON or copy database file
2. **Use Keyboard Shortcuts:** Faster workflow with shortcuts
3. **Auto-Save:** Click save frequently to prevent data loss
4. **PDF for Sharing:** Use PDF export for final reports
5. **JSON for Backup:** Export all reports as JSON regularly
