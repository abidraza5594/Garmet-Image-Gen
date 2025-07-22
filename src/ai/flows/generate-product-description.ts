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
  garmentCategory: z.string().optional().default('shirts').describe('The primary category of garment (shirts, pants, outerwear, etc.).'),
  garmentSubcategory: z.string().optional().default('dress_shirts').describe('The specific subcategory of garment (dress_shirts, jeans, blazers, etc.).'),
  garmentDescription: z.string().optional().default('').describe('Additional description of the garment characteristics and details.'),
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
    const garmentCategory = input.garmentCategory || 'shirts';
    const garmentSubcategory = input.garmentSubcategory || 'dress_shirts';
    const garmentDescription = input.garmentDescription || '';

    // Import garment categories to get subcategory info
    const { getGarmentSubcategory } = await import('@/lib/garment-categories');
    const subcategoryData = getGarmentSubcategory(garmentCategory, garmentSubcategory);
    const garmentName = subcategoryData?.label || 'garment';

    // Create garment-specific instructions
    let garmentSpecificInstructions = `Focus specifically on this ${garmentName.toUpperCase()}. `;

    switch (garmentCategory) {
      case 'shirts':
        garmentSpecificInstructions += `Pay attention to the shirt's collar style, sleeve length, fit, fabric, button details, and overall design. Consider use cases like office wear, casual outings, or formal events. `;
        break;
      case 'pants':
        garmentSpecificInstructions += `Pay attention to the pants' style, fit, length, waistline, leg shape, fabric, and overall design. Consider versatility for work, casual wear, or special occasions. `;
        break;
      case 'outerwear':
        garmentSpecificInstructions += `Pay attention to the jacket's lapels, buttons, fit, structure, fabric, and overall styling. Consider seasonal appropriateness and layering possibilities. `;
        break;
      case 'formal_wear':
        garmentSpecificInstructions += `Pay attention to the formal wear's fit, lapels, buttons, fabric quality, and professional styling. Emphasize business meetings, formal events, and professional occasions. `;
        break;
      case 'activewear':
        garmentSpecificInstructions += `Pay attention to the activewear's athletic fit, performance features, fabric technology, and sporty styling. Consider gym workouts, outdoor activities, and athletic performance. `;
        break;
      case 'accessories':
        garmentSpecificInstructions += `Pay attention to the accessory's design, material, craftsmanship, and styling details. Consider how it complements different outfits and occasions. `;
        break;
      case 'footwear':
        garmentSpecificInstructions += `Pay attention to the footwear's design, material, construction, sole, and overall styling. Consider comfort, durability, and style versatility. `;
        break;
      case 'undergarments':
        garmentSpecificInstructions += `Pay attention to the undergarment's fit, comfort features, fabric, and construction quality. Emphasize comfort, support, and everyday wearability. `;
        break;
      default:
        garmentSpecificInstructions += `Pay attention to the garment's style, fit, fabric, and overall design. Consider versatility and styling options. `;
    }

    if (garmentDescription) {
      garmentSpecificInstructions += `Additional details: ${garmentDescription}. `;
    }

    try {
        // Use failover system for generation
        const failoverResult = await generateSingleWithFailover({
      prompt: [
        {media: {url: input.garmentDataUri}},
        {text: `You are an expert e-commerce copywriter for high-end fashion brands like Zara and H&M.
Analyze the provided image of a ${garmentName}.
${garmentSpecificInstructions}
Based on the image, generate a compelling, SEO-friendly product title and a detailed product description.

The tone should be stylish, aspirational, and professional.
Focus on the ${garmentName}'s style, cut, fabric (if discernible), and potential use cases (e.g., "perfect for a summer brunch," "a versatile office staple").

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
    } catch (error) {
        console.error('Product Description Generation Error:', error);
        return {
            title: '',
            description: '',
            error: 'GENERATION_FAILED',
            allKeysExhausted: false,
            attempts: []
        };
    }
};
