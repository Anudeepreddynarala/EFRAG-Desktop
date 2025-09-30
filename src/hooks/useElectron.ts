import { useEffect } from 'react';

export const useElectron = () => {
  const isElectron = typeof window !== 'undefined' && window.electronAPI;

  return {
    isElectron,
    api: isElectron ? window.electronAPI : null,
  };
};

export const useElectronMenu = (handlers: {
  onNewReport?: () => void;
  onOpenReport?: () => void;
  onSaveReport?: () => void;
  onExportPDF?: () => void;
  onExportJSON?: () => void;
  onImport?: () => void;
}) => {
  const { isElectron, api } = useElectron();

  useEffect(() => {
    if (!isElectron || !api) return;

    if (handlers.onNewReport) api.onMenuNewReport(handlers.onNewReport);
    if (handlers.onOpenReport) api.onMenuOpenReport(handlers.onOpenReport);
    if (handlers.onSaveReport) api.onMenuSaveReport(handlers.onSaveReport);
    if (handlers.onExportPDF) api.onMenuExportPDF(handlers.onExportPDF);
    if (handlers.onExportJSON) api.onMenuExportJSON(handlers.onExportJSON);
    if (handlers.onImport) api.onMenuImport(handlers.onImport);
  }, [isElectron, api, handlers]);
};
