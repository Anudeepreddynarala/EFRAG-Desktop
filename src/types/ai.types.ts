// AI Assistant Types for ChatGPT API Integration

export interface OpenAIConfig {
  apiKey: string;
  model: GPTModel;
  maxTokens: number;
  temperature: number;
}

export enum GPTModel {
  GPT4_TURBO = 'gpt-4-turbo-preview',
  GPT4O = 'gpt-4o',
  GPT35_TURBO = 'gpt-3.5-turbo'
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  path: string;
  content?: string; // Extracted text content
}

export interface DocumentInput {
  files: UploadedFile[];
  instructions?: string; // Additional context from user
}

export interface ExtractedField {
  fieldName: string;
  value: string | number | boolean | null;
  found: boolean;
  source: string; // Filename and location where data was found
  quote: string; // Exact quote from source document
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  notes?: string; // Additional context or warnings
}

export interface AIAnalysisResult {
  fieldsSuccessfullyFilled: ExtractedField[];
  fieldsNotFound: string[];
  fieldsRequiringVerification: ExtractedField[];
  sourceSummary: {
    filename: string;
    fieldsExtracted: number;
    usefulness: 'high' | 'medium' | 'low';
  }[];
  totalTokensUsed: number;
  estimatedCost: number;
  processingTime: number;
}

export interface FieldReview {
  field: ExtractedField;
  userAction: 'accept' | 'reject' | 'modify';
  modifiedValue?: string | number | boolean;
}

export interface VSMEFormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'boolean' | 'textarea';
  description: string;
  section: string;
  required: boolean;
  options?: string[]; // For select/multiselect fields
  unit?: string; // For numeric fields (e.g., "MWh", "tonnes CO2e")
}

export interface GPTPromptContext {
  formSchema: VSMEFormField[];
  documents: {
    filename: string;
    content: string;
  }[];
  userInstructions?: string;
  efragStandard: string; // EFRAG VSME standard reference
}

export interface APIKeyStorage {
  encryptedKey: string;
  createdAt: Date;
  lastUsed: Date;
}

export interface AIProcessingStatus {
  stage: 'uploading' | 'processing' | 'extracting' | 'complete' | 'error';
  progress: number; // 0-100
  message: string;
  error?: string;
}

// Model information for user selection
export const GPT_MODEL_INFO = {
  [GPTModel.GPT4_TURBO]: {
    name: 'GPT-4 Turbo',
    description: 'Best for complex document analysis. 128K context window.',
    inputCostPer1M: 10,
    outputCostPer1M: 30,
    contextWindow: 128000
  },
  [GPTModel.GPT4O]: {
    name: 'GPT-4o',
    description: 'Faster and cheaper. Excellent for structured data extraction.',
    inputCostPer1M: 5,
    outputCostPer1M: 15,
    contextWindow: 128000
  },
  [GPTModel.GPT35_TURBO]: {
    name: 'GPT-3.5 Turbo',
    description: 'Lower cost option for simpler documents.',
    inputCostPer1M: 0.5,
    outputCostPer1M: 1.5,
    contextWindow: 16000
  }
};

// EFRAG VSME Standard - Core fields for AI extraction
export const VSME_CORE_FIELDS: VSMEFormField[] = [
  // Section 1: General Information
  { name: 'entityName', label: 'Name of the reporting entity', type: 'text', description: 'The full legal name of the entity preparing this sustainability report', section: 'general', required: true },
  { name: 'identifierType', label: 'Identifier type', type: 'select', description: 'Type of unique identifier (LEI, EU ID, DUNS, Perm ID)', section: 'general', required: true, options: ['LEI', 'EU ID', 'DUNS', 'Perm ID'] },
  { name: 'identifierValue', label: 'Identifier value', type: 'text', description: 'The unique identifier value', section: 'general', required: true },
  { name: 'currency', label: 'Currency', type: 'select', description: 'Currency for all monetary values', section: 'general', required: true },
  { name: 'legalForm', label: 'Legal form', type: 'select', description: 'Legal structure of the entity', section: 'general', required: true },
  { name: 'headOfficeCountry', label: 'Head office country', type: 'select', description: 'Country where head office is located', section: 'general', required: true },
  { name: 'employeeCount', label: 'Number of employees', type: 'number', description: 'Total number of employees', section: 'general', required: true },
  { name: 'turnover', label: 'Turnover', type: 'number', description: 'Annual turnover/revenue', section: 'general', required: true },
  { name: 'balanceSheetSize', label: 'Balance sheet size', type: 'number', description: 'Total balance sheet size', section: 'general', required: true },

  // Section 2: Environmental - Energy & Emissions
  { name: 'electricityRenewable', label: 'Renewable electricity consumption', type: 'number', description: 'Consumption from renewable sources', section: 'environmental', required: false, unit: 'MWh' },
  { name: 'electricityNonRenewable', label: 'Non-renewable electricity consumption', type: 'number', description: 'Consumption from non-renewable sources', section: 'environmental', required: false, unit: 'MWh' },
  { name: 'fuelsRenewable', label: 'Renewable fuels consumption', type: 'number', description: 'Consumption from renewable fuels', section: 'environmental', required: false, unit: 'MWh' },
  { name: 'fuelsNonRenewable', label: 'Non-renewable fuels consumption', type: 'number', description: 'Consumption from non-renewable fuels', section: 'environmental', required: false, unit: 'MWh' },
  { name: 'currentScope1', label: 'Scope 1 GHG emissions', type: 'number', description: 'Direct GHG emissions', section: 'environmental', required: false, unit: 'tonnes CO2e' },
  { name: 'currentScope2Location', label: 'Scope 2 GHG emissions (location-based)', type: 'number', description: 'Indirect emissions from electricity (location-based)', section: 'environmental', required: false, unit: 'tonnes CO2e' },
  { name: 'currentScope2Market', label: 'Scope 2 GHG emissions (market-based)', type: 'number', description: 'Indirect emissions from electricity (market-based)', section: 'environmental', required: false, unit: 'tonnes CO2e' },
  { name: 'currentScope3Emissions', label: 'Scope 3 GHG emissions', type: 'number', description: 'Other indirect emissions', section: 'environmental', required: false, unit: 'tonnes CO2e' },

  // Environmental - Water & Waste
  { name: 'waterConsumption', label: 'Water consumption', type: 'number', description: 'Total water consumption', section: 'environmental', required: false, unit: 'm³' },
  { name: 'hazardousWaste', label: 'Hazardous waste', type: 'number', description: 'Hazardous waste generated', section: 'environmental', required: false, unit: 'tonnes' },
  { name: 'nonHazardousWaste', label: 'Non-hazardous waste', type: 'number', description: 'Non-hazardous waste generated', section: 'environmental', required: false, unit: 'tonnes' },

  // Section 3: Social - Workforce
  { name: 'femaleEmployees', label: 'Female employees', type: 'number', description: 'Number of female employees', section: 'social', required: false },
  { name: 'maleEmployees', label: 'Male employees', type: 'number', description: 'Number of male employees', section: 'social', required: false },
  { name: 'temporaryEmployees', label: 'Temporary employees', type: 'number', description: 'Number of temporary employees', section: 'social', required: false },
  { name: 'permanentEmployees', label: 'Permanent employees', type: 'number', description: 'Number of permanent employees', section: 'social', required: false },
  { name: 'fatalitiesWorkRelated', label: 'Work-related fatalities', type: 'number', description: 'Number of work-related fatalities', section: 'social', required: false },
  { name: 'recordableWorkInjuries', label: 'Recordable work-related injuries', type: 'number', description: 'Number of recordable work-related injuries', section: 'social', required: false },
  { name: 'averageTrainingHours', label: 'Average training hours', type: 'number', description: 'Average training hours per employee', section: 'social', required: false, unit: 'hours' },

  // Section 4: Governance
  { name: 'femaleBoardMembers', label: 'Female board members', type: 'number', description: 'Number of female board members', section: 'governance', required: false },
  { name: 'totalBoardMembers', label: 'Total board members', type: 'number', description: 'Total number of board members', section: 'governance', required: false },
  { name: 'corruptionConvictions', label: 'Corruption convictions', type: 'number', description: 'Number of corruption-related convictions', section: 'governance', required: false },
  { name: 'briberyConvictions', label: 'Bribery convictions', type: 'number', description: 'Number of bribery-related convictions', section: 'governance', required: false }
];

// System prompt for GPT
export const EFRAG_VSME_SYSTEM_PROMPT = `You are a data extraction assistant for EFRAG VSME (Voluntary Standard for Medium-sized Entities) sustainability reporting.

CRITICAL RULES:
1. Extract ONLY facts explicitly stated in the documents
2. NEVER infer, calculate, or estimate values
3. If data is not found, respond with "NOT_FOUND"
4. Always cite exact source: filename, page/section, and quote
5. Mark confidence: HIGH (exact match), MEDIUM (needs verification), LOW (uncertain)

EXTRACTION GUIDELINES:
- For numeric values: Extract exact numbers with units
- For dates: Use ISO format (YYYY-MM-DD)
- For text: Use exact wording from source
- For selections: Match to provided options exactly
- If multiple values found for same field: Flag for review
- If value format doesn't match expected type: Flag for review

RESPONSE FORMAT:
Return a JSON array of extracted fields. For each field:
{
  "fieldName": "string",
  "value": "exact value" | null,
  "found": true | false,
  "source": "filename, page/section",
  "quote": "exact quote from document",
  "confidence": "HIGH" | "MEDIUM" | "LOW",
  "notes": "any warnings or additional context"
}

SUSTAINABILITY REPORTING CONTEXT:
- Scope 1 emissions: Direct GHG emissions from owned/controlled sources
- Scope 2 emissions: Indirect GHG emissions from purchased electricity/heat/steam
- Scope 3 emissions: All other indirect emissions in value chain
- GHG emissions measured in tonnes CO2e (carbon dioxide equivalent)
- Energy consumption measured in MWh (megawatt hours)
- Water consumption measured in m³ (cubic meters)`;
