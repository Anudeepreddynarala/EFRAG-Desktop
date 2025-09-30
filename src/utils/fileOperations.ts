export const exportToJSON = async (reportData: any, reportName: string) => {
  const jsonContent = JSON.stringify(reportData, null, 2);

  if (window.electronAPI) {
    // Desktop app - use native save dialog
    const result = await window.electronAPI.saveFileDialog({
      title: 'Export Report as JSON',
      defaultPath: `${reportName || 'report'}.json`,
      filters: [{ name: 'JSON Files', extensions: ['json'] }],
    });

    if (!result.canceled && result.filePath) {
      const writeResult = await window.electronAPI.writeFile(result.filePath, jsonContent);
      return { success: writeResult.success, path: result.filePath };
    }
    return { success: false };
  } else {
    // Web app - download directly
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportName || 'report'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return { success: true };
  }
};

export const importFromJSON = async (): Promise<{ success: boolean; data?: any; error?: string }> => {
  if (window.electronAPI) {
    // Desktop app - use native open dialog
    const result = await window.electronAPI.openFileDialog({
      title: 'Import Report from JSON',
      filters: [{ name: 'JSON Files', extensions: ['json'] }],
      properties: ['openFile'],
    });

    if (!result.canceled && result.filePaths && result.filePaths.length > 0) {
      const readResult = await window.electronAPI.readFile(result.filePaths[0]);
      if (readResult.success) {
        try {
          const data = JSON.parse(readResult.content);
          return { success: true, data };
        } catch (error) {
          return { success: false, error: 'Invalid JSON file' };
        }
      }
      return { success: false, error: readResult.error };
    }
    return { success: false, error: 'No file selected' };
  } else {
    // Web app - use file input
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = (e: any) => {
        const file = e.target.files[0];
        if (!file) {
          resolve({ success: false, error: 'No file selected' });
          return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = JSON.parse(event.target?.result as string);
            resolve({ success: true, data });
          } catch (error) {
            resolve({ success: false, error: 'Invalid JSON file' });
          }
        };
        reader.onerror = () => {
          resolve({ success: false, error: 'Error reading file' });
        };
        reader.readAsText(file);
      };
      input.click();
    });
  }
};

export const exportToCSV = async (data: any[], filename: string) => {
  if (!data || data.length === 0) {
    return { success: false, error: 'No data to export' };
  }

  // Convert data to CSV
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map((row) =>
      headers.map((header) => {
        const value = row[header];
        // Escape quotes and wrap in quotes if contains comma
        const stringValue = String(value ?? '');
        return stringValue.includes(',') || stringValue.includes('"')
          ? `"${stringValue.replace(/"/g, '""')}"`
          : stringValue;
      }).join(',')
    ),
  ].join('\n');

  if (window.electronAPI) {
    // Desktop app
    const result = await window.electronAPI.saveFileDialog({
      title: 'Export as CSV',
      defaultPath: `${filename || 'export'}.csv`,
      filters: [{ name: 'CSV Files', extensions: ['csv'] }],
    });

    if (!result.canceled && result.filePath) {
      const writeResult = await window.electronAPI.writeFile(result.filePath, csvContent);
      return { success: writeResult.success, path: result.filePath };
    }
    return { success: false };
  } else {
    // Web app
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename || 'export'}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return { success: true };
  }
};
