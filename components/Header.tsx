
import React from 'react';
import { Languages, LogOut, Settings, User, Maximize2, MessageSquare } from 'lucide-react';
import { Language } from '../types';
import { Logo } from './Logo';

interface HeaderProps {
  language: Language;
  onLanguageToggle: () => void;
  onLogout: () => void;
  isAdmin?: boolean;
  onOpenAdmin?: () => void;
  onOpenProfile?: () => void;
  onOpenUpscaler?: () => void;
  onOpenDiscover?: () => void;
  onOpenFeedback?: () => void;
  userPhoto?: string | null;
  onLogoClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  language, 
  onLanguageToggle, 
  onLogout, 
  isAdmin, 
  onOpenAdmin, 
  onOpenProfile, 
  onOpenUpscaler, 
  onOpenDiscover, 
  onOpenFeedback,
  userPhoto, 
  onLogoClick 
}) => {
  return (
    <header className="w-full py-3 px-4 flex items-center justify-center border-b-[3px] border-double border-white/10 bg-black/40 backdrop-blur-md sticky top-0 z-50">
      <div className="w-full max-w-7xl flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-4 cursor-pointer group" onClick={onLogoClick}>
          <div className="w-10 h-10 sm:w-[48px] sm:h-[48px] rounded-lg sm:rounded-xl shadow-lg flex items-center justify-center overflow-hidden border border-zinc-800 group-hover:border-zinc-700 transition-colors">
            <Logo className="w-full h-full group-hover:scale-105 transition-transform duration-500" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-xl font-bold tracking-tight text-white leading-none">
                Pro Stencils Art
              </h1>
              <span className="px-1.5 py-0.5 bg-orange-600/20 border border-orange-600/30 rounded text-[9px] font-bold text-orange-500 uppercase tracking-widest h-fit mt-0.5">
                Beta
              </span>
            </div>
            <span style={{ fontFamily: "'Exmouth', cursive", fontSize: "1rem", letterSpacing: "1px" }} className="text-orange-500/90 font-medium hidden sm:block">
              By Kenny Goossens
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {onOpenDiscover && (
            <button 
              onClick={onOpenDiscover}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-full font-bold text-xs transition-colors shadow-lg shadow-orange-600/20"
            >
              <span>🌟</span> Discover
            </button>
          )}
          {isAdmin && (
            <button 
              onClick={onOpenAdmin}
              className="flex items-center gap-2 px-3 py-1.5 bg-orange-600/10 border border-orange-600/20 rounded-full hover:bg-orange-600/20 transition-all group"
              title="Admin Panel"
            >
              <Settings className="w-4 h-4 text-orange-500 group-hover:rotate-90 transition-transform duration-500" />
            </button>
          )}
          <button 
            onClick={onOpenFeedback}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all group"
            title="Send Feedback"
          >
            <MessageSquare className="w-4 h-4 text-zinc-400 group-hover:text-orange-500" />
          </button>
          <button 
            onClick={onOpenProfile}
            className="flex items-center gap-2 p-1 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all group overflow-hidden"
            title="Profile"
          >
            {userPhoto && userPhoto !== "" ? (
              <img src={userPhoto} alt="" className="w-7 h-7 rounded-full object-cover" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-orange-600/20 flex items-center justify-center">
                <User className="w-4 h-4 text-orange-500" />
              </div>
            )}
          </button>
          <button 
            onClick={onLanguageToggle}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all group"
          >
            <Languages className="w-4 h-4 text-zinc-400 group-hover:text-orange-500" />
            <span className="text-xs font-bold text-zinc-300 uppercase tracking-widest">
              {language === 'en' ? 'EN' : 'DE'}
            </span>
          </button>
          <button 
            onClick={onLogout}
            className="flex items-center gap-2 px-3 py-1.5 bg-orange-600/10 border border-orange-600/20 rounded-full hover:bg-orange-600/20 transition-all group"
            title="Logout"
          >
            <LogOut className="w-4 h-4 text-orange-500" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
