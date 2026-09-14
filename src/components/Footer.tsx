
import React from 'react';
import { Instagram, Facebook } from 'lucide-react';
import { Logo } from '../../components/Logo';

interface FooterProps {
  t: any;
  siteConfig: any;
  socialLinksConfig: any;
  setCurrentView: (view: any) => void;
}

export const Footer: React.FC<FooterProps> = ({ t, siteConfig, socialLinksConfig, setCurrentView }) => {
  return (
    <footer className="w-full py-8 px-8 flex flex-col items-center justify-center gap-6 text-zinc-600 text-sm relative z-10 border-t border-zinc-900 bg-zinc-950">
      <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-7xl">
        <div className="flex items-center gap-4 mb-4 md:mb-0">
          <div className="w-[40px] h-[40px] rounded-lg shadow-md flex items-center justify-center overflow-hidden border border-zinc-800">
            <Logo className="w-full h-full" />
          </div>
          <div className="flex flex-col">
            <span className="text-white font-bold text-lg tracking-tight leading-none">Pro Stencils Art</span>
          </div>
        </div>

        <div className="flex items-center gap-6 mb-4 md:mb-0">
          {socialLinksConfig?.instagram && (
            <a href={socialLinksConfig.instagram} target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-orange-500 transition-colors">
              <Instagram className="w-5 h-5" />
            </a>
          )}
          {socialLinksConfig?.tiktok && (
            <a href={socialLinksConfig.tiktok} target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-orange-500 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
            </a>
          )}
          {socialLinksConfig?.facebook && (
            <a href={socialLinksConfig.facebook} target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-orange-500 transition-colors">
              <Facebook className="w-5 h-5" />
            </a>
          )}
        </div>

        <div className="flex gap-6 font-medium mb-4 md:mb-0">
          <button onClick={() => { setCurrentView('privacy'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-zinc-400 transition-colors">{t.privacy}</button>
          <button onClick={() => { setCurrentView('terms'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-zinc-400 transition-colors">{t.terms}</button>
          <button onClick={() => { setCurrentView('support'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-zinc-400 transition-colors">{t.support}</button>
        </div>
      </div>
      
      <p className="text-zinc-600 text-sm">© 2025 Pro Stencils Art. {t.allRightsReserved}</p>
    </footer>
  );
};
