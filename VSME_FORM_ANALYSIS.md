# VSME Form Analysis - Complete Field Extraction

## Overview
This document provides a complete analysis of the VSME (Voluntary Sustainability Reporting Standard for Medium-sized Entities) digital template form located at `/Users/anudeepnarala/Projects/EFRAG-app/src/components/VSMEForm.tsx`.

## Form Structure

The form is organized into 5 main tabs:
1. **Section 1: General Information** (General Info)
2. **Section 2: Environmental Disclosures** (Environmental)
3. **Section 3: Social Disclosures** (Social)
4. **Section 4: Governance Disclosures** (Governance)
5. **Converters** (Utility tools - not data collection)

## Total Field Count

### Section 1: General Information (~50 fields)
- XBRL Information (6 fields)
- Previous Reporting Period (3 fields)
- Basis for Preparation (11 fields)
- Subsidiaries (dynamic list - if consolidated)
- Sustainability Certifications (2 fields)
- Sites (dynamic list)
- Sustainability Practices (2 fields)
- Cooperative Disclosures (3 fields)
- Practices Descriptions (dynamic list)
- Strategy (5 fields)
- Additional Disclosures (1 field)

### Section 2: Environmental (~60 fields)
- Energy Consumption (7 fields)
- GHG Emissions Current Period (4 direct fields + Scope 3 dynamic list)
- GHG Reduction Targets (15 fields + Scope 3 targets dynamic list)
- Transition Plan (4 fields)
- Pollution (5 fields + pollutants dynamic list)
- Water (4 fields)
- Biodiversity (9 fields + sites dynamic list)
- Circular Economy (2 fields)
- Waste (1 dynamic list)
- Materials (2 fields including dynamic list)
- Climate Risks (6 fields)
- Additional Environmental (1 field)

### Section 3: Social (~50 fields)
- Employee Counting Methodology (2 fields - auto-populated from General Information)
- Workforce by Contract (2 fields)
- Workforce by Gender (4 fields)
- Workforce by Country (1 dynamic list)
- Turnover (3 fields)
- Health & Safety (3 fields)
- Remuneration (4 fields)
- Training (4 fields)
- Management Diversity (4 fields)
- Human Rights Policies (9 fields)
- Human Rights Incidents (11 fields)
- Additional Social (1 field)

### Section 4: Governance (~20 fields)
- Corruption & Bribery (4 fields)
- Controversial Revenues (7 fields)
- EU Benchmark Exclusions (5 fields)
- Board Diversity (3 fields)
- Additional Governance (1 field)

**Total: Approximately 180+ individual fields plus multiple dynamic arrays/lists**

## Field Types Breakdown

### Input Types
- **Text**: 20+ fields (entity name, descriptions, etc.)
- **Number**: 90+ fields (emissions, employees, revenues, etc.)
- **Date**: 5 fields (reporting periods, adoption dates)
- **Textarea**: 30+ fields (long descriptions, strategies)
- **Select/Dropdown**: 15+ fields (currency, legal form, units, etc.)
- **Radio**: 5 fields (basis for preparation, reporting basis, etc.)
- **Boolean/Switch**: 30+ fields (yes/no questions)
- **Multi-select**: 5+ fields (disclosures lists, sustainability issues)
- **Dynamic Grid/Array**: 15+ dynamic lists (subsidiaries, sites, emissions by category, waste, materials, pollutants, etc.)
- **Custom Components**: NACE selector, Pollutant selector

### Required vs Optional
- **Always Required**: ~30 fields (marked with `required` prop)
- **Conditionally Required**: ~40 fields (required if parent field is true)
- **Optional**: ~110+ fields

## Data Lists Used (from /src/data/countries.ts)

1. **countries**: 195+ countries
2. **currencies**: 20+ major currencies
3. **entityIdentifierTypes**: ["LEI", "EU ID", "DUNS", "Perm ID"]
4. **legalForms**: 5 options including "other"
5. **disclosuresList**: 19 disclosure categories
6. **sustainabilityIssues**: 12 sustainability topics
7. **naceCodes**: Extensive list of European economic activity codes

## Key Subsections with Tooltips

All fields have tooltips (via `TooltipField` component) that provide:
- Detailed descriptions of what to enter
- Guidance on data sources
- Explanations of technical terms
- References to VSME Standard

## Dynamic/Repeatable Sections

These sections allow adding multiple entries:

1. **Subsidiaries** (if consolidated)
   - Name, Registered Address

2. **Sites**
   - Address, Postal Code, City, Country, GPS Coordinates

3. **Scope 3 Emissions** (15 categories)
   - Category, Current Period Emissions, Base Year, Target Year

4. **Pollution Data**
   - Pollutant, Emission to Air, Water, Soil

5. **Biodiversity Sites**
   - Site ID, Location, Area, In/Near Sensitive Area

6. **Waste Data**
   - Waste Type, Unit, Diverted, Disposal

7. **Materials Data**
   - Material Name, Mass/Volume, Unit

8. **Employees by Country**
   - Country, Number of Employees

9. **Practices Descriptions**
   - Multiple text descriptions

## Auto-populated Fields (Do NOT Extract)

The following fields are automatically populated from other form sections and should **NOT** be extracted from documents:

### Section 3: Social Disclosures
- **Employee Counting Methodology (Type)** - Auto-populated from Section 1 > General Information > Basis for Preparation
- **Employee Counting Methodology (Timing)** - Auto-populated from Section 1 > General Information > Basis for Preparation

## Calculated Fields (Auto-populated, Do NOT Extract)

The following fields are automatically calculated by the form and should **NOT** be extracted from documents:

### Energy & Emissions
- Total renewable + non-renewable energy per source
- Total Scope 1 + Scope 2 (location and market-based)
- Total Scope 3 emissions
- GHG emission intensity per turnover
- Percentage reductions for targets

### Workforce
- Total employees (from permanent + temporary)
- Total employees (from gender breakdown)
- Employee turnover rate
- Rate of recordable accidents
- Gender pay gap percentage
- Percentage covered by collective bargaining
- Average training hours
- Female-to-male ratio at management

### Water
- Total water consumption (withdrawal - discharge)

### Waste
- Total waste (diverted + disposal)
- Total hazardous/non-hazardous by mass/volume

### Materials
- Total annual mass-flow

### Governance
- Total fossil fuel revenues (coal + oil + gas)
- Gender diversity ratio in governance
- Excluded from EU benchmarks (calculated from thresholds)

## Critical AI Extraction Rules

### Zero Hallucination Policy
**The AI must NEVER make up or guess data. This is legally binding sustainability reporting.**

1. **Only Extract, Never Infer**
   - If data is not explicitly in the document, mark as "NOT_FOUND"
   - Never calculate, estimate, or guess values
   - Never use placeholder or example data

2. **Source Attribution (Mandatory)**
   Every filled field MUST include:
   - Exact quote from source document
   - Page number or section reference
   - Confidence level (HIGH/MEDIUM/LOW)
   - Format: "Found in [filename], page X: '[exact quote]'"

3. **Transparency Report**
   The AI must provide:
   - **Fields Successfully Filled**: List with sources
   - **Fields Not Found**: Clear list of missing data
   - **Fields Requiring Verification**: Ambiguous matches
   - **Source Summary**: Which documents were most useful

4. **Validation Checks**
   - Flag multiple conflicting values for same field
   - Flag format mismatches (text in number field)
   - Flag unusual values (outliers, unexpected units)

## JSON Schema Output

A complete JSON schema has been generated at:
**`/Users/anudeepnarala/Projects/EFRAG-app/vsme-form-schema.json`**

This schema includes:
- All field names and types
- Required/optional status
- Descriptions and tooltips
- Extraction guidance for each field
- Output format specifications
- Priority fields for extraction
- Calculated fields to avoid extracting

## Usage for AI Prompts

The JSON schema can be used to create prompts for ChatGPT or other LLMs to:

1. **Extract data from sustainability reports**
   - Upload company annual reports, ESG reports, sustainability reports
   - AI extracts relevant data and maps to form fields
   - Returns structured JSON with sources and confidence levels

2. **Validate extracted data**
   - Check for completeness
   - Verify data types and formats
   - Flag missing required fields

3. **Generate pre-fill data**
   - Create a JSON object that can be loaded into the VSME form
   - User reviews and confirms/edits before submission

## Example AI Prompt Structure

```
You are a data extraction assistant for EFRAG VSME sustainability reporting.

CRITICAL RULES:
- Extract ONLY facts explicitly stated in documents
- NEVER infer, calculate, or estimate values
- If data not found, respond with "NOT_FOUND"
- Always cite: filename, page, exact quote
- Mark confidence: HIGH/MEDIUM/LOW

SCHEMA: [Include the JSON schema]

DOCUMENTS: [User uploads documents]

For each field in the schema, respond with:
{
  "field_name": "entityName",
  "value": "Acme Corp" | null,
  "found": true | false,
  "source": "annual_report.pdf, page 3",
  "quote": "Acme Corp is a leading...",
  "confidence": "HIGH",
  "notes": "Additional context"
}

Provide summary at end:
- Fields filled: X/Y
- Missing fields: [list]
- Fields requiring review: [list]
```

## Notes for Implementation

1. **Calculated Fields**: The form automatically calculates ~30 fields. The AI should not extract these - they will be computed from other inputs.

2. **Conditional Fields**: Many fields only appear if a parent field is true (e.g., subsidiary list only appears if reporting basis is "consolidated"). AI should handle these dependencies.

3. **Units**: Pay careful attention to units:
   - Energy: MWh
   - Emissions: tCO2e
   - Water: m³
   - Money: EUR (or currency specified)
   - Waste: kg, tonne, or m³

4. **Date Formats**: All dates should be YYYY-MM-DD format.

5. **Arrays**: Multiple sections use arrays. AI should extract all relevant items and structure as arrays.

6. **NACE Codes**: These are specialized economic activity codes. Look for industry classifications, sector codes.

## File Locations

- **Form Component**: `/Users/anudeepnarala/Projects/EFRAG-app/src/components/VSMEForm.tsx` (3296 lines)
- **Data Lists**: `/Users/anudeepnarala/Projects/EFRAG-app/src/data/countries.ts` (285 lines)
- **JSON Schema**: `/Users/anudeepnarala/Projects/EFRAG-app/vsme-form-schema.json` (NEW)
- **This Analysis**: `/Users/anudeepnarala/Projects/EFRAG-app/VSME_FORM_ANALYSIS.md` (NEW)

---

**Generated**: 2025-09-30
**Last Updated**: 2025-10-01
**Version**: 1.0.1

## Changelog

### 2025-10-01
- Added Employee Counting Methodology auto-population in Section 3
- Clarified that methodology fields are populated from General Information section
- Removed duplicate methodology fields from Gender subsection
