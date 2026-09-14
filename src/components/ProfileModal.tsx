import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Zap, Clock, Trash2, ExternalLink } from 'lucide-react';
import { StencilHistoryItem } from '../../types';
import { upscaleImage } from '../../services/geminiService';
import { downloadImage } from '../lib/download';
import { deleteUser } from '../firebase';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: {
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
    role: string;
    quota: number;
    used: number;
  };
  lastStencils: StencilHistoryItem[];
  onDeleteStencil: (id: string) => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, userData, lastStencils, onDeleteStencil }) => {
  const handleDownload = async (stencil: StencilHistoryItem) => {
    let downloadUrl = stencil.stencilImage;
    
    if (stencil.dimensions) {
      try {
        downloadUrl = await upscaleImage(stencil.stencilImage, stencil.dimensions.width, stencil.dimensions.height);
      } catch (err) {
        console.error("Upscale failed", err);
      }
    }

    await downloadImage(downloadUrl, `stencil-${stencil.id}.png`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-zinc-950 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-orange-600/10 to-transparent">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-600/20 rounded-2xl">
                  <User className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">User Profile</h2>
                  <p className="text-zinc-500 text-sm">Manage your account and history</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-xl text-zinc-500 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto p-8 space-y-8 custom-scrollbar">
              {/* User Info Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-4">
                  <div className="flex items-center gap-4">
                    <img 
                      src={userData.photoURL || `https://ui-avatars.com/api/?name=${userData.displayName || 'User'}&background=ea580c&color=fff`} 
                      alt="" 
                      className="w-16 h-16 rounded-2xl border-2 border-orange-600/20"
                    />
                    <div>
                      <div className="font-bold text-lg text-white truncate max-w-[150px]">{userData.displayName || 'Artist'}</div>
                      <div className="text-zinc-500 text-sm flex items-center gap-1 truncate max-w-[150px]">
                        <Mail className="w-3 h-3" />
                        {userData.email}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-orange-600/10 border border-orange-600/20 rounded-full text-[10px] font-bold text-orange-500 uppercase tracking-widest">
                      {userData.role}
                    </span>
                    <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                      Active
                    </span>
                  </div>
                </div>

                <div className="p-6 bg-white/5 border border-white/10 rounded-3xl flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-zinc-500 text-sm font-bold uppercase tracking-widest">Stencil Quota</div>
                    <Zap className="w-5 h-5 text-orange-500" />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-end justify-between">
                        <div className="text-3xl font-bold text-white">{userData.used}<span className="text-zinc-600 text-lg">/{userData.quota}</span></div>
                        <div className="text-zinc-500 text-xs mb-1">{Math.round((userData.used / userData.quota) * 100)}% used</div>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden mt-2">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, (userData.used / userData.quota) * 100)}%` }}
                          className={`h-full ${userData.used >= userData.quota ? 'bg-red-600' : 'bg-orange-600'}`}
                        />
                      </div>
                    </div>
                    {userData.used >= userData.quota && (
                      <button 
                        onClick={() => window.location.href = `mailto:admin@prostencils.com?subject=Upgrade Quota Request: ${userData.email}`}
                        className="w-full py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-bold transition-colors"
                      >
                        Request Quota Increase
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Last 3 Stencils */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange-500" />
                    Last 3 Stencils
                  </h3>
                  <div className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Recent History</div>
                </div>

                {lastStencils.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {lastStencils.map((stencil) => (
                      <div key={stencil.id} className="group relative aspect-square bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                        <img 
                          src={stencil.stencilImage || undefined} 
                          alt="" 
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button 
                            onClick={() => onDeleteStencil(stencil.id)}
                            className="p-2 bg-red-600/80 hover:bg-red-600 rounded-lg text-white transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDownload(stencil)}
                            className="p-2 bg-orange-600/80 hover:bg-orange-600 rounded-lg text-white transition-colors"
                            title="Download"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                          <div className="text-[8px] text-white/60 uppercase font-bold tracking-widest truncate">
                            {stencil.styleName}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 border border-dashed border-white/10 rounded-3xl text-center">
                    <p className="text-zinc-500">No stencils generated yet.</p>
                  </div>
                )}
              </div>
              <div className="flex justify-between items-center bg-white/5 border border-red-500/20 p-4 rounded-2xl">
                <div>
                  <h4 className="text-white font-bold">Data & Privacy</h4>
                  <p className="text-zinc-500 text-xs">Manage your personal data (GDPR compliant)</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      const dataStr = JSON.stringify({ user: userData, stencils: lastStencils }, null, 2);
                      const blob = new Blob([dataStr], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `my-data-${userData.email}.json`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    Export Data
                  </button>
                  <button 
                    onClick={async () => {
                      if (window.confirm("Möchtest du dein Konto und alle deine Daten wirklich dauerhaft löschen? Dies kann nicht rückgängig gemacht werden.")) {
                        try {
                          const { getAuth } = await import('firebase/auth');
                          const auth = getAuth();
                          if (auth.currentUser) {
                            const uid = auth.currentUser.uid;
                            await deleteUser(uid);
                            await auth.currentUser.delete();
                            onClose();
                            window.location.reload();
                          }
                        } catch (err: any) {
                          console.error("Error deleting account:", err);
                          if (err.code === 'auth/requires-recent-login') {
                            alert("Aus Sicherheitsgründen musst du dich erst neu anmelden, um dein Konto zu löschen.");
                          } else {
                            alert("Fehler beim Löschen des Kontos: " + (err.message || "Unbekannter Fehler"));
                          }
                        }
                      }
                    }}
                    className="px-4 py-2 bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white rounded-xl text-xs font-bold transition-all"
                  >
                    Konto Löschen
                  </button>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="p-6 bg-white/5 border-t border-white/5 text-center">
              <p className="text-zinc-600 text-xs italic">
                Professional AI Stencil Generation • {new Date().getFullYear()}
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ProfileModal;
