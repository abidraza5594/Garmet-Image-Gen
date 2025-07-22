'use server';
/**
 * @fileOverview Generates e-commerce style product images for a given garment.
 *
 * - generateECommerceImages - A function that generates multiple model preview images.
 * - GenerateECommerceImagesInput - The input type for the function.
 * - GenerateECommerceImagesOutput - The return type for the function.
 */

// Removed ai import since we're using failover system
import {z} from 'zod';
import { generateMultipleImagesWithFailover } from '@/lib/ai-with-failover';
import { getGarmentSubcategory } from '@/lib/garment-categories';
import { getGarmentSpecificPrompts } from '@/ai/prompts/garment-specific-prompts';

const GenerateECommerceImagesInputSchema = z.object({
  garmentDataUri: z
    .string()
    .describe(
      "A photo of a garment, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
  modelGender: z.enum(['male', 'female', 'any']).optional().default('any').describe('The desired gender of the fashion model.'),
  modelAge: z.string().optional().default('18-25').describe('The desired age range of the fashion model (e.g., "18-25", "25-35").'),
  garmentCategory: z.string().optional().default('shirts').describe('The primary category of garment (shirts, pants, outerwear, etc.).'),
  garmentSubcategory: z.string().optional().default('dress_shirts').describe('The specific subcategory of garment (dress_shirts, jeans, blazers, etc.).'),
  garmentDescription: z.string().optional().default('').describe('Additional description of the garment characteristics and details.'),
  addWatermark: z.boolean().optional().describe("Whether to add a watermark to the images."),
  watermarkText: z.string().optional().describe("The text for the watermark."),
  apiKey: z.string().optional().describe('An optional API key to override the default.'),
});
export type GenerateECommerceImagesInput = z.infer<typeof GenerateECommerceImagesInputSchema>;

const GenerateECommerceImagesOutputSchema = z.object({
  generatedImages: z.array(z.object({
    imageUrl: z.string().describe('A generated e-commerce style photo as a data URI.'),
  })),
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
export type GenerateECommerceImagesOutput = z.infer<typeof GenerateECommerceImagesOutputSchema>;

export async function generateECommerceImages(
  input: GenerateECommerceImagesInput
): Promise<GenerateECommerceImagesOutput> {
  return generateECommerceImagesFlow(input);
}

const getModelRequirements = (gender: 'male' | 'female' | 'any', age: string) => {
  let genderDesc = "professional fashion model";
  if (gender === 'male') genderDesc = "professional male fashion model";
  if (gender === 'female') genderDesc = "professional female fashion model";
  
  return `Attractive, ${genderDesc} aged ${age} with good posture`;
};

const modelFrontPrompt = `Create a hyper-realistic, commercial-grade e-commerce product photograph. Feature a professional fashion model wearing the garment, photographed from the front in a classic portrait style.

MODEL REQUIREMENTS:
- {{{modelRequirements}}}
- Natural, confident expression with slight smile
- Hands positioned naturally at sides or on hips
- Perfect fit of the garment showing all details
- Professional grooming and styling

PHOTOGRAPHY SPECIFICATIONS:
- Shot with Canon 5D Mark IV or similar professional DSLR
- 85mm portrait lens for natural perspective
- Professional studio lighting with softbox setup
- Aperture f/8 for sharp details throughout
- ISO 100 for maximum image quality

LIGHTING & BACKGROUND:
- Pure white seamless background (RGB 255,255,255)
- Key light at 45-degree angle with large softbox
- Fill light to eliminate harsh shadows
- Background light for pure white backdrop
- No color casts or unwanted reflections

FINAL IMAGE QUALITY:
- 4K resolution minimum
- Tack sharp focus on the garment
- Perfect color accuracy and white balance
- Professional retouching level
- Ready for immediate e-commerce use`;

const modelAnglePrompt = `Generate a premium e-commerce lifestyle photograph featuring a professional model wearing the garment. This should be a three-quarter angle shot with editorial styling.

MODEL & POSE:
- {{{modelRequirements}}}, in confident, dynamic pose
- Three-quarter turn showing garment from side angle
- Natural movement - walking stance or casual turn
- Genuine expression - approachable yet aspirational
- Perfect garment fit and professional styling

CAMERA & TECHNICAL:
- Shot with professional medium format camera
- 70-200mm lens for compression and background blur
- Aperture f/5.6 for subject isolation
- Fast shutter speed to freeze natural movement
- Studio-quality lighting setup

ENVIRONMENT:
- Clean, modern studio environment
- Subtle textured background (light gray or off-white)
- Professional lighting with gradient backdrop
- Minimal shadows, perfect exposure
- High-end fashion photography aesthetic

FINAL OUTPUT:
- Commercial photography quality
- Sharp, detailed, and professionally retouched
- Perfect for luxury e-commerce websites
- Aspirational yet accessible styling
- High-resolution, print-ready quality`;

const ghostMannequinPrompt = `Create a perfect 'ghost mannequin' or 'invisible mannequin' product photograph - the gold standard for e-commerce product display. The garment should appear to be worn by an invisible body, maintaining its natural shape and fit.

GHOST MANNEQUIN TECHNIQUE:
- Garment appears to be worn but mannequin is completely invisible
- Natural drape and fit as if on a human body
- No visible mannequin parts, clips, or supports
- Perfect garment shaping with natural wrinkles and folds
- Professional invisible mannequin photography standard

TECHNICAL SPECIFICATIONS:
- Shot with macro lens for extreme detail capture
- Aperture f/11 for maximum depth of field
- Studio lighting with multiple angles for even illumination
- Focus stacking for complete sharpness
- Professional product photography setup

BACKGROUND & LIGHTING:
- Pure white background (RGB 255,255,255)
- Seamless, gradient-free backdrop
- Multiple studio lights for shadow-free illumination
- Perfect color temperature (5600K daylight)
- No reflections or hotspots on fabric

FINAL IMAGE STANDARDS:
- Ultra-high resolution for zoom capabilities
- Perfect color accuracy for online sales
- Professional retouching and cleanup
- Optimized for e-commerce platform requirements
- Industry-standard ghost mannequin quality`;

const flatLayPrompt = `Generate an expertly styled flat-lay product photograph with luxury e-commerce presentation. This should be a perfectly composed overhead shot with premium styling and professional execution.

FLAT-LAY COMPOSITION:
- Garment laid flat with perfect symmetry and styling
- Natural fabric drape and professional garment styling
- Overhead shot (bird's eye view) at perfect 90-degree angle
- Balanced composition following rule of thirds
- Premium lifestyle styling approach

SURFACE & PROPS:
- High-end surface: white marble, fine linen, or premium wood
- Subtle texture that complements but doesn't compete
- Minimal, luxury props if any (single elegant item maximum)
- Props should enhance, not distract from the garment
- Consistent color palette and luxury aesthetic

LIGHTING SETUP:
- Soft, even lighting across entire frame
- Large softbox or natural diffused window light
- No harsh shadows or blown highlights
- Perfect exposure for fabric texture visibility
- Professional product photography lighting

TECHNICAL QUALITY:
- Shot with tilt-shift lens for perfect perspective
- High resolution for detail examination
- Aperture f/8 for optimal sharpness
- Professional color grading and retouching
- Consistent with luxury brand standards

FINAL PRESENTATION:
- Instagram-worthy flat-lay aesthetic
- Perfect for social media and e-commerce
- Professional styling and composition
- Luxury brand presentation quality
- Ready for immediate commercial use`;

const lifestylePrompt = `Create a dynamic lifestyle e-commerce photograph showing the garment in real-world context. Feature a professional model wearing the garment in a natural, authentic setting.

MODEL & SCENARIO:
- Professional {{{modelRequirements}}} in authentic, natural pose
- Real-world activity appropriate to the garment
- Genuine expressions and natural body language
- Perfect garment fit in movement
- Lifestyle context that matches target audience

ENVIRONMENT:
- Authentic lifestyle setting (cafe, street, office, etc.)
- Natural lighting with professional enhancement
- Clean, uncluttered background
- Contextual elements that support the story
- Professional location scouting quality

PHOTOGRAPHY STYLE:
- Documentary-style authenticity
- Professional fashion photography execution
- Natural lighting enhanced with reflectors
- 50mm lens for natural perspective
- Aperture f/4 for subject isolation

FINAL RESULT:
- Authentic lifestyle imagery
- Professional commercial quality
- Perfect for social media and e-commerce
- Aspirational yet relatable
- High engagement potential`;

const generateECommerceImagesFlow = async (input: GenerateECommerceImagesInput): Promise<GenerateECommerceImagesOutput> => {
    const modelRequirements = getModelRequirements(input.modelGender || 'any', input.modelAge || '18-25');
    const garmentCategory = input.garmentCategory || 'shirts';
    const garmentSubcategory = input.garmentSubcategory || 'dress_shirts';
    const garmentDescription = input.garmentDescription || '';

    // Get specialized prompts for this garment type
    const promptSet = getGarmentSpecificPrompts(garmentCategory, garmentSubcategory, garmentDescription, modelRequirements);

    const watermarkInstruction = (input.addWatermark && input.watermarkText)
      ? `\n\nWATERMARK REQUIREMENT: Add a subtle, semi-transparent watermark with the text "${input.watermarkText}" in the bottom right corner. The watermark should be professional and discreet, not interfering with the product visibility.`
      : "";

    const prompts = [
        promptSet.modelFront,
        promptSet.modelAngle,
        promptSet.ghostMannequin,
        promptSet.flatLay,
        promptSet.lifestyle,
    ].map(p => `${p}${watermarkInstruction}`);

    const model = 'googleai/gemini-2.0-flash-preview-image-generation';

    // Prepare generation options for each prompt
    const generationOptions = prompts.map(promptText => ({
        prompt: [
            {media: {url: input.garmentDataUri}},
            {text: `Based on the provided garment image, ${promptText}`},
        ],
        model,
        config: {
            responseModalities: ['TEXT', 'IMAGE'],
            temperature: 0.3, // Lower temperature for more consistent results
            candidateCount: 1, // Generate single high-quality image
        },
    }));

    // Use failover system for generation
    const failoverResult = await generateMultipleImagesWithFailover(generationOptions, input.apiKey);

    if (failoverResult.success && failoverResult.result) {
        const generatedImages = failoverResult.result
            .map((result: any) => {
                // Extract media from the GenerateResponse message content
                const mediaContent = result.message?.content?.find((content: any) => content.media);
                return { imageUrl: mediaContent?.media?.url };
            })
            .filter((img: any): img is { imageUrl: string } => !!img.imageUrl);

        return {
            generatedImages,
            attempts: failoverResult.attempts
        };
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
            generatedImages: [],
            error: failoverResult.error || 'UNKNOWN_ERROR',
            allKeysExhausted: failoverResult.keyResult.allKeysExhausted,
            failureSummary,
            attempts: failoverResult.attempts
        };
    }
};
