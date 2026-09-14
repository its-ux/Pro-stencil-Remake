import React, { useState, useMemo } from 'react';
import { Search, Calendar, Download, Trash2, Clock, FileJson } from 'lucide-react';
import { StencilHistoryItem } from '../types';
import { upscaleImage } from '../services/geminiService';

interface HistorySectionProps {
  history: StencilHistoryItem[];
  onDelete: (id: string) => void;
  onView: (item: StencilHistoryItem) => void;
  translations: any;
}

const HistorySection: React.FC<HistorySectionProps> = ({ history, onDelete, onView, translations: t }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHistory = useMemo(() => {
    return history.filter(item => {
      const dateStr = new Date(item.date).toLocaleDateString();
      const searchLower = searchTerm.toLowerCase();
      return (
        item.styleName.toLowerCase().includes(searchLower) ||
        dateStr.includes(searchLower)
      );
    }).sort((a, b) => b.date - a.date);
  }, [history, searchTerm]);

  const handleDownload = async (item: StencilHistoryItem) => {
    let downloadUrl = item.stencilImage;
    
    // If we have original dimensions, upscale back to that size for download
    if (item.dimensions) {
      try {
        downloadUrl = await upscaleImage(item.stencilImage, item.dimensions.width, item.dimensions.height);
      } catch (err) {
        console.error("Upscale failed, downloading original compressed version", err);
      }
    }

    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `stencil-${item.styleName.toLowerCase()}-${item.date}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportHistory = () => {
    try {
      const dataStr = JSON.stringify(history, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `easy-stencil-history-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to export history:", err);
    }
  };

  if (history.length === 0) return null;

  return (
    <div className="w-full max-w-5xl mt-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-baseline gap-3">
          <h2 className="text-2xl font-bold text-white">{t.myStencils}</h2>
          <span className="text-zinc-500 font-mono text-sm">{history.length}</span>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-grow md:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className="h-4 w-4 text-zinc-500" /></div>
            <input type="text" placeholder={t.searchPlaceholder} className="w-full bg-black/40 backdrop-blur-sm border border-white/10 text-zinc-200 text-sm rounded-xl focus:ring-orange-500 focus:border-orange-500 block pl-10 p-2.5" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <button onClick={handleExportHistory} className="flex items-center gap-2 px-4 py-2.5 bg-black/40 backdrop-blur-sm border border-white/10 hover:bg-black/60 text-white rounded-xl text-sm font-medium"><FileJson className="w-4 h-4" /> <span className="hidden sm:inline">{t.exportJson}</span></button>
        </div>
      </div>
      {filteredHistory.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredHistory.map((item) => (
            <div key={item.id} className="group relative bg-black/40 backdrop-blur-sm border border-white/5 rounded-xl overflow-hidden hover:border-white/20 transition-all duration-300">
              <div className="aspect-[4/5] p-4 flex items-center justify-center bg-[linear-gradient(45deg,#1f1f22_25%,transparent_25%,transparent_75%,#1f1f22_75%,#1f1f22)] bg-[length:20px_20px]">
                <img src={item.stencilImage || undefined} alt={`${item.styleName} stencil`} className="w-full h-full object-contain" loading="lazy" />
              </div>
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                 <button onClick={(e) => { e.stopPropagation(); onView(item); }} className="bg-orange-600 text-white px-4 py-2 rounded-full font-bold text-xs flex items-center gap-2">
                   <Clock className="w-3 h-3" /> {t.viewBtn || 'View'}
                 </button>
                 <button onClick={() => handleDownload(item)} className="bg-white text-black px-4 py-2 rounded-full font-bold text-xs flex items-center gap-2">{t.downloadBtn}</button>
                 <button onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} className="text-red-400 bg-red-950/50 px-3 py-1.5 rounded-full text-xs flex items-center gap-1.5 border border-red-900/50"><Trash2 className="w-3 h-3" /> {t.deleteBtn}</button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-zinc-950/90 border-t border-zinc-800">
                <div className="flex items-center justify-between">
                   <span className="text-xs font-semibold text-zinc-200 truncate">{item.styleName}</span>
                   <span className="text-[10px] text-zinc-500 font-mono">{new Date(item.date).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="w-full py-12 border-2 border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center text-zinc-500">
           <Search className="w-8 h-8 mb-3 opacity-50" />
           <p>{t.noHistory}</p>
        </div>
      )}
    </div>
  );
};

export default HistorySection;