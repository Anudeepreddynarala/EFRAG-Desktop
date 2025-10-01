import OpenAI from 'openai';
import {
  GPTModel,
  ExtractedField,
  AIAnalysisResult,
  GPTPromptContext,
  EFRAG_VSME_SYSTEM_PROMPT,
  VSME_CORE_FIELDS
} from '@/types/ai.types';

/**
 * Create OpenAI client instance
 */
export function createOpenAIClient(apiKey: string): OpenAI {
  return new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true // For Electron/browser context
  });
}

/**
 * Build the user prompt for GPT
 */
function buildUserPrompt(context: GPTPromptContext): string {
  const { formSchema, documents, userInstructions } = context;

  let prompt = `Extract sustainability reporting data from the following documents for EFRAG VSME form filling.\n\n`;

  // Add user instructions if provided
  if (userInstructions) {
    prompt += `**User Instructions:**\n${userInstructions}\n\n`;
  }

  // Add form schema
  prompt += `**Form Fields to Extract:**\n`;
  formSchema.forEach((field) => {
    prompt += `- ${field.name}: ${field.description}`;
    if (field.unit) {
      prompt += ` (Unit: ${field.unit})`;
    }
    if (field.options) {
      prompt += ` [Options: ${field.options.join(', ')}]`;
    }
    prompt += `\n`;
  });

  // Add documents
  prompt += `\n**Documents:**\n`;
  documents.forEach((doc, index) => {
    prompt += `\n--- Document ${index + 1}: ${doc.filename} ---\n`;
    prompt += doc.content + '\n';
  });

  prompt += `\n\nPlease extract all available data and return as JSON array following the specified format.`;

  return prompt;
}

/**
 * Parse GPT response and validate structure
 */
function parseGPTResponse(response: string): ExtractedField[] {
  try {
    // Try to find JSON array in response
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No JSON array found in response');
    }

    const fields = JSON.parse(jsonMatch[0]) as ExtractedField[];
    return fields;
  } catch (error) {
    console.error('Error parsing GPT response:', error);
    throw new Error('Failed to parse AI response. Please try again.');
  }
}

/**
 * Analyze documents using ChatGPT and extract form data
 */
export async function analyzeDocuments(
  apiKey: string,
  model: GPTModel,
  documents: { filename: string; content: string }[],
  userInstructions?: string,
  onProgress?: (progress: number, message: string) => void
): Promise<AIAnalysisResult> {
  const startTime = Date.now();

  try {
    // Create OpenAI client
    const client = createOpenAIClient(apiKey);

    // Update progress
    onProgress?.(20, 'Preparing documents for AI analysis...');

    // Build prompt context
    const context: GPTPromptContext = {
      formSchema: VSME_CORE_FIELDS,
      documents,
      userInstructions,
      efragStandard: EFRAG_VSME_SYSTEM_PROMPT
    };

    const userPrompt = buildUserPrompt(context);

    onProgress?.(40, 'Sending documents to ChatGPT...');

    // Call OpenAI API
    const completion = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: EFRAG_VSME_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.1, // Low temperature for factual extraction
      max_tokens: 4000
    });

    onProgress?.(70, 'Processing AI response...');

    const responseText = completion.choices[0]?.message?.content || '';
    const extractedFields = parseGPTResponse(responseText);

    onProgress?.(90, 'Organizing results...');

    // Categorize fields
    const fieldsSuccessfullyFilled = extractedFields.filter((f) => f.found && f.confidence !== 'LOW');
    const fieldsNotFound = VSME_CORE_FIELDS
      .filter((schema) => !extractedFields.some((extracted) => extracted.fieldName === schema.name && extracted.found))
      .map((schema) => schema.name);
    const fieldsRequiringVerification = extractedFields.filter(
      (f) => f.found && (f.confidence === 'LOW' || f.confidence === 'MEDIUM')
    );

    // Calculate source summary
    const sourceSummary = documents.map((doc) => {
      const fieldsFromDoc = extractedFields.filter((f) => f.source.includes(doc.filename));
      return {
        filename: doc.filename,
        fieldsExtracted: fieldsFromDoc.length,
        usefulness: fieldsFromDoc.length > 5 ? 'high' : fieldsFromDoc.length > 2 ? 'medium' : 'low'
      } as const;
    });

    // Calculate cost
    const totalTokensUsed = completion.usage?.total_tokens || 0;
    const inputTokens = completion.usage?.prompt_tokens || 0;
    const outputTokens = completion.usage?.completion_tokens || 0;

    // Get pricing based on model
    const pricing = {
      [GPTModel.GPT4_TURBO]: { input: 10, output: 30 },
      [GPTModel.GPT4O]: { input: 5, output: 15 },
      [GPTModel.GPT35_TURBO]: { input: 0.5, output: 1.5 }
    };

    const modelPricing = pricing[model];
    const estimatedCost =
      (inputTokens / 1000000) * modelPricing.input + (outputTokens / 1000000) * modelPricing.output;

    const processingTime = Date.now() - startTime;

    onProgress?.(100, 'Analysis complete!');

    return {
      fieldsSuccessfullyFilled,
      fieldsNotFound,
      fieldsRequiringVerification,
      sourceSummary,
      totalTokensUsed,
      estimatedCost,
      processingTime
    };
  } catch (error: any) {
    console.error('Error analyzing documents:', error);

    // Handle specific OpenAI errors
    if (error.status === 401) {
      throw new Error('Invalid API key. Please check your OpenAI API key.');
    } else if (error.status === 429) {
      throw new Error('Rate limit exceeded. Please try again in a moment.');
    } else if (error.status === 500) {
      throw new Error('OpenAI server error. Please try again later.');
    } else {
      throw new Error(`AI analysis failed: ${error.message || 'Unknown error'}`);
    }
  }
}

/**
 * Estimate cost before processing
 */
export function estimateCost(
  model: GPTModel,
  documentLengths: number[],
  formFieldCount: number
): { minCost: number; maxCost: number; estimatedTokens: number } {
  // Rough estimation: 1 token ≈ 4 characters
  const documentTokens = documentLengths.reduce((sum, length) => sum + Math.ceil(length / 4), 0);
  const systemPromptTokens = Math.ceil(EFRAG_VSME_SYSTEM_PROMPT.length / 4);
  const formSchemaTokens = formFieldCount * 50; // Rough estimate
  const outputTokens = formFieldCount * 100; // Rough estimate for response

  const estimatedInputTokens = documentTokens + systemPromptTokens + formSchemaTokens;
  const estimatedTotalTokens = estimatedInputTokens + outputTokens;

  const pricing = {
    [GPTModel.GPT4_TURBO]: { input: 10, output: 30 },
    [GPTModel.GPT4O]: { input: 5, output: 15 },
    [GPTModel.GPT35_TURBO]: { input: 0.5, output: 1.5 }
  };

  const modelPricing = pricing[model];

  const minCost =
    (estimatedInputTokens / 1000000) * modelPricing.input + (outputTokens * 0.5 / 1000000) * modelPricing.output;

  const maxCost =
    (estimatedInputTokens / 1000000) * modelPricing.input + (outputTokens * 1.5 / 1000000) * modelPricing.output;

  return {
    minCost: Math.round(minCost * 100) / 100,
    maxCost: Math.round(maxCost * 100) / 100,
    estimatedTokens: estimatedTotalTokens
  };
}
