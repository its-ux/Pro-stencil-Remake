import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LogIn, Mail, User, Lock, AlertTriangle, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { Logo } from './Logo';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoogleLogin: () => void;
  onEmailLogin?: (email: string, pass: string) => Promise<void>;
  onEmailRegister?: (email: string, pass: string, name: string) => Promise<void>;
  onGuestLogin?: (displayName?: string) => Promise<void>;
  isLoggingIn?: boolean;
  loginError?: string | null;
  onClearLoginError?: () => void;
  isDemoEnabled?: boolean;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onGoogleLogin,
  onEmailLogin,
  onEmailRegister,
  onGuestLogin,
  isLoggingIn,
  loginError,
  onClearLoginError,
  isDemoEnabled = true
}) => {
  const [tab, setTab] = useState<'options' | 'email_login' | 'email_register'>('options');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!email || !password) {
      setLocalError("Bitte füllen Sie alle Felder aus.");
      return;
    }

    try {
      if (tab === 'email_login' && onEmailLogin) {
        await onEmailLogin(email, password);
        onClose();
      } else if (tab === 'email_register' && onEmailRegister) {
        await onEmailRegister(email, password, name);
        onClose();
      }
    } catch (err: any) {
      // Error handled by parent or local state
    }
  };

  const handleGuestClick = async () => {
    setLocalError(null);
    if (!isDemoEnabled) {
      setLocalError("Der Gast- / Demo-Zugang wurde vom Administrator vorübergehend deaktiviert.");
      return;
    }
    try {
      if (onGuestLogin) {
        await onGuestLogin("Guest Artist");
        onClose();
      }
    } catch (err: any) {
      setLocalError("Gast-Anmeldung fehlgeschlagen.");
    }
  };

  const displayError = localError || loginError;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md p-6 sm:p-8 bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden text-white"
        >
          {/* Header Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-orange-600/15 blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-zinc-400 hover:text-white bg-zinc-900/50 hover:bg-zinc-800 rounded-full transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Logo & Title */}
          <div className="text-center space-y-3 mb-6 relative">
            <div className="w-16 h-16 mx-auto rounded-2xl border border-orange-500/30 bg-orange-500/10 flex items-center justify-center p-2 shadow-lg">
              <Logo className="w-full h-full text-orange-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Pro Stencils Art</h2>
              <p className="text-xs text-zinc-400 mt-1">
                Wählen Sie Ihre bevorzugte Anmeldeoption
              </p>
            </div>
          </div>

          {/* Global / Local Error Banner */}
          {displayError && (
            <div className="mb-6 p-4 bg-red-950/80 border border-red-500/30 rounded-2xl space-y-3 text-left">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div className="flex-1 text-xs text-zinc-300 leading-relaxed">
                  <p className="font-bold text-red-400 mb-0.5">Anmeldehinweis</p>
                  {displayError}
                </div>
                <button
                  onClick={() => {
                    setLocalError(null);
                    if (onClearLoginError) onClearLoginError();
                  }}
                  className="text-zinc-500 hover:text-zinc-300 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Instant Fallback Button for quick recovery */}
              <div className="pt-1 flex flex-wrap gap-2">
                {isDemoEnabled && (
                  <button
                    type="button"
                    onClick={handleGuestClick}
                    disabled={isLoggingIn}
                    className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md transition-all"
                  >
                    <Zap className="w-3.5 h-3.5 fill-white" />
                    <span>Jetzt als Gast anmelden</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setTab('email_login')}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
                >
                  <Mail className="w-3.5 h-3.5 text-orange-400" />
                  <span>E-Mail nutzen</span>
                </button>
              </div>
            </div>
          )}

          {tab === 'options' && (
            <div className="space-y-3">
              {/* Google Login Button */}
              <button
                onClick={onGoogleLogin}
                disabled={isLoggingIn}
                className="w-full py-3.5 px-4 bg-white text-zinc-950 font-bold rounded-2xl flex items-center justify-center gap-3 hover:bg-zinc-100 transition-all shadow-lg active:scale-[0.98] disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>{isLoggingIn ? 'Verbinde...' : 'Mit Google anmelden'}</span>
              </button>

              {/* Email Login Button */}
              <button
                onClick={() => setTab('email_login')}
                disabled={isLoggingIn}
                className="w-full py-3.5 px-4 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-200 font-bold rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <Mail className="w-5 h-5 text-orange-500" />
                <span>Mit E-Mail & Passwort anmelden</span>
              </button>

              {/* Guest / Demo Login Button */}
              <button
                onClick={handleGuestClick}
                disabled={isLoggingIn || !isDemoEnabled}
                className={`w-full py-3.5 px-4 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] ${
                  isDemoEnabled
                    ? 'bg-orange-600/15 border border-orange-500/30 hover:bg-orange-600/25 text-orange-400 font-bold'
                    : 'bg-zinc-900/50 border border-zinc-800/60 text-zinc-600 font-medium cursor-not-allowed opacity-60'
                }`}
              >
                <Zap className={`w-5 h-5 ${isDemoEnabled ? 'text-orange-500 animate-pulse' : 'text-zinc-600'}`} />
                <span>
                  {isDemoEnabled
                    ? 'Sofort als Gast / Demozugang starten'
                    : 'Gast- / Demozugang (Vom Admin deaktiviert)'}
                </span>
              </button>
            </div>
          )}

          {(tab === 'email_login' || tab === 'email_register') && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="flex border-b border-zinc-800 mb-4 text-sm font-bold">
                <button
                  type="button"
                  onClick={() => setTab('email_login')}
                  className={`flex-1 py-2 text-center transition-colors border-b-2 ${tab === 'email_login' ? 'border-orange-500 text-orange-500' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
                >
                  Anmelden
                </button>
                <button
                  type="button"
                  onClick={() => setTab('email_register')}
                  className={`flex-1 py-2 text-center transition-colors border-b-2 ${tab === 'email_register' ? 'border-orange-500 text-orange-500' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
                >
                  Registrieren
                </button>
              </div>

              {tab === 'email_register' && (
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Name / Künstlername</label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="z.B. Alex Ink"
                      className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500 transition-colors"
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">E-Mail-Adresse</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@beispiel.de"
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Passwort</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoggingIn ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{tab === 'email_login' ? 'Anmelden' : 'Konto erstellen'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setTab('options')}
                  className="w-full py-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  ← Zurück zu allen Anmeldeoptionen
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 pt-4 border-t border-zinc-900 text-center text-[11px] text-zinc-500 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
            <span>Sichere Ende-zu-Ende Verbindung & Datenschutz</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
