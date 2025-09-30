# Build Instructions for EFRAG Desktop

## Prerequisites

### For macOS Development
- macOS 10.13 or later
- Node.js 18 or later
- Xcode Command Line Tools (for native modules)

### For Windows Development
- Windows 10 or later
- Node.js 18 or later
- Python 3.x (for native modules)
- Visual Studio Build Tools or Visual Studio with C++ support

## Installation

```bash
# Clone the repository (if not already done)
git clone <repository-url>
cd EFRAG-app

# Install dependencies
npm install
```

## Development

### Run in Development Mode

```bash
npm run dev
```

This will:
1. Start Vite dev server on port 5173
2. Launch Electron with hot-reload enabled
3. Open DevTools automatically

The app will automatically reload when you make changes to:
- React components
- TypeScript files
- CSS files

Electron main process changes require a restart.

## Building for Production

### Build for Current Platform

```bash
npm run build
```

This builds for your current operating system.

### Build for macOS

```bash
npm run build:mac
```

**Output files** (in `release/` directory):
- `EFRAG Desktop-1.0.0-arm64.dmg` - Disk image installer (Apple Silicon)
- `EFRAG Desktop-1.0.0-arm64-mac.zip` - ZIP archive (Apple Silicon)
- `EFRAG Desktop-1.0.0-x64.dmg` - Disk image installer (Intel)
- `EFRAG Desktop-1.0.0-x64-mac.zip` - ZIP archive (Intel)

**Notes:**
- Code signing is recommended for distribution
- Without signing, users will see a warning on first launch
- Universal builds (arm64 + x64) can be created with additional configuration

### Build for Windows

**On Windows:**
```bash
npm run build:win
```

**Cross-platform build from macOS/Linux:**
```bash
# Install Wine (required for Windows builds on macOS)
brew install wine-stable

# Build
npm run build:win
```

**Output files** (in `release/` directory):
- `EFRAG Desktop Setup 1.0.0.exe` - NSIS installer
- `EFRAG Desktop 1.0.0.exe` - Portable executable

**Notes:**
- NSIS installer allows custom installation directory
- Portable version requires no installation
- Code signing recommended for production distribution

### Build Without Packaging (for testing)

```bash
npm run build:dir
```

This creates an unpacked directory in `release/` without creating installers.
Useful for:
- Testing the built app
- Debugging packaging issues
- Manual distribution

## Build Configuration

### Electron Builder Configuration

The build settings are in `package.json` under the `"build"` key:

```json
{
  "build": {
    "appId": "com.efrag.desktop",
    "productName": "EFRAG Desktop",
    "directories": {
      "output": "release"
    },
    "files": [
      "dist/**/*",
      "dist-electron/**/*",
      "package.json"
    ],
    "mac": {
      "target": ["dmg", "zip"],
      "category": "public.app-category.business"
    },
    "win": {
      "target": ["nsis", "portable"]
    }
  }
}
```

### Customizing Build

#### Change App Icons

1. **macOS**: Place `icon.icns` in `build/` directory
2. **Windows**: Place `icon.ico` in `build/` directory

Icon requirements:
- macOS: .icns file with sizes: 16, 32, 64, 128, 256, 512, 1024
- Windows: .ico file with sizes: 16, 24, 32, 48, 64, 256

#### Code Signing

**macOS:**
```json
{
  "build": {
    "mac": {
      "identity": "Developer ID Application: Your Name (TEAM_ID)"
    }
  }
}
```

**Windows:**
```json
{
  "build": {
    "win": {
      "certificateFile": "path/to/certificate.pfx",
      "certificatePassword": "your-password"
    }
  }
}
```

## Architecture

The application consists of:

1. **Main Process** (`electron/main.ts`)
   - Window management
   - Native menu
   - IPC handlers
   - SQLite database
   - File system operations

2. **Preload Script** (`electron/preload.ts`)
   - Secure IPC bridge
   - Exposes safe APIs to renderer

3. **Renderer Process** (`src/`)
   - React application
   - UI components
   - Business logic

## Native Dependencies

The app uses `better-sqlite3` which requires native compilation:

- Automatically rebuilt for Electron during packaging
- Different binaries for each platform and architecture
- Handled by `@electron/rebuild`

## Troubleshooting

### Build Fails on macOS

```bash
# Ensure Xcode tools are installed
xcode-select --install

# Clean and rebuild
rm -rf node_modules dist dist-electron release
npm install
npm run build
```

### Build Fails on Windows

```bash
# Ensure Python and Visual Studio Build Tools are installed
# Clean and rebuild
rm -rf node_modules dist dist-electron release
npm install
npm run build:win
```

### SQLite Native Module Issues

```bash
# Manually rebuild better-sqlite3
npm rebuild better-sqlite3
```

### "Application is damaged" warning on macOS

This happens with unsigned apps. Users can bypass with:
```bash
xattr -cr "/Applications/EFRAG Desktop.app"
```

For production, use proper code signing.

## File Sizes

Typical build sizes:
- macOS DMG: ~110-120 MB
- Windows installer: ~90-100 MB

This includes:
- Electron runtime (~50-60 MB)
- Chromium (~40-50 MB)
- Application code (~1-2 MB)
- Native modules (~5-10 MB)

## Distribution

### macOS
1. Upload DMG to your server or GitHub releases
2. Optionally notarize with Apple (required for Gatekeeper)
3. Users download and drag to Applications folder

### Windows
1. Upload installer to your server or GitHub releases
2. Users download and run installer
3. Can be distributed via Microsoft Store with additional setup

## Auto-Updates

To enable auto-updates, add to `package.json`:

```json
{
  "build": {
    "publish": {
      "provider": "github",
      "owner": "your-username",
      "repo": "your-repo"
    }
  }
}
```

Then update code in `electron/main.ts` to use `electron-updater`.

## Continuous Integration

Example GitHub Actions workflow:

```yaml
name: Build
on: [push, pull_request]

jobs:
  build:
    strategy:
      matrix:
        os: [macos-latest, windows-latest]
    runs-on: ${{ matrix.os }}

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18

      - run: npm install
      - run: npm run build

      - uses: actions/upload-artifact@v3
        with:
          name: ${{ matrix.os }}-build
          path: release/
```
