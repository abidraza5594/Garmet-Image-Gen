'use server';
/**
 * @fileOverview Generates marketing copy (social media posts, SEO keywords) for a product.
 *
 * - generateMarketingCopy - A function that generates the marketing text.
 * - GenerateMarketingCopyInput - The input type for the function.
 * - GenerateMarketingCopyOutput - The return type for the function.
 */

// Removed ai import since we're using failover system
import {z} from 'zod';
import { generateSingleWithFailover } from '@/lib/ai-with-failover';

const GenerateMarketingCopyInputSchema = z.object({
  title: z.string().describe("The title of the product."),
  description: z.string().describe("The detailed description of the product."),
  apiKey: z.string().optional().describe('An optional API key to override the default.'),
});
export type GenerateMarketingCopyInput = z.infer<typeof GenerateMarketingCopyInputSchema>;

const GenerateMarketingCopyOutputSchema = z.object({
  socialMediaPost: z.string().describe("A catchy and engaging social media post for Instagram or Facebook, including relevant hashtags."),
  seoKeywords: z.array(z.string()).describe("A list of 5-7 relevant SEO keywords for the product."),
  error: z.string().optional().describe("An error message if generation failed, e.g., 'QUOTA_EXCEEDED' or 'MODEL_OVERLOADED'."),
  allKeysExhausted: z.boolean().optional().describe("Whether all available API keys have been exhausted."),
  failureSummary: z.object({
    totalAttempts: z.number(),
    quotaExceeded: z.number(),
    invalidKeys: z.number(),
    networkErrors: z.number(),
    unknownErrors: z.number(),
  }).optional().describe("Summary of all failed API key attempts."),
  attempts: z.array(z.object({
    key: z.string(),
    source: z.enum(['predefined', 'user', 'environment']),
    index: z.number().optional(),
    status: z.enum(['trying', 'success', 'failed']),
    error: z.string().optional(),
    errorType: z.enum(['quota_exceeded', 'invalid_key', 'network_error', 'unknown_error']).optional(),
  })).optional().describe("Detailed information about each API key attempt.")
});
export type GenerateMarketingCopyOutput = z.infer<typeof GenerateMarketingCopyOutputSchema>;

export async function generateMarketingCopy(
  input: GenerateMarketingCopyInput
): Promise<GenerateMarketingCopyOutput> {
  return generateMarketingCopyFlow(input);
}



const generateMarketingCopyFlow = async (input: GenerateMarketingCopyInput): Promise<GenerateMarketingCopyOutput> => {
    // Use failover system for generation
    const failoverResult = await generateSingleWithFailover({
      prompt: `You are a social media marketing expert specializing in fashion e-commerce.

Product Title: ${input.title}
Product Description: ${input.description}

Based on this product information, create engaging marketing content:

1. A catchy social media post for Instagram/Facebook (include relevant hashtags)
2. A list of 5-7 SEO keywords for this product

Please respond with a JSON object containing:
- socialMediaPost: The social media post text with hashtags
- seoKeywords: Array of keyword strings`,
      model: 'googleai/gemini-2.0-flash',
      config: {
        temperature: 0.8,
        candidateCount: 1,
      },
    }, input.apiKey);

    if (failoverResult.success && failoverResult.result) {
        try {
            // Parse the JSON response - extract text from GenerateResponse object
            const responseText = failoverResult.result.text || '';
            // Clean the response text by removing markdown code blocks
            const cleanedText = responseText.replace(/```json\s*|\s*```/g, '').trim();
            const parsed = JSON.parse(cleanedText);
            return {
                socialMediaPost: parsed.socialMediaPost || '',
                seoKeywords: parsed.seoKeywords || [],
                attempts: failoverResult.attempts
            };
        } catch (parseError) {
            // If JSON parsing fails, try to extract from text
            const text = failoverResult.result.text || '';
            const postMatch = text.match(/socialMediaPost[:\s]*["']?([^"'\n]+)["']?/i);
            const keywordsMatch = text.match(/seoKeywords[:\s]*\[([^\]]+)\]/i);

            return {
                socialMediaPost: postMatch?.[1]?.trim() || 'Check out this amazing product! #fashion #style',
                seoKeywords: keywordsMatch?.[1]?.split(',').map((k: string) => k.trim().replace(/['"]/g, '')) || ['fashion', 'style', 'clothing'],
                attempts: failoverResult.attempts
            };
        }
    } else {
        // Handle failure case
        const failureSummary = failoverResult.keyResult.errors ? {
            totalAttempts: failoverResult.keyResult.errors.length,
            quotaExceeded: failoverResult.keyResult.errors.filter(e => e.errorType === 'quota_exceeded').length,
            invalidKeys: failoverResult.keyResult.errors.filter(e => e.errorType === 'invalid_key').length,
            networkErrors: failoverResult.keyResult.errors.filter(e => e.errorType === 'network_error').length,
            unknownErrors: failoverResult.keyResult.errors.filter(e => e.errorType === 'unknown_error').length,
        } : undefined;

        return {
            socialMediaPost: '',
            seoKeywords: [],
            error: failoverResult.error || 'UNKNOWN_ERROR',
            allKeysExhausted: failoverResult.keyResult.allKeysExhausted,
            failureSummary,
            attempts: failoverResult.attempts
        };
    }
};
