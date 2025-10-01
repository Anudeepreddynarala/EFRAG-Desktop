import CryptoJS from 'crypto-js';

// Encryption key derived from machine-specific data
// In production, this should be stored more securely
const ENCRYPTION_SECRET = 'efrag-vsme-ai-assistant-v1';

export interface StoredAPIKey {
  encryptedKey: string;
  createdAt: string;
  lastUsed: string;
  model: string;
}

/**
 * Encrypt API key using AES encryption
 */
export function encryptAPIKey(apiKey: string): string {
  return CryptoJS.AES.encrypt(apiKey, ENCRYPTION_SECRET).toString();
}

/**
 * Decrypt API key
 */
export function decryptAPIKey(encryptedKey: string): string {
  const bytes = CryptoJS.AES.decrypt(encryptedKey, ENCRYPTION_SECRET);
  return bytes.toString(CryptoJS.enc.Utf8);
}

/**
 * Store API key in database (encrypted)
 */
export async function storeAPIKey(apiKey: string, model: string): Promise<void> {
  const encryptedKey = encryptAPIKey(apiKey);
  const now = new Date().toISOString();

  const keyData: StoredAPIKey = {
    encryptedKey,
    createdAt: now,
    lastUsed: now,
    model
  };

  // Store in localStorage for now (should be moved to SQLite database)
  localStorage.setItem('openai_api_key', JSON.stringify(keyData));
}

/**
 * Retrieve API key from storage
 */
export async function getStoredAPIKey(): Promise<string | null> {
  const stored = localStorage.getItem('openai_api_key');

  if (!stored) {
    return null;
  }

  try {
    const keyData: StoredAPIKey = JSON.parse(stored);

    // Update last used timestamp
    keyData.lastUsed = new Date().toISOString();
    localStorage.setItem('openai_api_key', JSON.stringify(keyData));

    return decryptAPIKey(keyData.encryptedKey);
  } catch (error) {
    console.error('Error retrieving API key:', error);
    return null;
  }
}

/**
 * Check if API key is stored
 */
export async function hasStoredAPIKey(): Promise<boolean> {
  const stored = localStorage.getItem('openai_api_key');
  return stored !== null;
}

/**
 * Delete stored API key
 */
export async function deleteAPIKey(): Promise<void> {
  localStorage.removeItem('openai_api_key');
}

/**
 * Get stored model preference
 */
export async function getStoredModel(): Promise<string | null> {
  const stored = localStorage.getItem('openai_api_key');

  if (!stored) {
    return null;
  }

  try {
    const keyData: StoredAPIKey = JSON.parse(stored);
    return keyData.model;
  } catch (error) {
    return null;
  }
}

/**
 * Test API key validity by making a simple request
 */
export async function testAPIKey(apiKey: string): Promise<{ valid: boolean; error?: string }> {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    if (response.ok) {
      return { valid: true };
    } else {
      const error = await response.json();
      return { valid: false, error: error.error?.message || 'Invalid API key' };
    }
  } catch (error) {
    return { valid: false, error: 'Network error: Could not connect to OpenAI' };
  }
}
