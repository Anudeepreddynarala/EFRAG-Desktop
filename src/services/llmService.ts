// Local LLM Connection Service - 100% local processing
import { LLMBackend, LLMConnection, LLM_BACKEND_INFO } from '../types/ai.types';

export class LLMService {
  private connection: LLMConnection | null = null;

  /**
   * Test connection to local LLM backend
   */
  async testConnection(backend: LLMBackend): Promise<boolean> {
    const info = LLM_BACKEND_INFO[backend];

    try {
      const response = await fetch(`${info.defaultUrl}/api/tags`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      return response.ok;
    } catch (error) {
      console.error(`Failed to connect to ${info.name}:`, error);
      return false;
    }
  }

  /**
   * Connect to local LLM backend
   */
  async connect(backend: LLMBackend, model: string): Promise<{ success: boolean; error?: string }> {
    const info = LLM_BACKEND_INFO[backend];

    try {
      // Test connection
      const isConnected = await this.testConnection(backend);

      if (!isConnected) {
        return {
          success: false,
          error: `Cannot connect to ${info.name}. Make sure it's installed and running.`
        };
      }

      // Check if model exists (Ollama-specific, adapt for other backends)
      if (backend === LLMBackend.OLLAMA) {
        const hasModel = await this.checkModel(model, info.defaultUrl);
        if (!hasModel) {
          // Attempt to pull the model
          console.log(`Model ${model} not found locally. Downloading...`);
          await this.pullModel(model, info.defaultUrl);
        }
      }

      this.connection = {
        backend,
        baseUrl: info.defaultUrl,
        isConnected: true,
        model
      };

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to connect'
      };
    }
  }

  /**
   * Check if model exists locally
   */
  private async checkModel(model: string, baseUrl: string): Promise<boolean> {
    try {
      const response = await fetch(`${baseUrl}/api/tags`);
      const data = await response.json();

      // Normalize model name (remove version if present)
      const modelBase = model.toLowerCase().split(':')[0];

      return data.models?.some((m: any) =>
        m.name.toLowerCase().includes(modelBase)
      ) || false;
    } catch (error) {
      console.error('Failed to check model:', error);
      return false;
    }
  }

  /**
   * Pull (download) model from Ollama registry
   */
  private async pullModel(model: string, baseUrl: string): Promise<void> {
    // Convert model name to Ollama format
    // "Qwen 2.5 3B" -> "qwen2.5:3b"
    const ollamaModel = this.convertToOllamaName(model);

    const response = await fetch(`${baseUrl}/api/pull`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: ollamaModel })
    });

    if (!response.ok) {
      throw new Error(`Failed to download model: ${response.statusText}`);
    }

    // Stream the download progress (simplified)
    const reader = response.body?.getReader();
    if (reader) {
      while (true) {
        const { done } = await reader.read();
        if (done) break;
      }
    }
  }

  /**
   * Convert friendly model name to Ollama registry name
   */
  private convertToOllamaName(modelName: string): string {
    const mapping: Record<string, string> = {
      'Qwen 2.5 3B': 'qwen2.5:3b',
      'Qwen 2.5 7B': 'qwen2.5:7b',
      'Qwen 2.5 14B': 'qwen2.5:14b',
      'Gemma 2B': 'gemma:2b',
      'Mistral 7B': 'mistral:7b',
      'Mistral Nemo 12B': 'mistral-nemo:12b'
    };

    return mapping[modelName] || modelName.toLowerCase().replace(/\s+/g, '-');
  }

  /**
   * Send prompt to local LLM and get response
   */
  async generate(prompt: string, systemPrompt?: string): Promise<{ success: boolean; response?: string; error?: string }> {
    if (!this.connection?.isConnected) {
      return { success: false, error: 'Not connected to LLM' };
    }

    try {
      const ollamaModel = this.convertToOllamaName(this.connection.model || '');

      const response = await fetch(`${this.connection.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: ollamaModel,
          prompt: systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt,
          stream: false,
          options: {
            temperature: 0.1, // Low temperature for consistent extraction
            top_p: 0.9,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`LLM request failed: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        response: data.response
      };
    } catch (error: any) {
      console.error('LLM generation error:', error);
      return {
        success: false,
        error: error.message || 'Failed to generate response'
      };
    }
  }

  /**
   * Generate with structured output (JSON)
   */
  async generateStructured<T>(prompt: string, systemPrompt?: string): Promise<{ success: boolean; data?: T; error?: string }> {
    const result = await this.generate(prompt, systemPrompt);

    if (!result.success || !result.response) {
      return { success: false, error: result.error };
    }

    try {
      // Extract JSON from markdown code blocks if present
      let jsonText = result.response.trim();
      const jsonMatch = jsonText.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      if (jsonMatch) {
        jsonText = jsonMatch[1];
      }

      const data = JSON.parse(jsonText);
      return { success: true, data };
    } catch (error: any) {
      console.error('Failed to parse JSON response:', error);
      return {
        success: false,
        error: 'Failed to parse structured response. LLM may not have returned valid JSON.'
      };
    }
  }

  /**
   * Get current connection status
   */
  getConnection(): LLMConnection | null {
    return this.connection;
  }

  /**
   * Disconnect from LLM
   */
  disconnect(): void {
    this.connection = null;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connection?.isConnected || false;
  }
}

// Singleton instance
export const llmService = new LLMService();
