import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={className + " flex items-center justify-center p-1"}>
      <img 
        src="/logo.png" 
        alt="Pro Stencils Art" 
        className="w-full h-full object-contain"
        referrerPolicy="no-referrer"
      />
    </div>
  );
};
