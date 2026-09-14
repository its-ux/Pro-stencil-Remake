
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Download, MoveHorizontal, ScanFace, Printer, Columns, ImageIcon, CheckCircle2, Sparkles, Layers, Plus, Minus } from 'lucide-react';
import ArtistInsightsPanel from './ArtistInsightsPanel';
import { ArtistInsights, Language } from '../types';

interface PreviewSectionProps {
  originalImage: string | null;
  stencilImage: string | null;
  isGenerated: boolean;
  isProcessing?: boolean;
  styleName: string;
  lineColor?: string;
  brightness?: number;
  onBrightnessChange?: (b: number) => void;
  onDownload: (processedUrl?: string) => void;
  onPublish?: () => void;
  published?: boolean;
  insights?: ArtistInsights | null;
  translations: any;
  language: Language;
}

const PreviewSection: React.FC<PreviewSectionProps> = ({
  originalImage,
  stencilImage,
  isGenerated,
  isProcessing = false,
  styleName,
  lineColor = '#000000',
  brightness = 1,
  onBrightnessChange,
  onDownload,
  onPublish,
  published,
  insights,
  translations: t,
  language
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<'result' | 'slider' | 'side-by-side' | 'overlay'>('result');
  const [overlayOpacity, setOverlayOpacity] = useState(50);
  const [zoom, setZoom] = useState(1);
  const [stencilBrightness, setStencilBrightness] = useState(1);
  const colorMatrixRef = useRef<SVGFEColorMatrixElement>(null);
  
  const [localBrightness, setLocalBrightness] = useState(brightness);
  const imgRefs = useRef<HTMLImageElement[]>([]);

  useEffect(() => {
    setLocalBrightness(brightness);
    imgRefs.current.forEach(img => {
      if (img) img.style.filter = `brightness(${brightness})`;
    });
  }, [brightness]);

  const getColorMatrixValues = useCallback((sb: number, lineC: string) => {
    const r = parseInt(lineC.slice(1, 3), 16) / 255;
    const g = parseInt(lineC.slice(3, 5), 16) / 255;
    const b = parseInt(lineC.slice(5, 7), 16) / 255;

    // Luminance constants for accurate grayscale conversion
    const lr = 0.2126;
    const lg = 0.7152;
    const lb = 0.0722;

    const a00 = (1 - r) * sb * lr;
    const a01 = (1 - r) * sb * lg;
    const a02 = (1 - r) * sb * lb;
    const a04 = 1 - sb * (1 - r);

    const a10 = (1 - g) * sb * lr;
    const a11 = (1 - g) * sb * lg;
    const a12 = (1 - g) * sb * lb;
    const a14 = 1 - sb * (1 - g);

    const a20 = (1 - b) * sb * lr;
    const a21 = (1 - b) * sb * lg;
    const a22 = (1 - b) * sb * lb;
    const a24 = 1 - sb * (1 - b);

    return `
      ${a00} ${a01} ${a02} 0 ${a04}
      ${a10} ${a11} ${a12} 0 ${a14}
      ${a20} ${a21} ${a22} 0 ${a24}
      0 0 0 1 0
    `.trim().replace(/\s+/g, ' ');
  }, []);

  const colorFilterValues = useMemo(() => getColorMatrixValues(stencilBrightness, lineColor), [stencilBrightness, lineColor, getColorMatrixValues]);

  const handleBrightnessInput = (val: number) => {
    imgRefs.current.forEach(img => {
      if (img) img.style.filter = `brightness(${val})`;
    });
    // Just document the ref element update
    const sliderFill = document.getElementById('brightness-fill');
    if (sliderFill) sliderFill.style.width = `${(val / 2) * 100}%`;
    const sliderThumb = document.getElementById('brightness-thumb');
    if (sliderThumb) sliderThumb.style.left = `calc(${(val / 2) * 100}% - 14px)`;
    const sliderVal = document.getElementById('brightness-val');
    if (sliderVal) sliderVal.innerText = `${Math.round(val * 100)}%`;
  };

  const handleStencilBrightnessInput = (val: number) => {
    if (colorMatrixRef.current) {
      colorMatrixRef.current.setAttribute('values', getColorMatrixValues(val, lineColor));
    }
    const sliderFill = document.getElementById('stencil-brightness-fill');
    if (sliderFill) sliderFill.style.width = `${(val / 3) * 100}%`;
    const sliderThumb = document.getElementById('stencil-brightness-thumb');
    if (sliderThumb) sliderThumb.style.left = `calc(${(val / 3) * 100}% - 14px)`;
    const sliderVal = document.getElementById('stencil-brightness-val');
    if (sliderVal) sliderVal.innerText = `${Math.round(val * 100)}%`;
  };

  useEffect(() => {
    if (isGenerated && stencilImage) {
      setViewMode('result');
    }
  }, [isGenerated, stencilImage]);

  useEffect(() => {
    if (isProcessing && containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isProcessing]);

  useEffect(() => {
    if (originalImage) {
      const img = new Image();
      img.onload = () => {
        setAspectRatio(img.width / img.height);
      };
      img.src = originalImage;
    }
  }, [originalImage]);

  const getProcessedImageUrl = async (): Promise<string> => {
    return new Promise((resolve) => {
      if (!stencilImage) return resolve('');
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return resolve(stencilImage);

        ctx.drawImage(img, 0, 0);
        
        // Skip processing if no changes made to thickness/color
        if (stencilBrightness === 1 && lineColor === '#000000') {
          return resolve(canvas.toDataURL('image/png'));
        }

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        
        const sb = stencilBrightness;
        const rC = parseInt(lineColor.slice(1, 3), 16) / 255;
        const gC = parseInt(lineColor.slice(3, 5), 16) / 255;
        const bC = parseInt(lineColor.slice(5, 7), 16) / 255;
        
        const lr = 0.2126;
        const lg = 0.7152;
        const lb = 0.0722;
        
        const a00 = (1 - rC) * sb * lr;
        const a01 = (1 - rC) * sb * lg;
        const a02 = (1 - rC) * sb * lb;
        const a04 = 1 - sb * (1 - rC);

        const a10 = (1 - gC) * sb * lr;
        const a11 = (1 - gC) * sb * lg;
        const a12 = (1 - gC) * sb * lb;
        const a14 = 1 - sb * (1 - gC);

        const a20 = (1 - bC) * sb * lr;
        const a21 = (1 - bC) * sb * lg;
        const a22 = (1 - bC) * sb * lb;
        const a24 = 1 - sb * (1 - bC);

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i] / 255;
          const g = data[i + 1] / 255;
          const b = data[i + 2] / 255;
          
          const newR = (a00 * r + a01 * g + a02 * b + a04) * 255;
          const newG = (a10 * r + a11 * g + a12 * b + a14) * 255;
          const newB = (a20 * r + a21 * g + a22 * b + a24) * 255;

          data[i] = Math.max(0, Math.min(255, newR));
          data[i + 1] = Math.max(0, Math.min(255, newG));
          data[i + 2] = Math.max(0, Math.min(255, newB));
        }

        ctx.putImageData(imgData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => resolve(stencilImage);
      img.src = stencilImage;
    });
  };

  const handlePrint = async () => {
    if (!stencilImage) return;
    const finalImageUrl = await getProcessedImageUrl();
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`<html><body style="margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;"><img src="${finalImageUrl}" style="max-width:100%;" onload="window.print();window.close()" /></body></html>`);
      printWindow.document.close();
    }
  };

  const handleDownloadClick = async () => {
    if (!stencilImage) return;
    const finalImageUrl = await getProcessedImageUrl();
    onDownload(finalImageUrl);
  };

  const showControls = Boolean(originalImage);
  const showViewModes = isGenerated && Boolean(stencilImage) && Boolean(originalImage);

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="w-full bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-2xl select-none relative">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-black/40 backdrop-blur-sm z-30 relative overflow-x-auto hide-scrollbar gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <h3 className="font-bold text-white text-sm tracking-wide flex items-center gap-2">
              {t.preview}
              {isGenerated && <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />}
            </h3>
            {showViewModes && (
              <div className="hidden sm:flex items-center gap-2 ml-2">
                <div className="flex items-center bg-zinc-900 rounded-full px-2 border border-zinc-800 mr-2">
                  <button 
                    onClick={() => setZoom(prev => Math.max(0.5, prev - 0.25))}
                    className="p-1.5 text-zinc-500 hover:text-white transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] font-mono font-bold w-12 text-center text-orange-500">
                    {Math.round(zoom * 100)}%
                  </span>
                  <button 
                    onClick={() => setZoom(prev => Math.min(5, prev + 0.25))}
                    className="p-1.5 text-zinc-500 hover:text-white transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <button 
                  onClick={() => setViewMode('result')} 
                  className={`text-[10px] font-bold px-3 py-1 rounded-full border transition-all ${viewMode === 'result' ? 'bg-white text-black border-white' : 'text-zinc-500 border-zinc-800 hover:border-zinc-700'}`}
                >
                  {t.stencilOnly}
                </button>
                <button 
                  onClick={() => setViewMode('side-by-side')} 
                  className={`text-[10px] font-bold px-3 py-1 rounded-full border transition-all ${viewMode === 'side-by-side' ? 'bg-white text-black border-white' : 'text-zinc-500 border-zinc-800 hover:border-zinc-700'}`}
                >
                  {t.sideBySide}
                </button>
                <button 
                  onClick={() => setViewMode('slider')} 
                  className={`text-[10px] font-bold px-3 py-1 rounded-full border transition-all ${viewMode === 'slider' ? 'bg-white text-black border-white' : 'text-zinc-500 border-zinc-800 hover:border-zinc-700'}`}
                >
                  {t.compSlider}
                </button>
                <button 
                  onClick={() => setViewMode('overlay')} 
                  className={`text-[10px] font-bold px-3 py-1 rounded-full border transition-all ${viewMode === 'overlay' ? 'bg-white text-black border-white' : 'text-zinc-500 border-zinc-800 hover:border-zinc-700'}`}
                >
                  {t.overlayView}
                </button>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
             <div className="flex sm:hidden items-center bg-zinc-900 rounded-lg px-2 border border-zinc-800 h-9">
               <span className="text-[10px] font-mono font-bold text-orange-500 whitespace-nowrap">
                 {Math.round(zoom * 100)}%
               </span>
             </div>
             {showViewModes && !isProcessing && (
                <div className="flex items-center bg-zinc-950/50 p-1 rounded-xl border border-zinc-800 sm:hidden">
                  <button 
                    onClick={() => setViewMode('result')} 
                    className={`p-2 rounded-lg transition-all ${viewMode === 'result' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`} 
                    title={t.stencilOnly}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setViewMode('side-by-side')} 
                    className={`p-2 rounded-lg transition-all ${viewMode === 'side-by-side' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`} 
                    title={t.sideBySide}
                  >
                    <Columns className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setViewMode('slider')} 
                    className={`p-2 rounded-lg transition-all ${viewMode === 'slider' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`} 
                    title={t.compSlider}
                  >
                    <MoveHorizontal className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setViewMode('overlay')} 
                    className={`p-2 rounded-lg transition-all ${viewMode === 'overlay' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`} 
                    title={t.overlayView}
                  >
                    <Layers className="w-4 h-4" />
                  </button>
                </div>
             )}
          </div>
        </div>

        <div ref={containerRef} className={`relative w-full bg-[#050505] flex flex-col items-center justify-center overflow-hidden transition-all duration-500 min-h-[400px] max-h-[85vh]`}>
          {/* SVG Filter for live line color tinting */}
          <svg className="hidden">
            <filter id="stencil-color">
              <feColorMatrix
                ref={colorMatrixRef}
                type="matrix"
                values={colorFilterValues}
              />
            </filter>
          </svg>
          
          {(!isGenerated || isProcessing) && originalImage && (
             <div className="relative w-full h-full flex flex-col items-center justify-center p-4 md:p-8 animate-in fade-in duration-500 overflow-hidden cursor-grab active:cursor-grabbing">
                <div className="relative flex items-center justify-center max-w-full max-h-[60vh]">
                  <motion.div 
                    className="relative flex items-center justify-center bg-zinc-900 rounded-xl shadow-2xl overflow-hidden border border-zinc-800"
                    drag={zoom > 1}
                    dragMomentum={false}
                    style={{ 
                      scale: zoom,
                      aspectRatio: aspectRatio || 'auto',
                      maxWidth: '100%',
                      maxHeight: '60vh'
                    }}
                  >
                    <img 
                      ref={(el) => { if (el && !imgRefs.current.includes(el)) imgRefs.current.push(el); }}
                      src={originalImage || undefined} 
                      alt="Original Selection" 
                      className="max-w-full max-h-full object-contain" 
                      style={{ filter: `brightness(${localBrightness})` }}
                      draggable={false}
                      onError={(e) => {
                        console.error("Failed to load original image preview");
                      }}
                    />
                  </motion.div>
                  
                  {isProcessing && (
                    <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 animate-in fade-in duration-300 rounded-xl">
                       <div className="relative mb-4">
                         <div className="w-12 h-12 border-4 border-zinc-800 rounded-full"></div>
                         <div className="absolute inset-0 w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                         <Sparkles className="absolute inset-0 m-auto w-5 h-5 text-white animate-pulse" />
                       </div>
                       <h3 className="text-base font-bold text-white tracking-tight">{t.processing}</h3>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex flex-col items-center gap-2">
                   <div className="flex items-center gap-2 bg-blue-500/20 border border-blue-500/30 px-3 py-1 rounded-full text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                     <ImageIcon className="w-3 h-3" />
                     {language === 'es' ? 'Imagen Seleccionada' : 'Image Selected'}
                   </div>
                   {!isProcessing && (
                     <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">
                        {language === 'es' ? 'LISTO PARA PROCESAR' : 'READY TO PROCESS'}
                     </p>
                   )}
                </div>
             </div>
          )}

          {isGenerated && !isProcessing && (
            <div className="w-full h-full flex flex-col items-center justify-center overflow-hidden">
              {viewMode === 'result' ? (
                <div className="relative w-full h-full flex flex-col items-center justify-center p-4 md:p-8 animate-in fade-in zoom-in-95 duration-500 overflow-hidden cursor-grab active:cursor-grabbing">
                   <motion.div 
                     className="relative flex items-center justify-center bg-white rounded-xl shadow-2xl overflow-hidden border border-zinc-800"
                     drag={zoom > 1}
                     dragMomentum={false}
                     style={{ 
                       aspectRatio: aspectRatio || 'auto',
                       maxWidth: '100%',
                       maxHeight: '75vh',
                       scale: zoom
                     }}
                   >
                     <img 
                       src={stencilImage || undefined} 
                       alt="Stencil Result" 
                       className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500" 
                       style={{ filter: `url(#stencil-color)` }}
                       draggable={false}
                     />
                     <div className="absolute top-4 right-4 text-[10px] font-bold text-orange-600 bg-orange-50/80 px-2 py-1 rounded backdrop-blur-sm uppercase tracking-widest border border-orange-100 shadow-sm z-10">Stencil Result</div>
                   </motion.div>
                </div>
              ) : viewMode === 'side-by-side' ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-px w-full h-full bg-zinc-800 animate-in fade-in zoom-in-95 duration-500 overflow-y-auto">
                   <div className="flex flex-col bg-white h-full min-h-[300px] border-b md:border-b-0 md:border-r border-zinc-800">
                      <div className="bg-white relative h-full w-full flex items-center justify-center p-4">
                        <img 
                          src={stencilImage || undefined} 
                          alt="Stencil" 
                          className="max-w-full max-h-full object-contain mix-blend-multiply" 
                          style={{ filter: `url(#stencil-color)` }}
                        />
                        <div className="absolute top-4 left-4 text-[10px] font-bold text-orange-600 bg-orange-50/80 px-2 py-1 rounded backdrop-blur-sm uppercase tracking-widest border border-orange-100 shadow-sm z-10">Stencil Result</div>
                      </div>
                   </div>
                   <div className="flex flex-col bg-zinc-950 h-full min-h-[300px]">
                      <div className="bg-zinc-950 relative h-full w-full flex items-center justify-center p-4">
                        <img ref={(el) => { if (el && !imgRefs.current.includes(el)) imgRefs.current.push(el); }} src={originalImage || undefined} alt="Original" className="max-w-full max-h-full object-contain opacity-60" style={{ filter: `brightness(${localBrightness})` }} />
                        <div className="absolute top-4 right-4 text-[10px] font-bold text-zinc-500 bg-black/40 px-2 py-1 rounded backdrop-blur-sm uppercase tracking-widest border border-white/5">Original Reference</div>
                      </div>
                   </div>
                </div>
              ) : viewMode === 'overlay' ? (
                <div className="relative w-full h-full flex flex-col items-center justify-center p-4 md:p-8 animate-in fade-in zoom-in-95 duration-500 overflow-hidden cursor-grab active:cursor-grabbing">
                    <motion.div 
                      className="relative shadow-2xl overflow-hidden rounded-xl border border-zinc-800 bg-black flex items-center justify-center" 
                      drag={zoom > 0.5}
                      dragMomentum={false}
                      style={{ 
                        aspectRatio: aspectRatio || 'auto',
                        width: 'auto',
                        height: 'auto',
                        maxWidth: '100%',
                        maxHeight: '75vh',
                        scale: zoom
                      }}
                    >
                        <img 
                          ref={(el) => { if (el && !imgRefs.current.includes(el)) imgRefs.current.push(el); }}
                          src={originalImage || undefined} 
                          alt="Original" 
                          className="max-w-full max-h-[75vh] block object-contain" 
                          style={{ filter: `brightness(${localBrightness})` }}
                          draggable={false} 
                        />
                        <div 
                          className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center" 
                          style={{ opacity: overlayOpacity / 100 }}
                        >
                          <img 
                            src={stencilImage || undefined} 
                            alt="Stencil Overlay" 
                            className="max-w-full max-h-[75vh] block object-contain mix-blend-multiply" 
                            draggable={false} 
                            style={{ filter: `url(#stencil-color)` }}
                          />
                        </div>
                    </motion.div>
                    
                    <div className="mt-8 w-full max-w-xs flex flex-col gap-3 items-center bg-black/40 backdrop-blur-md p-5 rounded-3xl border border-white/5 shadow-2xl">
                      <div className="flex justify-between w-full px-1">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{t.background || 'Original'}</span>
                        <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">{t.transparency || 'Opacity'}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={overlayOpacity}
                        onChange={(e) => setOverlayOpacity(Number(e.target.value))}
                        className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-orange-600 transition-all hover:accent-orange-500"
                      />
                      
                      <div className="w-full pt-2 border-t border-white/5 flex flex-col gap-2">
                        <div className="flex justify-between w-full px-1">
                          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{t.zoom || 'Zoom'}</span>
                          <span className="text-[10px] font-mono text-orange-500">{Math.round(zoom * 100)}%</span>
                        </div>
                        <div className="flex items-center gap-2 w-full">
                          <button 
                            onClick={() => setZoom(prev => Math.max(0.5, prev - 0.25))}
                            className="p-1 text-zinc-500 hover:text-white transition-colors flex-shrink-0"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <input
                            type="range"
                            min="0.5"
                            max="5"
                            step="0.1"
                            value={zoom}
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-600 transition-all hover:accent-blue-500"
                          />
                          <button 
                            onClick={() => setZoom(prev => Math.min(5, prev + 0.25))}
                            className="p-1 text-zinc-500 hover:text-white transition-colors flex-shrink-0"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-orange-500/80">{overlayOpacity}%</span>
                        <span className="text-[10px] font-mono text-zinc-600"> {t.preview}</span>
                      </div>
                    </div>
                </div>
              ) : (
                <div className="relative w-full h-full flex items-center justify-center p-4 md:p-8 overflow-hidden">
                    <div 
                      className="relative shadow-2xl overflow-hidden rounded-xl border border-zinc-800 bg-black" 
                      style={{ 
                        aspectRatio: aspectRatio || 'auto',
                        maxWidth: '100%',
                        maxHeight: '100%',
                        width: aspectRatio && aspectRatio > 1 ? '100%' : 'auto',
                        height: aspectRatio && aspectRatio < 1 ? '100%' : 'auto',
                      }}
                    >
                        {/* 
                            Forcing both images to 'object-fill' within the aspect-ratio-constrained container
                            ensures they occupy exactly the same space regardless of minor generation padding.
                        */}
                        <img 
                          ref={(el) => { if (el && !imgRefs.current.includes(el)) imgRefs.current.push(el); }}
                          src={originalImage || undefined} 
                          alt="Original" 
                          className="w-full h-full block object-fill pointer-events-none" 
                          style={{ filter: `brightness(${localBrightness})` }}
                          draggable={false} 
                        />
                        <div 
                            className="absolute inset-0 overflow-hidden pointer-events-none bg-white z-10" 
                            style={{ 
                              clipPath: `inset(0 0 0 ${sliderPosition}%)`
                            }}
                        >
                             <img 
                               src={stencilImage || undefined} 
                               alt="Stencil" 
                               className="w-full h-full block object-fill" 
                               draggable={false} 
                               style={{ 
                                  filter: `url(#stencil-color)`,
                                  mixBlendMode: 'multiply'
                               }}
                             />
                        </div>
                        <div 
                          className="absolute inset-y-0 w-1 z-20 pointer-events-none group bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)]" 
                          style={{ 
                            left: `${sliderPosition}%`, 
                            transform: 'translateX(-50%)'
                          }}
                        >
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center border-2 bg-white text-black border-zinc-200 transition-all duration-300 group-hover:scale-110 shadow-xl pointer-events-none">
                                <MoveHorizontal size={14} />
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
                    </div>
                </div>
              )}
            </div>
          )}

          {!originalImage && !isProcessing && (
             <div className="w-full py-32 flex flex-col items-center justify-center text-zinc-700">
               <div className="w-20 h-20 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6 opacity-40">
                <ImageIcon className="w-8 h-8" />
               </div>
               <p className="text-zinc-500 font-bold uppercase tracking-[0.2em] text-xs">{language === 'es' ? 'Esperando Imagen' : 'Awaiting Image'}</p>
             </div>
          )}
        </div>
        
        {/* Brightness Control placed directly under the image */}
        {onBrightnessChange && originalImage && (
          <div className="p-5 bg-zinc-900 border-t border-white/5 animate-in fade-in slide-in-from-top-4 space-y-6">
              {/* Original Image Brightness */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                      <h4 className="text-sm font-bold text-white mb-0.5">{t.brightnessLabel || "Bildhelligkeit"}</h4>
                      <p className="text-xs text-zinc-500">{t.brightnessSub || "Anpassen der Bildbelichtung für besseres Tracing"}</p>
                  </div>
                  <span id="brightness-val" className="text-xs font-mono bg-zinc-950 px-2 py-1 rounded text-zinc-300 border border-zinc-800">
                      {Math.round(localBrightness * 100)}%
                  </span>
                </div>
                <div className="relative h-6 flex items-center mb-2 px-1">
                  <div className="absolute left-0 right-0 h-1.5 bg-zinc-950 rounded-full overflow-hidden">
                      <div id="brightness-fill" className="h-full bg-orange-600 transition-all duration-150" style={{ width: `${(localBrightness / 2) * 100}%` }} />
                  </div>
                  <input 
                    type="range" 
                    min="0.1" 
                    max="2" 
                    step="0.05" 
                    defaultValue={localBrightness} 
                    disabled={isProcessing} 
                    onInput={(e) => handleBrightnessInput(parseFloat((e.target as HTMLInputElement).value))}
                    onPointerUp={(e) => { 
                      const val = parseFloat((e.target as HTMLInputElement).value); 
                      setLocalBrightness(val);
                      if (val !== brightness && onBrightnessChange) onBrightnessChange(val); 
                    }}
                    onTouchEnd={(e) => { 
                      const val = parseFloat((e.target as HTMLInputElement).value); 
                      setLocalBrightness(val);
                      if (val !== brightness && onBrightnessChange) onBrightnessChange(val); 
                    }}
                    className="absolute w-full h-6 opacity-0 cursor-pointer z-20" 
                  />
                  <div id="brightness-thumb" className="absolute h-4 w-4 bg-white rounded-full shadow-lg border border-zinc-400 pointer-events-none transition-all duration-75 z-10" style={{ left: `calc(${(localBrightness / 2) * 100}% - 14px)` }} />
                </div>
                <div className="flex justify-between text-[10px] text-zinc-600 font-bold px-1">
                  <span>0%</span>
                  <span>100%</span>
                  <span>200%</span>
                </div>
              </div>

              {/* Stencil Line Brightness */}
              {isGenerated && (
                <div>
                  <div className="flex items-center justify-between mb-4 pt-4 border-t border-white/5">
                    <div>
                        <h4 className="text-sm font-bold text-white mb-0.5">{t.stencilBrightnessLabel || "Stencil-Linienstärke"}</h4>
                        <p className="text-xs text-zinc-500">{t.stencilBrightnessSub || "Linien heller oder dunkler machen"}</p>
                    </div>
                    <span id="stencil-brightness-val" className="text-xs font-mono bg-zinc-950 px-2 py-1 rounded text-zinc-300 border border-zinc-800">
                        {Math.round(stencilBrightness * 100)}%
                    </span>
                  </div>
                  <div className="relative h-6 flex items-center mb-2 px-1">
                    <div className="absolute left-0 right-0 h-1.5 bg-zinc-950 rounded-full overflow-hidden">
                        <div id="stencil-brightness-fill" className="h-full bg-blue-600 transition-all duration-150" style={{ width: `${(stencilBrightness / 3) * 100}%` }} />
                    </div>
                    <input 
                      type="range" 
                      min="0.1" 
                      max="3" 
                      step="0.05" 
                      defaultValue={stencilBrightness} 
                      disabled={isProcessing} 
                      onInput={(e) => handleStencilBrightnessInput(parseFloat((e.target as HTMLInputElement).value))}
                      onPointerUp={(e) => setStencilBrightness(parseFloat((e.target as HTMLInputElement).value))}
                      onTouchEnd={(e) => setStencilBrightness(parseFloat((e.target as HTMLInputElement).value))}
                      className="absolute w-full h-6 opacity-0 cursor-pointer z-20" 
                    />
                    <div id="stencil-brightness-thumb" className="absolute h-4 w-4 bg-white rounded-full shadow-lg border border-zinc-400 pointer-events-none transition-all duration-75 z-10" style={{ left: `calc(${(stencilBrightness / 3) * 100}% - 14px)` }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-zinc-600 font-bold px-1">
                    <span>0%</span>
                    <span>150%</span>
                    <span>300%</span>
                  </div>
                </div>
              )}
           </div>
        )}
      </div>

      {isGenerated && insights && <ArtistInsightsPanel insights={insights} translations={t} language={language} />}

      <div className="w-full bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-sm">
        <div className="mb-6 bg-zinc-950/50 rounded-xl p-4 border border-zinc-800/50">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-zinc-900 rounded-lg shrink-0">
               <ScanFace className="w-4 h-4 text-zinc-400" />
            </div>
            <p className="text-zinc-400 text-xs leading-relaxed">{t.procreateTip}</p>
          </div>
        </div>
        
        <h3 className="font-bold text-white text-base mb-4">{t.download}</h3>
        <div className="flex gap-3 flex-wrap sm:flex-nowrap">
          <button onClick={handlePrint} disabled={!isGenerated || isProcessing} className={`flex-1 min-w-[140px] py-4 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all border ${isGenerated && !isProcessing ? 'bg-zinc-800 text-white border-zinc-700 hover:bg-zinc-750' : 'bg-zinc-900 text-zinc-600 cursor-not-allowed border-zinc-800'}`}>
            <Printer className="w-4 h-4" /> {t.print}
          </button>
          <button onClick={handleDownloadClick} disabled={!isGenerated || isProcessing} className={`flex-[2] min-w-[200px] py-4 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${isGenerated && !isProcessing ? 'bg-orange-600 text-white hover:bg-orange-500 shadow-lg shadow-orange-600/20' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'}`}>
            <Download className="w-4 h-4" /> {t.downloadPng}
          </button>
        </div>
        {onPublish && isGenerated && !isProcessing && (
          <div className="mt-4 flex justify-center">
             <button 
                onClick={onPublish} 
                disabled={published}
                className={`py-2 px-6 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${published ? 'bg-green-500/20 text-green-500' : 'bg-white/5 border border-white/10 hover:bg-white/10 text-white'}`}
              >
                {published ? (
                  <><CheckCircle2 className="w-4 h-4" /> Published to Gallery</>
                ) : (
                  <><Sparkles className="w-4 h-4 text-orange-500" /> Share to Discover Gallery</>
                )}
             </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviewSection;
