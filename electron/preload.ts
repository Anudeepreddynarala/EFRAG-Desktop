import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Database operations
  saveReport: (reportName: string, reportData: any) =>
    ipcRenderer.invoke('save-report', reportName, reportData),
  loadReport: (reportId: number) => ipcRenderer.invoke('load-report', reportId),
  listReports: () => ipcRenderer.invoke('list-reports'),
  deleteReport: (reportId: number) => ipcRenderer.invoke('delete-report', reportId),

  // File operations
  saveFileDialog: (options: any) => ipcRenderer.invoke('save-file-dialog', options),
  openFileDialog: (options: any) => ipcRenderer.invoke('open-file-dialog', options),
  writeFile: (filePath: string, content: string) => ipcRenderer.invoke('write-file', filePath, content),
  readFile: (filePath: string) => ipcRenderer.invoke('read-file', filePath),

  // Menu event listeners
  onMenuNewReport: (callback: () => void) => {
    ipcRenderer.on('menu-new-report', callback);
  },
  onMenuOpenReport: (callback: () => void) => {
    ipcRenderer.on('menu-open-report', callback);
  },
  onMenuSaveReport: (callback: () => void) => {
    ipcRenderer.on('menu-save-report', callback);
  },
  onMenuExportPDF: (callback: () => void) => {
    ipcRenderer.on('menu-export-pdf', callback);
  },
  onMenuExportJSON: (callback: () => void) => {
    ipcRenderer.on('menu-export-json', callback);
  },
  onMenuImport: (callback: () => void) => {
    ipcRenderer.on('menu-import', callback);
  },
});

// Type definitions for TypeScript
declare global {
  interface Window {
    electronAPI: {
      saveReport: (reportName: string, reportData: any) => Promise<any>;
      loadReport: (reportId: number) => Promise<any>;
      listReports: () => Promise<any>;
      deleteReport: (reportId: number) => Promise<any>;
      saveFileDialog: (options: any) => Promise<any>;
      openFileDialog: (options: any) => Promise<any>;
      writeFile: (filePath: string, content: string) => Promise<any>;
      readFile: (filePath: string) => Promise<any>;
      onMenuNewReport: (callback: () => void) => void;
      onMenuOpenReport: (callback: () => void) => void;
      onMenuSaveReport: (callback: () => void) => void;
      onMenuExportPDF: (callback: () => void) => void;
      onMenuExportJSON: (callback: () => void) => void;
      onMenuImport: (callback: () => void) => void;
    };
  }
}
