// AI Assistant Types for Local LLM Integration

export enum LLMBackend {
  OLLAMA = 'ollama',
  LM_STUDIO = 'lmstudio',
  JAN = 'jan'
}

export enum ModelTier {
  ULTRA_LIGHT = 'ultra-light', // 4-8GB RAM
  BALANCED = 'balanced',        // 8-16GB RAM
  HIGH_PERFORMANCE = 'high'     // 16GB+ RAM
}

export interface SystemSpecs {
  totalRAM: number; // in GB
  availableRAM: number; // in GB
  cpuCores: number;
  recommendedTier: ModelTier;
}

export interface LLMModel {
  name: string;
  size: string; // e.g., "1.7GB"
  tier: ModelTier;
  backend: LLMBackend;
  description: string;
  downloadUrl?: string;
}

export interface LLMConnection {
  backend: LLMBackend;
  baseUrl: string;
  isConnected: boolean;
  model?: string;
}

export interface DocumentInput {
  type: 'file' | 'text';
  content: string;
  filename?: string;
  mimeType?: string;
}

export interface ExtractedField {
  fieldName: string;
  value: string | number;
  confidence: number; // 0-1
  source: string; // which part of document it came from
  needsReview: boolean;
}

export interface AIAnalysis {
  extractedFields: ExtractedField[];
  summary: string;
  warnings: string[];
  missingInfo: string[];
  processingTime: number;
}

export interface AIFeedback {
  fieldsIdentified: number;
  fieldsNeedingAttention: string[];
  confidenceAverage: number;
  suggestions: string[];
}

export const RECOMMENDED_MODELS: Record<ModelTier, LLMModel[]> = {
  [ModelTier.ULTRA_LIGHT]: [
    {
      name: 'Qwen 2.5 3B',
      size: '2.0GB',
      tier: ModelTier.ULTRA_LIGHT,
      backend: LLMBackend.OLLAMA,
      description: 'Alibaba\'s specialized extraction model. Outperforms larger models on structured data tasks.'
    },
    {
      name: 'Gemma 2B',
      size: '1.7GB',
      tier: ModelTier.ULTRA_LIGHT,
      backend: LLMBackend.OLLAMA,
      description: 'Google\'s efficient small model. Reliable fallback for very limited hardware.'
    }
  ],
  [ModelTier.BALANCED]: [
    {
      name: 'Mistral 7B',
      size: '4.4GB',
      tier: ModelTier.BALANCED,
      backend: LLMBackend.OLLAMA,
      description: 'Best-in-class for structured data extraction. Fast, precise, and excellent for business forms.'
    },
    {
      name: 'Qwen 2.5 7B',
      size: '4.7GB',
      tier: ModelTier.BALANCED,
      backend: LLMBackend.OLLAMA,
      description: 'Superior extraction accuracy with hybrid reasoning modes. Excellent for complex documents.'
    }
  ],
  [ModelTier.HIGH_PERFORMANCE]: [
    {
      name: 'Qwen 2.5 14B',
      size: '8.2GB',
      tier: ModelTier.HIGH_PERFORMANCE,
      backend: LLMBackend.OLLAMA,
      description: 'Maximum extraction accuracy for complex sustainability reports. Requires 16GB+ RAM.'
    },
    {
      name: 'Mistral Nemo 12B',
      size: '7.1GB',
      tier: ModelTier.HIGH_PERFORMANCE,
      backend: LLMBackend.OLLAMA,
      description: 'Advanced structured data extraction with excellent multilingual support.'
    }
  ]
};

export const LLM_BACKEND_INFO = {
  [LLMBackend.OLLAMA]: {
    name: 'Ollama',
    defaultPort: 11434,
    defaultUrl: 'http://localhost:11434',
    downloadUrl: 'https://ollama.ai/download',
    description: 'Easy command-line tool with simple setup',
    setupSteps: [
      'Download Ollama from ollama.ai',
      'Install and run Ollama',
      'Model will be downloaded automatically on first use'
    ]
  },
  [LLMBackend.LM_STUDIO]: {
    name: 'LM Studio',
    defaultPort: 1234,
    defaultUrl: 'http://localhost:1234',
    downloadUrl: 'https://lmstudio.ai',
    description: 'User-friendly GUI application',
    setupSteps: [
      'Download LM Studio from lmstudio.ai',
      'Install and launch the application',
      'Download a model from the built-in browser',
      'Start the local server from the menu'
    ]
  },
  [LLMBackend.JAN]: {
    name: 'Jan',
    defaultPort: 1337,
    defaultUrl: 'http://localhost:1337',
    downloadUrl: 'https://jan.ai',
    description: 'Fully offline ChatGPT alternative',
    setupSteps: [
      'Download Jan from jan.ai',
      'Install and open the application',
      'Download a model from the Hub',
      'Enable API server in settings'
    ]
  }
};
