/**
 * Garment-specific AI prompts for professional e-commerce photography
 * Each garment category has specialized prompts optimized for that clothing type
 */

import { getGarmentSubcategory } from '@/lib/garment-categories';

export interface PromptSet {
  modelFront: string;
  modelAngle: string;
  ghostMannequin: string;
  flatLay: string;
  lifestyle: string;
}

export const getGarmentSpecificPrompts = (
  category: string,
  subcategory: string,
  description: string,
  modelRequirements: string
): PromptSet => {
  const subcategoryData = getGarmentSubcategory(category, subcategory);
  const cameraFocus = subcategoryData?.cameraFocus || 'full_body';
  const poseStyle = subcategoryData?.poseStyle || 'casual';
  
  // Create garment-specific focus instruction
  const garmentFocus = createGarmentFocus(category, subcategory, description);
  
  // Get camera and pose specifications
  const cameraSpecs = getCameraSpecifications(cameraFocus);
  const poseSpecs = getPoseSpecifications(poseStyle, cameraFocus);
  
  return {
    modelFront: createModelFrontPrompt(garmentFocus, modelRequirements, cameraSpecs, poseSpecs),
    modelAngle: createModelAnglePrompt(garmentFocus, modelRequirements, cameraSpecs, poseSpecs),
    ghostMannequin: createGhostMannequinPrompt(garmentFocus, cameraSpecs),
    flatLay: createFlatLayPrompt(garmentFocus, category),
    lifestyle: createLifestylePrompt(garmentFocus, modelRequirements, poseStyle)
  };
};

const createGarmentFocus = (category: string, subcategory: string, description: string): string => {
  const subcategoryData = getGarmentSubcategory(category, subcategory);
  const garmentName = subcategoryData?.label || 'garment';
  
  let focusInstruction = `GARMENT FOCUS: Focus specifically on the ${garmentName.toUpperCase()}. `;
  
  switch (category) {
    case 'shirts':
      focusInstruction += `Ensure the shirt is the main subject and clearly visible. Pay attention to the shirt's collar, sleeves, fit, buttons, fabric texture, and overall styling. `;
      break;
    case 'pants':
      focusInstruction += `Ensure the pants are the main subject and clearly visible. Pay attention to the pants' fit, length, waistline, leg shape, fabric, and overall styling. `;
      break;
    case 'outerwear':
      focusInstruction += `Ensure the outerwear is the main subject and clearly visible. Pay attention to the jacket's lapels, buttons, fit, structure, fabric, and overall styling. `;
      break;
    case 'formal_wear':
      focusInstruction += `Ensure the formal wear is the main subject and clearly visible. Pay attention to the suit's fit, lapels, buttons, fabric quality, and professional styling. `;
      break;
    case 'activewear':
      focusInstruction += `Ensure the activewear is the main subject and clearly visible. Pay attention to the garment's athletic fit, performance features, fabric technology, and sporty styling. `;
      break;
    case 'accessories':
      focusInstruction += `Ensure the accessory is the main subject and clearly visible. Pay attention to the accessory's design, material, craftsmanship, and styling details. `;
      break;
    case 'footwear':
      focusInstruction += `Ensure the footwear is the main subject and clearly visible. Pay attention to the shoes' design, material, construction, sole, and overall styling. `;
      break;
    case 'undergarments':
      focusInstruction += `Ensure the undergarment is the main subject and clearly visible. Pay attention to the garment's fit, comfort features, fabric, and construction quality. `;
      break;
    default:
      focusInstruction += `Ensure the garment is the main subject and clearly visible. Pay attention to the garment's fit, style, fabric, and overall appearance. `;
  }
  
  if (description) {
    focusInstruction += `The ${garmentName.toLowerCase()} is described as: ${description}. `;
  }
  
  return focusInstruction;
};

const getCameraSpecifications = (cameraFocus: string): string => {
  switch (cameraFocus) {
    case 'upper_body':
      return `CAMERA SPECIFICATIONS:
- Shot with Canon 5D Mark IV or similar professional DSLR
- 85mm portrait lens for natural perspective and compression
- Focus from chest to head, ensuring upper body garment is prominently featured
- Aperture f/5.6 for sharp garment details with slight background blur
- ISO 100 for maximum image quality`;
      
    case 'lower_body':
      return `CAMERA SPECIFICATIONS:
- Shot with Canon 5D Mark IV or similar professional DSLR
- 70-200mm lens for compression and detail capture
- Focus from waist to feet, ensuring lower body garment is prominently featured
- Aperture f/8 for sharp details throughout the garment
- ISO 100 for maximum image quality`;
      
    case 'full_body':
      return `CAMERA SPECIFICATIONS:
- Shot with Canon 5D Mark IV or similar professional DSLR
- 24-70mm lens for full body coverage with natural perspective
- Full body shot showing complete garment and styling
- Aperture f/8 for sharp details throughout
- ISO 100 for maximum image quality`;
      
    case 'accessory':
      return `CAMERA SPECIFICATIONS:
- Shot with Canon 5D Mark IV or similar professional DSLR
- 100mm macro lens for detailed accessory photography
- Close-up focus on accessory details and craftsmanship
- Aperture f/11 for maximum depth of field and sharpness
- ISO 100 for maximum image quality`;
      
    case 'feet':
      return `CAMERA SPECIFICATIONS:
- Shot with Canon 5D Mark IV or similar professional DSLR
- 85mm lens for natural perspective on footwear
- Focus on feet and lower legs, showcasing footwear prominently
- Aperture f/8 for sharp details throughout the shoes
- ISO 100 for maximum image quality`;
      
    default:
      return `CAMERA SPECIFICATIONS:
- Shot with Canon 5D Mark IV or similar professional DSLR
- 85mm portrait lens for natural perspective
- Professional studio lighting with softbox setup
- Aperture f/8 for sharp details throughout
- ISO 100 for maximum image quality`;
  }
};

const getPoseSpecifications = (poseStyle: string, cameraFocus: string): string => {
  let poseBase = '';
  
  switch (poseStyle) {
    case 'formal':
      poseBase = `POSE & STYLING:
- Professional, confident stance with excellent posture
- Hands positioned naturally at sides or one hand on hip
- Serious yet approachable facial expression
- Perfect grooming and formal styling
- Garment should fit impeccably and be properly styled`;
      break;
      
    case 'casual':
      poseBase = `POSE & STYLING:
- Relaxed, natural pose with confident body language
- Hands in pockets, crossed arms, or natural gestures
- Genuine, friendly expression with slight smile
- Casual yet polished grooming and styling
- Garment should look effortlessly styled`;
      break;
      
    case 'athletic':
      poseBase = `POSE & STYLING:
- Dynamic, energetic pose suggesting movement or activity
- Athletic stance with engaged posture
- Confident, determined expression
- Athletic grooming and styling appropriate for sports
- Garment should showcase performance and fit`;
      break;
      
    case 'fashion':
      poseBase = `POSE & STYLING:
- Editorial fashion pose with artistic flair
- Creative hand positioning and body angles
- Striking, model-like expression
- High-fashion grooming and avant-garde styling
- Garment should be styled for maximum visual impact`;
      break;
      
    case 'static':
      poseBase = `POSE & STYLING:
- Clean, simple presentation focused on the garment
- Minimal pose to avoid distraction from the product
- Neutral expression or no model if appropriate
- Professional styling focused on garment presentation
- Garment should be the clear focal point`;
      break;
      
    default:
      poseBase = `POSE & STYLING:
- Natural, confident pose appropriate for the garment type
- Hands positioned naturally and comfortably
- Genuine expression with slight smile
- Professional grooming and styling
- Garment should fit perfectly and be well-styled`;
  }
  
  // Add camera focus specific adjustments
  if (cameraFocus === 'upper_body') {
    poseBase += `\n- Upper body positioning is critical for garment showcase
- Ensure shoulders are square and garment drapes naturally`;
  } else if (cameraFocus === 'lower_body') {
    poseBase += `\n- Lower body positioning is critical for garment showcase
- Ensure proper stance to show garment fit and drape`;
  } else if (cameraFocus === 'feet') {
    poseBase += `\n- Foot positioning is critical for footwear showcase
- Ensure shoes are clean and properly laced/styled`;
  }
  
  return poseBase;
};

const createModelFrontPrompt = (
  garmentFocus: string,
  modelRequirements: string,
  cameraSpecs: string,
  poseSpecs: string
): string => {
  return `Create a hyper-realistic, commercial-grade e-commerce product photograph. Feature a professional fashion model wearing the garment, photographed from the front in a classic portrait style.

${garmentFocus}

MODEL REQUIREMENTS:
- ${modelRequirements}
- ${poseSpecs}

${cameraSpecs}

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
};

const createModelAnglePrompt = (
  garmentFocus: string,
  modelRequirements: string,
  cameraSpecs: string,
  poseSpecs: string
): string => {
  return `Generate a premium e-commerce lifestyle photograph featuring a professional model wearing the garment. This should be a three-quarter angle shot with editorial styling.

${garmentFocus}

MODEL & POSE:
- ${modelRequirements}, in confident, dynamic pose
- Three-quarter turn showing garment from side angle
- Natural movement - walking stance or casual turn
- ${poseSpecs}

${cameraSpecs}

ENVIRONMENT:
- Clean, modern studio environment
- Subtle textured background (light gray or off-white)
- Professional lighting with gradient backdrop
- Minimal shadows, perfect exposure
- High-end fashion photography aesthetic

FINAL SPECIFICATIONS:
- Editorial fashion photography quality
- Perfect garment presentation and fit
- Professional color grading and retouching
- Suitable for premium e-commerce and marketing use`;
};

const createGhostMannequinPrompt = (garmentFocus: string, cameraSpecs: string): string => {
  return `Create a professional ghost mannequin product photograph showing the garment's shape and fit without a visible model. This technique should showcase the garment's natural drape and construction.

${garmentFocus}

GHOST MANNEQUIN TECHNIQUE:
- Invisible mannequin effect showing garment's natural shape
- Perfect fit and drape as if worn by an invisible person
- Clean, professional presentation without visible support
- Focus on garment construction and silhouette

${cameraSpecs}

LIGHTING & BACKGROUND:
- Pure white seamless background (RGB 255,255,255)
- Even, shadowless lighting from multiple angles
- No harsh shadows or color casts
- Perfect exposure for garment details
- Professional product photography lighting

FINAL QUALITY:
- Commercial product photography standard
- Perfect for e-commerce product pages
- Clean, distraction-free presentation
- Maximum garment detail visibility`;
};

const createFlatLayPrompt = (garmentFocus: string, category: string): string => {
  const isAccessoryOrFootwear = category === 'accessories' || category === 'footwear';
  
  return `Create a professional flat lay product photograph showing the garment laid out naturally and styled attractively.

${garmentFocus}

FLAT LAY STYLING:
- Garment laid flat and naturally styled
- ${isAccessoryOrFootwear ? 'Product arranged for optimal detail visibility' : 'Sleeves and legs positioned naturally'}
- ${isAccessoryOrFootwear ? 'Clean, organized presentation' : 'Smooth fabric without wrinkles or creases'}
- Professional styling and arrangement
- Focus on garment details and construction

CAMERA & LIGHTING:
- Shot from directly above (bird's eye view)
- Even, shadowless lighting across entire surface
- Pure white background (RGB 255,255,255)
- Perfect exposure for fabric texture and details
- No color casts or unwanted reflections

FINAL SPECIFICATIONS:
- High-resolution product photography
- Perfect for e-commerce and catalog use
- Clean, professional presentation
- Maximum detail visibility and clarity`;
};

const createLifestylePrompt = (
  garmentFocus: string,
  modelRequirements: string,
  poseStyle: string
): string => {
  const environmentStyle = poseStyle === 'formal' ? 'upscale urban or office environment' :
                          poseStyle === 'athletic' ? 'modern gym or outdoor athletic setting' :
                          'contemporary lifestyle setting';
  
  return `Create a premium lifestyle photograph featuring the garment in a real-world context. This should feel aspirational yet authentic, showing how the garment fits into the wearer's lifestyle.

${garmentFocus}

LIFESTYLE CONTEXT:
- ${environmentStyle}
- Natural, candid moment that feels authentic
- Model interacting naturally with environment
- Aspirational yet relatable lifestyle presentation
- Perfect garment styling within the scene

MODEL & ENVIRONMENT:
- ${modelRequirements}
- Natural interaction with surroundings
- Confident, genuine expression and body language
- Professional styling appropriate for the setting
- Garment should look effortlessly integrated

PHOTOGRAPHY STYLE:
- Editorial lifestyle photography aesthetic
- Natural lighting or professional lighting that mimics natural
- Shallow depth of field to isolate subject
- Rich colors and professional color grading
- High-end commercial photography quality

FINAL QUALITY:
- Professional commercial quality
- Perfect for social media and e-commerce
- Aspirational yet relatable
- High engagement potential`;
};
