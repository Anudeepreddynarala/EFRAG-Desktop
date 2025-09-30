/**
 * XBRL Export Utility for EFRAG VSME Reports
 * Converts sustainability report data to XBRL format
 */

interface XBRLExportOptions {
  reportData: any;
  entityName: string;
  reportingPeriodStart: string;
  reportingPeriodEnd: string;
}

/**
 * Generates XBRL XML content from report data
 */
export function generateXBRL(options: XBRLExportOptions): string {
  const { reportData, entityName, reportingPeriodStart, reportingPeriodEnd } = options;

  const now = new Date().toISOString();
  const contextId = 'Current_AsOf_' + reportingPeriodEnd.replace(/-/g, '');

  // Build XBRL document
  let xbrl = `<?xml version="1.0" encoding="UTF-8"?>
<xbrl xmlns="http://www.xbrl.org/2003/instance"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      xmlns:iso4217="http://www.xbrl.org/2003/iso4217"
      xmlns:efrag="http://www.efrag.org/taxonomy/vsme/2024"
      xmlns:link="http://www.xbrl.org/2003/linkbase"
      xsi:schemaLocation="http://www.efrag.org/taxonomy/vsme/2024 efrag-vsme-2024.xsd">

  <!-- Schema Reference -->
  <link:schemaRef xlink:type="simple"
                  xlink:href="http://www.efrag.org/taxonomy/vsme/2024/efrag-vsme-2024.xsd"/>

  <!-- Entity Information -->
  <context id="${contextId}">
    <entity>
      <identifier scheme="http://www.efrag.org/entity-identifier">
        ${escapeXml(reportData.identifierValue || 'UNKNOWN')}
      </identifier>
    </entity>
    <period>
      <startDate>${reportingPeriodStart}</startDate>
      <endDate>${reportingPeriodEnd}</endDate>
    </period>
  </context>

  <!-- Unit Definitions -->
  <unit id="EUR">
    <measure>iso4217:EUR</measure>
  </unit>

  <unit id="Pure">
    <measure>xbrli:pure</measure>
  </unit>

  <unit id="MWh">
    <measure>efrag:MWh</measure>
  </unit>

  <unit id="tCO2e">
    <measure>efrag:tCO2e</measure>
  </unit>

  <unit id="cubicMeters">
    <measure>efrag:m3</measure>
  </unit>

  <unit id="tonnes">
    <measure>efrag:tonnes</measure>
  </unit>

  <!-- General Information -->
  <efrag:ReportingEntityName contextRef="${contextId}">
    ${escapeXml(entityName)}
  </efrag:ReportingEntityName>

  <efrag:EntityIdentifierType contextRef="${contextId}">
    ${escapeXml(reportData.identifierType || '')}
  </efrag:EntityIdentifierType>

  <efrag:EntityIdentifier contextRef="${contextId}">
    ${escapeXml(reportData.identifierValue || '')}
  </efrag:EntityIdentifier>

  <efrag:LegalForm contextRef="${contextId}">
    ${escapeXml(reportData.legalForm || '')}
  </efrag:LegalForm>

  <efrag:CountryOfOperation contextRef="${contextId}">
    ${escapeXml(reportData.country || '')}
  </efrag:CountryOfOperation>

  <efrag:NACESectorCode contextRef="${contextId}">
    ${escapeXml(reportData.naceCode || '')}
  </efrag:NACESectorCode>

  <!-- Environmental Disclosures -->
`;

  // Energy Consumption
  if (reportData.totalEnergyConsumption) {
    xbrl += `  <efrag:TotalEnergyConsumption contextRef="${contextId}" unitRef="MWh" decimals="2">
    ${reportData.totalEnergyConsumption}
  </efrag:TotalEnergyConsumption>
`;
  }

  if (reportData.renewableEnergyConsumption) {
    xbrl += `  <efrag:RenewableEnergyConsumption contextRef="${contextId}" unitRef="MWh" decimals="2">
    ${reportData.renewableEnergyConsumption}
  </efrag:RenewableEnergyConsumption>
`;
  }

  if (reportData.nonRenewableEnergyConsumption) {
    xbrl += `  <efrag:NonRenewableEnergyConsumption contextRef="${contextId}" unitRef="MWh" decimals="2">
    ${reportData.nonRenewableEnergyConsumption}
  </efrag:NonRenewableEnergyConsumption>
`;
  }

  // GHG Emissions
  if (reportData.scope1Emissions) {
    xbrl += `  <efrag:Scope1GHGEmissions contextRef="${contextId}" unitRef="tCO2e" decimals="2">
    ${reportData.scope1Emissions}
  </efrag:Scope1GHGEmissions>
`;
  }

  if (reportData.scope2Emissions) {
    xbrl += `  <efrag:Scope2GHGEmissions contextRef="${contextId}" unitRef="tCO2e" decimals="2">
    ${reportData.scope2Emissions}
  </efrag:Scope2GHGEmissions>
`;
  }

  if (reportData.scope3Emissions) {
    xbrl += `  <efrag:Scope3GHGEmissions contextRef="${contextId}" unitRef="tCO2e" decimals="2">
    ${reportData.scope3Emissions}
  </efrag:Scope3GHGEmissions>
`;
  }

  if (reportData.totalGHGEmissions) {
    xbrl += `  <efrag:TotalGHGEmissions contextRef="${contextId}" unitRef="tCO2e" decimals="2">
    ${reportData.totalGHGEmissions}
  </efrag:TotalGHGEmissions>
`;
  }

  // Water and Waste
  if (reportData.waterConsumption) {
    xbrl += `  <efrag:WaterConsumption contextRef="${contextId}" unitRef="cubicMeters" decimals="2">
    ${reportData.waterConsumption}
  </efrag:WaterConsumption>
`;
  }

  if (reportData.wasteGenerated) {
    xbrl += `  <efrag:WasteGenerated contextRef="${contextId}" unitRef="tonnes" decimals="2">
    ${reportData.wasteGenerated}
  </efrag:WasteGenerated>
`;
  }

  if (reportData.wasteRecycled) {
    xbrl += `  <efrag:WasteRecycled contextRef="${contextId}" unitRef="tonnes" decimals="2">
    ${reportData.wasteRecycled}
  </efrag:WasteRecycled>
`;
  }

  // Social Disclosures
  if (reportData.totalWorkforce) {
    xbrl += `  <efrag:TotalWorkforce contextRef="${contextId}" unitRef="Pure" decimals="0">
    ${reportData.totalWorkforce}
  </efrag:TotalWorkforce>
`;
  }

  if (reportData.fullTimeEmployees) {
    xbrl += `  <efrag:FullTimeEmployees contextRef="${contextId}" unitRef="Pure" decimals="0">
    ${reportData.fullTimeEmployees}
  </efrag:FullTimeEmployees>
`;
  }

  if (reportData.partTimeEmployees) {
    xbrl += `  <efrag:PartTimeEmployees contextRef="${contextId}" unitRef="Pure" decimals="0">
    ${reportData.partTimeEmployees}
  </efrag:PartTimeEmployees>
`;
  }

  if (reportData.temporaryEmployees) {
    xbrl += `  <efrag:TemporaryEmployees contextRef="${contextId}" unitRef="Pure" decimals="0">
    ${reportData.temporaryEmployees}
  </efrag:TemporaryEmployees>
`;
  }

  // Additional narrative disclosures
  if (reportData.sustainabilityStrategy) {
    xbrl += `  <efrag:SustainabilityStrategy contextRef="${contextId}">
    ${escapeXml(reportData.sustainabilityStrategy)}
  </efrag:SustainabilityStrategy>
`;
  }

  if (reportData.materialIssues) {
    xbrl += `  <efrag:MaterialSustainabilityIssues contextRef="${contextId}">
    ${escapeXml(reportData.materialIssues)}
  </efrag:MaterialSustainabilityIssues>
`;
  }

  // Close XBRL document
  xbrl += `
</xbrl>`;

  return xbrl;
}

/**
 * Escape XML special characters
 */
function escapeXml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Export report data as XBRL file using Electron API
 */
export async function exportAsXBRL(reportData: any): Promise<void> {
  try {
    // Check if Electron API is available
    if (!window.electron) {
      throw new Error('Electron API not available');
    }

    // Extract required information
    const entityName = reportData.entityName || 'Unknown Entity';
    const reportingPeriodStart = reportData.reportingPeriodStart || new Date().toISOString().split('T')[0];
    const reportingPeriodEnd = reportData.reportingPeriodEnd || new Date().toISOString().split('T')[0];

    // Generate XBRL content
    const xbrlContent = generateXBRL({
      reportData,
      entityName,
      reportingPeriodStart,
      reportingPeriodEnd
    });

    // Show save dialog
    const result = await window.electron.saveFileDialog({
      title: 'Export as XBRL',
      defaultPath: `${entityName.replace(/[^a-z0-9]/gi, '_')}_VSME_Report.xbrl`,
      filters: [
        { name: 'XBRL Files', extensions: ['xbrl', 'xml'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });

    if (result.canceled || !result.filePath) {
      return;
    }

    // Write file
    await window.electron.writeFile(result.filePath, xbrlContent);

    console.log('XBRL export successful:', result.filePath);
  } catch (error) {
    console.error('Error exporting XBRL:', error);
    throw error;
  }
}
