
import { GoogleGenAI, Type } from "@google/genai";
import { StencilStyle, ArtistInsights, StencilOptions } from "../types";

// Using Flash models for better availability and performance while maintaining high fidelity
const IMAGE_MODEL = 'gemini-2.5-flash-image';
const TEXT_MODEL = 'gemini-3-flash-preview';
//gemini-2.5-flash-image//
/**
 * Compresses a Base64 image string by resizing and lowering quality.
 * Useful for staying under Firestore's 1MB document limit.
 */
export const compressImage = (base64Str: string, maxWidth: number = 800, quality: number = 0.6, type: string = 'image/jpeg'): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = (maxWidth / width) * height;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // If exporting to JPEG, fill with white first to prevent transparent areas from turning black
        if (type === 'image/jpeg') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
        }
        ctx.drawImage(img, 0, 0, width, height);
      }
      resolve(canvas.toDataURL(type, quality));
    };
    img.onerror = () => resolve(base64Str); // Fallback to original if error
  });
};

/**
 * Upscales a Base64 image string to target dimensions using canvas.
 */
export const upscaleImage = (base64Str: string, targetWidth: number, targetHeight: number): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Use high-quality image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
      }
      resolve(canvas.toDataURL('image/png')); // Export as PNG for download
    };
    img.onerror = () => resolve(base64Str);
  });
};

/**
 * Converts a File object to a full Data URL.
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Utility to strip the Data URL prefix for Gemini API.
 */
const stripDataUrlPrefix = (dataUrl: string) => dataUrl.split(',')[1];

/**
 * Maps an image's dimensions to the nearest supported Gemini aspect ratio.
 */
const getNearestAspectRatio = (width: number, height: number): "1:1" | "3:4" | "4:3" | "9:16" | "16:9" => {
  const ratio = width / height;
  const supported = [
    { name: "1:1", value: 1 },
    { name: "3:4", value: 3/4 },
    { name: "4:3", value: 4/3 },
    { name: "9:16", value: 9/16 },
    { name: "16:9", value: 16/9 }
  ];
  
  const closest = supported.reduce((prev, curr) => 
    Math.abs(curr.value - ratio) < Math.abs(prev.value - ratio) ? curr : prev
  );
  
  return closest.name as any;
};

/**
 * Analyzes the image to provide professional tattoo technical insights.
 */
export const analyzeTattooTechnique = async (input: File | string, language: string): Promise<ArtistInsights> => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined in the environment.");
  }
  const ai = new GoogleGenAI({ apiKey });
  
  // Use a smaller version for analysis to save bandwidth and speed up processing
  const fullDataUrl = typeof input === 'string' ? input : await fileToBase64(input);
  const compressedDataUrl = await compressImage(fullDataUrl, 512, 0.7);
  const base64Data = stripDataUrlPrefix(compressedDataUrl);
  const mimeType = 'image/jpeg';
  
  const prompt = `
    As a master tattoo artist, analyze this image for a tattoo project.
    IMPORTANT: Provide all descriptive text (needle descriptions, complexity level, color names, time estimates) EXCLUSIVELY in ${language === 'de' ? 'German' : 'English'}.
    1. Complexity level: [Minimal, Moderate, High, Extreme] (translate these words to ${language === 'de' ? 'German' : 'English'} too).
    2. Estimated session time (in ${language === 'de' ? 'German' : 'English'}).
    3. Exactly 5 specific needle recommendations (e.g., 3RL, 7RS) with a short description in ${language === 'de' ? 'German' : 'English'} of what each is used for.
    4. A professional color palette of 6-8 essential tones with color names in ${language === 'de' ? 'German' : 'English'}.
    Return only valid JSON.
  `;

  const response = await ai.models.generateContent({
    model: TEXT_MODEL,
    contents: {
      parts: [
        { inlineData: { mimeType, data: base64Data } },
        { text: prompt }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          complexity: { type: Type.STRING },
          estTime: { type: Type.STRING },
          needles: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING },
                description: { type: Type.STRING }
              },
              required: ["type", "description"]
            },
          },
          palette: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                hex: { type: Type.STRING }
              },
              required: ["name", "hex"]
            }
          }
        },
        required: ["complexity", "estTime", "needles", "palette"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
};

/**
 * Generates a high-quality tattoo stencil instantly in the browser using Sobel edge detection.
 * Highly optimized to provide a seamless, instantaneous backup experience.
 */
export const generateClientSideStencil = (
  base64Str: string,
  strength: number,
  lineColor: string,
  backgroundMode: 'white' | 'transparent',
  invert: boolean
): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(base64Str);
        return;
      }
      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      const w = canvas.width;
      const h = canvas.height;

      // 1. Convert to grayscale and store in a single-channel array
      const gray = new Uint8ClampedArray(w * h);
      for (let i = 0; i < data.length; i += 4) {
        gray[i / 4] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      }

      // 2. Apply Sobel Edge Detection
      const edges = new Float32Array(w * h);
      const kx = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
      const ky = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

      for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          let gX = 0;
          let gY = 0;
          for (let cy = -1; cy <= 1; cy++) {
            for (let cx = -1; cx <= 1; cx++) {
              const val = gray[(y + cy) * w + (x + cx)];
              const kIdx = (cy + 1) * 3 + (cx + 1);
              gX += val * kx[kIdx];
              gY += val * ky[kIdx];
            }
          }
          edges[y * w + x] = Math.sqrt(gX * gX + gY * gY);
        }
      }

      // 3. Parse lineColor
      const rC = parseInt(lineColor.slice(1, 3), 16) || 0;
      const gC = parseInt(lineColor.slice(3, 5), 16) || 0;
      const bC = parseInt(lineColor.slice(5, 7), 16) || 0;

      // 4. Threshold & Create Stencil (strength controls sensitivity: lower strength means fewer edges)
      // strength: 0 to 1. Threshold values around 10 to 90.
      const threshold = (1.1 - strength) * 80;

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const idx = (y * w + x) * 4;
          const edgeVal = edges[y * w + x];

          // Is it an edge?
          const isEdge = edgeVal > threshold;

          if (isEdge) {
            // Draw edge in line color
            data[idx] = rC;
            data[idx + 1] = gC;
            data[idx + 2] = bC;
            data[idx + 3] = 255;
          } else {
            // Draw background (white or transparent)
            if (backgroundMode === 'transparent') {
              data[idx] = 0;
              data[idx + 1] = 0;
              data[idx + 2] = 0;
              data[idx + 3] = 0; // transparent
            } else {
              data[idx] = 255;
              data[idx + 1] = 255;
              data[idx + 2] = 255;
              data[idx + 3] = 255; // white
            }
          }
        }
      }

      // Apply invert if selected
      if (invert) {
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] > 0) { // only invert visible pixels
            data[i] = 255 - data[i];
            data[i + 1] = 255 - data[i + 1];
            data[i + 2] = 255 - data[i + 2];
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => resolve(base64Str);
    img.src = base64Str;
  });
};

/**
 * Generates an enhanced tattoo stencil using Gemini.
 */
export const generateStencil = async (
  input: File | string, 
  style: StencilStyle, 
  strength: number,
  options: Omit<StencilOptions, 'style' | 'strength'>
): Promise<{ stencilImage: string; dimensions: { width: number; height: number } }> => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined in the environment.");
  }
  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const fullDataUrl = typeof input === 'string' ? input : await fileToBase64(input);
    
    // Determine dimensions and aspect ratio
    const img = new Image();
    const dimensionsPromise = new Promise<{width: number, height: number}>((resolve) => {
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.src = fullDataUrl;
    });
    const dims = await dimensionsPromise;

    // Check if Instant (Client-Side) style is selected
    if (style.id === 'instant') {
      const clientStencil = await generateClientSideStencil(
        fullDataUrl,
        strength,
        options.lineColor || '#000000',
        options.backgroundMode === 'transparent' ? 'transparent' : 'white',
        !!options.invert
      );
      return {
        stencilImage: clientStencil,
        dimensions: dims
      };
    }

    const targetRatio = getNearestAspectRatio(dims.width, dims.height);

    // Compress/Resize for generation - 768px is the sweet spot for fast generation and extreme detail balance
    const compressedDataUrl = dims.width > 768 || dims.height > 768 
      ? await compressImage(fullDataUrl, 768, 0.8, 'image/jpeg') 
      : fullDataUrl;
      
    const base64Data = stripDataUrlPrefix(compressedDataUrl);
    const mimeType = compressedDataUrl.startsWith('data:image/jpeg') ? 'image/jpeg' : 'image/png';

    let detailIntensityText = "";
    if (strength <= 0.3) {
      detailIntensityText = "MINIMALIST LINE ART: Extract ONLY the primary structural outer contours and key defining shapes. Omit micro-textures, fine shading lines, and complex interior hatching.";
    } else if (strength <= 0.7) {
      detailIntensityText = "BALANCED DETAIL & CLARITY: Trace main outlines and major key interior feature boundaries with clean line art.";
    } else {
      detailIntensityText = "MAXIMUM TECHNICAL DENSITY: Map all subtle details, texture boundaries, shadow zones, and intricate nuances as fine precision line art.";
    }

    const hasCustomPrompt = options.customPrompt && options.customPrompt.trim().length > 0;
    const hasStyleModifier = style.promptModifier && style.promptModifier.trim().length > 0 && style.promptModifier !== 'INSTANT_CLIENT_SIDE';

    const promptParts: string[] = [];

    // TIER 1: HIGHEST PRIORITY - CUSTOM ARTIST INSTRUCTIONS
    if (hasCustomPrompt) {
      promptParts.push(`
========================================================================
CRITICAL ARTIST DIRECTIVE - MANDATORY HIGHEST PRIORITY:
The artist has specified exact custom instructions for this stencil:
"${options.customPrompt.trim()}"

YOU MUST EXACTLY AND FAITHFULLY FOLLOW THESE CUSTOM INSTRUCTIONS ABOVE ALL ELSE.
If these custom instructions specify adding, removing, simplifying, or modifying any elements or changing line weights, style, or background, YOU MUST OVERRIDE ALL OTHER DEFAULT STENCIL RULES IN FAVOR OF THESE INSTRUCTIONS.
========================================================================
`);
    }

    // TIER 2: SELECTED STYLE DIRECTIVES
    if (hasStyleModifier) {
      promptParts.push(`
STYLE SPECIFICATION (${style.name}):
${style.promptModifier}
`);
    } else if (!hasCustomPrompt) {
      // Default realism freehand mapping rules if no custom prompt or style override exists
      promptParts.push(`
PRIMARY ROLE & STENCIL STYLE:
Master Realism Tattoo Stencil Artist. Create a clean, high-density professional tattoo stencil mapping covering the image's details with uniform, crisp line art.
- Draw distinct lines separating light vs shadow areas.
- Outline major expression boundaries and structural contours clearly.
- Maintain 1:1 spatial fidelity with the reference image.
`);
    }

    // TIER 3: TECHNICAL OUTPUT REQUIREMENTS
    promptParts.push(`
TECHNICAL STENCIL OUTPUT RULES:
1. Output MUST be an image containing ONLY clean stencil line art ready for printing on thermal stencil paper.
2. DO NOT include any photo background, realistic skin tones, shadows/gradients/fills, or camera frame elements.
3. Target Line Color: ${options.lineColor || '#000000'}.
4. Target Background: ${options.backgroundMode === 'transparent' ? 'strictly transparent' : 'solid clean white'}.
5. Line Inversion: ${options.invert ? 'INVERTED STENCIL (bright/white lines on dark canvas)' : 'STANDARD STENCIL (dark lines on light/transparent canvas)'}.
6. NO shading gradients, NO grayscale tones, NO soft blur. ONLY crisp, solid, high-contrast lines.

DETAIL LEVEL INTENSITY:
${detailIntensityText}
`);

    if (hasCustomPrompt) {
      promptParts.push(`
RE-EMPHASIS ON CUSTOM ARTIST DIRECTIVE:
Remember to strictly prioritize the artist's custom prompt: "${options.customPrompt.trim()}"
`);
    }

    const prompt = promptParts.join('\n\n');

    const config: any = {};
    if (IMAGE_MODEL.includes('-image')) {
      config.imageConfig = { 
        aspectRatio: targetRatio
      };
    }

    const response = await ai.models.generateContent({
      model: IMAGE_MODEL,
      contents: { parts: [{ inlineData: { mimeType, data: base64Data } }, { text: prompt }] },
      config
    });

    const parts = response.candidates?.[0]?.content?.parts;
    if (!parts) throw new Error("API response candidate or parts missing.");
    
    const imagePart = parts.find(p => p.inlineData);
    if (imagePart?.inlineData?.data) {
       return {
         stencilImage: `data:image/png;base64,${imagePart.inlineData.data}`,
         dimensions: dims
       };
    }
    throw new Error("No stencil image returned in response parts.");
  } catch (error: any) {
    console.error("Stencil generation error:", error);
    throw error;
  }
};

/**
 * Generates a tattoo design from a text prompt.
 */
export const generateTattooDesign = async (prompt: string): Promise<string[]> => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined in the environment.");
  }
  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: IMAGE_MODEL,
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    const results: string[] = [];
    const candidates = response.candidates || [];
    
    for (const candidate of candidates) {
      if (candidate.content?.parts) {
        for (const part of candidate.content.parts) {
          if (part.inlineData?.data) {
            results.push(`data:image/png;base64,${part.inlineData.data}`);
          }
        }
      }
    }

    if (results.length === 0) throw new Error("No designs were generated. Please try a different prompt.");
    return results;
  } catch (error: any) {
    console.error("Tattoo design generation error:", error);
    throw error;
  }
};

/**
 * Enhances an image using AI to improve clarity and detail.
 */
export const enhanceImage = async (input: File | string, strength: number = 3): Promise<string> => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined in the environment.");
  }
  const ai = new GoogleGenAI({ apiKey });
  const fullDataUrl = typeof input === 'string' ? input : await fileToBase64(input);
  const base64Data = stripDataUrlPrefix(fullDataUrl);
  const mimeType = typeof input === 'string' ? 'image/png' : input.type;
  
  try {
    // Generate an instruction that varies based on the strength
    let instruction;
    
    // Using a more structured prompt to completely prevent context shifts.
    const coreConstraint = "CRITICAL: You are an image-to-image AI upscaler. Enhance the EXACT input image. DO NOT change the background. DO NOT add objects. DO NOT hallucinate limbs, arms, or skin. Output ONLY an improved, sharper version of the original image with identical composition.\n";

    if (strength <= 2) {
      instruction = `${coreConstraint}Task: Light enhancement. Clarify the image gently. Reduce noise slightly. Keep it natural.`;
    } else if (strength === 3) {
      instruction = `${coreConstraint}Task: Standard upscale. Sharpen edges clearly. Remove blur and artifacting. Increase micro-contrast for better definition.`;
    } else {
      instruction = `${coreConstraint}Task: MAXIMAL aggressive over-sharpening for a tattoo stencil reference. Create extreme hyper-detail. Maximize edge clarity. Extract all possible textural details. Very crisp and highly focused.`;
    }

    const response = await ai.models.generateContent({
      model: IMAGE_MODEL,
      contents: {
        parts: [
          { inlineData: { mimeType, data: base64Data } },
          { text: instruction }
        ]
      }
    });

    const parts = response.candidates?.[0]?.content?.parts;
    if (!parts) throw new Error("API response candidate or parts missing.");
    
    const imagePart = parts.find(p => p.inlineData);
    if (imagePart?.inlineData?.data) {
       const aiResultUrl = `data:image/png;base64,${imagePart.inlineData.data}`;
       return await applyClientSideUpscale(aiResultUrl, strength);
    }
    throw new Error("No enhanced image returned in response parts.");
  } catch (error: any) {
    console.error("Image enhancement error:", error);
    throw error;
  }
};

/**
 * Physically scales up the image using HTML5 Canvas up to 400% based on strength.
 * Also applies a sharpening convolution matrix to guarantee crispness.
 */
async function applyClientSideUpscale(base64Image: string, strength: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scaleMap: Record<number, number> = {
        1: 1,      // 100%
        2: 1.5,    // 150%
        3: 2,      // 200%
        4: 3,      // 300%
        5: 4       // 400% (Max)
      };
      
      const scaleFactor = scaleMap[strength] || 2;
      const targetWidth = Math.round(img.width * scaleFactor);
      const targetHeight = Math.round(img.height * scaleFactor);

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(base64Image); // Fallback
        return;
      }

      // High quality smoothing for upscale
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      // Apply sharpening filter if strength is high
      if (strength >= 2) {
        const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
        
        // Sharpen convolution matrix
        // The higher the strength, the stronger the center weight
        let centerWeight = 5;
        let edgeWeight = -1;

        if (strength === 3) { centerWeight = 6; edgeWeight = -1.25; }
        if (strength === 4) { centerWeight = 7; edgeWeight = -1.5; }
        if (strength === 5) { centerWeight = 9; edgeWeight = -2; } // Aggressive sharpen

        const mix = new Float32Array(data.length);
        for (let i = 0; i < data.length; i++) {
          mix[i] = data[i]; // copy original
        }

        // Apply simple 3x3 sharpen kernel
        for (let y = 1; y < height - 1; y++) {
          for (let x = 1; x < width - 1; x++) {
            const idx = (y * width + x) * 4;
            const top = ((y - 1) * width + x) * 4;
            const bottom = ((y + 1) * width + x) * 4;
            const left = (y * width + (x - 1)) * 4;
            const right = (y * width + (x + 1)) * 4;

            for (let c = 0; c < 3; c++) { // RGB only
              let val = 
                  data[idx + c] * centerWeight +
                  data[top + c] * edgeWeight +
                  data[bottom + c] * edgeWeight +
                  data[left + c] * edgeWeight +
                  data[right + c] * edgeWeight;
              
              mix[idx + c] = Math.min(255, Math.max(0, val));
            }
          }
        }

        for (let i = 0; i < data.length; i++) {
          data[i] = mix[i];
        }
        ctx.putImageData(imageData, 0, 0);
      }

      resolve(canvas.toDataURL('image/png', 1.0));
    };
    img.onerror = () => reject(new Error("Failed to process image upscaling"));
    img.src = base64Image;
  });
}
