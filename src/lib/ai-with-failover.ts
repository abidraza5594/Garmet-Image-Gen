/**
 * AI Generation with Failover Support
 * Provides utilities for AI generation with automatic API key failover
 */

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { ApiKeyManager, ApiKeyAttempt, ApiKeyResult } from './api-key-manager';
import { PREDEFINED_API_KEYS } from './api-keys-config';

export interface GenerationOptions {
  prompt: any;
  model: string;
  config?: any;
}

export interface FailoverGenerationResult<T = any> {
  success: boolean;
  result?: T;
  keyResult: ApiKeyResult;
  error?: string;
  attempts?: Array<{
    key: string;
    source: 'predefined' | 'user' | 'environment';
    index?: number;
    status: 'trying' | 'success' | 'failed';
    error?: string;
    errorType?: 'quota_exceeded' | 'invalid_key' | 'network_error' | 'unknown_error';
  }>;
  currentAttempt?: {
    key: string;
    source: 'predefined' | 'user' | 'environment';
    index?: number;
    status: 'trying' | 'success' | 'failed';
  };
}

/**
 * Performs AI generation with automatic API key failover
 */
export async function generateWithFailover<T = any>(
  generationFn: (ai: any) => Promise<T>,
  userProvidedKey?: string
): Promise<FailoverGenerationResult<T>> {
  const keyManager = new ApiKeyManager(PREDEFINED_API_KEYS);
  const errors: string[] = [];
  let lastError: string = '';

  // Reset any previous state
  keyManager.reset();

  while (true) {
    const keyAttempt = keyManager.getNextKey(userProvidedKey);

    if (!keyAttempt) {
      // All keys exhausted
      const keyResult: ApiKeyResult = {
        success: false,
        allKeysExhausted: true,
        errors: keyManager.getFailureSummary().errors
      };

      return {
        success: false,
        keyResult,
        error: keyManager.getUserFriendlyErrorMessage(),
        attempts: keyManager.getAllAttempts().map(attempt => ({
          key: attempt.key,
          source: attempt.source,
          index: attempt.index,
          status: 'failed' as const,
          error: keyManager.getFailureSummary().errors.find(e => e.key === attempt.key)?.error,
          errorType: keyManager.getFailureSummary().errors.find(e => e.key === attempt.key)?.errorType
        }))
      };
    }

    // Start tracking this attempt
    keyManager.startAttempt(keyAttempt);

    try {
      // Create AI instance with the current key
      const currentAi = genkit({
        plugins: [googleAI({ apiKey: keyAttempt.key })],
        model: 'googleai/gemini-2.0-flash',
      });

      // Attempt generation
      const result = await generationFn(currentAi);

      // Success!
      keyManager.markAttemptAsSuccessful();

      const keyResult: ApiKeyResult = {
        success: true,
        key: keyAttempt.key,
        source: keyAttempt.source,
        index: keyAttempt.index
      };

      return {
        success: true,
        result,
        keyResult,
        attempts: keyManager.getAllAttempts().map(attempt => ({
          key: attempt.key,
          source: attempt.source,
          index: attempt.index,
          status: attempt.key === keyAttempt.key ? 'success' as const : 'failed' as const,
          error: attempt.key !== keyAttempt.key ? keyManager.getFailureSummary().errors.find(e => e.key === attempt.key)?.error : undefined,
          errorType: attempt.key !== keyAttempt.key ? keyManager.getFailureSummary().errors.find(e => e.key === attempt.key)?.errorType : undefined
        }))
      };

    } catch (error: any) {
      const errorMessage = error.message || error.toString();
      lastError = errorMessage;
      errors.push(errorMessage);

      // Mark this key as failed
      keyManager.markKeyAsFailed(keyAttempt, errorMessage);

      // Check if we should continue trying or give up
      if (keyManager.areAllKeysExhausted(userProvidedKey)) {
        break;
      }

      // Add delay between retries to avoid rate limiting
      console.log('Waiting 2 seconds before trying next API key...');
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Continue to next key
      continue;
    }
  }

  // All keys failed
  const keyResult: ApiKeyResult = {
    success: false,
    allKeysExhausted: true,
    errors: keyManager.getFailureSummary().errors
  };

  return {
    success: false,
    keyResult,
    error: keyManager.getUserFriendlyErrorMessage(),
    attempts: keyManager.getAllAttempts().map(attempt => ({
      key: attempt.key,
      source: attempt.source,
      index: attempt.index,
      status: 'failed' as const,
      error: keyManager.getFailureSummary().errors.find(e => e.key === attempt.key)?.error,
      errorType: keyManager.getFailureSummary().errors.find(e => e.key === attempt.key)?.errorType
    }))
  };
}



/**
 * Simplified generation function for single AI calls
 */
export async function generateSingleWithFailover(
  options: GenerationOptions,
  userProvidedKey?: string
): Promise<FailoverGenerationResult> {
  return generateWithFailover(async (ai) => {
    return await ai.generate(options);
  }, userProvidedKey);
}

/**
 * Generation function for multiple parallel AI calls
 */
export async function generateMultipleWithFailover(
  optionsArray: GenerationOptions[],
  userProvidedKey?: string
): Promise<FailoverGenerationResult> {
  return generateWithFailover(async (ai) => {
    const generationTasks = optionsArray.map(options => ai.generate(options));
    return await Promise.all(generationTasks);
  }, userProvidedKey);
}

/**
 * Generate multiple images with specific format for image generation
 */
export async function generateMultipleImagesWithFailover(
  generationOptions: Array<{
    prompt: any[];
    model: string;
    config: any;
  }>,
  userProvidedKey?: string
): Promise<FailoverGenerationResult<any[]>> {
  return generateWithFailover(async (ai) => {
    const results = [];

    for (const options of generationOptions) {
      const result = await ai.generate({
        prompt: options.prompt,
        model: options.model,
        config: options.config,
      });
      results.push(result);
    }

    return results;
  }, userProvidedKey);
}

/**
 * Categorize errors for better user feedback
 */
export function categorizeGenerationError(error: string): {
  type: 'quota_exceeded' | 'invalid_key' | 'network_error' | 'model_overloaded' | 'unknown_error';
  userMessage: string;
} {
  const errorLower = error.toLowerCase();
  
  if (errorLower.includes('quota') || errorLower.includes('429') || errorLower.includes('too many requests')) {
    return {
      type: 'quota_exceeded',
      userMessage: 'API quota exceeded. Please try again later or use a different API key.'
    };
  }
  
  if (errorLower.includes('invalid') || errorLower.includes('unauthorized') || errorLower.includes('403') || errorLower.includes('401')) {
    return {
      type: 'invalid_key',
      userMessage: 'Invalid API key. Please check your API key and try again.'
    };
  }
  
  if (errorLower.includes('503') || errorLower.includes('service unavailable') || errorLower.includes('overloaded')) {
    return {
      type: 'model_overloaded',
      userMessage: 'AI service is temporarily overloaded. Please try again in a few moments.'
    };
  }
  
  if (errorLower.includes('network') || errorLower.includes('fetch') || errorLower.includes('connection') || errorLower.includes('timeout')) {
    return {
      type: 'network_error',
      userMessage: 'Network connection error. Please check your internet connection and try again.'
    };
  }
  
  return {
    type: 'unknown_error',
    userMessage: 'An unexpected error occurred. Please try again.'
  };
}
