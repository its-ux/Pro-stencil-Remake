import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Type, Download, Sliders, Palette, Share2, CornerUpLeft, SplitSquareHorizontal, Image as ImageIcon, Upload } from 'lucide-react';

interface TextBenderToolProps {
  onBack: () => void;
  language: string;
}

export const TextBenderTool: React.FC<TextBenderToolProps> = ({ onBack, language }) => {
  const [mode, setMode] = useState<'text' | 'image'>('text');
  const [text, setText] = useState('PRO STENCILS');
  const [curvature, setCurvature] = useState(50);
  const [fontSize, setFontSize] = useState(64);
  const [fontFamily, setFontFamily] = useState('Impact');
  const [textColor, setTextColor] = useState('#ffffff');
  const [letterSpacing, setLetterSpacing] = useState(10);
  const [outlineColor, setOutlineColor] = useState('#ea580c');
  const [outlineWidth, setOutlineWidth] = useState(0);
  const [isTransparent, setIsTransparent] = useState(true);
  
  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);
  const [imageScale, setImageScale] = useState(100);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const fontOptions = [
    'Impact', 'Arial', 'Courier New', 'Times New Roman', 'Verdana', 'Georgia', 'Comic Sans MS', 'Trebuchet MS', 'Arial Black', 'Palatino'
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const img = new window.Image();
      img.src = url;
      img.onload = () => {
        setImageObj(img);
      };
    }
  };

  const drawContent = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // We make the canvas large for high quality, scaled down in CSS
    const canvasWidth = 1200;
    const canvasHeight = 1200;
    
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    if (!isTransparent) {
      ctx.fillStyle = '#0a0a0a'; // Dark zinc background to match the app
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }
    
    const cx = canvasWidth / 2;
    const cy = canvasHeight / 2;

    if (mode === 'text') {
      ctx.font = `bold ${fontSize}px "${fontFamily}"`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const chars = text.split('');
      const charWidths = chars.map(char => ctx.measureText(char).width);
      
      // Total width including letter spacing
      const totalWidth = charWidths.reduce((a, b) => a + b, 0) + (chars.length > 0 ? (chars.length - 1) * letterSpacing : 0);
      
      if (Math.abs(curvature) < 1) {
        // Straight line
        let xOffset = -totalWidth / 2;
        for (let i = 0; i < chars.length; i++) {
          const width = charWidths[i];
          const x = cx + xOffset + width / 2;
          const y = cy;
          
          drawChar(ctx, chars[i], x, y, 0, textColor, outlineColor, outlineWidth);
          xOffset += width + letterSpacing;
        }
      } else {
        // Curved
        const maxAngleRadians = Math.PI * 1.6; // Max bend
        const totalAngle = (Math.abs(curvature) / 100) * maxAngleRadians;
        
        const R = Math.max(totalWidth / totalAngle, fontSize);
        const isUpward = curvature > 0;
        
        const centerY = isUpward ? cy + R : cy - R;
        let currentAngleOffset = -totalAngle / 2;
        
        for(let i=0; i<chars.length; i++) {
          const width = charWidths[i];
          const charAngle = (width / R);
          
          const angle = currentAngleOffset + (charAngle / 2);
          const theta = isUpward ? -Math.PI/2 + angle : Math.PI/2 - angle;
          
          const x = cx + R * Math.cos(theta);
          const y = centerY + R * Math.sin(theta);
          
          const rotation = isUpward ? angle : -angle;
          
          drawChar(ctx, chars[i], x, y, rotation, textColor, outlineColor, outlineWidth);
          
          currentAngleOffset += charAngle + (letterSpacing / R);
        }
      }
    } else if (mode === 'image' && imageObj) {
      const imgWidth = imageObj.width;
      const imgHeight = imageObj.height;
      
      const baseHeight = 200;
      const scaledHeight = baseHeight * (imageScale / 100);
      const aspect = imgWidth / imgHeight;
      const scaledWidth = scaledHeight * aspect;

      const totalWidth = scaledWidth;
      
      if (Math.abs(curvature) < 1) {
        ctx.drawImage(imageObj, cx - scaledWidth/2, cy - scaledHeight/2, scaledWidth, scaledHeight);
      } else {
        const maxAngleRadians = Math.PI * 1.6;
        const totalAngle = (Math.abs(curvature) / 100) * maxAngleRadians;
        
        const R = Math.max(totalWidth / totalAngle, scaledHeight);
        const isUpward = curvature > 0;
        
        const centerY = isUpward ? cy + R : cy - R;
        let currentAngleOffset = -totalAngle / 2;
        
        const slices = Math.max(800, Math.floor(scaledWidth));
        const sliceWidth = scaledWidth / slices;
        const srcSliceWidth = imgWidth / slices;
        
        const destOverlap = sliceWidth * 1.05;
        
        for(let i=0; i<slices; i++) {
          const charAngle = (sliceWidth / R);
          const angle = currentAngleOffset + (charAngle / 2);
          const theta = isUpward ? -Math.PI/2 + angle : Math.PI/2 - angle;
          
          const x = cx + R * Math.cos(theta);
          const y = centerY + R * Math.sin(theta);
          const rotation = isUpward ? angle : -angle;
          
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(rotation);
          ctx.drawImage(
            imageObj, 
            i * srcSliceWidth, 0, srcSliceWidth, imgHeight,
            -destOverlap/2, -scaledHeight/2, destOverlap, scaledHeight
          );
          ctx.restore();
          
          currentAngleOffset += charAngle;
        }
      }
    }
  };

  const drawChar = (ctx: CanvasRenderingContext2D, char: string, x: number, y: number, rotation: number, color: string, outColor: string, outWidth: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    if (outWidth > 0 && outColor) {
      ctx.lineWidth = outWidth;
      ctx.strokeStyle = outColor;
      ctx.strokeText(char, 0, 0);
    }
    ctx.fillStyle = color;
    ctx.fillText(char, 0, 0);
    ctx.restore();
  };

  useEffect(() => {
    const timer = setTimeout(drawContent, 50);
    return () => clearTimeout(timer);
  }, [mode, text, curvature, fontSize, fontFamily, textColor, letterSpacing, outlineColor, outlineWidth, isTransparent, imageObj, imageScale]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `bent-${mode}-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm font-medium"
        >
          <CornerUpLeft className="w-4 h-4" />
          {language === 'de' ? 'Zurück' : 'Back'}
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-600/20 rounded-lg">
            <SplitSquareHorizontal className="w-5 h-5 text-orange-500" />
          </div>
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-500">
            {language === 'de' ? 'Gebogener Text & Bild Generator' : 'Arc Text & Image Generator'}
          </h2>
        </div>
        
        <div className="flex bg-black/40 border border-white/5 rounded-xl p-1">
          <button 
            onClick={() => setMode('text')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest transition-all ${mode === 'text' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <Type className="w-4 h-4" />
            {language === 'de' ? 'Text' : 'Text'}
          </button>
          <button 
            onClick={() => setMode('image')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest transition-all ${mode === 'image' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <ImageIcon className="w-4 h-4" />
            {language === 'de' ? 'Bild' : 'Image'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-zinc-900/50 border border-white/10 rounded-[2rem] p-6 space-y-6 backdrop-blur-sm">
            <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
              <Sliders className="w-4 h-4" />
              {language === 'de' ? 'Parameter' : 'Parameters'}
            </h3>
            
            <div className="space-y-4">
              {mode === 'text' ? (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{language === 'de' ? 'Text' : 'Text Content'}</label>
                    <input 
                      type="text" 
                      value={text}
                      onChange={e => setText(e.target.value)}
                      className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 outline-none focus:border-orange-600 text-white"
                      placeholder="Enter text..."
                    />
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      <label>{language === 'de' ? 'Schriftgröße' : 'Font Size'}</label>
                      <span className="text-orange-500">{fontSize}px</span>
                    </div>
                    <input 
                      type="range" 
                      min="24" max="240" 
                      value={fontSize}
                      onChange={e => setFontSize(Number(e.target.value))}
                      className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                    />
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      <label>{language === 'de' ? 'Zeichenabstand' : 'Letter Spacing'}</label>
                      <span className="text-orange-500">{letterSpacing}px</span>
                    </div>
                    <input 
                      type="range" 
                      min="-20" max="100" 
                      value={letterSpacing}
                      onChange={e => setLetterSpacing(Number(e.target.value))}
                      className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                    />
                  </div>

                  <div className="space-y-2 pt-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{language === 'de' ? 'Schriftart' : 'Font Family'}</label>
                    <select 
                      value={fontFamily}
                      onChange={e => setFontFamily(e.target.value)}
                      className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 outline-none focus:border-orange-600 text-white"
                      style={{ fontFamily }}
                    >
                      {fontOptions.map(font => (
                        <option key={font} value={font} style={{ fontFamily: font }}>{font}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{language === 'de' ? 'Textfarbe' : 'Text Color'}</label>
                      <div className="flex items-center gap-2">
                        <input 
                          type="color" 
                          value={textColor}
                          onChange={e => setTextColor(e.target.value)}
                          className="w-10 h-10 rounded-xl overflow-hidden cursor-pointer bg-black/40 border border-white/5"
                        />
                        <span className="text-xs font-mono text-zinc-500">{textColor}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{language === 'de' ? 'Konturfarbe' : 'Outline Color'}</label>
                      <div className="flex items-center gap-2">
                        <input 
                          type="color" 
                          value={outlineColor}
                          onChange={e => setOutlineColor(e.target.value)}
                          className="w-10 h-10 rounded-xl overflow-hidden cursor-pointer bg-black/40 border border-white/5"
                        />
                        <span className="text-xs font-mono text-zinc-500">{outlineColor}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      <label>{language === 'de' ? 'Konturbreite' : 'Outline Width'}</label>
                      <span className="text-orange-500">{outlineWidth}px</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" max="20" 
                      value={outlineWidth}
                      onChange={e => setOutlineWidth(Number(e.target.value))}
                      className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-4">
                    <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-white/10 rounded-3xl hover:border-orange-500/50 hover:bg-orange-500/5 transition-all cursor-pointer group">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 text-zinc-500 mb-3 group-hover:text-orange-500 transition-colors" />
                        <p className="max-w-[150px] text-center text-xs text-zinc-400 font-bold uppercase tracking-widest">
                          {language === 'de' ? 'Bild Hochladen' : 'Upload Image'}
                        </p>
                      </div>
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </label>

                    {imageObj && (
                      <div className="space-y-3 pt-4 border-t border-white/5">
                        <div className="flex justify-between text-xs font-bold text-zinc-400 uppercase tracking-wider">
                          <label>{language === 'de' ? 'Bildgröße' : 'Image Scale'}</label>
                          <span className="text-orange-500">{imageScale}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="10" max="300" 
                          value={imageScale}
                          onChange={e => setImageScale(Number(e.target.value))}
                          className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                        />
                      </div>
                    )}
                  </div>
                </>
              )}

              <div className="space-y-3 pt-4 border-t border-white/5">
                <div className="flex justify-between text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  <label>{language === 'de' ? 'Krümmung' : 'Curvature'}</label>
                  <span className="text-orange-500">{curvature}</span>
                </div>
                <input 
                  type="range" 
                  min="-100" max="100" 
                  value={curvature}
                  onChange={e => setCurvature(Number(e.target.value))}
                  className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
                <div className="flex justify-between text-[10px] uppercase text-zinc-600">
                  <span>{language === 'de' ? 'Lächeln' : 'Smile'}</span>
                  <span>{language === 'de' ? 'Bogen' : 'Arch'}</span>
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      checked={isTransparent}
                      onChange={e => setIsTransparent(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-600"></div>
                  </div>
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    {language === 'de' ? 'Transparenter Hintergrund' : 'Transparent Background'}
                  </span>
                </label>
              </div>

            </div>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="lg:col-span-8 flex flex-col h-full space-y-4">
          <div className="flex-grow bg-zinc-900 border border-white/10 rounded-[2rem] overflow-hidden flex items-center justify-center relative min-h-[400px] lg:min-h-[500px]">
            {/* Checkerboard pattern for transparency */}
            {isTransparent && (
              <div className="absolute inset-0 z-0 opacity-10" style={{
                backgroundImage: 'repeating-linear-gradient(45deg, #808080 25%, transparent 25%, transparent 75%, #808080 75%, #808080), repeating-linear-gradient(45deg, #808080 25%, transparent 25%, transparent 75%, #808080 75%, #808080)',
                backgroundPosition: '0 0, 10px 10px',
                backgroundSize: '20px 20px'
              }} />
            )}
            
            <canvas 
              ref={canvasRef} 
              className="w-full h-full object-contain relative z-10"
              style={{ maxHeight: '70vh' }}
            />
          </div>
          
          <div className="flex justify-end">
            <button 
              onClick={handleDownload}
              className="flex items-center justify-center gap-3 px-8 py-4 bg-orange-600 hover:bg-orange-500 rounded-2xl transition-all font-bold uppercase tracking-widest text-sm shadow-lg shadow-orange-600/20"
            >
              <Download className="w-5 h-5" />
              {language === 'de' ? 'PNG Herunterladen' : 'Download PNG'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
