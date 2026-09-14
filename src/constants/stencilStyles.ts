import { StencilStyle, Language } from '../../types';

export const getBaseStencilStyles = (lang: Language): StencilStyle[] => [
  {
    id: 'instant',
    name: lang === 'de' ? 'Instant (Echtzeit)' : 'Instant (Real-time)',
    description: lang === 'de' ? 'Generiert das Stencil sofort lokal im Browser (ohne Wartezeit)' : 'Generates the stencil instantly locally in your browser (no waiting time)',
    promptModifier: 'INSTANT_CLIENT_SIDE'
  },
  {
    id: 'recommended',
    name: 'High Fidelity',
    description: lang === 'de' ? 'Meisterhafte Nachzeichnung: alles in gleichmäßigen feinen Linien für maximale Details' : 'Master trace: all uniform fine lines for maximum detail',
    promptModifier: `
        ROLE: Master "Mano Alzada" (Freehand) Realism Tattoo Stencil Artist.
  GOAL: Create the absolute best HIGH-DENSITY professional tattoo stencil that covers 100% of the original image's details using EXCLUSIVELY UNIFORM FINE LINES.
  
  UNIFORM FINE LINE ENFORCEMENT:
  - ALL LINES MUST BE THE EXACT SAME THIN WEIGHT (approx 0.5px - 1px).
  - NO variation in line thickness. NO bold lines.
  - The entire stencil must be a uniform, delicate, high-precision technical map.
  
  SHADOW & EXPRESSION DEFINITION:
  - CRITICAL: DRAW A FINE LINE AROUND EVERY SHADOW SHAPE AND EXPRESSION LINE.
  - Explicitly outline the exact boundary of every shadow area, no matter how small.
  - Trace all expression lines, wrinkles, and texture changes with a single distinct fine line.
  - Do not fill shadows; only outline their perimeter to create a map of the tones.
  
  VOLUMETRIC WRAPPING:
  - Lines must WRAP AROUND FORMS to define volume.
  - The lines tracing the shadows and details must follow the curvature of the anatomy or object (e.g., curving around a bicep, following the fold of cloth).
  - Use these wrapping lines to "sculpt" the 3D form on the 2D plane.
  
  DETAIL & CLARITY:
  - Maximize definition by separating every distinct area of value (light vs shadow) with a line.
  - Treat empty areas and highlights as shapes that must be outlined.
  - Result should be an intricate map of fine lines defining every nuance of the original image.
  
  TECHNICAL SPECS:
  - Clean black-only line art.
  - Single, uniform fine line weight for everything (outlines, details, shadow borders).
  - Maintain 1:1 spatial fidelity.
    `
  },
  {
    id: 'high-fidelity-v2',
    name: 'High Fidelity V2',
    description: lang === 'de' ? 'Fortgeschrittene topografische Karte mit Schatten-Mapping' : 'Advanced topographical map with shadow mapping',
    promptModifier: `
      ROLE: Master "Mano Alzada" (Freehand) Realism Tattoo Stencil Engineer.
      GOAL: Generate a high-density, professional-grade topographical tattoo map. Convert 100% of the image's details into a high-precision technical guide using exclusively fine lines.
 
      LINE WEIGHT & STYLE CONSTRAINTS:
      - UNIFORM WEIGHT: Use a constant, ultra-fine line weight (0.5px) for the entire image. No bolding or pressure variation.
      - SOLID LINES: Use solid fine lines for anatomical contours, hard edges, expression lines, and physical boundaries.
      - DASHED LINES (SHADOW MAPPING): Use fine DASHED lines to outline the perimeters of all shadow shapes and value transitions. These act as "islands" for shading zones.
      - NO SHADING: Strictly black lines on a white background. No gradients, no fills, no hatching.
 
      MAPPING & VOLUMETRIC LOGIC:
      - SHADOW PERIMETERS: Explicitly trace the "break" where light turns to shadow using dashed lines. Treat every value change as a shape that must be mapped.
      - WRAP-AROUND FLOW: All lines must follow the 3D geometry of the object. They do not just sit on top; they flow with the musculature and depth.
      - CLARITY: Ensure extreme readability. The stencil must look like a technical blueprint or a topographical elevation map.
    `
  },
  {
    id: 'fine-line',
    name: 'Micro-Line',
    description: 'Surgical precision for fine line work',
    promptModifier: 'Surgical fine-line stencil. Focus on hair-thin uniform lines, minimal shading, and high-contrast structural edges. No thick weights.'
  },
  {
    id: 'bold',
    name: 'Traditional',
    description: 'Thick, bold defined edges',
    promptModifier: 'Classic bold American Traditional stencil. Solid 3-pixel weight lines, clear boundaries, and high-impact structural forms.'
  }
];
