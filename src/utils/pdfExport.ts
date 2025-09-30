import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';

export const exportToPDF = async (reportData: any, reportName: string) => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let yPosition = 20;

  // Title
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('EFRAG Sustainability Report', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // Report Name
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'normal');
  pdf.text(reportName || 'Unnamed Report', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  // Date
  pdf.setFontSize(10);
  pdf.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // General Information
  if (reportData.entityName) {
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('General Information', 20, yPosition);
    yPosition += 10;

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');

    const generalInfo = [
      ['Entity Name', reportData.entityName || 'N/A'],
      ['Entity Identifier', reportData.entityIdentifier || 'N/A'],
      ['Legal Form', reportData.legalForm || 'N/A'],
      ['Reporting Period Start', reportData.reportingPeriodStart || 'N/A'],
      ['Reporting Period End', reportData.reportingPeriodEnd || 'N/A'],
      ['Country', reportData.country || 'N/A'],
      ['NACE Sector', reportData.naceSector || 'N/A'],
    ];

    autoTable(pdf, {
      startY: yPosition,
      head: [['Field', 'Value']],
      body: generalInfo,
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185] },
      margin: { left: 20, right: 20 },
    });

    yPosition = (pdf as any).lastAutoTable.finalY + 15;
  }

  // Environmental Disclosures
  if (reportData.energyConsumption || reportData.ghgEmissions || reportData.waterUsage) {
    if (yPosition > pageHeight - 40) {
      pdf.addPage();
      yPosition = 20;
    }

    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Environmental Disclosures', 20, yPosition);
    yPosition += 10;

    const envData = [];
    if (reportData.energyConsumption) {
      envData.push(['Energy Consumption', `${reportData.energyConsumption} MWh`]);
    }
    if (reportData.renewableEnergy) {
      envData.push(['Renewable Energy', `${reportData.renewableEnergy} MWh`]);
    }
    if (reportData.ghgEmissions) {
      envData.push(['GHG Emissions (Scope 1)', `${reportData.ghgEmissions} tCO2e`]);
    }
    if (reportData.ghgEmissionsScope2) {
      envData.push(['GHG Emissions (Scope 2)', `${reportData.ghgEmissionsScope2} tCO2e`]);
    }
    if (reportData.ghgEmissionsScope3) {
      envData.push(['GHG Emissions (Scope 3)', `${reportData.ghgEmissionsScope3} tCO2e`]);
    }
    if (reportData.waterUsage) {
      envData.push(['Water Usage', `${reportData.waterUsage} m³`]);
    }
    if (reportData.wasteGenerated) {
      envData.push(['Waste Generated', `${reportData.wasteGenerated} tonnes`]);
    }

    if (envData.length > 0) {
      autoTable(pdf, {
        startY: yPosition,
        head: [['Metric', 'Value']],
        body: envData,
        theme: 'striped',
        headStyles: { fillColor: [46, 204, 113] },
        margin: { left: 20, right: 20 },
      });

      yPosition = (pdf as any).lastAutoTable.finalY + 15;
    }
  }

  // Social Disclosures
  if (reportData.totalEmployees || reportData.fullTimeEmployees) {
    if (yPosition > pageHeight - 40) {
      pdf.addPage();
      yPosition = 20;
    }

    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Social Disclosures', 20, yPosition);
    yPosition += 10;

    const socialData = [];
    if (reportData.totalEmployees) {
      socialData.push(['Total Employees', reportData.totalEmployees]);
    }
    if (reportData.fullTimeEmployees) {
      socialData.push(['Full-Time Employees', reportData.fullTimeEmployees]);
    }
    if (reportData.partTimeEmployees) {
      socialData.push(['Part-Time Employees', reportData.partTimeEmployees]);
    }
    if (reportData.temporaryEmployees) {
      socialData.push(['Temporary Employees', reportData.temporaryEmployees]);
    }

    if (socialData.length > 0) {
      autoTable(pdf, {
        startY: yPosition,
        head: [['Metric', 'Value']],
        body: socialData,
        theme: 'striped',
        headStyles: { fillColor: [231, 76, 60] },
        margin: { left: 20, right: 20 },
      });
    }
  }

  // Add footer
  const totalPages = (pdf as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(128);
    pdf.text(
      `Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  return pdf;
};

export const savePDFToFile = async (reportData: any, reportName: string) => {
  const pdf = await exportToPDF(reportData, reportName);

  if (window.electronAPI) {
    // Desktop app - use native save dialog
    const result = await window.electronAPI.saveFileDialog({
      title: 'Save PDF Report',
      defaultPath: `${reportName || 'report'}.pdf`,
      filters: [{ name: 'PDF Files', extensions: ['pdf'] }],
    });

    if (!result.canceled && result.filePath) {
      const pdfBlob = pdf.output('blob');
      const reader = new FileReader();
      reader.onload = async () => {
        const arrayBuffer = reader.result as ArrayBuffer;
        const buffer = Buffer.from(arrayBuffer);
        await window.electronAPI.writeFile(result.filePath, buffer.toString('base64'));
      };
      reader.readAsArrayBuffer(pdfBlob);
      return { success: true, path: result.filePath };
    }
    return { success: false };
  } else {
    // Web app - download directly
    pdf.save(`${reportName || 'report'}.pdf`);
    return { success: true };
  }
};
