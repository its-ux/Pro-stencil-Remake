import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Sparkles, Download, ArrowLeft, RefreshCw, AlertCircle, Maximize2, MoveHorizontal, Columns } from 'lucide-react';
import { enhanceImage } from '../../services/geminiService';

interface UpscalerToolProps {
  onBack?: () => void;
  hideHeader?: boolean;
  config?: any;
}

const UpscalerTool: React.FC<UpscalerToolProps> = ({ onBack, hideHeader, config }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [enhancedUrl, setEnhancedUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [upscaleStrength, setUpscaleStrength] = useState<number>(3); // 1 to 5
  
  // Slider states
  const [viewMode, setViewMode] = useState<'slider' | 'side-by-side'>('slider');
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setEnhancedUrl(null);
      setError(null);
      setSliderPosition(50);
    }
  };

  const handleEnhance = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setError(null);
    try {
      const result = await enhanceImage(selectedFile, upscaleStrength);
      setEnhancedUrl(result);
    } catch (err: any) {
      setError(err.message || "Enhancement failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (enhancedUrl) {
      try {
        const res = await fetch(enhancedUrl);
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `enhanced-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
      } catch (err) {
        console.error("Download failed, using fallback:", err);
        // Fallback
        const link = document.createElement('a');
        link.href = enhancedUrl;
        link.download = `enhanced-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  };

  return (
    <div className={`w-full ${hideHeader ? '' : 'max-w-6xl mx-auto p-6'} space-y-8`}>
      {!hideHeader && (
        <div className="flex items-center justify-between">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold uppercase tracking-widest text-sm">Back to Stencils</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-600/20 rounded-lg">
              <Maximize2 className="w-5 h-5 text-orange-500" />
            </div>
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-500">
              {config?.title || "AI Image Upscaler"}
            </h2>
          </div>
        </div>
      )}

      <div className={`grid grid-cols-1 ${hideHeader ? 'gap-6' : 'lg:grid-cols-2 gap-8'}`}>
        {/* Upload & Controls */}
        <div className="space-y-6">
          <div className="bg-zinc-900/50 border border-white/10 rounded-[2rem] p-8 space-y-6 backdrop-blur-sm">
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">{config?.title || "Enhance Reference"}</h3>
              <p className="text-zinc-500 text-sm">{config?.subtitle || "Upload a blurry or low-res photo to sharpen it for your stencil."}</p>
            </div>

            {!previewUrl ? (
              <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-white/10 rounded-3xl hover:border-orange-500/50 hover:bg-orange-500/5 transition-all cursor-pointer group">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-12 h-12 text-zinc-600 group-hover:text-orange-500 transition-colors mb-4" />
                  <p className="text-sm text-zinc-400 font-bold uppercase tracking-widest">Upload Reference</p>
                </div>
                <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
              </label>
            ) : (
              <div className="space-y-6">
                <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 bg-black">
                  <img src={previewUrl || undefined} alt="Original" className="w-full h-full object-contain" />
                  <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-bold text-white uppercase tracking-widest border border-white/10">
                    Original
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm font-bold uppercase tracking-widest text-zinc-400">
                    <span>Upscale Strength</span>
                    <span className="text-orange-500">{upscaleStrength === 1 ? 'Light' : upscaleStrength === 5 ? 'Max' : upscaleStrength}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    value={upscaleStrength}
                    onChange={(e) => setUpscaleStrength(Number(e.target.value))}
                    className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  />
                  <div className="flex justify-between text-[10px] uppercase tracking-widest text-zinc-600">
                    <span>Subtle</span>
                    <span>Aggressive</span>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <label className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all cursor-pointer font-bold uppercase tracking-widest text-xs">
                    <RefreshCw className="w-4 h-4" />
                    Change Image
                    <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                  </label>
                  <button 
                    onClick={handleEnhance}
                    disabled={isProcessing}
                    className="flex-[2] flex items-center justify-center gap-3 px-6 py-4 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl transition-all font-bold uppercase tracking-widest text-sm shadow-lg shadow-orange-600/20"
                  >
                    {isProcessing ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <Sparkles className="w-5 h-5" />
                    )}
                    {isProcessing ? "Enhancing..." : (config?.buttonText || "Upscale & Sharpen")}
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-900/20 border border-red-900/50 rounded-2xl flex items-start gap-3 text-red-200 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm">{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Result Preview */}
        <div className="bg-zinc-900/50 border border-white/10 rounded-[2rem] p-8 flex flex-col backdrop-blur-sm min-h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <h3 className="text-xl font-bold text-white">Enhanced Result</h3>
              {enhancedUrl && (
                <div className="flex items-center bg-zinc-950/50 p-1 rounded-xl border border-zinc-800">
                  <button 
                    onClick={() => setViewMode('slider')} 
                    className={`p-2 rounded-lg transition-all ${viewMode === 'slider' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`} 
                    title="Comparison Slider"
                  >
                    <MoveHorizontal className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setViewMode('side-by-side')} 
                    className={`p-2 rounded-lg transition-all ${viewMode === 'side-by-side' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`} 
                    title="Side by Side"
                  >
                    <Columns className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            {enhancedUrl && (
              <button 
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-xs font-bold uppercase tracking-widest"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            )}
          </div>

          <div className="flex-grow flex items-center justify-center bg-black rounded-2xl border border-white/5 overflow-hidden relative">
            <AnimatePresence mode="wait">
              {enhancedUrl ? (
                viewMode === 'side-by-side' ? (
                  <motion.div 
                    key="side-by-side"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-2 gap-px w-full h-full bg-zinc-800"
                  >
                    <div className="relative bg-zinc-950 flex items-center justify-center p-4">
                      <img src={previewUrl || undefined} alt="Original" className="max-w-full max-h-full object-contain" />
                      <div className="absolute top-4 left-4 text-[10px] font-bold text-zinc-500 bg-black/40 px-2 py-1 rounded backdrop-blur-sm uppercase tracking-widest border border-white/5">Original</div>
                    </div>
                    <div className="relative bg-zinc-950 flex items-center justify-center p-4">
                      <img src={enhancedUrl || undefined} alt="Enhanced" className="max-w-full max-h-full object-contain" />
                      <div className="absolute top-4 right-4 text-[10px] font-bold text-orange-500 bg-black/40 px-2 py-1 rounded backdrop-blur-sm uppercase tracking-widest border border-orange-500/20">Enhanced</div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="slider"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    ref={containerRef}
                    className="relative w-full h-full flex items-center justify-center p-4 overflow-hidden"
                  >
                    <div className="relative w-full h-full flex items-center justify-center pointer-events-auto select-none overflow-hidden">
                      <img 
                        src={previewUrl || undefined} 
                        alt="Original" 
                        className="w-full h-full object-contain pointer-events-none" 
                        draggable={false} 
                      />
                      <div 
                          className="absolute inset-0 overflow-hidden pointer-events-none bg-black" 
                          style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
                      >
                           <img 
                             src={enhancedUrl || undefined} 
                             alt="Enhanced" 
                             className="w-full h-full object-contain pointer-events-none" 
                             draggable={false}
                           />
                      </div>
                      <div 
                        className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] z-20 pointer-events-none flex items-center justify-center"
                        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
                      >
                        <div className="w-8 h-8 bg-white rounded-full shadow-[0_0_20px_rgba(0,0,0,0.5)] flex items-center justify-center text-black pointer-events-none border-2 border-zinc-200 transition-all duration-300 group-hover:scale-110">
                          <MoveHorizontal className="w-4 h-4" />
                        </div>
                      </div>
                      
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={sliderPosition}
                        onChange={(e) => setSliderPosition(Number(e.target.value))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30 m-0 p-0"
                      />
                      
                      {/* Labels */}
                      <div className="absolute top-4 left-4 text-[10px] font-bold text-zinc-500 bg-black/40 px-2 py-1 rounded backdrop-blur-sm uppercase tracking-widest border border-white/5 pointer-events-none z-10 transition-opacity" style={{ opacity: sliderPosition > 10 ? 1 : 0 }}>Original</div>
                      <div className="absolute top-4 right-4 text-[10px] font-bold text-orange-500 bg-black/40 px-2 py-1 rounded backdrop-blur-sm uppercase tracking-widest border border-orange-500/20 pointer-events-none z-10 transition-opacity" style={{ opacity: sliderPosition < 90 ? 1 : 0 }}>Enhanced</div>
                    </div>
                  </motion.div>
                )
              ) : isProcessing ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-4"
                >
                  <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs animate-pulse">AI is sharpening pixels...</p>
                </motion.div>
              ) : (
                <div className="text-center space-y-4 p-8">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                    <Sparkles className="w-8 h-8 text-zinc-700" />
                  </div>
                  <p className="text-zinc-600 text-sm max-w-[200px] mx-auto">
                    Enhanced image will appear here after processing.
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpscalerTool;
