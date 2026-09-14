import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface LegalPagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  markdownContent: string;
}

export const LegalPagesModal: React.FC<LegalPagesModalProps> = ({ isOpen, onClose, title, markdownContent }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-[#121214] border border-white/10 rounded-2xl shadow-2xl z-[101] overflow-hidden max-h-[90vh] flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h2 className="text-xl font-bold text-white">{title}</h2>
              <button
                onClick={onClose}
                className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 prose prose-invert prose-zinc max-w-none">
              {/* Very simple markdown renderer using dangerouslySetInnerHTML, usually we'd use react-markdown but keeping it simple/lightweight for text */}
              <div 
                className="whitespace-pre-wrap text-zinc-300 text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ 
                  __html: markdownContent
                    .replace(/^### (.*$)/gim, '<h3 class="text-white font-bold text-lg mt-6 mb-2">$1</h3>')
                    .replace(/^## (.*$)/gim, '<h2 class="text-white font-bold text-xl mt-8 mb-4">$1</h2>')
                    .replace(/^# (.*$)/gim, '<h1 class="text-white font-bold text-2xl mt-8 mb-4">$1</h1>')
                    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
                    .replace(/\*(.*)\*/gim, '<em>$1</em>')
                }}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
