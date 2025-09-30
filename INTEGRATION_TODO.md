# Integration TODO - Connecting Electron APIs to React Components

The Electron backend is fully implemented, but the React components need to be updated to use the new desktop features. Here's what needs to be done:

## 1. Update VSMEForm Component

**File:** `src/components/VSMEForm.tsx`

### Add Electron Hooks
```tsx
import { useElectron, useElectronMenu } from '@/hooks/useElectron';
import { savePDFToFile } from '@/utils/pdfExport';
import { exportToJSON, importFromJSON } from '@/utils/fileOperations';
```

### Add State for Report Management
```tsx
const [reportName, setReportName] = useState('');
const [reportId, setReportId] = useState<number | null>(null);
const { isElectron, api } = useElectron();
```

### Implement Menu Handlers
```tsx
useElectronMenu({
  onNewReport: () => {
    // Clear form
    setReportId(null);
    setReportName('');
    // Reset all form fields
  },
  onSaveReport: async () => {
    if (!api) return;
    const formData = {
      entityName,
      entityIdentifier,
      // ... all other form fields
    };
    const result = await api.saveReport(reportName || 'Untitled Report', formData);
    if (result.success) {
      setReportId(result.id);
      toast.success('Report saved successfully');
    }
  },
  onOpenReport: async () => {
    // Show dialog to select report
    // Load report data into form
  },
  onExportPDF: async () => {
    const formData = { /* all fields */ };
    await savePDFToFile(formData, reportName);
  },
  onExportJSON: async () => {
    const formData = { /* all fields */ };
    await exportToJSON(formData, reportName);
  },
  onImport: async () => {
    const result = await importFromJSON();
    if (result.success && result.data) {
      // Load data into form fields
      setEntityName(result.data.entityName);
      // ... set all other fields
    }
  },
});
```

### Add Save Button UI
```tsx
{isElectron && (
  <div className="flex gap-2">
    <Input
      placeholder="Report name"
      value={reportName}
      onChange={(e) => setReportName(e.target.value)}
    />
    <Button onClick={handleSave}>
      {reportId ? 'Update' : 'Save'} Report
    </Button>
  </div>
)}
```

## 2. Create Report Manager Component

**File:** `src/components/ReportManager.tsx` (NEW FILE)

Create a component to list and manage saved reports:

```tsx
import { useEffect, useState } from 'react';
import { useElectron } from '@/hooks/useElectron';

interface Report {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export const ReportManager = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const { api } = useElectron();

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    if (!api) return;
    const result = await api.listReports();
    if (result.success) {
      setReports(result.reports);
    }
  };

  const handleLoad = async (id: number) => {
    if (!api) return;
    const result = await api.loadReport(id);
    if (result.success) {
      // Emit event or use callback to load data into form
      // You might want to use React Context or props for this
    }
  };

  const handleDelete = async (id: number) => {
    if (!api) return;
    const result = await api.deleteReport(id);
    if (result.success) {
      loadReports(); // Refresh list
    }
  };

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-bold">Saved Reports</h3>
      {reports.map((report) => (
        <div key={report.id} className="flex justify-between items-center p-2 border rounded">
          <div>
            <p className="font-medium">{report.name}</p>
            <p className="text-sm text-gray-500">
              Updated: {new Date(report.updated_at).toLocaleString()}
            </p>
          </div>
          <div className="space-x-2">
            <Button onClick={() => handleLoad(report.id)}>Load</Button>
            <Button variant="destructive" onClick={() => handleDelete(report.id)}>
              Delete
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
```

## 3. Add Export Buttons to Pages

### Fuel Converter Export
**File:** `src/pages/FuelConverter.tsx`

Add export button for fuel conversion results:

```tsx
import { exportToCSV } from '@/utils/fileOperations';

// In component:
const handleExportCSV = async () => {
  const csvData = fuelConversions.map(conversion => ({
    'Fuel Type': conversion.fuelType,
    'Amount': conversion.amount,
    'Unit': conversion.unit,
    'Energy (MWh)': conversion.energy,
    'Renewable': conversion.renewable ? 'Yes' : 'No',
  }));

  await exportToCSV(csvData, 'fuel-conversions');
};

// In JSX:
<Button onClick={handleExportCSV}>Export to CSV</Button>
```

### Unit Converter Export
**File:** `src/pages/UnitConverter.tsx`

Similar CSV export for unit conversions.

## 4. Update App Layout

**File:** `src/App.tsx`

Add conditional rendering for desktop features:

```tsx
import { useElectron } from '@/hooks/useElectron';

function App() {
  const { isElectron } = useElectron();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          {isElectron && (
            <div className="bg-gray-100 p-2 text-center text-sm">
              EFRAG Desktop v1.0.0 - Running in desktop mode
            </div>
          )}
          <Routes>
            {/* existing routes */}
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
```

## 5. Add Splash Screen (Optional)

**File:** `src/components/SplashScreen.tsx` (NEW FILE)

Show on app startup:

```tsx
export const SplashScreen = () => {
  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">EFRAG Desktop</h1>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
};
```

## 6. Add Type Definitions

**File:** `src/types/electron.d.ts` (NEW FILE)

Ensure TypeScript knows about window.electronAPI:

```tsx
declare global {
  interface Window {
    electronAPI?: {
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

export {};
```

## 7. Testing Checklist

After implementing the above:

- [ ] Test new report creation
- [ ] Test report saving to database
- [ ] Test report loading from database
- [ ] Test report deletion
- [ ] Test PDF export
- [ ] Test JSON export
- [ ] Test JSON import
- [ ] Test CSV export
- [ ] Test keyboard shortcuts
- [ ] Test menu items
- [ ] Test on Windows (after Windows build)
- [ ] Test file dialog cancellation
- [ ] Test error handling
- [ ] Test with empty forms
- [ ] Test with large datasets

## 8. Priority Order

1. **High Priority** (Core functionality)
   - Add save/load to VSMEForm
   - Create ReportManager component
   - Test basic database operations

2. **Medium Priority** (Enhanced UX)
   - Add PDF export integration
   - Add JSON import/export
   - Add keyboard shortcut feedback

3. **Low Priority** (Polish)
   - Add splash screen
   - Add desktop mode indicator
   - Add CSV export to converters
   - Add report statistics

## 9. Code Examples Location

All utility functions are already implemented in:
- `src/hooks/useElectron.ts` - Electron detection and hooks
- `src/utils/pdfExport.ts` - PDF generation
- `src/utils/fileOperations.ts` - File I/O operations

Simply import and use them in your components!

## 10. Running and Testing

```bash
# Start in dev mode to test
npm run dev

# The Electron window will open with DevTools
# Test all features manually
# Check console for errors
```

## Notes

- The Electron backend is **100% complete and functional**
- The React components just need to **call the APIs**
- All utilities are **already implemented**
- This is mainly **wiring up UI to backend**
- Estimated time: **2-4 hours** for basic integration
- Full polish: **1-2 days**

## Questions?

Check these files for reference:
- `electron/main.ts` - See all available IPC handlers
- `electron/preload.ts` - See the API interface
- `src/hooks/useElectron.ts` - See how to use the APIs
- `PROJECT_SUMMARY.md` - Overall architecture

The hard work is done - just connect the dots! 🎉
