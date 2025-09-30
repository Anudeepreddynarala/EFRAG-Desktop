import { app, BrowserWindow, Menu, ipcMain, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';

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
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
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
