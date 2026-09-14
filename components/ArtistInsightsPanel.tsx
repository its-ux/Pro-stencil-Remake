
import React, { useState } from 'react';
import { Target, Clock, Zap, Info, Palette, FlaskConical, Sparkles } from 'lucide-react';
import { ArtistInsights, Language } from '../types';
import ColorMixCalculator from './ColorMixCalculator';

interface ArtistInsightsPanelProps {
  insights: ArtistInsights;
  translations: any;
  language: Language;
}

const ArtistInsightsPanel: React.FC<ArtistInsightsPanelProps> = ({ insights, translations: t, language }) => {
  const [selectedHex, setSelectedHex] = useState<string | null>(null);

  // Maps AI-generated complexity strings back to localized versions if needed for fallback
  const getDisplayComplexity = (val: string) => {
    if (!val) return val;
    const v = val.toLowerCase();
    if (language === 'de') {
      if (v.includes('minimal')) return 'Minimal';
      if (v.includes('moderate')) return 'Moderat';
      if (v.includes('high')) return 'Hoch';
      if (v.includes('extreme')) return 'Extrem';
      return val;
    } else {
      if (v.includes('moderat')) return 'Moderate';
      if (v.includes('hoch')) return 'High';
      if (v.includes('extrem')) return 'Extreme';
      return val;
    }
  };

  // Maps AI-generated tone roles back to localized versions if needed
  const getDisplayRole = (role: string) => {
    if (!role) return role;
    if (language === 'de') {
      const mapping: Record<string, string> = {
        'Deep Shadow': 'Tiefer Schatten',
        'Deepest Shadow': 'Tiefster Schatten',
        'Mid Shadow': 'Mittlerer Schatten',
        'Midtone': 'Mittelton',
        'Light Area': 'Heller Bereich',
        'Highlights': 'Glanzlichter / Highlights',
        'Main Line': 'Hauptlinie',
        'Line': 'Linie',
        'Skin Glow': 'Hautglanz'
      };
      return mapping[role] || role;
    } else {
      const mapping: Record<string, string> = {
        'Tiefer Schatten': 'Deep Shadow',
        'Tiefster Schatten': 'Deepest Shadow',
        'Mittlerer Schatten': 'Mid Shadow',
        'Mittelton': 'Midtone',
        'Heller Bereich': 'Light Area',
        'Glanzlichter / Highlights': 'Highlights',
        'Hauptlinie': 'Main Line',
        'Linie': 'Line',
        'Hautglanz': 'Skin Glow'
      };
      return mapping[role] || role;
    }
  };

  return (
    <div className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500 shadow-xl">
      <div className="bg-zinc-800/50 px-6 py-4 border-b border-zinc-700/50 flex items-center justify-between">
        <h3 className="text-white font-bold flex items-center gap-2">
          <Info className="w-4 h-4 text-orange-500" />
          {t.analysisHeader}
        </h3>
        <div className="flex items-center gap-1.5 bg-orange-500/10 px-2 py-1 rounded border border-orange-500/20">
          <Sparkles className="w-3 h-3 text-orange-500" />
          <span className="text-[9px] font-bold text-orange-500 uppercase tracking-widest">{t.aiBadge}</span>
        </div>
      </div>
      
      <div className="p-6 space-y-8">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-800">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-orange-400" />
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{t.complexity}</span>
            </div>
            <p className="text-white font-semibold">{getDisplayComplexity(insights.complexity)}</p>
          </div>
          <div className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-800">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-orange-400" />
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{t.estTime}</span>
            </div>
            <p className="text-white font-semibold">{insights.estTime}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-orange-500" />
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">{t.tonesPalette}</h4>
            </div>
            <div className="flex items-center gap-2 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
               <FlaskConical className="w-3 h-3 text-orange-400" />
               <span className="text-[9px] text-orange-300 font-bold uppercase tracking-tight">
                {t.clickToMix}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {insights.palette.map((tone, idx) => (
              <button 
                key={idx} 
                onClick={() => setSelectedHex(tone.hex)}
                className={`flex flex-col gap-2 bg-zinc-950/40 p-3 rounded-xl border transition-all group relative ${selectedHex === tone.hex ? 'border-orange-500 ring-1 ring-orange-500/50 bg-zinc-900' : 'border-zinc-800/60 hover:border-zinc-600 hover:bg-zinc-900/60'}`}
              >
                <div 
                  className="w-full aspect-[4/3] rounded-lg shadow-inner border border-white/5 transition-transform group-hover:scale-[1.02]" 
                  style={{ backgroundColor: tone.hex }} 
                />
                <div className="space-y-0.5 text-left">
                  <span className="text-[9px] font-bold text-orange-400 uppercase tracking-wider block">
                    {getDisplayRole(tone.name)}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase block">
                    {tone.hex}
                  </span>
                </div>
                {selectedHex === tone.hex && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center animate-bounce shadow-lg shadow-orange-500/50">
                    <FlaskConical className="w-2 h-2 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>

          {selectedHex && (
            <div className="mt-8 animate-in slide-in-from-bottom-4 duration-300">
               <ColorMixCalculator 
                 targetHex={selectedHex} 
                 onClose={() => setSelectedHex(null)} 
                 language={language} 
                 translations={t} 
               />
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-4 h-4 text-orange-600" />
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">{t.needles}</h4>
          </div>
          <div className="space-y-3">
            {insights.needles.map((needle, idx) => (
              <div key={idx} className="flex items-start gap-3 group bg-zinc-950/30 p-3 rounded-xl border border-zinc-800/50 hover:border-zinc-700 transition-colors">
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                    <span className="text-orange-400 font-mono text-sm font-bold">{needle.type}</span>
                  </div>
                  <span className="text-zinc-400 text-xs leading-relaxed">{needle.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="px-6 py-3 bg-orange-500/5 border-t border-orange-500/10">
        <p className="text-[10px] text-zinc-500 text-center italic">{t.insightsDisclaimer}</p>
      </div>
    </div>
  );
};

export default ArtistInsightsPanel;
