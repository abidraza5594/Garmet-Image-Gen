'use server';
/**
 * @fileOverview Generates a product title and description for a garment image.
 *
 * - generateProductDescription - A function that generates the text.
 * - GenerateProductDescriptionInput - The input type for the function.
 * - GenerateProductDescriptionOutput - The return type for the function.
 */

// Removed ai import since we're using failover system
import {z} from 'zod';
import { generateSingleWithFailover } from '@/lib/ai-with-failover';

const GenerateProductDescriptionInputSchema = z.object({
  garmentDataUri: z
    .string()
    .describe(
      "A photo of a garment, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
  apiKey: z.string().optional().describe('An optional API key to override the default.'),
});
export type GenerateProductDescriptionInput = z.infer<typeof GenerateProductDescriptionInputSchema>;

const GenerateProductDescriptionOutputSchema = z.object({
  title: z.string().describe("A catchy, SEO-friendly title for the product. Keep it under 60 characters."),
  description: z.string().describe("A compelling and detailed product description, highlighting key features, fabric, and style. Aim for 2-3 paragraphs."),
  error: z.string().optional().describe("An error message if the generation failed, e.g., 'QUOTA_EXCEEDED' or 'MODEL_OVERLOADED'."),
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
export type GenerateProductDescriptionOutput = z.infer<typeof GenerateProductDescriptionOutputSchema>;

export async function generateProductDescription(
  input: GenerateProductDescriptionInput
): Promise<GenerateProductDescriptionOutput> {
  return generateProductDescriptionFlow(input);
}



const generateProductDescriptionFlow = async (input: GenerateProductDescriptionInput): Promise<GenerateProductDescriptionOutput> => {
    // Use failover system for generation
    const failoverResult = await generateSingleWithFailover({
      prompt: [
        {media: {url: input.garmentDataUri}},
        {text: `You are an expert e-commerce copywriter for high-end fashion brands like Zara and H&M.
Analyze the provided image of a garment.
Based on the image, generate a compelling, SEO-friendly product title and a detailed product description.

The tone should be stylish, aspirational, and professional.
Focus on the garment's style, cut, fabric (if discernible), and potential use cases (e.g., "perfect for a summer brunch," "a versatile office staple").

Please respond with a JSON object containing:
- title: A catchy, SEO-friendly title for the product (under 60 characters)
- description: A compelling and detailed product description (2-3 paragraphs)`}
      ],
      model: 'googleai/gemini-2.0-flash',
      config: {
        temperature: 0.7,
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
                title: parsed.title || '',
                description: parsed.description || '',
                attempts: failoverResult.attempts
            };
        } catch (parseError) {
            // If JSON parsing fails, try to extract title and description from text
            const text = failoverResult.result.text || '';
            const titleMatch = text.match(/title[:\s]*["']?([^"'\n]+)["']?/i);
            const descMatch = text.match(/description[:\s]*["']?([^"']+)["']?/i);

            return {
                title: titleMatch?.[1]?.trim() || 'Stylish Garment',
                description: descMatch?.[1]?.trim() || text.substring(0, 200) + '...',
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
            title: '',
            description: '',
            error: failoverResult.error || 'UNKNOWN_ERROR',
            allKeysExhausted: failoverResult.keyResult.allKeysExhausted,
            failureSummary,
            attempts: failoverResult.attempts
        };
    }
};
