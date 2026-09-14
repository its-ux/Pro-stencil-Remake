import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageSquare, CheckCircle, AlertCircle } from 'lucide-react';
import { sendMessageToAdmin } from '../firebase';

interface AdminContactProps {
  translations: any;
}

const AdminContact: React.FC<AdminContactProps> = ({ translations: t }) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isSending) return;

    setIsSending(true);
    setError(null);
    try {
      await sendMessageToAdmin(message);
      setIsSent(true);
      setMessage('');
      setTimeout(() => setIsSent(false), 5000);
    } catch (err: any) {
      setError(err.message || 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="mt-8 p-6 bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-transparent opacity-50" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-orange-600/20 rounded-xl flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{t.contactAdmin || "Admin kontaktieren"}</h3>
            <p className="text-xs text-zinc-500">{t.contactAdminSub || "Fragen, Feedback oder technische Hilfe"}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t.messagePlaceholder || "Ihre Nachricht an den Admin..."}
              disabled={isSending}
              className="w-full h-32 bg-black/40 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-orange-500/50 transition-all resize-none placeholder:text-zinc-600"
            />
            <AnimatePresence>
              {isSent && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute inset-0 bg-zinc-900/90 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center text-center p-4"
                >
                  <CheckCircle className="w-12 h-12 text-green-500 mb-2" />
                  <div className="text-lg font-bold text-white">Nachricht gesendet!</div>
                  <div className="text-sm text-zinc-500">Der Admin wird sich in Kürze bei Ihnen melden.</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-between gap-4">
            {error && (
              <div className="flex items-center gap-2 text-red-500 text-xs">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
            <div className="flex-grow" />
            <button
              type="submit"
              disabled={isSending || !message.trim() || isSent}
              className="flex items-center gap-2 px-6 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:bg-zinc-800 rounded-xl font-bold transition-all text-white shadow-lg shadow-orange-600/20"
            >
              {isSending ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {t.sendMessage || "Senden"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminContact;
