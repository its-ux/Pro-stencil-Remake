
import React from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

interface GenerateActionsProps {
  onGenerate: () => void;
  onReset: () => void;
  isProcessing: boolean;
  isLimitReached?: boolean;
  translations: any;
}

const GenerateActions: React.FC<GenerateActionsProps> = ({
  onGenerate,
  onReset,
  isProcessing,
  isLimitReached,
  translations: t
}) => {
  return (
    <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 animate-in fade-in slide-in-from-bottom-8 mt-4 relative">
        <div className="absolute top-4 left-4 font-mono text-zinc-600 font-bold text-sm">4</div>
        <div className="mt-4 md:px-8">
            <button
                onClick={onGenerate}
                disabled={isProcessing || isLimitReached}
                className={`w-full font-bold py-4 px-6 rounded-xl transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-xl ${
                  isLimitReached 
                  ? 'bg-zinc-800 text-zinc-500 border border-zinc-700' 
                  : 'bg-orange-600 hover:bg-orange-500 text-white shadow-orange-600/20'
                }`}
            >
                {isProcessing ? (
                     <><Loader2 className="w-5 h-5 animate-spin text-white" /> {t.processing}</>
                ) : isLimitReached ? (
                  <>{t.limitReached || "Limit Reached"}</>
                ) : (
                     <><Sparkles className="w-5 h-5 fill-white/10" /> {t.createBtn}</>
                )}
            </button>
            <div className="mt-4 flex justify-center">
                <button onClick={onReset} disabled={isProcessing} className="text-zinc-500 font-bold hover:text-white transition-colors text-sm py-2 px-4 rounded-lg hover:bg-zinc-800/50">
                    {t.reset}
                </button>
            </div>
        </div>
    </div>
  );
};

export default GenerateActions;
