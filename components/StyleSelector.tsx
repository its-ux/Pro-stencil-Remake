
import React, { useState, useEffect } from 'react';
import { CheckCircle2, Star, PenTool, Grip, Layers, Terminal, Sparkles, Zap } from 'lucide-react';
import { StencilStyle, Language } from '../types';
import { Tooltip } from './Tooltip';

interface StyleSelectorProps {
  styles: StencilStyle[];
  selectedStyleId: string;
  onSelectStyle: (id: string) => void;
  strength: number;
  onStrengthChange: (val: number) => void;
  disabled?: boolean;
  translations: any;
  language: Language;
  isAdmin?: boolean;
}

const StyleSelector: React.FC<StyleSelectorProps> = ({
  styles,
  selectedStyleId,
  onSelectStyle,
  strength,
  onStrengthChange,
  disabled,
  translations: t,
  language,
  isAdmin = false
}) => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [localStrength, setLocalStrength] = useState(strength);

  useEffect(() => {
    setLocalStrength(strength);
  }, [strength]);

  useEffect(() => {
    setShowPrompt(false);
  }, [selectedStyleId]);
  
  const getIconForStyle = (id: string) => {
      switch(id) {
          case 'recommended': return <Zap className="w-6 h-6 md:w-8 h-8 text-orange-500 fill-orange-500/20" />;
          case 'high-fidelity-v2': return <Star className="w-6 h-6 md:w-8 h-8 text-amber-400 fill-amber-400/20" />;
          case 'fine-line': return <PenTool className="w-6 h-6 md:w-8 h-8 text-zinc-200" />;
          case 'bold': return <Grip className="w-6 h-6 md:w-8 h-8 text-zinc-200" />;
          default: return <Sparkles className="w-6 h-6 md:w-8 h-8 text-zinc-200" />;
      }
  };

  const handleStrengthInput = (val: number) => {
    // Direct DOM updates for butter-smooth slider feel
    const fill = document.getElementById('strength-fill');
    if (fill) fill.style.width = `${val * 100}%`;
    const thumb = document.getElementById('strength-thumb');
    if (thumb) thumb.style.left = `calc(${val * 100}% - 10px)`;
    const valLabel = document.getElementById('strength-val');
    if (valLabel) valLabel.innerText = `${(val * 100).toFixed(0)}%`;
    
    // Also update the description text box if possible
    const descBox = document.getElementById('strength-desc');
    if (descBox) {
      let desc = '';
      let title = '';
      let color = '';
      if (val < 0.35) {
        title = t.minimal + ': ';
        desc = t.detailMinimalDesc;
        color = '#fb923c'; // orange-400
      } else if (val < 0.7) {
        title = t.balanced + ': ';
        desc = t.detailBalancedDesc;
        color = '#f97316'; // orange-500
      } else {
        title = t.intricate + ': ';
        desc = t.detailIntricateDesc;
        color = '#ea580c'; // orange-600
      }
      descBox.innerHTML = `<span style="color: ${color}; font-weight: bold; margin-right: 0.5rem; flex-shrink: 0;">${title}</span><span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${desc}</span>`;
    }
  };

  return (
    <div className={`w-full max-w-2xl bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 transition-opacity ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-zinc-600 font-bold text-sm">2</span>
            <h2 className="text-xl font-bold text-white">{t.styleTitle}</h2>
            <Tooltip content="Select a processing style optimized for different tattoo techniques." />
          </div>
          <p className="text-zinc-400 text-sm">{t.styleSub}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
        {styles.map((style) => {
          const isSelected = selectedStyleId === style.id;
          return (
            <div 
              key={style.id}
              onClick={() => !disabled && onSelectStyle(style.id)}
              className={`
                relative flex flex-col p-4 rounded-xl text-left transition-all duration-300 group cursor-pointer
                hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(255,255,255,0.03)]
                ${isSelected 
                  ? 'bg-orange-600/20 border-2 border-orange-600 shadow-xl shadow-black/20' 
                  : style.id === 'high-fidelity-v2'
                    ? 'bg-amber-900/10 border border-amber-500/30 hover:border-amber-500/50 hover:bg-amber-900/20'
                    : 'bg-black/40 backdrop-blur-sm border border-white/5 hover:border-white/20 hover:bg-black/60'
                }
              `}
            >
              {style.id === 'high-fidelity-v2' && (
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-400 to-amber-600 text-black text-[9px] font-black px-2 py-0.5 rounded shadow-lg z-10 uppercase tracking-tighter flex items-center gap-1 border border-white/20 animate-pulse">
                  <Star className="w-2 h-2 fill-black" />
                  {t.bestResults || 'Best Results'}
                </div>
              )}
              <div className="flex items-start gap-3 md:gap-4">
                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center shrink-0 mt-1 transition-colors ${style.id === 'high-fidelity-v2' && !isSelected ? 'bg-amber-950/40 border border-amber-500/20' : isSelected ? 'bg-zinc-700' : 'bg-zinc-800 group-hover:bg-zinc-700'}`}>
                    {getIconForStyle(style.id)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 mb-0.5">
                      <span className={`font-semibold text-sm transition-colors ${isSelected ? 'text-white' : 'text-zinc-200 group-hover:text-white'}`}>{style.name}</span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-orange-500 fill-orange-500/20" />}
                    </div>
                    <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed group-hover:text-zinc-400 transition-colors">{style.description}</p>
                    {isSelected && isAdmin && (
                      <button onClick={(e) => { e.stopPropagation(); setShowPrompt(!showPrompt); }} className="mt-3 inline-flex items-center gap-1.5 px-2 py-1 rounded bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-700/50 text-[10px] font-medium text-zinc-400 hover:text-zinc-200 transition-colors">
                        <Terminal className="w-3 h-3" />
                        {showPrompt ? 'Hide System Prompt' : 'View System Prompt'}
                      </button>
                    )}
                  </div>
              </div>
              {isSelected && isAdmin && showPrompt && (
                 <div className="mt-3 p-3 bg-black/40 rounded-lg border border-zinc-800 animate-in fade-in slide-in-from-top-1 cursor-text" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2 mb-2 text-zinc-500 text-[10px] uppercase font-bold tracking-wider sticky top-0 bg-zinc-900/40 backdrop-blur-sm pb-1"><Terminal className="w-3 h-3" /> System Prompt</div>
                    <div className="max-h-48 overflow-y-auto pr-2 custom-scrollbar text-left">
                      <pre className="text-[10px] font-mono text-zinc-400 whitespace-pre-wrap leading-relaxed break-words">{style.promptModifier}</pre>
                    </div>
                 </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-zinc-950/30 rounded-xl p-5 border border-zinc-800/50">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-zinc-400" />
            <label className="text-sm font-semibold text-white">{t.detailLevel}</label>
          </div>
          <span id="strength-val" className="text-xs font-mono bg-zinc-900 px-2 py-1 rounded text-zinc-300 border border-zinc-800">{(localStrength * 100).toFixed(0)}%</span>
        </div>
        <div id="strength-desc" className="mb-5 text-xs text-zinc-400 bg-zinc-900/50 p-2.5 rounded-lg border border-zinc-800/50 flex items-center gap-2 transition-all min-h-[40px]">
            {localStrength < 0.35 && <span className="text-orange-400 font-bold tracking-wide shrink-0">{t.minimal}:</span>}
            {localStrength >= 0.35 && localStrength < 0.7 && <span className="text-orange-500 font-bold tracking-wide shrink-0">{t.balanced}:</span>}
            {localStrength >= 0.7 && <span className="text-orange-600 font-bold tracking-wide shrink-0">{t.intricate}:</span>}
            <span className="truncate">
                {localStrength < 0.35 && t.detailMinimalDesc}
                {localStrength >= 0.35 && localStrength < 0.7 && t.detailBalancedDesc}
                {localStrength >= 0.7 && t.detailIntricateDesc}
            </span>
        </div>
        <div className="relative h-6 flex items-center mb-6 select-none group px-1">
            <div className="absolute left-0 right-0 h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div id="strength-fill" className="h-full bg-gradient-to-r from-orange-400 via-orange-500 to-orange-700 transition-all duration-150 ease-out" style={{ width: `${localStrength * 100}%` }} />
            </div>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.05" 
              defaultValue={localStrength} 
              disabled={disabled} 
              onInput={(e) => handleStrengthInput(parseFloat((e.target as HTMLInputElement).value))}
              onPointerUp={(e) => {
                const val = parseFloat((e.target as HTMLInputElement).value);
                setLocalStrength(val);
                if (val !== strength) onStrengthChange(val);
              }}
              onTouchEnd={(e) => {
                const val = parseFloat((e.target as HTMLInputElement).value);
                setLocalStrength(val);
                if (val !== strength) onStrengthChange(val);
              }}
              className="absolute w-full h-6 opacity-0 cursor-pointer z-20" 
            />
            <div id="strength-thumb" className="absolute h-5 w-5 bg-white rounded-full shadow-[0_0_15px_rgba(0,0,0,0.6)] border-2 border-zinc-200 pointer-events-none transition-all duration-75 ease-out z-10 group-hover:scale-110" style={{ left: `calc(${localStrength * 100}% - 10px)` }} />
        </div>
        <div className="grid grid-cols-3 gap-2">
            {[ { label: t.clean, value: 0.2 }, { label: t.standard, value: 0.5 }, { label: t.heavy, value: 0.9 } ].map((preset) => (
                <button key={preset.label} onClick={() => { setLocalStrength(preset.value); onStrengthChange(preset.value); }} disabled={disabled} className={`py-2 text-xs font-medium rounded-lg border transition-all ${Math.abs(localStrength - preset.value) < 0.1 ? 'bg-zinc-700 text-white border-zinc-500' : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-300'}`}>
                    {preset.label}
                </button>
            ))}
        </div>
      </div>
    </div>
  );
};

export default StyleSelector;
