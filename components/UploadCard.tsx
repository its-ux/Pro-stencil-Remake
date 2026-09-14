
import React, { useCallback, useState, useRef } from 'react';
import { Upload, HelpCircle, Image as ImageIcon, AlertCircle } from 'lucide-react';

interface UploadCardProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
  translations: any;
  config?: any;
}

const UploadCard: React.FC<UploadCardProps> = ({ onFileSelect, disabled, translations: t, config }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const validateAndProcessFile = (file: File) => {
    setError(null);
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPG, PNG, GIF).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File size too large. Max 10MB.');
      return;
    }
    onFileSelect(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  }, [disabled, onFileSelect]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <div 
        className={`
          relative bg-black/40 backdrop-blur-md border-2 rounded-2xl p-8 md:p-12 transition-all duration-300
          flex flex-col items-center text-center group
          ${isDragging ? 'border-orange-600 bg-orange-600/10' : 'border-white/10'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-white/20'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="absolute top-4 left-4 font-mono text-zinc-600 font-bold text-sm">
          1
        </div>
        <div className="absolute top-4 right-4 text-zinc-600 hover:text-zinc-400 cursor-pointer">
          <HelpCircle className="w-5 h-5" />
        </div>
        <div className={`
          w-16 h-16 rounded-full flex items-center justify-center mb-6 transition-colors
          ${isDragging ? 'bg-orange-600/20 text-orange-500' : 'bg-zinc-800 text-zinc-400 group-hover:bg-zinc-700 group-hover:text-zinc-300'}
        `}>
          {isDragging ? <ImageIcon className="w-8 h-8" /> : <Upload className="w-8 h-8" />}
        </div>
        <h2 className="text-2xl font-semibold text-white mb-2">{config?.uploadLabel || t.uploadLabel}</h2>
        <p className="text-zinc-400 mb-8 max-w-xs mx-auto">{config?.uploadSub || t.uploadSub}</p>
        
        <input type="file" ref={fileInputRef} onChange={handleFileInputChange} accept="image/png, image/jpeg, image/gif" className="hidden" disabled={disabled} />
        
        <div className="flex flex-col w-full gap-3">
            <button onClick={handleUploadClick} disabled={disabled} className="w-full bg-white text-black font-semibold py-3.5 px-6 rounded-xl hover:bg-zinc-200 transition-colors focus:outline-none">
              {config?.buttonText || t.uploadBtn}
            </button>
        </div>
        <p className="mt-4 text-sm text-zinc-500">Supports JPG, PNG, GIF up to 10MB</p>
      </div>
      {error && (
        <div className="mt-4 p-4 bg-red-900/20 border border-red-900/50 rounded-xl flex items-center gap-3 text-red-200 animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}
    </div>
  );
};

export default UploadCard;
