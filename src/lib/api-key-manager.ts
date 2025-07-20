/**
 * API Key Management System for Virtual Vogue
 * Handles multiple API keys with automatic failover and user input fallback
 */

export interface ApiKeyAttempt {
  key: string;
  source: 'predefined' | 'user' | 'environment';
  index?: number;
}

export interface ApiKeyError {
  key: string;
  error: string;
  errorType: 'quota_exceeded' | 'invalid_key' | 'network_error' | 'unknown_error';
  source: 'predefined' | 'user' | 'environment';
  index?: number;
}

export interface ApiKeyResult {
  success: boolean;
  key?: string;
  source?: 'predefined' | 'user' | 'environment';
  index?: number;
  errors?: ApiKeyError[];
  allKeysExhausted?: boolean;
}

export class ApiKeyManager {
  private predefinedKeys: string[] = [];
  private failedKeys: Set<string> = new Set();
  private keyAttempts: ApiKeyAttempt[] = [];
  private errors: ApiKeyError[] = [];
  private currentAttempt: ApiKeyAttempt | null = null;

  constructor(predefinedKeys: string[] = []) {
    // Filter out empty keys and add environment key if available
    this.predefinedKeys = predefinedKeys.filter(key => key && key.trim().length > 0);
    
    // Add environment key if available and not already in predefined keys
    const envKey = process.env.GOOGLE_API_KEY;
    if (envKey && envKey.trim().length > 0 && !this.predefinedKeys.includes(envKey)) {
      this.predefinedKeys.unshift(envKey);
    }
  }

  /**
   * Start tracking a new attempt
   */
  startAttempt(attempt: ApiKeyAttempt): void {
    this.currentAttempt = attempt;
    this.keyAttempts.push(attempt);
  }

  /**
   * Get the current attempt being made
   */
  getCurrentAttempt(): ApiKeyAttempt | null {
    return this.currentAttempt;
  }

  /**
   * Get all attempts made so far
   */
  getAllAttempts(): ApiKeyAttempt[] {
    return [...this.keyAttempts];
  }

  /**
   * Get the next available API key to try
   */
  getNextKey(userProvidedKey?: string): ApiKeyAttempt | null {
    // If user provided a key, try it first (unless it's already failed)
    if (userProvidedKey && userProvidedKey.trim().length > 0 && !this.failedKeys.has(userProvidedKey)) {
      return {
        key: userProvidedKey,
        source: 'user'
      };
    }

    // Try predefined keys that haven't failed yet
    for (let i = 0; i < this.predefinedKeys.length; i++) {
      const key = this.predefinedKeys[i];
      if (!this.failedKeys.has(key)) {
        return {
          key,
          source: i === 0 && process.env.GOOGLE_API_KEY === key ? 'environment' : 'predefined',
          index: i
        };
      }
    }

    return null;
  }

  /**
   * Mark the current attempt as successful
   */
  markAttemptAsSuccessful(): void {
    if (this.currentAttempt) {
      // Find the attempt in the array and update it
      const attemptIndex = this.keyAttempts.findIndex(a => a.key === this.currentAttempt!.key);
      if (attemptIndex >= 0) {
        this.keyAttempts[attemptIndex] = { ...this.keyAttempts[attemptIndex] };
      }
    }
  }

  /**
   * Mark a key as failed and record the error
   */
  markKeyAsFailed(attempt: ApiKeyAttempt, error: string): void {
    this.failedKeys.add(attempt.key);
    
    const errorType = this.categorizeError(error);
    const apiKeyError: ApiKeyError = {
      key: attempt.key,
      error,
      errorType,
      source: attempt.source,
      index: attempt.index
    };
    
    this.errors.push(apiKeyError);
    console.warn(`API Key failed (${attempt.source}${attempt.index !== undefined ? ` #${attempt.index + 1}` : ''}):`, {
      errorType,
      error: error.substring(0, 200) // Truncate long error messages
    });
  }

  /**
   * Categorize error types for better handling
   */
  private categorizeError(error: string): ApiKeyError['errorType'] {
    const errorLower = error.toLowerCase();
    
    if (errorLower.includes('quota') || errorLower.includes('429') || errorLower.includes('too many requests')) {
      return 'quota_exceeded';
    }
    
    if (errorLower.includes('invalid') || errorLower.includes('unauthorized') || errorLower.includes('403') || errorLower.includes('401')) {
      return 'invalid_key';
    }
    
    if (errorLower.includes('network') || errorLower.includes('fetch') || errorLower.includes('connection') || errorLower.includes('timeout')) {
      return 'network_error';
    }
    
    return 'unknown_error';
  }

  /**
   * Check if all available keys have been exhausted
   */
  areAllKeysExhausted(userProvidedKey?: string): boolean {
    const totalAvailableKeys = this.predefinedKeys.length + (userProvidedKey ? 1 : 0);
    return this.failedKeys.size >= totalAvailableKeys;
  }

  /**
   * Get a summary of all failed attempts
   */
  getFailureSummary(): {
    totalAttempts: number;
    quotaExceeded: number;
    invalidKeys: number;
    networkErrors: number;
    unknownErrors: number;
    errors: ApiKeyError[];
  } {
    const quotaExceeded = this.errors.filter(e => e.errorType === 'quota_exceeded').length;
    const invalidKeys = this.errors.filter(e => e.errorType === 'invalid_key').length;
    const networkErrors = this.errors.filter(e => e.errorType === 'network_error').length;
    const unknownErrors = this.errors.filter(e => e.errorType === 'unknown_error').length;

    return {
      totalAttempts: this.errors.length,
      quotaExceeded,
      invalidKeys,
      networkErrors,
      unknownErrors,
      errors: [...this.errors]
    };
  }

  /**
   * Reset the manager for a new generation attempt
   */
  reset(): void {
    this.failedKeys.clear();
    this.keyAttempts = [];
    this.errors = [];
    this.currentAttempt = null;
  }

  /**
   * Get user-friendly error message based on failure summary
   */
  getUserFriendlyErrorMessage(): string {
    const summary = this.getFailureSummary();
    
    if (summary.totalAttempts === 0) {
      return "No API keys available. Please provide a valid Google Gemini API key.";
    }

    if (summary.quotaExceeded > 0 && summary.invalidKeys === 0) {
      return "All available API keys have exceeded their quota limits. Please try again later or provide a new API key with available quota.";
    }

    if (summary.invalidKeys > 0 && summary.quotaExceeded === 0) {
      return "All provided API keys are invalid. Please check your API keys and ensure they are valid Google Gemini API keys.";
    }

    if (summary.networkErrors > 0) {
      return "Network connectivity issues detected. Please check your internet connection and try again.";
    }

    return "All available API keys have failed. Please provide a valid Google Gemini API key with available quota.";
  }

  /**
   * Get the number of remaining keys to try
   */
  getRemainingKeyCount(userProvidedKey?: string): number {
    const totalKeys = this.predefinedKeys.length + (userProvidedKey && !this.failedKeys.has(userProvidedKey) ? 1 : 0);
    return Math.max(0, totalKeys - this.failedKeys.size);
  }
}
