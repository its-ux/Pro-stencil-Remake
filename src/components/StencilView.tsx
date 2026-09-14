
import React, { useRef } from 'react';
import { ArrowLeft, AlertTriangle, Terminal, X } from 'lucide-react';
import UploadCard from '../../components/UploadCard';
import StyleSelector from '../../components/StyleSelector';
import SettingsSelector from '../../components/SettingsSelector';
import GenerateActions from '../../components/GenerateActions';
import PreviewSection from '../../components/PreviewSection';
import HistorySection from '../../components/HistorySection';
import { AppState, StencilStyle, StencilHistoryItem, BackgroundMode, StencilResult, Language } from '../../types';

interface StencilViewProps {
  t: any;
  language: Language;
  appState: AppState;
  previewUrl: string | null;
  selectedStyleId: string;
  setSelectedStyleId: (id: string) => void;
  strength: number;
  setStrength: (s: number) => void;
  lineColor: string;
  setLineColor: (c: string) => void;
  backgroundMode: BackgroundMode;
  setBackgroundMode: (m: BackgroundMode) => void;
  backgroundColor: string;
  setBackgroundColor: (c: string) => void;
  invert: boolean;
  setInvert: (i: boolean) => void;
  brightness: number;
  setBrightness: (b: number) => void;
  gradientColors: [string, string];
  setGradientColors: (c: [string, string]) => void;
  customPrompt: string;
  setCustomPrompt: (p: string) => void;
  result: StencilResult | null;
  errorMsg: string | null;
  history: StencilHistoryItem[];
  user: any;
  userQuota: number;
  stencilCount: number;
  siteConfig: any;
  STENCIL_STYLES: StencilStyle[];
  isAdmin: boolean;
  isPublishedToGallery: boolean;
  handleFileSelect: (file: File) => void;
  handleGenerate: () => void;
  handleDownload: (processedImage?: string) => void;
  handlePublishToGallery: () => void;
  handleViewHistory: (item: StencilHistoryItem) => void;
  deleteHistoryItem: (id: string) => void;
  resetApp: () => void;
  setCurrentView: (view: any) => void;
}

export const StencilView: React.FC<StencilViewProps> = ({
  t, language, appState, previewUrl, selectedStyleId, setSelectedStyleId,
  strength, setStrength, lineColor, setLineColor, backgroundMode, setBackgroundMode,
  backgroundColor, setBackgroundColor, invert, setInvert, brightness, setBrightness,
  gradientColors, setGradientColors, customPrompt, setCustomPrompt, result,
  errorMsg, history, user, userQuota, stencilCount, siteConfig, STENCIL_STYLES,
  isAdmin, isPublishedToGallery, handleFileSelect, handleGenerate, handleDownload,
  handlePublishToGallery, handleViewHistory, deleteHistoryItem, resetApp, setCurrentView
}) => {
  const styleSelectorRef = useRef<HTMLDivElement>(null);
  const previewSectionRef = useRef<HTMLDivElement>(null);

  const currentStyleName = STENCIL_STYLES.find(s => s.id === selectedStyleId)?.name || 'Unknown';
  const isConfiguringOrSuccess = appState === AppState.CONFIGURING || appState === AppState.PROCESSING || appState === AppState.SUCCESS || appState === AppState.ERROR;

  return (
    <div className="w-full max-w-[1800px] mx-auto px-4 py-8 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={() => setCurrentView('selection')}
          className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          {t?.backToUpload}
        </button>
      </div>
      <div className="space-y-8">
        {appState === AppState.IDLE && (
          <div className="flex flex-col items-center gap-8 animate-in fade-in zoom-in-95 duration-500 w-full mb-12">
              <div className="text-center space-y-2 mb-4 mt-8">
                <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-orange-200">
                  {siteConfig?.stencilPage?.title || t?.heroTitle}
                </h2>
                <p className="text-zinc-400 text-lg">{siteConfig?.stencilPage?.subtitle || t?.heroSub}</p>
              </div>
              <UploadCard onFileSelect={handleFileSelect} translations={t} config={siteConfig?.stencilPage} />
          </div>
        )}
        {isConfiguringOrSuccess && previewUrl && (
          <div className="w-full flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-8 duration-500 mb-12">
              <div className="flex justify-start mb-4">
                 <button onClick={resetApp} className="text-zinc-500 hover:text-white text-sm flex items-center gap-1 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> {t?.uploadNew}
                 </button>
              </div>
              {appState === AppState.ERROR && (
                 <div className="bg-red-900/20 border border-red-900/50 p-4 rounded-xl mb-6 flex items-start gap-3 text-red-200 animate-in fade-in slide-in-from-top-2">
                     <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                     <div>
                        <p className="font-semibold">{t?.genFailed}</p>
                        <p className="text-sm opacity-80">{errorMsg}</p>
                     </div>
                 </div>
              )}
              
              <div className="flex flex-col-reverse lg:grid lg:grid-cols-12 gap-8 items-start w-full">
                <div className="space-y-6 w-full lg:col-span-5 xl:col-span-4">
                  <div ref={styleSelectorRef}>
                     <StyleSelector 
                         styles={STENCIL_STYLES}
                         selectedStyleId={selectedStyleId}
                         onSelectStyle={setSelectedStyleId}
                         strength={strength}
                         onStrengthChange={setStrength}
                         disabled={appState === AppState.PROCESSING}
                         translations={t}
                         language={language}
                         isAdmin={isAdmin}
                     />
                  </div>
                  <div className={`bg-zinc-900/20 backdrop-blur-xl border border-white/5 rounded-2xl p-6 space-y-4 transition-all mb-6 ${appState === AppState.PROCESSING ? 'opacity-50 pointer-events-none' : ''} ${customPrompt ? 'border-orange-500/30 bg-orange-500/5 shadow-lg shadow-orange-500/5' : ''}`}>
                     <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                         <Terminal className="w-5 h-5 text-orange-500" />
                         <h3 className="text-[10px] font-bold text-white uppercase tracking-widest">{t?.customInstructions}</h3>
                       </div>
                       {customPrompt && (
                         <button onClick={() => setCustomPrompt('')} className="text-[10px] text-zinc-500 hover:text-orange-500 flex items-center gap-1 transition-colors uppercase font-bold tracking-tighter">
                           <X className="w-3 h-3" /> Clear
                         </button>
                       )}
                     </div>
                     <p className="text-[10px] text-zinc-500 leading-relaxed uppercase font-medium">
                       {t?.customInstructionsDesc}
                     </p>
                     <div className="relative group">
                       <textarea
                         value={customPrompt}
                         onChange={(e) => setCustomPrompt(e.target.value)}
                         placeholder={language === 'de' ? "z.B. 'Hintergrund entfernen', 'kontrastreicher'..." : "e.g. 'remove background', 'more contrast'..."}
                         className="w-full h-24 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 outline-none transition-all resize-none font-sans"
                        />
                     </div>
                  </div>
                  <SettingsSelector 
                     lineColor={lineColor}
                     onLineColorChange={setLineColor}
                     backgroundMode={backgroundMode}
                     onBackgroundModeChange={setBackgroundMode}
                     backgroundColor={backgroundColor}
                     onBackgroundColorChange={setBackgroundColor}
                     invert={invert}
                     onInvertChange={setInvert}
                     brightness={brightness}
                     onBrightnessChange={setBrightness}
                     gradientColors={gradientColors}
                     onGradientColorsChange={setGradientColors}
                     disabled={appState === AppState.PROCESSING}
                     translations={t}
                  />
                  <GenerateActions 
                    onGenerate={handleGenerate} 
                    onReset={resetApp} 
                    isProcessing={appState === AppState.PROCESSING} 
                    isLimitReached={user?.uid ? stencilCount >= userQuota : false}
                    translations={t} 
                  />
                </div>
                
                <div className="flex flex-col gap-4 w-full lg:col-span-7 xl:col-span-8" ref={previewSectionRef}>
                   <div className="lg:sticky lg:top-24 w-full">
                      <PreviewSection 
                         originalImage={previewUrl}
                         stencilImage={result?.stencilImage || null}
                         isProcessing={appState === AppState.PROCESSING}
                         isGenerated={appState === AppState.SUCCESS}
                         translations={t}
                         onDownload={handleDownload}
                         onPublish={handlePublishToGallery}
                         published={isPublishedToGallery}
                         insights={result?.insights}
                         language={language}
                         styleName={currentStyleName}
                         lineColor={lineColor}
                         brightness={brightness}
                         onBrightnessChange={setBrightness}
                      />
                   </div>
                </div>
              </div>
          </div>
        )}
      </div>
      {history.length > 0 && <HistorySection history={history} onDelete={deleteHistoryItem} onView={handleViewHistory} translations={t} />}
    </div>
  );
};
