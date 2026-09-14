import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface TooltipProps {
  content: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ content }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  return (
    <div 
      className="relative inline-flex items-center ml-2 align-middle z-10"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onClick={(e) => {
        e.stopPropagation();
        setIsVisible(!isVisible);
      }}
      role="button"
      tabIndex={0}
      aria-label="Show information"
    >
      <HelpCircle className={`w-4 h-4 cursor-help transition-colors ${isVisible ? 'text-orange-500' : 'text-zinc-500 hover:text-zinc-300'}`} />
      <div className={`
        absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 p-3 
        bg-zinc-950 border border-zinc-700 rounded-lg shadow-xl shadow-black/50 
        transition-all duration-200 pointer-events-none z-50 backdrop-blur-sm
        ${isVisible ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-2'}
      `}>
        <p className="text-xs text-zinc-300 font-normal leading-relaxed text-center">{content}</p>
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-zinc-700" />
      </div>
    </div>
  );
};
