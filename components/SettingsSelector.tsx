import React from 'react';
import { BackgroundMode } from '../types';
import { Tooltip } from './Tooltip';

interface SettingsSelectorProps {
  lineColor: string;
  onLineColorChange: (val: string) => void;
  backgroundMode: BackgroundMode;
  onBackgroundModeChange: (mode: BackgroundMode) => void;
  backgroundColor: string;
  onBackgroundColorChange: (color: string) => void;
  invert: boolean;
  onInvertChange: (val: boolean) => void;
  gradientColors: [string, string];
  onGradientColorsChange: (colors: [string, string]) => void;
  disabled?: boolean;
  translations: any;
}

const COLORS = [
  { id: 'black', value: '#000000', label: 'Black' },
  { id: 'red', value: '#ef4444', label: 'Red' },
  { id: 'blue', value: '#3b82f6', label: 'Blue' },
  { id: 'green', value: '#22c55e', label: 'Green' },
  { id: 'purple', value: '#a855f7', label: 'Purple' },
];

const SettingsSelector: React.FC<SettingsSelectorProps> = ({
  lineColor,
  onLineColorChange,
  backgroundMode,
  onBackgroundModeChange,
  backgroundColor,
  onBackgroundColorChange,
  invert,
  onInvertChange,
  gradientColors,
  onGradientColorsChange,
  disabled,
  translations: t
}) => {
  return (
    <div className={`w-full max-w-2xl bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 md:p-8 animate-in fade-in slide-in-from-bottom-6 mt-4 transition-opacity ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="flex items-center gap-2 mb-6">
        <span className="font-mono text-zinc-600 font-bold text-sm">3</span>
        <h2 className="text-xl font-bold text-white">{t.settingsTitle}</h2>
      </div>

      <div className="space-y-6">
        <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700/50 relative">
          <div className="flex items-center mb-1"><div className="font-semibold text-white">{t.lineColor}</div></div>
          <div className="flex gap-3 mt-4">
            {COLORS.map((color) => {
              const isSelected = lineColor === color.value;
              return (
                <button key={color.id} onClick={() => onLineColorChange(color.value)} disabled={disabled} className={`w-16 h-12 rounded-lg border-2 flex items-center justify-center transition-all ${isSelected ? 'border-zinc-400 bg-zinc-700/50' : 'border-zinc-700 hover:border-zinc-600 bg-zinc-900/50'}`}>
                  <div className="w-6 h-6 rounded-full shadow-sm" style={{ backgroundColor: color.value }} />
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700/50 relative">
           <div className="flex items-center mb-1"><div className="font-semibold text-white">{t.background}</div></div>
           <div className="flex flex-col sm:flex-row gap-3 mt-4">
              {['white', 'transparent', 'gradient'].map((mode) => (
                <button key={mode} onClick={() => onBackgroundModeChange(mode as any)} disabled={disabled} className={`flex-1 py-3 px-4 rounded-xl border-2 font-medium transition-all ${backgroundMode === mode ? 'border-orange-600 bg-orange-600/10 text-white' : 'border-zinc-700 hover:border-zinc-600 bg-zinc-900/50 text-zinc-400'}`}>
                  {mode === 'white' ? 'Solid White' : mode === 'transparent' ? 'Transparent' : 'Gradient'}
                </button>
              ))}
           </div>
           {backgroundMode === 'gradient' && (
             <div className="mt-4 animate-in fade-in slide-in-from-top-2 p-3 bg-zinc-900/50 rounded-lg border border-zinc-800 relative">
               <div className="text-xs font-medium text-zinc-300 mb-2">{t.gradientColors}</div>
               <div className="flex items-center gap-4">
                 <div className="flex-1">
                   <input type="color" value={gradientColors[0]} onChange={(e) => onGradientColorsChange([e.target.value, gradientColors[1]])} className="w-8 h-8 rounded cursor-pointer bg-transparent p-0 border-0" />
                 </div>
                 <div className="flex-1">
                   <input type="color" value={gradientColors[1]} onChange={(e) => onGradientColorsChange([gradientColors[0], e.target.value])} className="w-8 h-8 rounded cursor-pointer bg-transparent p-0 border-0" />
                 </div>
               </div>
             </div>
           )}
        </div>

        {/* Invert Stencil Setting */}
        <div className="bg-black/40 backdrop-blur-sm rounded-xl p-5 border border-white/5 flex items-center justify-between group cursor-pointer hover:bg-black/60 transition-all" onClick={() => onInvertChange(!invert)}>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-white mb-0.5">{t.invertLabel}</h4>
            <p className="text-xs text-zinc-500">{t.invertSub}</p>
          </div>
          <div className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${invert ? 'bg-orange-600' : 'bg-zinc-700'}`}>
            <div className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-300 ${invert ? 'left-7 bg-white' : 'left-1 bg-zinc-400'}`} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsSelector;