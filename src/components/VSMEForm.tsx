import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FormSection, Subsection } from "@/components/ui/form-section";
import { TooltipField } from "@/components/ui/tooltip-field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, ExternalLink, AlertCircle, FileCode, Sparkles } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { MultiSelect } from "@/components/ui/multi-select";
import { DynamicGrid } from "@/components/ui/dynamic-grid";
import {
  countries,
  currencies,
  entityIdentifierTypes,
  legalForms,
  disclosuresList,
  sustainabilityIssues
} from "@/data/countries";
import { NACESelector } from "@/components/NACESelector";
import { PollutantSelector } from "@/components/PollutantSelector";
import { MatrixInput } from "@/components/ui/matrix-input";
import { RepeatableSection } from "@/components/ui/repeatable-section";
import { exportAsXBRL } from "@/utils/xbrlExport";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AISetupWizard } from "@/components/AIAssistant/AISetupWizard";
import { LLMBackend } from "@/types/ai.types";

export function VSMEForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [activeTab, setActiveTab] = useState<string>("section1");
  const [showAIWizard, setShowAIWizard] = useState(false);
  const [aiConnected, setAIConnected] = useState(false);

  const updateFormData = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleExportXBRL = async () => {
    try {
      // Prepare data with dates
      const exportData = {
        ...formData,
        reportingPeriodStart: startDate ? format(startDate, 'yyyy-MM-dd') : '',
        reportingPeriodEnd: endDate ? format(endDate, 'yyyy-MM-dd') : '',
      };

      await exportAsXBRL(exportData);
      alert('XBRL file exported successfully!');
    } catch (error) {
      console.error('Error exporting XBRL:', error);
      alert('Error exporting XBRL file. Please try again.');
    }
  };

  const handleAIComplete = (backend: LLMBackend, modelName: string) => {
    setShowAIWizard(false);
    setAIConnected(true);
    console.log(`AI Connected: ${backend} - ${modelName}`);
    // TODO: Open document upload interface
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Theme Toggle - Top Right */}
        <div className="flex justify-end">
          <ThemeToggle />
        </div>

        {/* Header */}
        <div className="text-center py-10 space-y-4">
          <h1 className="text-4xl font-bold text-foreground mb-3 tracking-tight">
            VSME Digital Template
          </h1>
          <p className="text-[1.0625rem] text-muted-foreground leading-relaxed">
            Voluntary Sustainability Reporting Standard for Medium-sized Entities
          </p>
          <div className="mt-6 p-5 bg-accent/20 rounded-xl border-2 border-accent/30 shadow-sm hover:shadow-md transition-shadow duration-200">
            <p className="text-[0.9375rem] text-accent-foreground leading-relaxed">
              This template is designed to align with the EFRAG VSME Standard for digital sustainability reporting.
            </p>
          </div>

          {/* AI Assistant Button - EXPERIMENTAL */}
          <div className="mt-6">
            <Button
              onClick={() => setShowAIWizard(true)}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold shadow-lg"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Use AI Assistant (Experimental)
            </Button>
            {aiConnected && (
              <p className="text-sm text-green-600 mt-2">✓ AI Connected - Ready to assist</p>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              🔒 100% Local Processing - Your data never leaves your computer
            </p>
          </div>
        </div>

        {/* AI Setup Wizard Modal */}
        {showAIWizard && (
          <AISetupWizard
            onClose={() => setShowAIWizard(false)}
            onComplete={handleAIComplete}
          />
        )}

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 gap-1">
            <TabsTrigger value="section1">General Info</TabsTrigger>
            <TabsTrigger value="section2">Environmental</TabsTrigger>
            <TabsTrigger value="section3">Social</TabsTrigger>
            <TabsTrigger value="section4">Governance</TabsTrigger>
            <TabsTrigger value="converters">Converters</TabsTrigger>
          </TabsList>

          {/* Section 1: General Information */}
          <TabsContent value="section1" className="space-y-8 mt-6">
            <FormSection title="Section 1: General Information">
          
          {/* Subsection: Information on the report necessary for XBRL */}
          <Subsection title="Information on the report necessary for XBRL">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TooltipField
                label="Name of the reporting entity"
                tooltip="The full legal name of the entity preparing this sustainability report."
                required
              >
                <Input 
                  placeholder="Enter entity name"
                  value={formData.entityName || ''}
                  onChange={(e) => updateFormData('entityName', e.target.value)}
                />
              </TooltipField>

              <div className="flex gap-3">
                <TooltipField
                  label="Identifier of the reporting entity"
                  tooltip="Select the type of unique identifier used for your entity."
                  required
                  className="flex-shrink-0"
                >
                  <Select
                    value={formData.identifierType || ''}
                    onValueChange={(value) => updateFormData('identifierType', value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {entityIdentifierTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TooltipField>
                
                <TooltipField
                  tooltip="The entity identifier is a unique ID, that will enable identifying the company that has reported the information. The VSME Standard does not require any specific identifier. An entity identifier is required for the digital reporting"
                  className="flex-1"
                >
                  <Input 
                    placeholder="Enter identifier value"
                    value={formData.identifierValue || ''}
                    onChange={(e) => updateFormData('identifierValue', e.target.value)}
                  />
                </TooltipField>
              </div>

              <TooltipField
                label="Currency of the monetary values in the report"
                tooltip="Select the currency in which all monetary values in this report are expressed."
                required
              >
                <Select
                  value={formData.currency || ''}
                  onValueChange={(value) => updateFormData('currency', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency} value={currency}>{currency}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TooltipField>

              <TooltipField
                label="Reporting period start date"
                tooltip="Enter the start date of the reporting period for this sustainability report."
                required
              >
                <Input
                  type="date"
                  value={formData.reportingStartDate || ''}
                  onChange={(e) => updateFormData('reportingStartDate', e.target.value)}
                />
              </TooltipField>

              <TooltipField
                label="Reporting period end date"
                tooltip="Enter the end date of the reporting period. This must be after the start date."
                required
              >
                <Input
                  type="date"
                  value={formData.reportingEndDate || ''}
                  onChange={(e) => updateFormData('reportingEndDate', e.target.value)}
                />
              </TooltipField>
            </div>
          </Subsection>

          {/* Information on previous reporting period */}
          <Subsection title="Information on previous reporting period">
            <TooltipField
              tooltip="If a sustainability report is prepared to meet the needs of large undertakings or banks that require an update annually, it shall be prepared annually. If the undertaking prepares financial statements, the sustainability report shall be prepared with a period of time that is consistent with the preparation of the financial statement. If specific datapoints did not change from the previous reporting year, the undertaking may indicate that no changes occurred and refer to the information provided for that specific datapoint in the previous year's report."
            >
              <div className="flex items-center space-x-2">
                <Switch
                  id="previous-report-toggle"
                  checked={formData.hasPreviousReport || false}
                  onCheckedChange={(checked) => updateFormData('hasPreviousReport', checked)}
                />
                <Label htmlFor="previous-report-toggle">
                  This report contains disclosures from the previous reporting period that remain unchanged
                </Label>
              </div>
            </TooltipField>

            {formData.hasPreviousReport && (
              <div className="space-y-4 pl-6 border-l-2 border-accent/30">
                <TooltipField
                  label="List of disclosures for which no changes are reported"
                  tooltip="Select all disclosure areas where no changes occurred compared to the previous reporting period."
                >
                  <MultiSelect
                    options={disclosuresList}
                    selected={formData.unchangedDisclosures || []}
                    onSelectionChange={(selected) => updateFormData('unchangedDisclosures', selected)}
                    placeholder="Select unchanged disclosures..."
                  />
                </TooltipField>

                <TooltipField
                  label="Link to previous report"
                  tooltip="Provide a URL link to the previous report containing the unchanged disclosures."
                >
                  <Input
                    type="url"
                    placeholder="https://example.com/previous-report"
                    value={formData.previousReportUrl || ''}
                    onChange={(e) => updateFormData('previousReportUrl', e.target.value)}
                  />
                </TooltipField>
              </div>
            )}
          </Subsection>

          {/* B1 Basis for Preparation */}
          <Subsection title="B1 Basis for Preparation and other undertaking's general information">
            <div className="space-y-6">
              <TooltipField
                label="Basis for preparation"
                tooltip="The undertaking shall disclose which option it has selected: (a) OPTION A: Basic Module (only); or (b) OPTION B: Basic Module and Comprehensive Module"
                required
              >
                <RadioGroup
                  value={formData.basisForPreparation || ''}
                  onValueChange={(value) => updateFormData('basisForPreparation', value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="basic-only" id="basic-only" />
                    <Label htmlFor="basic-only">OPTION A: Basic Module (only)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="basic-comprehensive" id="basic-comprehensive" />
                    <Label htmlFor="basic-comprehensive">OPTION B: Basic Module and Comprehensive Module</Label>
                  </div>
                </RadioGroup>
              </TooltipField>

              <TooltipField
                label="List of omitted disclosures deemed to be classified or sensitive information"
                tooltip="When the provision of the disclosures in this Standard require disclosing classified or sensitive information, the undertaking may omit such information. If the undertaking decides to omit such information, it shall state that this is the case under disclosure B1"
              >
                <MultiSelect
                  options={[...disclosuresList, "None"]}
                  selected={formData.omittedDisclosures || []}
                  onSelectionChange={(selected) => updateFormData('omittedDisclosures', selected)}
                  placeholder="Select omitted disclosures or 'None'..."
                />
              </TooltipField>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TooltipField
                  label="Basis for reporting"
                  tooltip="Whether the sustainability report has been prepared on an individual basis (i.e. the report is limited to the undertaking's information only) or on a consolidated basis (i.e. the report includes information about the undertaking and its subsidiaries)"
                  required
                >
                  <RadioGroup
                    value={formData.reportingBasis || ''}
                    onValueChange={(value) => updateFormData('reportingBasis', value)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="consolidated" id="consolidated" />
                      <Label htmlFor="consolidated">Consolidated</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="individual" id="individual" />
                      <Label htmlFor="individual">Individual</Label>
                    </div>
                  </RadioGroup>
                </TooltipField>

                <TooltipField
                  label="Undertaking's legal form"
                  tooltip="Select the legal form of your undertaking."
                  required
                >
                  <Select
                    value={formData.legalForm || ''}
                    onValueChange={(value) => updateFormData('legalForm', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select legal form" />
                    </SelectTrigger>
                    <SelectContent>
                      {legalForms.map((form) => (
                        <SelectItem key={form} value={form}>{form}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TooltipField>
              </div>

              {formData.legalForm === 'other' && (
                <TooltipField
                  label="Other legal form specification"
                  tooltip="Please specify the legal form of your undertaking."
                  required
                >
                  <Input
                    placeholder="Please specify the legal form"
                    value={formData.otherLegalForm || ''}
                    onChange={(e) => updateFormData('otherLegalForm', e.target.value)}
                  />
                </TooltipField>
              )}

              <TooltipField
                label="NACE sector classification code(s)"
                tooltip="NACE codes (Nomenclature statistique des Activités économiques dans la Communauté Européenne) are classifications of economic activities used in the European Union. They provide a standardized framework for classifying economic activities into sectors, enabling comparability and a common understanding among the various EU countries. The NACE code consists of a number of digits ranging from 2 to 5 depending on the level of specificity with which the economic activity is identified."
                required
              >
                <NACESelector
                  selectedValues={formData.naceCodes || []}
                  onSelectionChange={(selected) => updateFormData('naceCodes', selected)}
                />
              </TooltipField>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <TooltipField
                  label="Size of balance sheet (€)"
                  tooltip="Enter the total size of the balance sheet in euros."
                  required
                >
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.balanceSheetSize || ''}
                    onChange={(e) => updateFormData('balanceSheetSize', e.target.value)}
                  />
                </TooltipField>

                <TooltipField
                  label="Turnover (€)"
                  tooltip="Enter the total turnover in euros."
                  required
                >
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.turnover || ''}
                    onChange={(e) => updateFormData('turnover', e.target.value)}
                  />
                </TooltipField>

                <TooltipField
                  label="Number of employees"
                  tooltip="Enter the number of employees based on the methodology selected below."
                  required
                >
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.employeeCount || ''}
                    onChange={(e) => updateFormData('employeeCount', e.target.value)}
                  />
                </TooltipField>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TooltipField
                  label="Employee counting methodology for the disclosures below (Timing)"
                  tooltip="Select when the employee count was measured."
                  required
                >
                  <Select
                    value={formData.employeeCountingTiming || ''}
                    onValueChange={(value) => updateFormData('employeeCountingTiming', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select timing" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="end-of-period">At the end of reporting period</SelectItem>
                      <SelectItem value="average">As an average during the reporting period</SelectItem>
                    </SelectContent>
                  </Select>
                </TooltipField>

                <TooltipField
                  label="Employee counting methodology for the disclosures below (Type)"
                  tooltip="When reporting the number of employees, full-time equivalent (FTE) is the number of full-time positions in an undertaking. It can be calculated by dividing an employee's scheduled hours by the employer's hours for a full-time workweek. Headcount is the total number of people employed by the undertaking at a given time."
                  required
                >
                  <Select
                    value={formData.employeeCountingType || ''}
                    onValueChange={(value) => updateFormData('employeeCountingType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="headcount">Headcount</SelectItem>
                      <SelectItem value="fte">Full-time equivalent (FTE)</SelectItem>
                    </SelectContent>
                  </Select>
                </TooltipField>
              </div>

              <TooltipField
                label="Country of primary operations and location of significant asset(s)"
                tooltip="Select the country where your primary operations are located and where significant assets are held."
                required
              >
                <Select
                  value={formData.primaryCountry || ''}
                  onValueChange={(value) => updateFormData('primaryCountry', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country} value={country}>{country}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TooltipField>
            </div>
          </Subsection>

          {/* Subsidiaries - shown only if consolidated */}
          {formData.reportingBasis === 'consolidated' && (
            <Subsection title="B1 – List of subsidiaries">
              <DynamicGrid
                columns={[
                  { key: 'name', label: 'Name', type: 'text', required: true },
                  { key: 'address', label: 'Registered Address', type: 'text', required: true }
                ]}
                tooltip="In case of a consolidated sustainability report, add the list of the subsidiaries, including their registered address."
                onDataChange={(data) => updateFormData('subsidiaries', data)}
              />
            </Subsection>
          )}

          {/* Sustainability certifications */}
          <Subsection title="B1 – Sustainability-related certification(s) or label(s)">
            <TooltipField
              tooltip="If the undertaking has obtained any sustainability-related certification or label, it shall provide a brief description of those (including, where relevant, the issuers of the certification or label, date and rating score). Sustainability-related certification can include registered eco-labels from an EU, national or international labelling scheme, corresponding to the main activity of an SME"
            >
              <div className="flex items-center space-x-2">
                <Switch
                  id="sustainability-certs"
                  checked={formData.hasSustainabilityCerts || false}
                  onCheckedChange={(checked) => updateFormData('hasSustainabilityCerts', checked)}
                />
                <Label htmlFor="sustainability-certs">
                  Has the undertaking obtained any sustainability-related certification(s) or label(s)?
                </Label>
              </div>
            </TooltipField>

            {formData.hasSustainabilityCerts && (
              <TooltipField
                label="Description of certification(s)/label(s)"
                tooltip="Provide a brief description including issuer, date, and rating score."
              >
                <Textarea
                  placeholder="Describe your sustainability certifications, including issuer, date, and rating score..."
                  value={formData.sustainabilityCertsDescription || ''}
                  onChange={(e) => updateFormData('sustainabilityCertsDescription', e.target.value)}
                  rows={4}
                />
              </TooltipField>
            )}
          </Subsection>

          {/* B1 – List of site(s) */}
          <Subsection title="B1 – List of site(s)">
            <TooltipField
              tooltip="The geolocation of an undertaking is expected to be a valuable datapoint for stakeholders for the assessment of risks and opportunities connected to the SME, particularly in relation to the sustainability issues of climate change adaptation , water, ecosystems and biodiversity."
            >
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto-geolocation"
                    checked={formData.autoGeolocation || false}
                    onCheckedChange={(checked) => updateFormData('autoGeolocation', checked)}
                  />
                  <Label htmlFor="auto-geolocation">
                    Enable automatic geolocation via OpenStreetMap Nominatim
                  </Label>
                </div>
                
                {formData.autoGeolocation && (
                  <div className="p-3 bg-muted/30 rounded-lg border border-muted text-sm">
                    <p className="font-medium mb-2">Usage Policy Notice:</p>
                    <p>
                      Automatic geolocation: enabling the OpenStreetMaps's automatic geolocation with the checkbox below, the undertaking is declaring to be fully aware and in acceptance of Nominatim Usage Policy and Privacy Policy.
                      OpenStreetMap® is open data, licensed under the Open Data Commons Open Database License (ODbL) by the OpenStreetMap Foundation (OSMF). All data belong and are owned by OpenStreetMap®.
                    </p>
                  </div>
                )}
              </div>
            </TooltipField>

            <DynamicGrid
              columns={[
                { key: 'address', label: 'Address', type: 'text', required: true },
                { key: 'postalCode', label: 'Postal Code', type: 'text', required: true },
                { key: 'city', label: 'City', type: 'text', required: true },
                { key: 'country', label: 'Country', type: 'select', options: countries, required: true },
                { key: 'coordinates', label: 'GPS Coordinates (lat,lon)', type: 'text' }
              ]}
              tooltip="Add all sites where your undertaking operates. GPS coordinates will be automatically populated if geolocation is enabled and address fields are complete."
              onDataChange={(data) => updateFormData('sites', data)}
              autoGeolocation={formData.autoGeolocation || false}
            />
          </Subsection>

          {/* B2 – Practices, policies and future initiatives */}
          <Subsection title="B2 – Practices, policies and future initiatives for transitioning towards a more sustainable economy">
            <TooltipField
              tooltip={
                <div>
                  In order to understand the sustainability issues refer to Appendix B of  VSME Standard{' '}
                  <a 
                    href="https://xbrl.efrag.org/e-esrs/2024-12-17-efrag-vsme.xhtml#id-440" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    <ExternalLink className="h-3 w-3" />
                    View Standard
                  </a>
                </div>
              }
            >
              <div className="flex items-center space-x-2">
                <Switch
                  id="has-sustainability-practices"
                  checked={formData.hasSustainabilityPractices || false}
                  onCheckedChange={(checked) => updateFormData('hasSustainabilityPractices', checked)}
                />
                <Label htmlFor="has-sustainability-practices">
                  Has the undertaking put in place specific practices, policies and/or future initiatives for transitioning towards a more sustainable economy?
                </Label>
              </div>
            </TooltipField>

            {formData.hasSustainabilityPractices && (
              <div className="space-y-4 pl-6 border-l-2 border-accent/30">
                <TooltipField
                  label="Sustainability issues addressed"
                  tooltip="Select all sustainability issues that are addressed by your practices, policies, and future initiatives."
                >
                  <MatrixInput
                    options={sustainabilityIssues}
                    selected={formData.sustainabilityIssuesAddressed || []}
                    onSelectionChange={(selected) => updateFormData('sustainabilityIssuesAddressed', selected)}
                  />
                </TooltipField>
              </div>
            )}
          </Subsection>

          {/* B2 – Cooperative specific disclosures */}
          <Subsection title="B2 – Cooperative specific disclosures">
            <TooltipField
              tooltip="If the undertaking is a cooperative, it may disclose: (a) The effective participation of workers, users or other interested parties or communities in governance; (b) The financial investment in the capital or assets of social economy entities referred to in the Council Recommendation of 29 September 2023 (excluding donations and contributions); and (c) Any limits to the distribution of profits connected to the mutualistic nature or to the nature of the activities consisting in services of general economic interest (SGEI)."
            >
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-foreground">
                    Effective participation of workers, users or other interested parties or communities in governance
                  </Label>
                  <Textarea
                    placeholder="Describe the effective participation of stakeholders in governance..."
                    value={formData.cooperativeGovernance || ''}
                    onChange={(e) => updateFormData('cooperativeGovernance', e.target.value)}
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-foreground">
                    Financial investment in the capital or assets of social economy entities (excluding donations and contributions)
                  </Label>
                  <Textarea
                    placeholder="Describe financial investments in social economy entities..."
                    value={formData.cooperativeInvestment || ''}
                    onChange={(e) => updateFormData('cooperativeInvestment', e.target.value)}
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-foreground">
                    Any limits to the distribution of profits connected to the mutualistic nature or SGEI
                  </Label>
                  <Textarea
                    placeholder="Describe any limits to profit distribution..."
                    value={formData.cooperativeProfitLimits || ''}
                    onChange={(e) => updateFormData('cooperativeProfitLimits', e.target.value)}
                    className="mt-1"
                    rows={3}
                  />
                </div>
              </div>
            </TooltipField>
          </Subsection>

          {/* C2 – Description of practices, policies and future initiatives */}
          <RepeatableSection
            title="C2 – Description of practices, policies and future initiatives"
            tooltip="If the undertaking has put in place specific practices, policies or future initiatives for transitioning towards a more sustainable economy, which it has already reported under disclosure B2 in the Basic Module, it shall be briefly described."
            items={formData.practicesDescriptions || []}
            onItemsChange={(items) => updateFormData('practicesDescriptions', items)}
          />

          {/* C1 – Strategy: Business Model and Sustainability */}
          <Subsection title="C1 – Strategy: Business Model and Sustainability – Related Initiatives">
            <TooltipField
              tooltip="The undertaking shall disclose the key elements of its business model and strategy, including: (a) A description of significant groups of products and/or services offered; (b) A description of significant market(s) the undertaking operates in (such as B2B, wholesale, retail, countries); (c) A description of main business relationships (such as key suppliers, customers distribution channels and consumers ); and (d) If the strategy has key elements that relate to or affect sustainability issues, a brief description of those key elements."
            >
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-foreground">
                    Description of significant groups of products and/or services offered
                  </Label>
                  <Textarea
                    placeholder="Describe your main products and services..."
                    value={formData.productsServices || ''}
                    onChange={(e) => updateFormData('productsServices', e.target.value)}
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-foreground">
                    Description of significant market(s) the undertaking operates in (e.g., B2B, wholesale, retail, countries)
                  </Label>
                  <Textarea
                    placeholder="Describe your key markets..."
                    value={formData.markets || ''}
                    onChange={(e) => updateFormData('markets', e.target.value)}
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-foreground">
                    Description of main business relationships (e.g., key suppliers, customers, distribution channels and consumers)
                  </Label>
                  <Textarea
                    placeholder="Describe your main business relationships..."
                    value={formData.businessRelationships || ''}
                    onChange={(e) => updateFormData('businessRelationships', e.target.value)}
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="strategy-sustainability-elements"
                      checked={formData.hasStrategySustainabilityElements || false}
                      onCheckedChange={(checked) => updateFormData('hasStrategySustainabilityElements', checked)}
                    />
                    <Label htmlFor="strategy-sustainability-elements">
                      Has the strategy key elements that relate to or affect sustainability issues?
                    </Label>
                  </div>

                  {formData.hasStrategySustainabilityElements && (
                    <div>
                      <Label className="text-sm font-medium text-foreground">
                        Describe those key elements
                      </Label>
                      <Textarea
                        placeholder="Describe key sustainability-related strategy elements..."
                        value={formData.strategySustainabilityElements || ''}
                        onChange={(e) => updateFormData('strategySustainabilityElements', e.target.value)}
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                  )}
                </div>
              </div>
            </TooltipField>
          </Subsection>

          {/* Additional general disclosures */}
          <Subsection title="Additional general disclosures (optional)">
            <TooltipField
              tooltip="Depending on the type of activities carried out by the undertaking, the inclusion of additional information (metrics and/or narrative disclosures) not covered in this standard is appropriate in order to disclose sustainability issues that are common in the undertaking's sector (i.e. typically encountered by businesses or entities operating within a specific industry or field) or that are specific to the undertaking, as this supports the preparation of relevant, faithful, comparable, understandable and verifiable information. This includes the consideration of information on Scope 3 GHG emissions"
            >
              <div>
                <Label className="text-sm font-medium text-foreground">
                  Disclosure of any other general and/or entity specific information on the reporting period
                </Label>
                <Textarea
                  placeholder="Provide any additional information relevant to your sustainability reporting..."
                  value={formData.additionalDisclosures || ''}
                  onChange={(e) => updateFormData('additionalDisclosures', e.target.value)}
                  className="mt-1"
                  rows={4}
                />
              </div>
            </TooltipField>
          </Subsection>

        </FormSection>
          </TabsContent>

          {/* Section 2: Environmental Disclosures */}
          <TabsContent value="section2" className="space-y-6">
            <FormSection title="Section 2: Environmental Disclosures">
          
          {/* B3 - Total Energy Consumption */}
          <Subsection title="B3 – Total Energy Consumption">
            <TooltipField
              label="Total Energy Consumption (MWh)"
              tooltip="Total energy consumption of the undertaking for the reporting period in MWh (megawatt hours)."
              required
            >
              <Input
                type="number"
                placeholder="0"
                value={formData.totalEnergyConsumption || ''}
                onChange={(e) => updateFormData('totalEnergyConsumption', e.target.value)}
              />
            </TooltipField>
          </Subsection>

          {/* B3 - Breakdown of energy consumption */}
          <Subsection title="B3 – Breakdown of energy consumption">
            <TooltipField
              tooltip="The undertaking may disclose its energy consumption breakdown between renewable and non-renewable sources if it has obtained the necessary information to provide this breakdown."
            >
              <div className="flex items-center space-x-2">
                <Switch
                  id="has-energy-breakdown"
                  checked={formData.hasEnergyBreakdown || false}
                  onCheckedChange={(checked) => updateFormData('hasEnergyBreakdown', checked)}
                />
                <Label htmlFor="has-energy-breakdown">
                  Has the undertaking obtained the necessary information to provide an energy consumption breakdown?
                </Label>
              </div>
            </TooltipField>

            <div className="space-y-4 pl-6 border-l-2 border-accent/30">
              <div className="grid grid-cols-4 gap-4">
                <div className="font-medium text-sm">Energy Source</div>
                <div className="font-medium text-sm">Renewable (MWh)</div>
                <div className="font-medium text-sm">Non-renewable (MWh)</div>
                <div className="font-medium text-sm">Total renewable and non-renewable</div>
                
                <Label className="text-sm">Electricity (as reflected in utility billings)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.electricityRenewable || ''}
                  onChange={(e) => updateFormData('electricityRenewable', e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.electricityNonRenewable || ''}
                  onChange={(e) => updateFormData('electricityNonRenewable', e.target.value)}
                />
                <Input
                  type="number"
                  value={(parseFloat(formData.electricityRenewable || '0') + parseFloat(formData.electricityNonRenewable || '0')) || ''}
                  readOnly
                  className="bg-muted"
                />
                
                <Label className="text-sm">Self-generated electricity</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.selfGeneratedRenewable || ''}
                  onChange={(e) => updateFormData('selfGeneratedRenewable', e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.selfGeneratedNonRenewable || ''}
                  onChange={(e) => updateFormData('selfGeneratedNonRenewable', e.target.value)}
                />
                <Input
                  type="number"
                  value={(parseFloat(formData.selfGeneratedRenewable || '0') + parseFloat(formData.selfGeneratedNonRenewable || '0')) || ''}
                  readOnly
                  className="bg-muted"
                />
                
                <Label className="text-sm">Fuels</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.fuelsRenewable || ''}
                  onChange={(e) => updateFormData('fuelsRenewable', e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.fuelsNonRenewable || ''}
                  onChange={(e) => updateFormData('fuelsNonRenewable', e.target.value)}
                />
                <Input
                  type="number"
                  value={(parseFloat(formData.fuelsRenewable || '0') + parseFloat(formData.fuelsNonRenewable || '0')) || ''}
                  readOnly
                  className="bg-muted"
                />
              </div>
            </div>
          </Subsection>

          {/* B3 - Greenhouse Gas Emissions considering the GHG Protocol Version 2004 */}
          <Subsection title="B3 – Estimated Greenhouse Gas Emissions considering the GHG Protocol Version 2004">
            <div className="space-y-6">
              {/* Current Reporting Period Display */}
              <TooltipField
                label="Current Reporting Period"
                tooltip="The reporting period as defined in the general information section."
              >
                <Input
                  type="text"
                  value={formData.reportingStartDate && formData.reportingEndDate 
                    ? `${formData.reportingStartDate} to ${formData.reportingEndDate}`
                    : 'Not specified'}
                  readOnly
                  className="bg-muted"
                />
              </TooltipField>

              {/* Current Period GHG Emissions */}
              <div className="space-y-4">
                <h4 className="font-medium text-foreground">Current Reporting Period GHG Emissions (tCO2e)</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="font-medium text-sm">Emission Type</div>
                  <div className="font-medium text-sm">Current Period (tCO2e)</div>

                  <Label className="text-sm">Gross Scope 1 GHG Emissions</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.currentScope1 || ''}
                    onChange={(e) => updateFormData('currentScope1', e.target.value)}
                  />

                  <Label className="text-sm">Gross Scope 2 location-based GHG Emissions</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.currentScope2Location || ''}
                    onChange={(e) => updateFormData('currentScope2Location', e.target.value)}
                  />

                  <Label className="text-sm">Gross scope 2 market-based GHG Emissions - May (optional)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.currentScope2Market || ''}
                    onChange={(e) => updateFormData('currentScope2Market', e.target.value)}
                  />

                  <Label className="text-sm font-medium">Total Scope 1 and Scope 2 GHG Emissions (location-based)</Label>
                  <Input
                    type="number"
                    value={((parseFloat(formData.currentScope1) || 0) + (parseFloat(formData.currentScope2Location) || 0)).toString()}
                    readOnly
                    className="bg-muted"
                  />

                  <Label className="text-sm font-medium">Total Scope 1 and Scope 2 GHG emissions (market-based) - May (optional)</Label>
                  <Input
                    type="number"
                    value={((parseFloat(formData.currentScope1) || 0) + (parseFloat(formData.currentScope2Market) || 0)).toString()}
                    readOnly
                    className="bg-muted"
                  />
                </div>

                {/* Current Period Scope 3 Emissions */}
                <div className="space-y-4">
                  <h4 className="font-medium text-foreground">Current Reporting Period Scope 3 Emissions</h4>
                  
                  <DynamicGrid
                    columns={[
                      { key: 'category', label: 'Scope 3 Category', type: 'select', options: [
                        '1. Purchased Goods and Services',
                        '2. Capital Goods',
                        '3. Fuel- and Energy-Related Activities (Not Included in Scope 1 or Scope 2)',
                        '4. Upstream Transportation and Distribution',
                        '5. Waste Generated in Operations',
                        '6. Business Travel',
                        '7. Employee Commuting',
                        '8. Upstream Leased Assets',
                        '9. Downstream Transportation and Distribution',
                        '10. Processing of Sold Products',
                        '11. Use of Sold Products',
                        '12. End-of-Life Treatment of Sold Products',
                        '13. Downstream Leased Assets',
                        '14. Franchises',
                        '15. Investments'
                      ], required: true },
                      { key: 'currentEmissions', label: 'Current Period (tCO2e)', type: 'text' }
                    ]}
                    tooltip="Select applicable Scope 3 categories and enter the corresponding current period emissions."
                    onDataChange={(data) => updateFormData('currentScope3Emissions', data)}
                  />

                  {/* Total Scope 3 Current Period */}
                  <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-form-border">
                    <Label className="text-sm font-medium">Total Scope 3 GHG Emissions</Label>
                    <Input
                      type="number"
                      value={formData.currentScope3Emissions?.reduce((sum, item) => sum + (parseFloat(item.currentEmissions) || 0), 0).toString() || '0'}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                </div>
              </div>
            </div>
          </Subsection>

          {/* C3 - GHG reduction targets (in tC02e) [If applicable] */}
          <Subsection title="C3 - GHG reduction targets (in tC02e) [If applicable]">
            <div className="space-y-6">
              {/* C3 - GHG reduction targets */}
              <div className="space-y-4">
                <TooltipField
                  tooltip="If the undertaking has established GHG emission reduction targets, it shall disclose them."
                >
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="has-ghg-targets"
                      checked={formData.hasGHGTargets || false}
                      onCheckedChange={(checked) => updateFormData('hasGHGTargets', checked)}
                    />
                    <Label htmlFor="has-ghg-targets">
                      Has the undertaking established GHG emission reduction targets?
                    </Label>
                  </div>
                </TooltipField>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TooltipField
                    label="Base Year"
                    tooltip="The year against which targets are measured."
                    required={formData.hasGHGTargets}
                  >
                    <Input
                      type="number"
                      placeholder="2024"
                      value={formData.ghgTargetBaseYear || ''}
                      onChange={(e) => updateFormData('ghgTargetBaseYear', e.target.value)}
                    />
                  </TooltipField>

                  <TooltipField
                    label="Target Year"
                    tooltip="The year by which the target should be achieved."
                    required={formData.hasGHGTargets}
                  >
                    <Input
                      type="number"
                      placeholder="2030"
                      value={formData.ghgTargetYear || ''}
                      onChange={(e) => updateFormData('ghgTargetYear', e.target.value)}
                    />
                  </TooltipField>
                </div>
              </div>

              {/* Scope 1 and 2 Emissions with Targets */}
              <div className="space-y-4">
                <h4 className="font-medium text-foreground">Scope 1 & 2 Emissions</h4>
                
                <div className="grid grid-cols-4 gap-4">
                  <div className="font-medium text-sm">Emission Type</div>
                  <div className="font-medium text-sm">Base Year Emissions (tCO2e)</div>
                  <div className="font-medium text-sm">Target Year Emissions (tCO2e)</div>
                  <div className="font-medium text-sm">Percentage Reduction</div>

                  <Label className="text-sm">Gross Scope 1 GHG Emissions</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.scope1BaseYear || ''}
                    onChange={(e) => updateFormData('scope1BaseYear', e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.scope1TargetYear || ''}
                    onChange={(e) => updateFormData('scope1TargetYear', e.target.value)}
                  />
                  <Input
                    type="number"
                    value={formData.scope1BaseYear && formData.scope1TargetYear 
                      ? (((parseFloat(formData.scope1BaseYear) - parseFloat(formData.scope1TargetYear)) / parseFloat(formData.scope1BaseYear)) * 100).toFixed(2)
                      : '0'}
                    readOnly
                    className="bg-muted"
                  />

                  <Label className="text-sm">Gross Scope 2 location-based GHG Emissions</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.scope2LocationBaseYear || ''}
                    onChange={(e) => updateFormData('scope2LocationBaseYear', e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.scope2LocationTargetYear || ''}
                    onChange={(e) => updateFormData('scope2LocationTargetYear', e.target.value)}
                  />
                  <Input
                    type="number"
                    value={formData.scope2LocationBaseYear && formData.scope2LocationTargetYear 
                      ? (((parseFloat(formData.scope2LocationBaseYear) - parseFloat(formData.scope2LocationTargetYear)) / parseFloat(formData.scope2LocationBaseYear)) * 100).toFixed(2)
                      : '0'}
                    readOnly
                    className="bg-muted"
                  />

                  <Label className="text-sm">Gross Scope 2 market-based GHG Emissions (Optional)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.scope2MarketBaseYear || ''}
                    onChange={(e) => updateFormData('scope2MarketBaseYear', e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.scope2MarketTargetYear || ''}
                    onChange={(e) => updateFormData('scope2MarketTargetYear', e.target.value)}
                  />
                  <Input
                    type="number"
                    value={formData.scope2MarketBaseYear && formData.scope2MarketTargetYear 
                      ? (((parseFloat(formData.scope2MarketBaseYear) - parseFloat(formData.scope2MarketTargetYear)) / parseFloat(formData.scope2MarketBaseYear)) * 100).toFixed(2)
                      : '0'}
                    readOnly
                    className="bg-muted"
                  />

                  <Label className="text-sm font-medium">Total Scope 1 and Scope 2 GHG Emissions location-based</Label>
                  <Input
                    type="number"
                    value={((parseFloat(formData.scope1BaseYear) || 0) + (parseFloat(formData.scope2LocationBaseYear) || 0)).toString()}
                    readOnly
                    className="bg-muted"
                  />
                  <Input
                    type="number"
                    value={((parseFloat(formData.scope1TargetYear) || 0) + (parseFloat(formData.scope2LocationTargetYear) || 0)).toString()}
                    readOnly
                    className="bg-muted"
                  />
                  <Input
                    type="number"
                    value={((parseFloat(formData.scope1BaseYear) || 0) + (parseFloat(formData.scope2LocationBaseYear) || 0)) > 0
                      ? ((((parseFloat(formData.scope1BaseYear) || 0) + (parseFloat(formData.scope2LocationBaseYear) || 0)) - ((parseFloat(formData.scope1TargetYear) || 0) + (parseFloat(formData.scope2LocationTargetYear) || 0))) / ((parseFloat(formData.scope1BaseYear) || 0) + (parseFloat(formData.scope2LocationBaseYear) || 0)) * 100).toFixed(2)
                      : '0'}
                    readOnly
                    className="bg-muted"
                  />

                  <Label className="text-sm font-medium">Total Scope 1 and Scope 2 GHG Emissions market-based (Optional)</Label>
                  <Input
                    type="number"
                    value={((parseFloat(formData.scope1BaseYear) || 0) + (parseFloat(formData.scope2MarketBaseYear) || 0)).toString()}
                    readOnly
                    className="bg-muted"
                  />
                  <Input
                    type="number"
                    value={((parseFloat(formData.scope1TargetYear) || 0) + (parseFloat(formData.scope2MarketTargetYear) || 0)).toString()}
                    readOnly
                    className="bg-muted"
                  />
                  <Input
                    type="number"
                    value={((parseFloat(formData.scope1BaseYear) || 0) + (parseFloat(formData.scope2MarketBaseYear) || 0)) > 0
                      ? ((((parseFloat(formData.scope1BaseYear) || 0) + (parseFloat(formData.scope2MarketBaseYear) || 0)) - ((parseFloat(formData.scope1TargetYear) || 0) + (parseFloat(formData.scope2MarketTargetYear) || 0))) / ((parseFloat(formData.scope1BaseYear) || 0) + (parseFloat(formData.scope2MarketBaseYear) || 0)) * 100).toFixed(2)
                      : '0'}
                    readOnly
                    className="bg-muted"
                  />
                </div>
              </div>

              {/* Scope 3 Emissions */}
              <div className="space-y-4">
                <TooltipField
                  tooltip="The undertaking may disclose entity-specific information on Scope 3 emissions if available."
                >
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="has-scope3-emissions"
                      checked={formData.hasScope3Emissions || false}
                      onCheckedChange={(checked) => updateFormData('hasScope3Emissions', checked)}
                    />
                    <Label htmlFor="has-scope3-emissions">
                      Is the undertaking disclosing entity-specific information on Scope 3 emissions (in tCO2e)?
                    </Label>
                  </div>
                </TooltipField>

                <DynamicGrid
                  columns={[
                    { key: 'category', label: 'Scope 3 Category', type: 'select', options: [
                      '1. Purchased Goods and Services',
                      '2. Capital Goods',
                      '3. Fuel- and Energy-Related Activities (Not Included in Scope 1 or Scope 2)',
                      '4. Upstream Transportation and Distribution',
                      '5. Waste Generated in Operations',
                      '6. Business Travel',
                      '7. Employee Commuting',
                      '8. Upstream Leased Assets',
                      '9. Downstream Transportation and Distribution',
                      '10. Processing of Sold Products',
                      '11. Use of Sold Products',
                      '12. End-of-Life Treatment of Sold Products',
                      '13. Downstream Leased Assets',
                      '14. Franchises',
                      '15. Investments'
                    ], required: true },
                    { key: 'baseYearEmissions', label: 'Base Year Emissions (tCO2e)', type: 'text' },
                    { key: 'targetYearEmissions', label: 'Target Year Emissions (tCO2e)', type: 'text' },
                    { key: 'percentageReduction', label: 'Percentage Reduction (%)', type: 'text', 
                      calculated: true, 
                      calculateFrom: ['baseYearEmissions', 'targetYearEmissions'],
                      calculateFunction: (base: string, target: string) => {
                        const baseVal = parseFloat(base) || 0;
                        const targetVal = parseFloat(target) || 0;
                        return baseVal > 0 ? (((baseVal - targetVal) / baseVal) * 100).toFixed(2) : '0';
                      }
                    }
                  ]}
                  tooltip="Select applicable Scope 3 categories and enter the corresponding emissions."
                  onDataChange={(data) => updateFormData('scope3Emissions', data)}
                />

                {/* Total Scope 3 calculations */}
                <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-form-border">
                  <Label className="text-sm font-medium">Total Scope 3 GHG Emissions</Label>
                  <Input
                    type="number"
                    value={formData.scope3Emissions?.reduce((sum, item) => sum + (parseFloat(item.baseYearEmissions) || 0), 0).toString() || '0'}
                    readOnly
                    className="bg-muted"
                  />
                  <Input
                    type="number"
                    value={formData.scope3Emissions?.reduce((sum, item) => sum + (parseFloat(item.targetYearEmissions) || 0), 0).toString() || '0'}
                    readOnly
                    className="bg-muted"
                  />
                  <Input
                    type="number"
                    value={(() => {
                      const totalBase = formData.scope3Emissions?.reduce((sum, item) => sum + (parseFloat(item.baseYearEmissions) || 0), 0) || 0;
                      const totalTarget = formData.scope3Emissions?.reduce((sum, item) => sum + (parseFloat(item.targetYearEmissions) || 0), 0) || 0;
                      return totalBase > 0 ? (((totalBase - totalTarget) / totalBase) * 100).toFixed(2) : '0';
                    })()}
                    readOnly
                    className="bg-muted"
                  />
                </div>
              </div>
            </div>
          </Subsection>

          {/* C3 - Main Actions for Targets */}
          <Subsection title="C3 - Disclosure of list of main actions the entity seeks in order to achieve its reporting period targets (if applicable)">
            <TooltipField
              label="List of main actions to achieve targets"
              tooltip="Describe the main actions the undertaking plans to implement to achieve its GHG reduction targets."
            >
              <Textarea
                placeholder="Describe the main actions your undertaking will take to achieve its GHG reduction targets..."
                value={formData.mainActionsForTargets || ''}
                onChange={(e) => updateFormData('mainActionsForTargets', e.target.value)}
                rows={4}
              />
            </TooltipField>
          </Subsection>

          {/* C3 - Transition Plan */}
          <Subsection title="C3 - Transition plan for undertakings operating in high climate impact sectors (if applicable)">
            <div className="space-y-4">
              <TooltipField
                tooltip="Undertakings operating in high climate impact sectors should disclose information about their transition plans."
              >
                <div className="flex items-center space-x-2">
                  <Switch
                    id="operates-high-impact-sectors"
                    checked={formData.operatesHighImpactSectors || false}
                    onCheckedChange={(checked) => updateFormData('operatesHighImpactSectors', checked)}
                  />
                  <Label htmlFor="operates-high-impact-sectors">
                    Is the undertaking operating in high climate impact sectors?
                  </Label>
                </div>
              </TooltipField>

              <TooltipField
                label="Status of implementation of a transition plan in relation to climate change mitigation"
                tooltip="Select the current status of your transition plan implementation."
                required
              >
                <RadioGroup
                  value={formData.transitionPlanStatus || ''}
                  onValueChange={(value) => updateFormData('transitionPlanStatus', value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="planned" id="planned" />
                    <Label htmlFor="planned">Adoption of a transition plan is planned in the future</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="adopted" id="adopted" />
                    <Label htmlFor="adopted">A transition plan has already been adopted</Label>
                  </div>
                </RadioGroup>
              </TooltipField>

              {formData.transitionPlanStatus === 'planned' && (
                <TooltipField
                  label="Date of foreseen adoption of transition plan (for undertakings not having adopted a transition plan yet)"
                  tooltip="Specify when you plan to adopt the transition plan."
                  required
                >
                  <Input
                    type="date"
                    value={formData.transitionPlanAdoptionDate || ''}
                    onChange={(e) => updateFormData('transitionPlanAdoptionDate', e.target.value)}
                  />
                </TooltipField>
              )}

              <TooltipField
                label="Description of a transition plan for climate change mitigation (Optional)"
                tooltip="Provide a description of your transition plan including how it contributes to reducing GHG emissions."
              >
                <Textarea
                  placeholder="Describe your transition plan for climate change mitigation..."
                  value={formData.transitionPlanDescription || ''}
                  onChange={(e) => updateFormData('transitionPlanDescription', e.target.value)}
                  rows={4}
                />
              </TooltipField>
            </div>
          </Subsection>

          {/* B3 - GHG Emission Intensity */}
          <Subsection title="B3 – Greenhouse gas emission intensity per turnover">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TooltipField
                label="Scope 1 and Scope 2 GHG Emissions intensity (location-based) (tCO2e/€)"
                tooltip="This is automatically calculated as (Scope 1 + Scope 2 location-based) / Turnover."
                required
              >
                <Input
                  type="number"
                  value={formData.turnover && (parseFloat(formData.currentScope1) || 0) + (parseFloat(formData.currentScope2Location) || 0) > 0 
                    ? (((parseFloat(formData.currentScope1) || 0) + (parseFloat(formData.currentScope2Location) || 0)) / parseFloat(formData.turnover)).toFixed(6)
                    : '0'}
                  readOnly
                  className="bg-muted"
                />
              </TooltipField>

              <TooltipField
                label="Scope 1 and Scope 2 GHG Emissions intensity (market-based) (tCO2e/€) (Optional)"
                tooltip="This is automatically calculated as (Scope 1 + Scope 2 market-based) / Turnover."
              >
                <Input
                  type="number"
                  value={formData.turnover && (parseFloat(formData.currentScope1) || 0) + (parseFloat(formData.currentScope2Market) || 0) > 0 
                    ? (((parseFloat(formData.currentScope1) || 0) + (parseFloat(formData.currentScope2Market) || 0)) / parseFloat(formData.turnover)).toFixed(6)
                    : '0'}
                  readOnly
                  className="bg-muted"
                />
              </TooltipField>

              <TooltipField
                label="Total Scope 1, Scope 2 and Scope 3 GHG Emissions intensity location-based (tCO2e/€)"
                tooltip="This is automatically calculated as (Total Scope 1 + Scope 2 + Scope 3 location-based) / Turnover."
                required
              >
                <Input
                  type="number"
                  value={(() => {
                    const scope12Location = (parseFloat(formData.currentScope1) || 0) + (parseFloat(formData.currentScope2Location) || 0);
                    const scope3Total = formData.currentScope3Emissions?.reduce((sum, item) => sum + (parseFloat(item.currentEmissions) || 0), 0) || 0;
                    const totalEmissions = scope12Location + scope3Total;
                    return formData.turnover && totalEmissions > 0 
                      ? (totalEmissions / parseFloat(formData.turnover)).toFixed(6)
                      : '0';
                  })()}
                  readOnly
                  className="bg-muted"
                />
              </TooltipField>

              <TooltipField
                label="Total Scope 1, Scope 2 and Scope 3 GHG Emissions intensity market-based (tCO2e/€) (Optional)"
                tooltip="This is automatically calculated as (Total Scope 1 + Scope 2 + Scope 3 market-based) / Turnover."
              >
                <Input
                  type="number"
                  value={(() => {
                    const scope12Market = (parseFloat(formData.currentScope1) || 0) + (parseFloat(formData.currentScope2Market) || 0);
                    const scope3Total = formData.currentScope3Emissions?.reduce((sum, item) => sum + (parseFloat(item.currentEmissions) || 0), 0) || 0;
                    const totalEmissions = scope12Market + scope3Total;
                    return formData.turnover && totalEmissions > 0 
                      ? (totalEmissions / parseFloat(formData.turnover)).toFixed(6)
                      : '0';
                  })()}
                  readOnly
                  className="bg-muted"
                />
              </TooltipField>
            </div>
          </Subsection>

          {/* B4 - Pollution */}
          <Subsection title="B4 – Pollution of air, water and soil">
            <TooltipField
              tooltip="If the undertaking is already required by law or other national regulations to report to competent authorities its emissions of pollutants, or if it already voluntarily reports on them according to an Environmental Management System, it may disclose this information."
            >
              <div className="flex items-center space-x-2">
                <Switch
                  id="reports-pollution"
                  checked={formData.reportsPollution || false}
                  onCheckedChange={(checked) => updateFormData('reportsPollution', checked)}
                />
                <Label htmlFor="reports-pollution">
                  Is the undertaking already required by law or other national regulations to report to competent authorities its emissions of pollutants, or does it already voluntarily report on them according to an Environmental Management System?
                </Label>
              </div>
            </TooltipField>

            <div className="space-y-4 pl-6 border-l-2 border-accent/30">
              <div className="flex items-center space-x-2">
                <Switch
                  id="pollution-publicly-available"
                  checked={formData.pollutionPubliclyAvailable || false}
                  onCheckedChange={(checked) => updateFormData('pollutionPubliclyAvailable', checked)}
                />
                <Label htmlFor="pollution-publicly-available">
                  Is this disclosure already publicly available?
                </Label>
              </div>

              {formData.pollutionPubliclyAvailable && (
                <TooltipField
                  label="URL link to publicly available information"
                  tooltip="Provide the URL where this pollution information is publicly reported."
                >
                  <Input
                    type="url"
                    placeholder="https://example.com/pollution-report"
                    value={formData.pollutionReportUrl || ''}
                    onChange={(e) => updateFormData('pollutionReportUrl', e.target.value)}
                  />
                </TooltipField>
              )}

              <TooltipField
                label="Unit used for reporting"
                tooltip="Select the unit used for reporting pollutant amounts."
                required={formData.reportsPollution}
              >
                <Select
                  value={formData.pollutionUnit || ''}
                  onValueChange={(value) => updateFormData('pollutionUnit', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">Kilograms (kg)</SelectItem>
                    <SelectItem value="tonne">Tonnes</SelectItem>
                  </SelectContent>
                </Select>
              </TooltipField>

              <DynamicGrid
                columns={[
                  { key: 'pollutant', label: 'Pollutant', type: 'custom', required: formData.reportsPollution },
                  { key: 'emissionToAir', label: 'Emission to air', type: 'text' },
                  { key: 'emissionToWater', label: 'Emission to water', type: 'text' },
                  { key: 'emissionToSoil', label: 'Emission to soil', type: 'text' }
                ]}
                tooltip="Enter pollutant emissions data for air, water, and soil."
                onDataChange={(data) => updateFormData('pollutionData', data)}
                customRenderers={{
                  pollutant: (value, onChange) => (
                    <PollutantSelector
                      selectedPollutant={value}
                      onSelect={onChange}
                    />
                  )
                }}
              />
            </div>
          </Subsection>

          {/* B6 - Water Withdrawal */}
          <Subsection title="B6 – Water Withdrawal">
            <div className="space-y-4">
              <TooltipField
                label="Total amount of water withdrawn from all sites (m³)"
                tooltip="Total water withdrawal from all sources in cubic meters."
                required
              >
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.totalWaterWithdrawal || ''}
                  onChange={(e) => updateFormData('totalWaterWithdrawal', e.target.value)}
                />
              </TooltipField>

              <TooltipField
                label="Amount of water withdrawn at sites located in areas of high water-stress (m³)"
                tooltip="Water withdrawal specifically from areas identified as high water-stress zones."
                required
              >
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.waterWithdrawalHighStress || ''}
                  onChange={(e) => updateFormData('waterWithdrawalHighStress', e.target.value)}
                />
              </TooltipField>
            </div>
          </Subsection>

          {/* B6 - Water Consumption */}
          <Subsection title="B6 – Water Consumption">
            <div className="space-y-4">
              <TooltipField
                tooltip="If the undertaking has production processes in place which significantly consume water, it may disclose additional water consumption information."
              >
                <div className="flex items-center space-x-2">
                  <Switch
                    id="has-water-consuming-processes"
                    checked={formData.hasWaterConsumingProcesses || false}
                    onCheckedChange={(checked) => updateFormData('hasWaterConsumingProcesses', checked)}
                  />
                  <Label htmlFor="has-water-consuming-processes">
                    Does the undertaking have production processes in place which significantly consume water (e.g., thermal energy processes like drying or power production, production of goods, agricultural irrigation, etc.)?
                  </Label>
                </div>
              </TooltipField>

              <TooltipField
                label="Water discharge from undertaking production processes (m³)"
                tooltip="Water discharge specifically from production processes."
              >
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.waterDischarge || ''}
                  onChange={(e) => updateFormData('waterDischarge', e.target.value)}
                />
              </TooltipField>

              <TooltipField
                label="Total water consumption (m³)"
                tooltip="This is automatically calculated as Total Water Withdrawal - Water Discharge."
              >
                <Input
                  type="number"
                  value={((parseFloat(formData.totalWaterWithdrawal) || 0) - (parseFloat(formData.waterDischarge) || 0)).toString()}
                  readOnly
                  className="bg-muted"
                />
              </TooltipField>
            </div>
          </Subsection>

          {/* B5 - Sites in biodiversity sensitive areas */}
          <Subsection title="B5 - Sites in biodiversity sensitive areas">
            <div className="space-y-4">
              <TooltipField
                tooltip="If the undertaking has sites located in or near biodiversity sensitive areas, it should disclose this information."
              >
                <div className="flex items-center space-x-2">
                  <Switch
                    id="has-biodiversity-sites"
                    checked={formData.hasBiodiversitySites || false}
                    onCheckedChange={(checked) => updateFormData('hasBiodiversitySites', checked)}
                  />
                  <Label htmlFor="has-biodiversity-sites">
                    Does the undertaking have sites that are located in or near biodiversity sensitive areas?
                  </Label>
                </div>
              </TooltipField>

              <TooltipField
                label="Unit used for area measurement"
                tooltip="Select the unit for measuring area."
              >
                <Select
                  value={formData.biodiversityAreaUnit || ''}
                  onValueChange={(value) => updateFormData('biodiversityAreaUnit', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hectares">Hectares</SelectItem>
                    <SelectItem value="m2">Square meters (m²)</SelectItem>
                  </SelectContent>
                </Select>
              </TooltipField>

              <DynamicGrid
                columns={[
                  { key: 'siteId', label: 'Related Site ID', type: 'text', required: true },
                  { key: 'siteLocation', label: 'Site Location', type: 'text', required: true },
                  { key: 'area', label: `Area (${formData.biodiversityAreaUnit || 'unit'})`, type: 'text' },
                  { key: 'inSensitiveArea', label: 'In Biodiversity Sensitive Area', type: 'select', options: ['Yes', 'No'] },
                  { key: 'nearSensitiveArea', label: 'Near Biodiversity Sensitive Area', type: 'select', options: ['Yes', 'No'] }
                ]}
                tooltip="Enter information about sites located in or near biodiversity sensitive areas."
                onDataChange={(data) => updateFormData('biodiversitySites', data)}
              />
            </div>
          </Subsection>

          {/* B5 - Biodiversity - Land-use */}
          <Subsection title="B5 - Biodiversity - Land-use (Optional)">
            <div className="space-y-4">
              <TooltipField
                label="Unit used for area measurement"
                tooltip="Select the unit for measuring land-use area."
              >
                <Select
                  value={formData.landUseAreaUnit || ''}
                  onValueChange={(value) => updateFormData('landUseAreaUnit', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hectares">Hectares</SelectItem>
                    <SelectItem value="m2">Square meters (m²)</SelectItem>
                  </SelectContent>
                </Select>
              </TooltipField>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TooltipField
                  label={`Total sealed area (${formData.landUseAreaUnit || 'unit'})`}
                  tooltip="Total area of sealed surfaces."
                >
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.totalSealedArea || ''}
                    onChange={(e) => updateFormData('totalSealedArea', e.target.value)}
                  />
                </TooltipField>

                <TooltipField
                  label={`Total nature-oriented area on-site (${formData.landUseAreaUnit || 'unit'})`}
                  tooltip="Total area dedicated to nature on-site."
                >
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.totalNatureOnSite || ''}
                    onChange={(e) => updateFormData('totalNatureOnSite', e.target.value)}
                  />
                </TooltipField>

                <TooltipField
                  label={`Total nature-oriented area off-site (${formData.landUseAreaUnit || 'unit'})`}
                  tooltip="Total area dedicated to nature off-site."
                >
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.totalNatureOffSite || ''}
                    onChange={(e) => updateFormData('totalNatureOffSite', e.target.value)}
                  />
                </TooltipField>

                <TooltipField
                  label={`Total use of land (${formData.landUseAreaUnit || 'unit'})`}
                  tooltip="Total land use area."
                >
                  <Input
                    type="number"
                    value={((parseFloat(formData.totalSealedArea) || 0) + (parseFloat(formData.totalNatureOnSite) || 0) + (parseFloat(formData.totalNatureOffSite) || 0)).toString()}
                    readOnly
                    className="bg-muted"
                  />
                </TooltipField>
              </div>
            </div>
          </Subsection>


          {/* B7 - Circular Economy */}
          <Subsection title="B7 – Description of circular economy principles">
            <div className="space-y-4">
              <TooltipField
                label="Undertaking applies circular economy principles"
                tooltip="Describe whether and how the undertaking applies circular economy principles."
                required
              >
                <RadioGroup
                  value={formData.appliesCircularEconomy || ''}
                  onValueChange={(value) => updateFormData('appliesCircularEconomy', value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="circular-yes" />
                    <Label htmlFor="circular-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="circular-no" />
                    <Label htmlFor="circular-no">No</Label>
                  </div>
                </RadioGroup>
              </TooltipField>

              {formData.appliesCircularEconomy === 'yes' && (
                <TooltipField
                  label="Description of how it applies these principles"
                  tooltip="Provide a description of how the undertaking applies circular economy principles."
                  required
                >
                  <Textarea
                    placeholder="Describe how your undertaking applies circular economy principles..."
                    value={formData.circularEconomyDescription || ''}
                    onChange={(e) => updateFormData('circularEconomyDescription', e.target.value)}
                    rows={3}
                  />
                </TooltipField>
              )}
            </div>
          </Subsection>

          {/* B7 - Waste Generated */}
          <Subsection title="B7 – Waste generated">
            <div className="space-y-4">
              <DynamicGrid
                columns={[
                  { key: 'wasteType', label: 'Type of waste', type: 'text', required: true },
                  { key: 'unit', label: 'Unit of measurement', type: 'select', options: ['kg', 'tonne', 'm³'], required: true },
                  { key: 'wasteDiverted', label: 'Waste diverted to recycle or reuse', type: 'text' },
                  { key: 'wasteDisposal', label: 'Waste directed to disposal', type: 'text' },
                  { key: 'totalWaste', label: 'Total waste recycled, reused and directed to disposal', type: 'text', 
                    calculated: true, 
                    calculateFrom: ['wasteDiverted', 'wasteDisposal'],
                    calculateFunction: (diverted: string, disposal: string) => {
                      return ((parseFloat(diverted) || 0) + (parseFloat(disposal) || 0)).toString();
                    }
                  }
                ]}
                tooltip="Enter data for different types of waste generated by the undertaking."
                onDataChange={(data) => updateFormData('wasteData', data)}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <TooltipField
                  label="Total Hazardous waste generated (mass)"
                  tooltip="Automatically calculated from waste data entries."
                >
                  <Input
                    type="number"
                    value={(() => {
                      const hazardousWaste = formData.wasteData?.filter(item => 
                        item.wasteType?.toLowerCase().includes('hazardous') && 
                        (item.unit === 'kg' || item.unit === 'tonne')
                      ) || [];
                      return hazardousWaste.reduce((sum, item) => 
                        sum + ((parseFloat(item.wasteDiverted) || 0) + (parseFloat(item.wasteDisposal) || 0)), 0
                      ).toString();
                    })()}
                    readOnly
                    className="bg-muted"
                  />
                </TooltipField>

                <TooltipField
                  label="Total Non-Hazardous waste generated (mass)"
                  tooltip="Automatically calculated from waste data entries."
                >
                  <Input
                    type="number"
                    value={(() => {
                      const nonHazardousWaste = formData.wasteData?.filter(item => 
                        !item.wasteType?.toLowerCase().includes('hazardous') && 
                        (item.unit === 'kg' || item.unit === 'tonne')
                      ) || [];
                      return nonHazardousWaste.reduce((sum, item) => 
                        sum + ((parseFloat(item.wasteDiverted) || 0) + (parseFloat(item.wasteDisposal) || 0)), 0
                      ).toString();
                    })()}
                    readOnly
                    className="bg-muted"
                  />
                </TooltipField>

                <TooltipField
                  label="Total waste generated (mass)"
                  tooltip="Automatically calculated from all mass-based waste entries."
                >
                  <Input
                    type="number"
                    value={(() => {
                      const massWaste = formData.wasteData?.filter(item => 
                        item.unit === 'kg' || item.unit === 'tonne'
                      ) || [];
                      return massWaste.reduce((sum, item) => 
                        sum + ((parseFloat(item.wasteDiverted) || 0) + (parseFloat(item.wasteDisposal) || 0)), 0
                      ).toString();
                    })()}
                    readOnly
                    className="bg-muted"
                  />
                </TooltipField>

                <TooltipField
                  label="Total Hazardous waste generated (volume)"
                  tooltip="Automatically calculated from waste data entries."
                >
                  <Input
                    type="number"
                    value={(() => {
                      const hazardousWaste = formData.wasteData?.filter(item => 
                        item.wasteType?.toLowerCase().includes('hazardous') && item.unit === 'm³'
                      ) || [];
                      return hazardousWaste.reduce((sum, item) => 
                        sum + ((parseFloat(item.wasteDiverted) || 0) + (parseFloat(item.wasteDisposal) || 0)), 0
                      ).toString();
                    })()}
                    readOnly
                    className="bg-muted"
                  />
                </TooltipField>

                <TooltipField
                  label="Total Non-Hazardous waste generated (volume)"
                  tooltip="Automatically calculated from waste data entries."
                >
                  <Input
                    type="number"
                    value={(() => {
                      const nonHazardousWaste = formData.wasteData?.filter(item => 
                        !item.wasteType?.toLowerCase().includes('hazardous') && item.unit === 'm³'
                      ) || [];
                      return nonHazardousWaste.reduce((sum, item) => 
                        sum + ((parseFloat(item.wasteDiverted) || 0) + (parseFloat(item.wasteDisposal) || 0)), 0
                      ).toString();
                    })()}
                    readOnly
                    className="bg-muted"
                  />
                </TooltipField>

                <TooltipField
                  label="Total waste generated (volume)"
                  tooltip="Automatically calculated from all volume-based waste entries."
                >
                  <Input
                    type="number"
                    value={(() => {
                      const volumeWaste = formData.wasteData?.filter(item => item.unit === 'm³') || [];
                      return volumeWaste.reduce((sum, item) => 
                        sum + ((parseFloat(item.wasteDiverted) || 0) + (parseFloat(item.wasteDisposal) || 0)), 0
                      ).toString();
                    })()}
                    readOnly
                    className="bg-muted"
                  />
                </TooltipField>
              </div>
            </div>
          </Subsection>

          {/* B7 - Annual mass-flow of relevant materials used */}
          <Subsection title="B7 – Annual mass-flow of relevant materials used">
            <div className="space-y-4">
              <TooltipField
                tooltip="If the undertaking operates in a sector using significant material flows, it should disclose this information."
              >
                <div className="flex items-center space-x-2">
                  <Switch
                    id="operates-significant-materials"
                    checked={formData.operatesSignificantMaterials || false}
                    onCheckedChange={(checked) => updateFormData('operatesSignificantMaterials', checked)}
                  />
                  <Label htmlFor="operates-significant-materials">
                    Does the undertaking operate in a sector using significant material flows (for example manufacturing, construction, packaging or others)?
                  </Label>
                </div>
              </TooltipField>

              <DynamicGrid
                columns={[
                  { key: 'materialName', label: 'Name of the key material', type: 'text', required: true },
                  { key: 'massVolume', label: 'Mass/Volume', type: 'text' },
                  { key: 'unitMeasurement', label: 'Unit of measurement', type: 'select', options: ['kg', 'tonne', 'm³'] }
                ]}
                tooltip="Enter information about key materials used by the undertaking."
                onDataChange={(data) => updateFormData('materialsData', data)}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TooltipField
                  label="Total annual mass-flow of relevant materials used (mass in kg)"
                  tooltip="Automatically calculated from materials data entries with mass units."
                >
                  <Input
                    type="number"
                    value={(() => {
                      const massEntries = formData.materialsData?.filter(item => 
                        item.unitMeasurement === 'kg' || item.unitMeasurement === 'tonne'
                      ) || [];
                      return massEntries.reduce((sum, item) => {
                        const value = parseFloat(item.massVolume) || 0;
                        return sum + (item.unitMeasurement === 'tonne' ? value * 1000 : value);
                      }, 0).toString();
                    })()}
                    readOnly
                    className="bg-muted"
                  />
                </TooltipField>

                <TooltipField
                  label="Total annual mass-flow of relevant materials used (volume in m³)"
                  tooltip="Automatically calculated from materials data entries with volume units."
                >
                  <Input
                    type="number"
                    value={(() => {
                      const volumeEntries = formData.materialsData?.filter(item => 
                        item.unitMeasurement === 'm³'
                      ) || [];
                      return volumeEntries.reduce((sum, item) => 
                        sum + (parseFloat(item.massVolume) || 0), 0
                      ).toString();
                    })()}
                    readOnly
                    className="bg-muted"
                  />
                </TooltipField>
              </div>
            </div>
          </Subsection>

          {/* C4 - Climate risks */}
          <Subsection title="C4 – Climate risks (if applicable)">
            <div className="space-y-4">
              <TooltipField
                tooltip="If the undertaking has identified climate-related hazards and transition events, it should disclose this information."
              >
                <div className="flex items-center space-x-2">
                  <Switch
                    id="has-climate-risks"
                    checked={formData.hasClimateRisks || false}
                    onCheckedChange={(checked) => updateFormData('hasClimateRisks', checked)}
                  />
                  <Label htmlFor="has-climate-risks">
                    Has the undertaking identified climate-related hazards and climate-related transition events, creating gross climate-related risks for the undertaking?
                  </Label>
                </div>
              </TooltipField>

              <TooltipField
                label="Description of climate-related hazards and climate-related transition events"
                tooltip="Describe the climate-related hazards and transition events identified."
              >
                <Textarea
                  placeholder="Describe climate-related hazards and transition events..."
                  value={formData.climateHazardsDescription || ''}
                  onChange={(e) => updateFormData('climateHazardsDescription', e.target.value)}
                  rows={3}
                />
              </TooltipField>

              <TooltipField
                label="Disclosure of how it has assessed the exposure and sensitivity of its assets, activities and value chain to these hazards and transition events"
                tooltip="Describe how you assessed exposure and sensitivity to climate risks."
              >
                <Textarea
                  placeholder="Describe how you assessed exposure and sensitivity to climate risks..."
                  value={formData.climateExposureAssessment || ''}
                  onChange={(e) => updateFormData('climateExposureAssessment', e.target.value)}
                  rows={3}
                />
              </TooltipField>

              <TooltipField
                label="Time horizons of any climate-related hazards and transition events identified"
                tooltip="Specify the time horizons for identified climate risks."
              >
                <Textarea
                  placeholder="Describe time horizons for climate risks..."
                  value={formData.climateTimeHorizons || ''}
                  onChange={(e) => updateFormData('climateTimeHorizons', e.target.value)}
                  rows={2}
                />
              </TooltipField>

              <TooltipField
                tooltip="Indicate whether climate change adaptation actions have been undertaken for any climate-related hazards and transition events."
              >
                <div className="flex items-center space-x-2">
                  <Switch
                    id="has-climate-adaptation-actions"
                    checked={formData.hasClimateAdaptationActions || false}
                    onCheckedChange={(checked) => updateFormData('hasClimateAdaptationActions', checked)}
                  />
                  <Label htmlFor="has-climate-adaptation-actions">
                    Disclosure of whether it has undertaken climate change adaptation actions for any climate-related hazards and transition events
                  </Label>
                </div>
              </TooltipField>

              <TooltipField
                label="Potential adverse effects of climate risks that may affect its financial performance or business operations (Optional)"
                tooltip="Assess whether risks are high, medium, or low and describe potential adverse effects."
              >
                <Textarea
                  placeholder="Describe potential adverse effects and assess risk levels (high, medium, low)..."
                  value={formData.climateAdverseEffects || ''}
                  onChange={(e) => updateFormData('climateAdverseEffects', e.target.value)}
                  rows={4}
                />
              </TooltipField>
            </div>
          </Subsection>

          {/* Additional environmental disclosures */}
          <Subsection title="Additional environmental disclosures (optional)">
            <TooltipField
              tooltip="You may include any additional environmental information or entity-specific environmental disclosures relevant to the reporting period."
            >
              <div>
                <Label className="text-sm font-medium text-foreground">
                  Disclosure of any other environmental and/or entity specific environmental disclosures
                </Label>
                <Textarea
                  placeholder="Provide any additional environmental information relevant to your sustainability reporting..."
                  value={formData.additionalEnvironmentalDisclosures || ''}
                  onChange={(e) => updateFormData('additionalEnvironmentalDisclosures', e.target.value)}
                  className="mt-1"
                  rows={4}
                />
              </div>
            </TooltipField>
          </Subsection>

        </FormSection>
          </TabsContent>

          {/* Section 3: Social Disclosures */}
          <TabsContent value="section3" className="space-y-6">
            <FormSection title="Section 3: Social Disclosures">
          
          {/* Employee Counting Methodology - Retrieved from B1 */}
          <Subsection title="Employee Counting Methodology (from General Information)">
            <div className="space-y-4 p-4 bg-muted rounded-lg">
              <TooltipField
                label="Employee counting methodology for the disclosures below (Type)"
                tooltip="This value is retrieved from the B1 General Information section."
              >
                <Input
                  value={formData.employeeCountingMethodologyType || 'Not specified'}
                  readOnly
                  className="bg-background"
                />
              </TooltipField>

              <TooltipField
                label="Employee counting methodology for the disclosures below (Timing)"
                tooltip="This value is retrieved from the B1 General Information section."
              >
                <Input
                  value={formData.employeeCountingMethodologyTiming || 'Not specified'}
                  readOnly
                  className="bg-background"
                />
              </TooltipField>
            </div>
          </Subsection>

          {/* B8 - Workforce General Characteristics - Type of contract */}
          <Subsection title="B8 – Workforce – General characteristics - Type of contract [Always to be reported]">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <TooltipField
                  label="Permanent employees"
                  tooltip="Number of employees with permanent contracts."
                >
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.permanentEmployees || ''}
                    onChange={(e) => updateFormData('permanentEmployees', e.target.value)}
                  />
                </TooltipField>

                <TooltipField
                  label="Temporary employees"
                  tooltip="Number of employees with temporary contracts."
                >
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.temporaryEmployees || ''}
                    onChange={(e) => updateFormData('temporaryEmployees', e.target.value)}
                  />
                </TooltipField>
              </div>

              <TooltipField
                label="Total employees (linked from B1)"
                tooltip="This should match the total from B1 General Information."
              >
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    value={((parseFloat(formData.permanentEmployees) || 0) + (parseFloat(formData.temporaryEmployees) || 0)).toString()}
                    readOnly
                    className="bg-muted"
                  />
                  {formData.numberOfEmployees && 
                   ((parseFloat(formData.permanentEmployees) || 0) + (parseFloat(formData.temporaryEmployees) || 0)) !== parseFloat(formData.numberOfEmployees) && (
                    <Alert className="ml-2 flex-1">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Total number of employees mismatch from B1
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </TooltipField>
            </div>
          </Subsection>

          {/* B8 - Workforce General Characteristics - Gender */}
          <Subsection title="B8 – Workforce – General characteristics - Gender [Always to be reported]">
            <div className="space-y-4">
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 mb-2">
                  <TooltipField
                    label="Employee counting methodology for the disclosures below (Type)"
                    tooltip="This value is displayed from B1 Basis for Preparation."
                  >
                    <Input
                      type="text"
                      value={formData.employeeCountingType === 'fte' ? 'Full-time equivalent (FTE)' : formData.employeeCountingType === 'headcount' ? 'Headcount' : 'Not specified'}
                      readOnly
                      className="bg-muted"
                    />
                  </TooltipField>

                  <TooltipField
                    label="Employee counting methodology for the disclosures below (Timing)"
                    tooltip="This value is displayed from B1 Basis for Preparation."
                  >
                    <Input
                      type="text"
                      value={formData.employeeCountingTiming === 'end-of-period' ? 'At the end of reporting period' : formData.employeeCountingTiming === 'average' ? 'As an average during the reporting period' : 'Not specified'}
                      readOnly
                      className="bg-muted"
                    />
                  </TooltipField>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <TooltipField
                    label="Male employees"
                    tooltip="Number of male employees."
                  >
                    <Input
                      type="number"
                      placeholder="0"
                      value={formData.maleEmployees || ''}
                      onChange={(e) => updateFormData('maleEmployees', e.target.value)}
                    />
                  </TooltipField>

                  <TooltipField
                    label="Female employees"
                    tooltip="Number of female employees."
                  >
                    <Input
                      type="number"
                      placeholder="0"
                      value={formData.femaleEmployees || ''}
                      onChange={(e) => updateFormData('femaleEmployees', e.target.value)}
                    />
                  </TooltipField>

                  <TooltipField
                    label="Other"
                    tooltip="Number of employees with other gender identity."
                  >
                    <Input
                      type="number"
                      placeholder="0"
                      value={formData.otherGenderEmployees || ''}
                      onChange={(e) => updateFormData('otherGenderEmployees', e.target.value)}
                    />
                  </TooltipField>

                  <TooltipField
                    label="Not reported"
                    tooltip="Number of employees who did not report their gender."
                  >
                    <Input
                      type="number"
                      placeholder="0"
                      value={formData.notReportedGenderEmployees || ''}
                      onChange={(e) => updateFormData('notReportedGenderEmployees', e.target.value)}
                    />
                  </TooltipField>
                </div>
              </div>

              <TooltipField
                label="Total employees"
                tooltip="Automatically calculated total of all employees. This should match the total from B1 General Information."
              >
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    value={((parseFloat(formData.maleEmployees) || 0) + 
                            (parseFloat(formData.femaleEmployees) || 0) + 
                            (parseFloat(formData.otherGenderEmployees) || 0) +
                            (parseFloat(formData.notReportedGenderEmployees) || 0)).toString()}
                    readOnly
                    className="bg-muted"
                  />
                  {formData.numberOfEmployees && 
                   ((parseFloat(formData.maleEmployees) || 0) + 
                    (parseFloat(formData.femaleEmployees) || 0) + 
                    (parseFloat(formData.otherGenderEmployees) || 0) +
                    (parseFloat(formData.notReportedGenderEmployees) || 0)) !== parseFloat(formData.numberOfEmployees) && (
                    <Alert className="ml-2 flex-1">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Total number of employees mismatch from B1
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </TooltipField>
            </div>
          </Subsection>

          {/* B8 - Workforce General Characteristics - Country of employment */}
          <Subsection title="B8 – Workforce – General characteristics - Country of employment [If applicable]">
            <div className="space-y-4">
              <DynamicGrid
                columns={[
                  { key: 'country', label: 'Country of employment contract', type: 'select', 
                    options: countries, required: true },
                  { key: 'numberOfEmployees', label: 'Number of employees', type: 'text', required: true }
                ]}
                tooltip="Enter the countries where employees are employed and their numbers."
                onDataChange={(data) => updateFormData('employeesByCountry', data)}
              />

              <TooltipField
                label="Total employees (linked from B1)"
                tooltip="This should match the total from B1 General Information."
              >
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    value={formData.employeesByCountry?.reduce((sum, item) => sum + (parseFloat(item.numberOfEmployees) || 0), 0).toString() || '0'}
                    readOnly
                    className="bg-muted"
                  />
                  {formData.numberOfEmployees && formData.employeesByCountry &&
                   formData.employeesByCountry.reduce((sum, item) => sum + (parseFloat(item.numberOfEmployees) || 0), 0) !== parseFloat(formData.numberOfEmployees) && (
                    <Alert className="ml-2 flex-1">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Total number of employees mismatch from B1
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </TooltipField>
            </div>
          </Subsection>

          {/* B8 - Turnover rate */}
          <Subsection title="B8 – Workforce – General characteristics - Turnover rate [If applicable]">
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <TooltipField
                  label="Number of employees who left during the reporting period"
                  tooltip="Total number of employees who left the organization during the reporting period."
                >
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.employeesLeft || ''}
                    onChange={(e) => updateFormData('employeesLeft', e.target.value)}
                  />
                </TooltipField>

                <TooltipField
                  label="Number of employees at the beginning of the reporting period"
                  tooltip="Number of employees at the start of the reporting period."
                >
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.employeesBeginning || ''}
                    onChange={(e) => updateFormData('employeesBeginning', e.target.value)}
                  />
                </TooltipField>

                <TooltipField
                  label="Number of employees at the end of the reporting period"
                  tooltip="Number of employees at the end of the reporting period."
                >
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.employeesEnd || ''}
                    onChange={(e) => updateFormData('employeesEnd', e.target.value)}
                  />
                </TooltipField>
              </div>

              <TooltipField
                label="Employee turnover rate (%) in the reporting period"
                tooltip="Automatically calculated as (employees left / average employees) * 100."
              >
                <Input
                  type="number"
                  value={(() => {
                    const left = parseFloat(formData.employeesLeft) || 0;
                    const beginning = parseFloat(formData.employeesBeginning) || 0;
                    const end = parseFloat(formData.employeesEnd) || 0;
                    const average = (beginning + end) / 2;
                    return average > 0 ? ((left / average) * 100).toFixed(2) : '0';
                  })()}
                  readOnly
                  className="bg-muted"
                />
              </TooltipField>
            </div>
          </Subsection>

          {/* B9 - Workforce Health and Safety */}
          <Subsection title="B9 – Workforce – Health and safety [Always to be reported]">
            <div className="space-y-4">
              <TooltipField
                label="Number of recordable work-related accidents in the reporting period"
                tooltip="Total number of recordable work-related accidents during the reporting period."
              >
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.recordableAccidents || ''}
                  onChange={(e) => updateFormData('recordableAccidents', e.target.value)}
                />
              </TooltipField>

              <TooltipField
                label="Number of hours worked by one full-time employee in the reporting period"
                tooltip="Standard working hours for one full-time employee (typically 2000 hours per year)."
              >
                <Input
                  type="number"
                  placeholder="2000"
                  value={formData.workHoursPerEmployee || '2000'}
                  onChange={(e) => updateFormData('workHoursPerEmployee', e.target.value)}
                />
              </TooltipField>

               <TooltipField
                 label="Total number of hours worked in a year by all employees in the reporting period"
                 tooltip="Automatically calculated as total employees × hours per employee."
               >
                 <Input
                   type="number"
                   value={(() => {
                     const totalEmployees = parseFloat(formData.numberOfEmployees) || 0;
                     const hoursPerEmployee = parseFloat(formData.workHoursPerEmployee) || 2000;
                     return (totalEmployees * hoursPerEmployee).toString();
                   })()}
                   readOnly
                   className="bg-muted"
                 />
               </TooltipField>

               <TooltipField
                 label="Rate of recordable work-related accidents in the reporting period"
                 tooltip="Automatically calculated as (accidents / total hours worked) × 1,000,000."
               >
                 <Input
                   type="number"
                   value={(() => {
                     const accidents = parseFloat(formData.recordableAccidents) || 0;
                     const totalEmployees = parseFloat(formData.numberOfEmployees) || 0;
                     const hoursPerEmployee = parseFloat(formData.workHoursPerEmployee) || 2000;
                     const totalHours = totalEmployees * hoursPerEmployee;
                     return totalHours > 0 ? ((accidents / totalHours) * 1000000).toFixed(2) : '0';
                   })()}
                   readOnly
                   className="bg-muted"
                 />
               </TooltipField>

              <TooltipField
                label="Number of fatalities as a result of work-related injuries and work-related ill health"
                tooltip="Total number of fatalities resulting from work-related incidents."
              >
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.fatalitiesWorkRelated || ''}
                  onChange={(e) => updateFormData('fatalitiesWorkRelated', e.target.value)}
                />
              </TooltipField>
            </div>
          </Subsection>

          {/* B10 - Workforce Remuneration, collective bargaining and training */}
          <Subsection title="B10 – Workforce – Remuneration, collective bargaining and training [Always to be reported]">
            <div className="space-y-4">
              <TooltipField
                tooltip="Whether all employees receive pay equal to or above the applicable minimum wage."
              >
                <div className="flex items-center space-x-2">
                  <Switch
                    id="min-wage-compliance"
                    checked={formData.minWageCompliance || false}
                    onCheckedChange={(checked) => updateFormData('minWageCompliance', checked)}
                  />
                  <Label htmlFor="min-wage-compliance">
                    Employees receive pay that is equal or above applicable minimum wage determined directly by the national minimum wage law or through a collective bargaining agreement
                  </Label>
                </div>
              </TooltipField>

              <div className="grid grid-cols-2 gap-4">
                <TooltipField
                  label="Average gross hourly pay level of male employees (amount in currency)"
                  tooltip="Average hourly pay for male employees (if applicable)."
                >
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.maleHourlyPay || ''}
                    onChange={(e) => updateFormData('maleHourlyPay', e.target.value)}
                  />
                </TooltipField>

                <TooltipField
                  label="Average gross hourly pay level of female employees (amount in currency)"
                  tooltip="Average hourly pay for female employees (if applicable)."
                >
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.femaleHourlyPay || ''}
                    onChange={(e) => updateFormData('femaleHourlyPay', e.target.value)}
                  />
                </TooltipField>
              </div>

              <TooltipField
                label="Percentage gap in pay between the undertaking's female and male employees (%)"
                tooltip="Automatically calculated pay gap percentage."
              >
                <Input
                  type="number"
                  value={(() => {
                    const malePay = parseFloat(formData.maleHourlyPay) || 0;
                    const femalePay = parseFloat(formData.femaleHourlyPay) || 0;
                    return malePay > 0 ? (((malePay - femalePay) / malePay) * 100).toFixed(2) : '0';
                  })()}
                  readOnly
                  className="bg-muted"
                />
              </TooltipField>

              <TooltipField
                label="Number of employees covered by collective bargaining agreements"
                tooltip="Number of employees covered by collective bargaining agreements."
              >
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.collectiveBargainingEmployees || ''}
                  onChange={(e) => updateFormData('collectiveBargainingEmployees', e.target.value)}
                />
              </TooltipField>

               <TooltipField
                 label="Percentage of employees covered by collective bargaining agreements (%)"
                 tooltip="Automatically calculated percentage of employees covered by collective bargaining."
               >
                 <Input
                   type="number"
                   value={(() => {
                     const covered = parseFloat(formData.collectiveBargainingEmployees) || 0;
                     const totalEmployees = parseFloat(formData.numberOfEmployees) || 0;
                     return totalEmployees > 0 ? ((covered / totalEmployees) * 100).toFixed(2) : '0';
                   })()}
                   readOnly
                   className="bg-muted"
                 />
               </TooltipField>
            </div>
          </Subsection>

          {/* B10 - Training hours by gender */}
          <Subsection title="B10 – Workforce – Training hours by gender [Always to be reported]">
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <Label className="text-sm font-medium">Gender</Label>
                <Label className="text-sm font-medium">Number of annual training hours per employee during the reporting period</Label>
                <Label className="text-sm font-medium">Number of employees</Label>
                <Label className="text-sm font-medium">Total training hours</Label>

                <Label>Male</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.maleTrainingHours || ''}
                  onChange={(e) => updateFormData('maleTrainingHours', e.target.value)}
                />
                <Input
                  type="number"
                  value={formData.maleEmployees || '0'}
                  readOnly
                  className="bg-muted"
                />
                <Input
                  type="number"
                  value={((parseFloat(formData.maleTrainingHours) || 0) * (parseFloat(formData.maleEmployees) || 0)).toString()}
                  readOnly
                  className="bg-muted"
                />

                <Label>Female</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.femaleTrainingHours || ''}
                  onChange={(e) => updateFormData('femaleTrainingHours', e.target.value)}
                />
                <Input
                  type="number"
                  value={formData.femaleEmployees || '0'}
                  readOnly
                  className="bg-muted"
                />
                <Input
                  type="number"
                  value={((parseFloat(formData.femaleTrainingHours) || 0) * (parseFloat(formData.femaleEmployees) || 0)).toString()}
                  readOnly
                  className="bg-muted"
                />

                <Label>Other</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.otherTrainingHours || ''}
                  onChange={(e) => updateFormData('otherTrainingHours', e.target.value)}
                />
                <Input
                  type="number"
                  value={formData.otherGenderEmployees || '0'}
                  readOnly
                  className="bg-muted"
                />
                <Input
                  type="number"
                  value={((parseFloat(formData.otherTrainingHours) || 0) * (parseFloat(formData.otherGenderEmployees) || 0)).toString()}
                  readOnly
                  className="bg-muted"
                />

                <Label>Not reported</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.notReportedTrainingHours || ''}
                  onChange={(e) => updateFormData('notReportedTrainingHours', e.target.value)}
                />
                <Input
                  type="number"
                  value="0"
                  readOnly
                  className="bg-muted"
                />
                <Input
                  type="number"
                  value="0"
                  readOnly
                  className="bg-muted"
                />
              </div>

              <TooltipField
                label="Average number of annual training hours per employee"
                tooltip="Automatically calculated average training hours across all employees."
              >
                <Input
                  type="number"
                  value={(() => {
                    const totalTrainingHours = 
                      ((parseFloat(formData.maleTrainingHours) || 0) * (parseFloat(formData.maleEmployees) || 0)) +
                      ((parseFloat(formData.femaleTrainingHours) || 0) * (parseFloat(formData.femaleEmployees) || 0)) +
                      ((parseFloat(formData.otherTrainingHours) || 0) * (parseFloat(formData.otherGenderEmployees) || 0));
                    const totalEmployees = parseFloat(formData.numberOfEmployees) || 0;
                    return totalEmployees > 0 ? (totalTrainingHours / totalEmployees).toFixed(2) : '0';
                  })()}
                  readOnly
                  className="bg-muted"
                />
              </TooltipField>
            </div>
          </Subsection>

          {/* C5 - Additional workforce characteristics */}
          <Subsection title="C5 – Additional (general) workforce characteristics [Optional]">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <TooltipField
                  label="Number of male employees at management level"
                  tooltip="Number of male employees in management positions."
                >
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.maleManagementEmployees || ''}
                    onChange={(e) => updateFormData('maleManagementEmployees', e.target.value)}
                  />
                </TooltipField>

                <TooltipField
                  label="Number of female employees at management level"
                  tooltip="Number of female employees in management positions."
                >
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.femaleManagementEmployees || ''}
                    onChange={(e) => updateFormData('femaleManagementEmployees', e.target.value)}
                  />
                </TooltipField>
              </div>

              <TooltipField
                label="Female-to-male ratio at management level for the reporting period"
                tooltip="Automatically calculated ratio of female to male managers."
              >
                <Input
                  type="number"
                  value={(() => {
                    const female = parseFloat(formData.femaleManagementEmployees) || 0;
                    const male = parseFloat(formData.maleManagementEmployees) || 0;
                    return male > 0 ? (female / male).toFixed(2) : '0';
                  })()}
                  readOnly
                  className="bg-muted"
                />
              </TooltipField>

              <div className="grid grid-cols-2 gap-4">
                <TooltipField
                  label="Total self-employed workers without personnel that are working exclusively for the undertaking"
                  tooltip="Number of self-employed workers working exclusively for the organization."
                >
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.selfEmployedWorkers || ''}
                    onChange={(e) => updateFormData('selfEmployedWorkers', e.target.value)}
                  />
                </TooltipField>

                <TooltipField
                  label="Total temporary workers provided by undertakings primarily engaged in employment activities"
                  tooltip="Number of temporary workers provided by employment agencies."
                >
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.temporaryAgencyWorkers || ''}
                    onChange={(e) => updateFormData('temporaryAgencyWorkers', e.target.value)}
                  />
                </TooltipField>
              </div>
            </div>
          </Subsection>

          {/* C6 - Human rights policies and processes */}
          <Subsection title="C6 – Additional own workforce information - Human rights policies and processes [Always to be reported]">
            <div className="space-y-4">
              <TooltipField
                tooltip="Whether the organization has a code of conduct or human rights policy for its workforce."
              >
                <div className="flex items-center space-x-2">
                  <Switch
                    id="has-hr-policy"
                    checked={formData.hasHumanRightsPolicy || false}
                    onCheckedChange={(checked) => updateFormData('hasHumanRightsPolicy', checked)}
                  />
                  <Label htmlFor="has-hr-policy">
                    Does the undertaking have a code of conduct or human rights policy for its own workforce?
                  </Label>
                </div>
              </TooltipField>

              <div className="space-y-2">
                <Label className="text-sm font-medium">If yes, does this cover:</Label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { key: 'childLabour', label: 'Child labour' },
                    { key: 'forcedLabour', label: 'Forced labour' },
                    { key: 'humanTrafficking', label: 'Human trafficking' },
                    { key: 'discrimination', label: 'Discrimination' },
                    { key: 'accidentPrevention', label: 'Accident prevention' },
                    { key: 'otherHrContent', label: 'Other (specify below)' }
                  ].map((item) => (
                    <div key={item.key} className="flex items-center space-x-2">
                      <Switch
                        id={item.key}
                        checked={formData[item.key] || false}
                        onCheckedChange={(checked) => updateFormData(item.key, checked)}
                      />
                      <Label htmlFor={item.key}>{item.label}</Label>
                    </div>
                  ))}
                </div>

                <TooltipField
                  label="Specify other types of content covered by the code of conduct or human rights policy"
                  tooltip="Specify any other types of content covered by the policy."
                >
                  <Textarea
                    placeholder="Specify other content..."
                    value={formData.otherHrContentSpecification || ''}
                    onChange={(e) => updateFormData('otherHrContentSpecification', e.target.value)}
                  />
                </TooltipField>
              </div>

              <TooltipField
                tooltip="Whether the organization has a complaint-handling mechanism for its workforce."
              >
                <div className="flex items-center space-x-2">
                  <Switch
                    id="has-complaint-mechanism"
                    checked={formData.hasComplaintMechanism || false}
                    onCheckedChange={(checked) => updateFormData('hasComplaintMechanism', checked)}
                  />
                  <Label htmlFor="has-complaint-mechanism">
                    Does the undertaking have a complaint-handling mechanism for its own workforce?
                  </Label>
                </div>
              </TooltipField>
            </div>
          </Subsection>

          {/* C7 - Severe negative human rights incidents */}
          <Subsection title="C7 – Severe negative human rights incidents [Always to be reported]">
            <div className="space-y-4">
              <TooltipField
                tooltip="Whether the organization has confirmed incidents in its own workforce."
              >
                <div className="flex items-center space-x-2">
                  <Switch
                    id="has-hr-incidents"
                    checked={formData.hasHumanRightsIncidents || false}
                    onCheckedChange={(checked) => updateFormData('hasHumanRightsIncidents', checked)}
                  />
                  <Label htmlFor="has-hr-incidents">
                    Does the undertaking have confirmed incidents in its own workforce?
                  </Label>
                </div>
              </TooltipField>

              <div className="space-y-2">
                <Label className="text-sm font-medium">If yes, are incidents related to:</Label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { key: 'incidentChildLabour', label: 'Child labour' },
                    { key: 'incidentForcedLabour', label: 'Forced labour' },
                    { key: 'incidentHumanTrafficking', label: 'Human trafficking' },
                    { key: 'incidentDiscrimination', label: 'Discrimination' },
                    { key: 'incidentOther', label: 'Other (specify below)' }
                  ].map((item) => (
                    <div key={item.key} className="flex items-center space-x-2">
                      <Switch
                        id={item.key}
                        checked={formData[item.key] || false}
                        onCheckedChange={(checked) => updateFormData(item.key, checked)}
                      />
                      <Label htmlFor={item.key}>{item.label}</Label>
                    </div>
                  ))}
                </div>

                <TooltipField
                  label="Specify other human rights related to the confirmed incidents"
                  tooltip="Specify any other human rights issues related to confirmed incidents."
                >
                  <Textarea
                    placeholder="Specify other incidents..."
                    value={formData.otherHrIncidents || ''}
                    onChange={(e) => updateFormData('otherHrIncidents', e.target.value)}
                  />
                </TooltipField>

                <TooltipField
                  label="Description of actions taken to address the confirmed incidents (Optional)"
                  tooltip="Describe actions taken to address the confirmed incidents."
                >
                  <Textarea
                    placeholder="Describe actions taken..."
                    value={formData.hrIncidentActions || ''}
                    onChange={(e) => updateFormData('hrIncidentActions', e.target.value)}
                  />
                </TooltipField>
              </div>

              <TooltipField
                tooltip="Whether the organization is aware of confirmed incidents involving workers in the value chain, affected communities, consumers and end-users."
              >
                <div className="flex items-center space-x-2">
                  <Switch
                    id="aware-external-incidents"
                    checked={formData.awareExternalIncidents || false}
                    onCheckedChange={(checked) => updateFormData('awareExternalIncidents', checked)}
                  />
                  <Label htmlFor="aware-external-incidents">
                    Is the undertaking aware of any confirmed incidents involving workers in the value chain, affected communities, consumers and end-users?
                  </Label>
                </div>
              </TooltipField>

              <TooltipField
                label="Specification of any confirmed incident involving workers in the value chain, affected communities, consumers and end-users"
                tooltip="Specify any confirmed incidents involving external stakeholders."
              >
                <Textarea
                  placeholder="Specify confirmed incidents..."
                  value={formData.externalIncidentsSpecification || ''}
                  onChange={(e) => updateFormData('externalIncidentsSpecification', e.target.value)}
                />
              </TooltipField>
            </div>
          </Subsection>

          {/* Additional Social Disclosures */}
          <Subsection title="Disclosure of any other social and/or entity specific social disclosures [Optional]">
            <TooltipField
              label="Additional social disclosures"
              tooltip="Any other social or entity-specific social disclosures not covered above."
            >
              <Textarea
                placeholder="Enter any additional social disclosures..."
                value={formData.additionalSocialDisclosures || ''}
                onChange={(e) => updateFormData('additionalSocialDisclosures', e.target.value)}
                rows={4}
              />
            </TooltipField>
          </Subsection>

        </FormSection>
          </TabsContent>

          {/* Section 4: Governance Disclosures */}
          <TabsContent value="section4" className="space-y-6">
            <FormSection title="Section 4: Governance Disclosures">
          
          {/* B11 – Convictions and fines for corruption and bribery */}
          <Subsection title="B11 – Convictions and fines for corruption and bribery [If applicable]">
            <div className="space-y-4">
              <TooltipField
                tooltip="Indicate whether the undertaking has incurred any convictions or fines related to corruption and bribery during the reporting period."
              >
                <div className="flex items-center space-x-2">
                  <Switch
                    id="has-convictions-fines"
                    checked={formData.hasConvictionsFines || false}
                    onCheckedChange={(checked) => updateFormData('hasConvictionsFines', checked)}
                  />
                  <Label htmlFor="has-convictions-fines">
                    Has the undertaking incurred convictions and fines in the reporting period?
                  </Label>
                </div>
              </TooltipField>

              {formData.hasConvictionsFines && (
                <>
                  <TooltipField
                    label="Total number of convictions for the violation of anti-corruption and anti-bribery laws"
                    tooltip="Total count of legal convictions for anti-corruption and anti-bribery law violations during the reporting period."
                    required
                  >
                    <Input
                      type="number"
                      min="0"
                      placeholder="Enter total number of convictions"
                      value={formData.totalConvictions || ''}
                      onChange={(e) => updateFormData('totalConvictions', e.target.value)}
                    />
                  </TooltipField>

                  <TooltipField
                    label="Total amount of fines for the violation of anti-corruption and anti-bribery laws (monetary amount)"
                    tooltip="Total monetary amount of fines imposed for anti-corruption and anti-bribery law violations during the reporting period."
                    required
                  >
                    <div className="flex gap-2">
                      <Select
                        value={formData.finesCurrency || ''}
                        onValueChange={(value) => updateFormData('finesCurrency', value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Currency" />
                        </SelectTrigger>
                        <SelectContent>
                          {currencies.map((currency) => (
                            <SelectItem key={currency} value={currency.split(' - ')[0]}>
                              {currency}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Enter total amount of fines"
                        value={formData.totalFinesAmount || ''}
                        onChange={(e) => updateFormData('totalFinesAmount', e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </TooltipField>
                </>
              )}
            </div>
          </Subsection>

          {/* C8 – Revenues from certain sectors */}
          <Subsection title="C8 – Revenues from certain sectors [If applicable]">
            <div className="space-y-4">
              <TooltipField
                tooltip="Indicate whether the undertaking derives revenues from any of the specified controversial sectors."
              >
                <div className="flex items-center space-x-2">
                  <Switch
                    id="derives-controversial-revenues"
                    checked={formData.derivesControversialRevenues || false}
                    onCheckedChange={(checked) => updateFormData('derivesControversialRevenues', checked)}
                  />
                  <Label htmlFor="derives-controversial-revenues">
                    Is the undertaking deriving revenues from one of the activities listed below?
                  </Label>
                </div>
              </TooltipField>

              {formData.derivesControversialRevenues && (
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-4">
                    <div className="mb-4">
                      <p className="text-sm font-medium text-muted-foreground">Monetary amount in EUR</p>
                    </div>

                    <TooltipField
                      label="Revenue derived from controversial weapons (anti-personnel mines, cluster munitions, chemical weapons and biological weapons)"
                      tooltip="Revenue generated from the production, trading or financing of controversial weapons."
                    >
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Enter revenue amount"
                        value={formData.revenueControversialWeapons || ''}
                        onChange={(e) => updateFormData('revenueControversialWeapons', e.target.value)}
                      />
                    </TooltipField>

                    <TooltipField
                      label="Revenue derived from cultivation and production of tobacco"
                      tooltip="Revenue generated from tobacco cultivation, production, processing or trading."
                    >
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Enter revenue amount"
                        value={formData.revenueTobacco || ''}
                        onChange={(e) => updateFormData('revenueTobacco', e.target.value)}
                      />
                    </TooltipField>

                    <TooltipField
                      label="Revenue derived from coal"
                      tooltip="Revenue generated from coal exploration, mining, extraction, production, processing, storage, refining or distribution."
                    >
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Enter revenue amount"
                        value={formData.revenueCoal || ''}
                        onChange={(e) => {
                          updateFormData('revenueCoal', e.target.value);
                          // Calculate total fossil fuel revenues
                          const coal = parseFloat(e.target.value) || 0;
                          const oil = parseFloat(formData.revenueOil) || 0;
                          const gas = parseFloat(formData.revenueGas) || 0;
                          updateFormData('totalFossilFuelRevenues', (coal + oil + gas).toString());
                        }}
                      />
                    </TooltipField>

                    <TooltipField
                      label="Revenue derived from oil"
                      tooltip="Revenue generated from oil exploration, mining, extraction, production, processing, storage, refining or distribution."
                    >
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Enter revenue amount"
                        value={formData.revenueOil || ''}
                        onChange={(e) => {
                          updateFormData('revenueOil', e.target.value);
                          // Calculate total fossil fuel revenues
                          const coal = parseFloat(formData.revenueCoal) || 0;
                          const oil = parseFloat(e.target.value) || 0;
                          const gas = parseFloat(formData.revenueGas) || 0;
                          updateFormData('totalFossilFuelRevenues', (coal + oil + gas).toString());
                        }}
                      />
                    </TooltipField>

                    <TooltipField
                      label="Revenue derived from gas"
                      tooltip="Revenue generated from gas exploration, mining, extraction, production, processing, storage, refining or distribution."
                    >
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Enter revenue amount"
                        value={formData.revenueGas || ''}
                        onChange={(e) => {
                          updateFormData('revenueGas', e.target.value);
                          // Calculate total fossil fuel revenues
                          const coal = parseFloat(formData.revenueCoal) || 0;
                          const oil = parseFloat(formData.revenueOil) || 0;
                          const gas = parseFloat(e.target.value) || 0;
                          updateFormData('totalFossilFuelRevenues', (coal + oil + gas).toString());
                        }}
                      />
                    </TooltipField>

                    <TooltipField
                      label="Total revenues derived from fossil fuel (coal, oil and gas) sector"
                      tooltip="Calculated total revenue derived from fossil fuel sectors as defined in Article 2, point (62), of Regulation (EU) 2018/1999. This field is automatically calculated from the coal, oil and gas revenues above."
                    >
                      <Input
                        type="number"
                        placeholder="Automatically calculated"
                        value={formData.totalFossilFuelRevenues || '0'}
                        readOnly
                        className="bg-muted"
                      />
                    </TooltipField>

                    <TooltipField
                      label="Revenue derived from chemicals production"
                      tooltip="Revenue generated from chemical production activities."
                    >
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Enter revenue amount"
                        value={formData.revenueChemicals || ''}
                        onChange={(e) => updateFormData('revenueChemicals', e.target.value)}
                      />
                    </TooltipField>
                  </div>
                </div>
              )}
            </div>
          </Subsection>

          {/* C8 – Exclusion from EU reference benchmarks */}
          <Subsection title="C8 – Exclusion from EU reference benchmarks [Always to be reported]">
            <div className="space-y-4">
              <div className="mb-4">
                <p className="text-sm font-medium mb-3">
                  Undertakings are excluded from the EU Paris-aligned Benchmarks if they derive:
                </p>
              </div>

              <TooltipField
                tooltip="Indicate if the undertaking derives 1% or more of revenues from exploration, mining, extraction, distribution or refining of hard coal and lignite."
              >
                <div className="flex items-center space-x-2">
                  <Switch
                    id="coal-lignite-threshold"
                    checked={formData.coalLigniteThreshold || false}
                    onCheckedChange={(checked) => updateFormData('coalLigniteThreshold', checked)}
                  />
                  <Label htmlFor="coal-lignite-threshold">
                    1% or more of their revenues from exploration, mining, extraction, distribution or refining of hard coal and lignite
                  </Label>
                </div>
              </TooltipField>

              <TooltipField
                tooltip="Indicate if the undertaking derives 10% or more of revenues from exploration, extraction, distribution or refining of oil fuels."
              >
                <div className="flex items-center space-x-2">
                  <Switch
                    id="oil-fuels-threshold"
                    checked={formData.oilFuelsThreshold || false}
                    onCheckedChange={(checked) => updateFormData('oilFuelsThreshold', checked)}
                  />
                  <Label htmlFor="oil-fuels-threshold">
                    10% or more of their revenues from the exploration, extraction, distribution or refining of oil fuels
                  </Label>
                </div>
              </TooltipField>

              <TooltipField
                tooltip="Indicate if the undertaking derives 50% or more of revenues from exploration, extraction, manufacturing or distribution of gaseous fuels."
              >
                <div className="flex items-center space-x-2">
                  <Switch
                    id="gaseous-fuels-threshold"
                    checked={formData.gaseousFuelsThreshold || false}
                    onCheckedChange={(checked) => updateFormData('gaseousFuelsThreshold', checked)}
                  />
                  <Label htmlFor="gaseous-fuels-threshold">
                    50% or more of their revenues from the exploration, extraction, manufacturing or distribution of gaseous fuels
                  </Label>
                </div>
              </TooltipField>

              <TooltipField
                tooltip="Indicate if the undertaking derives 50% or more of revenues from electricity generation with GHG intensity of more than 100g CO2 e/kWh."
              >
                <div className="flex items-center space-x-2">
                  <Switch
                    id="electricity-generation-threshold"
                    checked={formData.electricityGenerationThreshold || false}
                    onCheckedChange={(checked) => updateFormData('electricityGenerationThreshold', checked)}
                  />
                  <Label htmlFor="electricity-generation-threshold">
                    50% or more of their revenues from electricity generation with a GHG intensity of more than 100g CO2 e/kWh
                  </Label>
                </div>
              </TooltipField>

              <TooltipField
                tooltip="Select this if none of the above exclusion criteria apply to the undertaking."
              >
                <div className="flex items-center space-x-2">
                  <Switch
                    id="none-of-above"
                    checked={formData.noneOfAbove || false}
                    onCheckedChange={(checked) => updateFormData('noneOfAbove', checked)}
                  />
                  <Label htmlFor="none-of-above">
                    None of the above
                  </Label>
                </div>
              </TooltipField>

              <TooltipField
                label="Excluded from EU Paris-aligned Benchmarks"
                tooltip="Automatically calculated based on the selections above. Shows 'Yes' if any of the threshold criteria are met, 'No' if none apply."
              >
                <Input
                  type="text"
                  value={(() => {
                    if (formData.noneOfAbove) return 'No';
                    if (formData.coalLigniteThreshold || formData.oilFuelsThreshold || 
                        formData.gaseousFuelsThreshold || formData.electricityGenerationThreshold) {
                      return 'Yes';
                    }
                    return '';
                  })()}
                  readOnly
                  className="bg-muted"
                />
              </TooltipField>
            </div>
          </Subsection>

          {/* C9 – Gender diversity ratio in the governance body */}
          <Subsection title="C9 – Gender diversity ratio in the governance body [If applicable]">
            <div className="space-y-4">
              <TooltipField
                tooltip="Indicate whether the undertaking has established a governance body (e.g., board of directors, supervisory board)."
              >
                <div className="flex items-center space-x-2">
                  <Switch
                    id="has-governance-body"
                    checked={formData.hasGovernanceBody || false}
                    onCheckedChange={(checked) => updateFormData('hasGovernanceBody', checked)}
                  />
                  <Label htmlFor="has-governance-body">
                    Does the undertaking have a governance body in place?
                  </Label>
                </div>
              </TooltipField>

              {formData.hasGovernanceBody && (
                <>
                  <TooltipField
                    label="Number of female board members at the end of the reporting period"
                    tooltip="Total number of female members in the governance body at the end of the reporting period."
                    required
                  >
                    <Input
                      type="number"
                      min="0"
                      placeholder="Enter number of female board members"
                      value={formData.femaleBoardMembers || ''}
                      onChange={(e) => {
                        updateFormData('femaleBoardMembers', e.target.value);
                        // Calculate gender diversity ratio
                        const female = parseFloat(e.target.value) || 0;
                        const male = parseFloat(formData.maleBoardMembers) || 0;
                        const total = female + male;
                        if (total > 0) {
                          const ratio = ((female / total) * 100).toFixed(1);
                          updateFormData('genderDiversityRatio', `${ratio}%`);
                        } else {
                          updateFormData('genderDiversityRatio', '');
                        }
                      }}
                    />
                  </TooltipField>

                  <TooltipField
                    label="Number of male board members at the end of the reporting period"
                    tooltip="Total number of male members in the governance body at the end of the reporting period."
                    required
                  >
                    <Input
                      type="number"
                      min="0"
                      placeholder="Enter number of male board members"
                      value={formData.maleBoardMembers || ''}
                      onChange={(e) => {
                        updateFormData('maleBoardMembers', e.target.value);
                        // Calculate gender diversity ratio
                        const female = parseFloat(formData.femaleBoardMembers) || 0;
                        const male = parseFloat(e.target.value) || 0;
                        const total = female + male;
                        if (total > 0) {
                          const ratio = ((female / total) * 100).toFixed(1);
                          updateFormData('genderDiversityRatio', `${ratio}%`);
                        } else {
                          updateFormData('genderDiversityRatio', '');
                        }
                      }}
                    />
                  </TooltipField>

                  <TooltipField
                    label="Gender diversity ratio in governance body"
                    tooltip="Calculated percentage of female representation in the governance body. This field is automatically calculated based on the female and male board member counts above."
                  >
                    <Input
                      placeholder="Automatically calculated"
                      value={formData.genderDiversityRatio || ''}
                      readOnly
                      className="bg-muted"
                    />
                  </TooltipField>
                </>
              )}
            </div>
          </Subsection>

          {/* Additional Governance Disclosures */}
          <Subsection title="Disclosure of any other governance and/or entity specific governance disclosures [Optional]">
            <TooltipField
              label="Additional governance disclosures"
              tooltip="Any other governance-related or entity-specific governance disclosures not covered in the sections above."
            >
              <Textarea
                placeholder="Enter any additional governance disclosures..."
                value={formData.additionalGovernanceDisclosures || ''}
                onChange={(e) => updateFormData('additionalGovernanceDisclosures', e.target.value)}
                rows={4}
              />
            </TooltipField>
          </Subsection>

        </FormSection>
          </TabsContent>

          {/* Converter Tools Tab */}
          <TabsContent value="converters" className="space-y-6">
            <FormSection title="Converter Tools" subtitle="Access helpful conversion tools to support your reporting.">
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/fuel-converter')}
                  className="w-full sm:w-auto min-w-[200px]"
                >
                  <span className="mr-2">🔥</span>
                  Fuel Converter
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/unit-converter')}
                  className="w-full sm:w-auto min-w-[200px]"
                >
                  <span className="mr-2">📏</span>
                  Unit of Measurement Converter
                </Button>
              </div>
            </FormSection>

            {/* Export Section within Converters Tab */}
            <FormSection title="Export Options" subtitle="Export your completed report in various formats.">
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleExportXBRL}
                  className="w-full sm:w-auto min-w-[200px]"
                >
                  <FileCode className="mr-2 h-5 w-5" />
                  Export as XBRL
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto min-w-[200px]"
                >
                  <span className="mr-2">📄</span>
                  Export as PDF
                </Button>
              </div>
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  <strong>XBRL Export:</strong> Generate a machine-readable XBRL file that complies with EFRAG VSME taxonomy for digital sustainability reporting.
                </p>
              </div>
            </FormSection>
          </TabsContent>
        </Tabs>

        {/* Save/Continue Section */}
        <div className="flex justify-between items-center py-6 border-t border-form-border">
          <div className="text-sm text-muted-foreground">
            Progress: Sections 1-4 completed
          </div>
          <div className="flex gap-3">
            <Button variant="outline">Save as Draft</Button>
            <Button className="bg-vsme-primary hover:bg-vsme-primary/90">
              Generate Report
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}