import React, { useMemo } from 'react';
import { Pipette, FlaskConical, X } from 'lucide-react';
import { Language } from '../types';

interface ColorMixCalculatorProps {
  targetHex: string;
  onClose: () => void;
  language: Language;
  translations: any;
}

const ColorMixCalculator: React.FC<ColorMixCalculatorProps> = ({ targetHex, onClose, language, translations: t }) => {
  const mix = useMemo(() => {
    // Basic Ink Mixing Logic for Tattoo Artists (Simplified CMYK/RYB approach)
    const r = parseInt(targetHex.slice(1, 3), 16);
    const g = parseInt(targetHex.slice(3, 5), 16);
    const b = parseInt(targetHex.slice(5, 7), 16);

    // Normalize
    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;

    // Calculate Brightness/Shade
    const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // In tattoo mixing: 
    // High brightness -> More White
    // Low brightness -> More Black
    // Colorfulness -> Base Pigment
    
    const max = Math.max(rNorm, gNorm, bNorm);
    const min = Math.min(rNorm, gNorm, bNorm);
    const saturation = max === 0 ? 0 : (max - min) / max;

    // We assume a standard 10-part mix (for 10 drops/parts)
    let whiteParts = Math.round(brightness * 8);
    let blackParts = Math.round((1 - brightness) * 4);
    let pigmentParts = Math.round(saturation * 6);

    // Normalize to a total of 10 drops for ease of use
    const total = whiteParts + blackParts + pigmentParts;
    const factor = 10 / (total || 1);
    
    whiteParts = Math.round(whiteParts * factor);
    blackParts = Math.round(blackParts * factor);
    pigmentParts = Math.max(1, 10 - whiteParts - blackParts);

    // Determine Base Pigment and its Hex Color
    let pigmentName = "Yellow";
    let pigmentHex = "#eab308"; // yellow-500
    
    if (r > g && r > b) {
      pigmentName = language === 'es' ? "Rojo" : "Red";
      pigmentHex = "#ef4444"; // red-500
    } else if (g > r && g > b) {
      pigmentName = language === 'es' ? "Verde/Amarillo" : "Green/Yellow";
      pigmentHex = "#22c55e"; // green-500
    } else if (b > r && b > g) {
      pigmentName = language === 'es' ? "Azul" : "Blue";
      pigmentHex = "#3b82f6"; // blue-500
    }

    return { whiteParts, blackParts, pigmentParts, pigmentName, pigmentHex };
  }, [targetHex, language]);

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden animate-in zoom-in-95 duration-200">
      <div className="bg-zinc-900 px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-orange-500" />
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">{t.mixTitle}</h4>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-zinc-800 rounded-md transition-colors">
          <X className="w-4 h-4 text-zinc-500" />
        </button>
      </div>

      <div className="p-5">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-xl border border-white/10 shadow-xl" style={{ backgroundColor: targetHex }} />
          <div>
            <div className="text-xs font-mono text-zinc-500 mb-1">{targetHex}</div>
            <p className="text-xs text-zinc-400 leading-relaxed italic">{t.mixSub}</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Base Pigment */}
          <div className="flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <div 
                className="w-3 h-3 rounded-full transition-colors" 
                style={{ 
                  backgroundColor: mix.pigmentHex,
                  boxShadow: `0 0 8px ${mix.pigmentHex}80` // 80 is 50% opacity in hex
                }} 
              />
              <span className="text-xs font-bold text-zinc-300 group-hover:text-white transition-colors">
                {t.basePigment} ({mix.pigmentName})
              </span>
            </div>
            <span className="text-xs font-mono text-zinc-500 bg-zinc-900 px-2 py-1 rounded border border-zinc-800">{mix.pigmentParts} {t.parts}</span>
          </div>

          {/* White */}
          <div className="flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
              <span className="text-xs font-bold text-zinc-300 group-hover:text-white transition-colors">{t.whiteInk}</span>
            </div>
            <span className="text-xs font-mono text-zinc-500 bg-zinc-900 px-2 py-1 rounded border border-zinc-800">{mix.whiteParts} {t.parts}</span>
          </div>

          {/* Black */}
          <div className="flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-black border border-zinc-700" />
              <span className="text-xs font-bold text-zinc-300 group-hover:text-white transition-colors">{t.blackInk}</span>
            </div>
            <span className="text-xs font-mono text-zinc-500 bg-zinc-900 px-2 py-1 rounded border border-zinc-800">{mix.blackParts} {t.parts}</span>
          </div>
        </div>

        {/* Visual Bar */}
        <div className="mt-8">
           <div className="flex h-3 w-full rounded-full overflow-hidden border border-white/5 shadow-inner">
              <div style={{ width: `${mix.pigmentParts * 10}%`, backgroundColor: mix.pigmentHex }} className="h-full transition-all duration-500" />
              <div style={{ width: `${mix.whiteParts * 10}%`, backgroundColor: '#ffffff' }} className="h-full transition-all duration-500" />
              <div style={{ width: `${mix.blackParts * 10}%`, backgroundColor: '#000000' }} className="h-full transition-all duration-500" />
           </div>
           <div className="flex justify-between mt-2 text-[8px] font-mono text-zinc-600 uppercase tracking-widest">
              <span>{language === 'es' ? 'Guía de proporción' : 'Mix ratio guide'}</span>
              <span>10 {t.totalDrops}</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ColorMixCalculator;