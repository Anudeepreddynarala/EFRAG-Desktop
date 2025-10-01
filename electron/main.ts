import { app, BrowserWindow, Menu, ipcMain, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { fileURLToPath, pathToFileURL } from 'url';
import { createRequire } from 'module';
import Database from 'better-sqlite3';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';

// Use require to load pdf-parse to bypass the test code that runs on import
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse/lib/pdf-parse.js');

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null = null;
let db: Database.Database | null = null;

// Initialize database
function initDatabase() {
  const userDataPath = app.getPath('userData');
  const dbPath = path.join(userDataPath, 'efrag.db');

  db = new Database(dbPath);

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      data TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
}

function createWindow() {
  // Try .mjs first (ES module), fall back to .js
  let preloadPath = path.join(__dirname, 'preload.mjs');
  if (!fs.existsSync(preloadPath)) {
    preloadPath = path.join(__dirname, 'preload.js');
  }

  console.log('🟢 Preload path:', preloadPath);
  console.log('🟢 Preload exists:', fs.existsSync(preloadPath));

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: preloadPath,
      sandbox: false, // Disable sandbox to ensure preload works
    },
    icon: path.join(__dirname, '../build/icon.png'),
  });

  // Load the app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createMenu() {
  const template: any = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Report',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow?.webContents.send('menu-new-report');
          },
        },
        {
          label: 'Open Report',
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            mainWindow?.webContents.send('menu-open-report');
          },
        },
        {
          label: 'Save Report',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            mainWindow?.webContents.send('menu-save-report');
          },
        },
        { type: 'separator' },
        {
          label: 'Export as PDF',
          accelerator: 'CmdOrCtrl+E',
          click: () => {
            mainWindow?.webContents.send('menu-export-pdf');
          },
        },
        {
          label: 'Export as JSON',
          click: () => {
            mainWindow?.webContents.send('menu-export-json');
          },
        },
        {
          label: 'Export as XBRL',
          accelerator: 'CmdOrCtrl+Shift+X',
          click: () => {
            mainWindow?.webContents.send('menu-export-xbrl');
          },
        },
        { type: 'separator' },
        {
          label: 'Import',
          click: () => {
            mainWindow?.webContents.send('menu-import');
          },
        },
        { type: 'separator' },
        { role: 'quit' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'delete' },
        { type: 'separator' },
        { role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(process.platform === 'darwin'
          ? [{ type: 'separator' }, { role: 'front' }, { type: 'separator' }, { role: 'window' }]
          : [{ role: 'close' }]),
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About EFRAG Desktop',
          click: () => {
            dialog.showMessageBox({
              title: 'About EFRAG Desktop',
              message: 'EFRAG Desktop',
              detail: 'Version 1.0.0\n\nSustainability Reporting Application\nfor Medium-sized Enterprises',
              buttons: ['OK'],
            });
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// IPC Handlers
ipcMain.handle('save-report', async (event, reportName: string, reportData: any) => {
  if (!db) return { success: false, error: 'Database not initialized' };

  try {
    const dataJson = JSON.stringify(reportData);
    const stmt = db.prepare(`
      INSERT INTO reports (name, data) VALUES (?, ?)
      ON CONFLICT(id) DO UPDATE SET data = ?, updated_at = CURRENT_TIMESTAMP
    `);
    const result = stmt.run(reportName, dataJson, dataJson);
    return { success: true, id: result.lastInsertRowid };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('load-report', async (event, reportId: number) => {
  if (!db) return { success: false, error: 'Database not initialized' };

  try {
    const stmt = db.prepare('SELECT * FROM reports WHERE id = ?');
    const report: any = stmt.get(reportId);
    if (report) {
      return { success: true, report: { ...report, data: JSON.parse(report.data as string) } };
    }
    return { success: false, error: 'Report not found' };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('list-reports', async () => {
  if (!db) return { success: false, error: 'Database not initialized' };

  try {
    const stmt = db.prepare('SELECT id, name, created_at, updated_at FROM reports ORDER BY updated_at DESC');
    const reports = stmt.all();
    return { success: true, reports };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('delete-report', async (event, reportId: number) => {
  if (!db) return { success: false, error: 'Database not initialized' };

  try {
    const stmt = db.prepare('DELETE FROM reports WHERE id = ?');
    stmt.run(reportId);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('save-file-dialog', async (event, options: any) => {
  if (!mainWindow) return { canceled: true };

  const result = await dialog.showSaveDialog(mainWindow, options);
  return result;
});

ipcMain.handle('open-file-dialog', async (event, options: any) => {
  if (!mainWindow) return { canceled: true };

  const result = await dialog.showOpenDialog(mainWindow, options);
  return result;
});

ipcMain.handle('write-file', async (event, filePath: string, content: string) => {
  try {
    fs.writeFileSync(filePath, content, 'utf-8');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('read-file', async (event, filePath: string) => {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return { success: true, content };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

// System info handlers for AI Assistant
ipcMain.handle('get-total-memory', async () => {
  return os.totalmem();
});

ipcMain.handle('get-free-memory', async () => {
  return os.freemem();
});

// AI Assistant file operations
ipcMain.handle('read-file-buffer', async (event, filePath: string) => {
  try {
    const buffer = fs.readFileSync(filePath);
    return buffer;
  } catch (error: any) {
    console.error('Error reading file buffer:', error);
    throw new Error(`Failed to read file: ${error.message}`);
  }
});

ipcMain.handle('select-files-for-ai', async () => {
  try {
    const result = await dialog.showOpenDialog({
      properties: ['openFile', 'multiSelections'],
      filters: [
        { name: 'Documents', extensions: ['pdf', 'docx', 'doc', 'xlsx', 'xls', 'csv', 'txt', 'json'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });

    if (result.canceled) {
      return undefined;
    }

    return { filePaths: result.filePaths };
  } catch (error: any) {
    console.error('Error selecting files:', error);
    throw new Error(`Failed to select files: ${error.message}`);
  }
});

// Write buffer to temp file and return path (for drag-and-drop files)
ipcMain.handle('write-temp-file', async (event, buffer: Buffer, originalName: string) => {
  try {
    const tempDir = os.tmpdir();
    const tempPath = path.join(tempDir, `efrag-upload-${Date.now()}-${originalName}`);
    fs.writeFileSync(tempPath, buffer);
    return { success: true, path: tempPath };
  } catch (error: any) {
    console.error('Error writing temp file:', error);
    return { success: false, error: error.message };
  }
});

// Process documents (PDF, DOCX, Excel, etc.) for AI Assistant
ipcMain.handle('process-document', async (event, filePath: string) => {
  try {
    const ext = path.extname(filePath).toLowerCase();
    const buffer = fs.readFileSync(filePath);

    if (ext === '.pdf') {
      // Extract text from PDF
      const data = await pdfParse(buffer);
      return { success: true, content: data.text };
    } else if (ext === '.docx' || ext === '.doc') {
      // Extract text from DOCX
      const result = await mammoth.extractRawText({ buffer });
      return { success: true, content: result.value };
    } else if (['.xlsx', '.xls', '.csv'].includes(ext)) {
      // Parse Excel/CSV files - extract as JSON for more compact representation
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      let text = '';

      workbook.SheetNames.forEach(name => {
        const sheet = workbook.Sheets[name];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        text += `\n\n=== Sheet: ${name} ===\n`;
        text += `Total rows: ${jsonData.length}\n`;

        // Include all data as JSON (more compact than CSV)
        text += JSON.stringify(jsonData, null, 2);

        // Add note if file is large
        const estimatedTokens = text.length / 4; // Rough estimate: 4 chars = 1 token
        if (estimatedTokens > 100000) {
          text += `\n\n[Note: This file is very large (~${Math.round(estimatedTokens/1000)}K tokens). Consider using GPT-4 Turbo which supports 128K context window.]`;
        }
      });

      return { success: true, content: text };
    } else if (['.txt', '.json'].includes(ext)) {
      // Plain text files
      return { success: true, content: buffer.toString('utf-8') };
    } else {
      // Try to read as text
      return { success: true, content: buffer.toString('utf-8') };
    }
  } catch (error: any) {
    console.error('Error processing document:', error);
    return { success: false, error: error.message };
  }
});

app.on('ready', () => {
  initDatabase();
  createWindow();
  createMenu();
});

app.on('window-all-closed', () => {
  if (db) db.close();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
