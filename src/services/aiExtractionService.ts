// AI Extraction Service - Zero Hallucination Policy
import { llmService } from './llmService';
import { ExtractedField, AIAnalysis } from '../types/ai.types';

export class AIExtractionService {
  /**
   * System prompt enforcing zero hallucination policy
   */
  private static readonly SYSTEM_PROMPT = `You are a data extraction assistant for EFRAG VSME sustainability reporting.

CRITICAL RULES - ZERO HALLUCINATION POLICY:
1. Extract ONLY facts explicitly stated in the provided documents
2. NEVER infer, calculate, estimate, or guess any values
3. If data is not found, respond with null value and found: false
4. Always cite the exact source with filename and quote
5. Mark confidence levels honestly: HIGH (exact match), MEDIUM (needs verification), LOW (uncertain)
6. If you find conflicting information, report all values found

Your responses must be in valid JSON format. For each field requested, provide:
{
  "field_name": "string",
  "value": "extracted value" | null,
  "found": true | false,
  "source": "filename, location/page",
  "quote": "exact text from document",
  "confidence": "HIGH" | "MEDIUM" | "LOW",
  "notes": "any warnings or additional context"
}

If multiple values are found for the same field, include all in notes and mark confidence as LOW.
If the document format makes extraction difficult, note this and mark confidence as MEDIUM or LOW.`;

  /**
   * Extract data from documents for VSME form
   */
  static async extractFormData(
    documentContent: string,
    filename: string
  ): Promise<AIAnalysis> {
    const startTime = Date.now();

    try {
      // Build extraction prompt
      const extractionPrompt = this.buildExtractionPrompt(documentContent, filename);

      // Send to LLM
      const result = await llmService.generateStructured<{
        extracted_fields: ExtractedField[];
        summary: string;
        warnings: string[];
        missing_info: string[];
      }>(extractionPrompt, this.SYSTEM_PROMPT);

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to extract data');
      }

      const processingTime = Date.now() - startTime;

      // Process results
      const analysis: AIAnalysis = {
        extractedFields: result.data.extracted_fields,
        summary: result.data.summary,
        warnings: result.data.warnings || [],
        missingInfo: result.data.missing_info || [],
        processingTime
      };

      return analysis;
    } catch (error: any) {
      throw new Error(`Extraction failed: ${error.message}`);
    }
  }

  /**
   * Build the extraction prompt for VSME form fields
   */
  private static buildExtractionPrompt(content: string, filename: string): string {
    return `
Document to analyze:
Filename: ${filename}
Content:
${content.slice(0, 50000)} ${content.length > 50000 ? '\n\n[Content truncated due to length]' : ''}

Extract the following information for EFRAG VSME sustainability reporting.
Remember: ONLY extract explicitly stated facts. Do NOT infer or calculate anything.

Required fields to extract:

GENERAL INFORMATION:
1. Company/Entity name
2. Legal form of entity
3. Country of registration
4. Principal place of business
5. Reporting period start date (YYYY-MM-DD)
6. Reporting period end date (YYYY-MM-DD)
7. Number of employees (full-time equivalents)
8. Annual revenue/turnover
9. Total assets

ENVIRONMENTAL DATA:
10. Total energy consumption (with units)
11. Renewable energy percentage
12. Total GHG emissions Scope 1 (with units, e.g., tCO2e)
13. Total GHG emissions Scope 2 (with units)
14. Total GHG emissions Scope 3 (with units, if available)
15. Total water consumption (with units)
16. Total waste generated (with units)
17. Hazardous waste generated (with units)

SOCIAL DATA:
18. Employee turnover rate
19. Percentage of employees covered by collective agreements
20. Number of work-related accidents/injuries
21. Gender diversity metrics (e.g., % women in management)

GOVERNANCE:
22. Board composition and diversity
23. Existence of sustainability/ESG committee
24. Anti-corruption policies in place (yes/no)

For EACH field above, respond with this exact JSON structure:
{
  "extracted_fields": [
    {
      "fieldName": "companyName",
      "value": "extracted value or null",
      "confidence": 0.0-1.0,
      "source": "exact location where found",
      "needsReview": true/false
    }
  ],
  "summary": "Brief summary of what was successfully extracted",
  "warnings": ["List any data quality concerns, conflicts, or ambiguities"],
  "missing_info": ["List of fields that were NOT found in the document"]
}

IMPORTANT:
- If a value is not found, set value to null and add to missing_info
- If you find conflicting values, list all in warnings and set needsReview to true
- confidence should be 0.0-1.0 based on how certain you are
- needsReview should be true if confidence < 0.8 or if value needs verification
- source must include specific reference to where in the document the data was found

Return ONLY valid JSON, no additional text.
`;
  }

  /**
   * Validate extracted data against form schema
   */
  static validateExtractedData(fields: ExtractedField[]): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    fields.forEach(field => {
      // Check for required properties
      if (!field.fieldName) {
        errors.push('Missing fieldName in extracted data');
      }

      if (field.confidence < 0 || field.confidence > 1) {
        errors.push(`Invalid confidence value for ${field.fieldName}: ${field.confidence}`);
      }

      // Check for suspicious values
      if (field.value && !field.source) {
        errors.push(`${field.fieldName} has value but no source citation`);
      }

      // Flag very low confidence
      if (field.confidence < 0.3 && field.value !== null) {
        errors.push(`${field.fieldName} has very low confidence (${field.confidence}). Consider marking as not found.`);
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Generate human-readable feedback for user
   */
  static generateUserFeedback(analysis: AIAnalysis): {
    fieldsIdentified: number;
    fieldsNeedingAttention: string[];
    confidenceAverage: number;
    suggestions: string[];
  } {
    const totalFields = analysis.extractedFields.length;
    const foundFields = analysis.extractedFields.filter(f => f.value !== null);
    const fieldsIdentified = foundFields.length;

    const fieldsNeedingAttention = analysis.extractedFields
      .filter(f => f.needsReview || f.confidence < 0.7)
      .map(f => f.fieldName);

    const confidenceAverage = foundFields.length > 0
      ? foundFields.reduce((sum, f) => sum + f.confidence, 0) / foundFields.length
      : 0;

    const suggestions: string[] = [];

    if (analysis.missingInfo.length > 0) {
      suggestions.push(
        `${analysis.missingInfo.length} fields could not be found in the documents. You'll need to enter these manually.`
      );
    }

    if (fieldsNeedingAttention.length > 0) {
      suggestions.push(
        `${fieldsNeedingAttention.length} fields need your review before submission.`
      );
    }

    if (confidenceAverage < 0.6) {
      suggestions.push(
        'Overall extraction confidence is low. Please carefully verify all extracted values.'
      );
    }

    if (analysis.warnings.length > 0) {
      suggestions.push(
        `The AI found ${analysis.warnings.length} potential issues or conflicts. Check the warnings.`
      );
    }

    return {
      fieldsIdentified,
      fieldsNeedingAttention,
      confidenceAverage,
      suggestions
    };
  }
}
