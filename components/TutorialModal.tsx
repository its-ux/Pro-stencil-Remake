import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Sparkles, Sliders, Image as ImageIcon } from 'lucide-react';

interface TutorialModalProps {
  onComplete: () => void;
  translations: any;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ onComplete, translations: t }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: t.tutStep0Title || "Welcome to ProStencils AI",
      description: t.tutStep0Desc || "You're just 3 steps away from transforming your tattoo references into professional stencil line art.",
      icon: <Sparkles className="w-12 h-12 text-orange-500" />
    },
    {
      title: t.tutStep1Title || "1. Prompt Matters",
      description: t.tutStep1Desc || "For the best results, describe the image clearly and define the desired style, e.g. 'high contrast, fine details, no background'.",
      icon: <ImageIcon className="w-12 h-12 text-orange-500" />
    },
    {
      title: t.tutStep2Title || "2. Control the Output",
      description: t.tutStep2Desc || "Use the sliders to adjust line weight, contrast, and transparency after generation to get the perfect print layout.",
      icon: <Sliders className="w-12 h-12 text-orange-500" />
    }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="relative bg-[#121214] border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl flex flex-col items-center text-center text-white"
        >
          <div className="bg-orange-500/10 p-4 rounded-full mb-6">
            {steps[step].icon}
          </div>
          
          <h2 className="text-2xl font-bold mb-4 tracking-tight">{steps[step].title}</h2>
          <p className="text-zinc-400 mb-8 leading-relaxed">
            {steps[step].description}
          </p>
          
          <div className="flex w-full justify-between items-center mt-auto">
            <div className="flex gap-2">
              {steps.map((_, i) => (
                 <div 
                  key={i} 
                  className={`h-2 rounded-full transition-all ${i === step ? 'w-8 bg-orange-600' : 'w-2 bg-white/20'}`}
                />
              ))}
            </div>
            
            <button
              onClick={() => {
                if (step < steps.length - 1) {
                  setStep(s => s + 1);
                } else {
                  onComplete();
                }
              }}
              className="px-6 py-3 bg-white text-black hover:bg-zinc-200 rounded-full font-bold flex items-center gap-2 transition-transform active:scale-95"
            >
              {step < steps.length - 1 ? (
                <>{t.tutNext || "Next"} <ArrowRight className="w-4 h-4" /></>
              ) : (
                t.tutStart || "Get Started"
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
