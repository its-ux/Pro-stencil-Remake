
import React from 'react';
import { PenTool, Type, Maximize2, ArrowRight } from 'lucide-react';

interface SelectionViewProps {
  t: any;
  siteConfig: any;
  language: 'en' | 'de';
  setCurrentView: (view: any) => void;
}

export const SelectionView: React.FC<SelectionViewProps> = ({ t, siteConfig, language, setCurrentView }) => {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-12 md:py-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="text-center space-y-4 mb-10 md:mb-16">
        <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold text-[#ff7106] leading-tight">
          {t.selectTool}
        </h2>
        <p className="text-[#eeeeff] text-base md:text-xl max-w-2xl mx-auto px-4 opacity-80">
          {t.selectToolSub}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 px-2 sm:px-4 max-w-6xl mx-auto">
        {/* Stencil Tool Card */}
        <button 
          onClick={() => setCurrentView('stencil')}
          className="group relative bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 text-left transition-all hover:bg-zinc-900/60 hover:border-orange-500/30 hover:scale-[1.02] active:scale-[0.98]"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem] md:rounded-[2.5rem]" />
          <div className="relative z-10 space-y-4 md:space-y-6">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-orange-600/20 rounded-xl md:rounded-2xl flex items-center justify-center">
              <PenTool className="w-6 h-6 md:w-10 md:h-10 text-orange-500" />
            </div>
            <div>
              <h3 className="text-xl md:text-3xl font-bold text-white mb-2">{siteConfig?.stencilPage?.title || t.stencilTool}</h3>
              <p className="text-xs md:text-base text-zinc-400 leading-relaxed line-clamp-3">
                {siteConfig?.stencilPage?.subtitle || t.stencilToolDesc}
              </p>
            </div>
            <div className="flex items-center gap-2 text-orange-500 font-bold uppercase tracking-widest text-[10px] md:text-sm">
              {t.openTool}
              <ArrowRight className="w-3 h-3 md:w-4 md:h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </button>

        {/* Text Bender Tool Card */}
        <button 
          onClick={() => setCurrentView('textbender')}
          className="group relative bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 text-left transition-all hover:bg-zinc-900/60 hover:border-orange-500/30 hover:scale-[1.02] active:scale-[0.98]"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem] md:rounded-[2.5rem]" />
          <div className="relative z-10 space-y-4 md:space-y-6">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-orange-600/20 rounded-xl md:rounded-2xl flex items-center justify-center">
              <Type className="w-6 h-6 md:w-10 md:h-10 text-orange-500" />
            </div>
            <div>
              <h3 className="text-xl md:text-3xl font-bold text-white mb-2">{language === 'de' ? 'Bogen Text' : 'Arc Text'}</h3>
              <p className="text-xs md:text-base text-zinc-400 leading-relaxed line-clamp-3">
                {language === 'de' ? 'Text in gebogener Form als HD-Stempel generieren' : 'Generate perfectly bent text along a curve'}
              </p>
            </div>
            <div className="flex items-center gap-2 text-orange-500 font-bold uppercase tracking-widest text-[10px] md:text-sm">
              {t.openTool}
              <ArrowRight className="w-3 h-3 md:w-4 md:h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </button>

        {/* Upscaler Tool Card */}
        <button 
          onClick={() => setCurrentView('upscaler')}
          className="group relative bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 text-left transition-all hover:bg-zinc-900/60 hover:border-orange-500/30 hover:scale-[1.02] active:scale-[0.98]"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem] md:rounded-[2.5rem]" />
          <div className="relative z-10 space-y-4 md:space-y-6">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-orange-600/20 rounded-xl md:rounded-2xl flex items-center justify-center">
              <Maximize2 className="w-6 h-6 md:w-10 md:h-10 text-orange-500" />
            </div>
            <div>
              <h3 className="text-xl md:text-3xl font-bold text-white mb-2">{siteConfig?.upscalerPage?.title || t.upscalerTool}</h3>
              <p className="text-xs md:text-base text-zinc-400 leading-relaxed line-clamp-3">
                {siteConfig?.upscalerPage?.subtitle || t.upscalerToolDesc}
              </p>
            </div>
            <div className="flex items-center gap-2 text-orange-500 font-bold uppercase tracking-widest text-[10px] md:text-sm">
              {t.openTool}
              <ArrowRight className="w-3 h-3 md:w-4 md:h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};
