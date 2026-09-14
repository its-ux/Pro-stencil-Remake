import React from 'react';
import { Send, X, MessageSquare, Loader2 } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { motion, AnimatePresence } from 'framer-motion';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  translations: any;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, user, translations: t }) => {
  const [feedback, setFeedback] = React.useState('');
  const [type, setType] = React.useState<'bug' | 'suggestion' | 'other'>('suggestion');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'feedback'), {
        userId: user?.uid || 'anonymous',
        userEmail: user?.email || 'anonymous',
        content: feedback,
        type,
        timestamp: serverTimestamp(),
        userAgent: navigator.userAgent
      });
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
        setFeedback('');
      }, 2000);
    } catch (error) {
      console.error("Error submitting feedback:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden p-6 md:p-8"
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white">
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-orange-600/20 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-orange-500" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">User Feedback</h2>
            </div>

            {isSuccess ? (
              <div className="text-center py-8 space-y-4">
                <div className="text-4xl">🚀</div>
                <h3 className="text-lg font-bold text-white">Thank you!</h3>
                <p className="text-sm text-zinc-400">Your feedback helps us make Pro Stencils Art better.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Category</label>
                  <div className="flex gap-2">
                    {(['suggestion', 'bug', 'other'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setType(t)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase transition-all ${
                          type === t ? 'bg-orange-500 text-black' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Your Message</label>
                  <textarea
                    required
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Tell us what's on your mind..."
                    className="w-full h-32 bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder:text-zinc-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 outline-none transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !feedback.trim()}
                  className="w-full h-12 bg-orange-500 hover:bg-orange-400 disabled:bg-zinc-800 disabled:text-zinc-500 text-black font-bold rounded-2xl flex items-center justify-center gap-2 transition-all transform active:scale-95"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send Feedback
                    </>
                  )}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
