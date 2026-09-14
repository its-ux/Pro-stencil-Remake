import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  PenTool, 
  Type, 
  Maximize2, 
  Image as ImageIcon, 
  HelpCircle, 
  Settings, 
  Menu, 
  X, 
  ChevronDown, 
  LogOut, 
  User as UserIcon, 
  Plus, 
  MessageSquare, 
  Bell, 
  Database, 
  Layers, 
  Check, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Cpu,
  RefreshCw,
  Globe,
  Terminal,
  Clock,
  Trash2
} from 'lucide-react';
import { User } from 'firebase/auth';
import { StencilHistoryItem, Language } from '../../types';

interface AppDashboardProps {
  user: User;
  isAdmin: boolean;
  language: Language;
  setLanguage: (lang: Language) => void;
  handleLogoutAction: () => Promise<void>;
  siteConfig: any;
  currentView: string;
  setCurrentView: (view: any) => void;
  userQuota: number;
  stencilCount: number;
  history: StencilHistoryItem[];
  deleteHistoryItem: (id: string) => void;
  handleViewHistory: (item: StencilHistoryItem) => void;
  t: any;
  setShowProfile: (show: boolean) => void;
  setShowFeedback: (show: boolean) => void;
  setShowAdminPanel: (show: boolean) => void;
  setCustomPrompt: (prompt: string) => void;
  children: React.ReactNode;
}

export const AppDashboard: React.FC<AppDashboardProps> = ({
  user,
  isAdmin,
  language,
  setLanguage,
  handleLogoutAction,
  siteConfig,
  currentView,
  setCurrentView,
  userQuota,
  stencilCount,
  history,
  deleteHistoryItem,
  handleViewHistory,
  t,
  setShowProfile,
  setShowFeedback,
  setShowAdminPanel,
  setCustomPrompt,
  children
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  
  // Quick Draft state
  const [draftTitle, setDraftTitle] = useState('');
  const [draftContent, setDraftContent] = useState('');
  const [draftSavedMsg, setDraftSavedMsg] = useState(false);

  // App simulation news
  const dashboardNews = [
    {
      id: 'news-1',
      title: language === 'de' ? 'Pro Stencils Black Label v3.0 erfolgreich installiert' : 'Pro Stencils Black Label v3.0 successfully installed',
      date: '06. Juni 2026',
      desc: language === 'de' ? 'Das neueste Major-Update bringt ultra-präzise Vektor-Algorithmen und reibungslose API-Konnektivität.' : 'New major update introduces ultra-precise vector algorithms and seamless API connectivity.'
    },
    {
      id: 'news-2',
      title: language === 'de' ? 'Optimierter Farbmisch-Leitfaden für Realismus' : 'Optimized ink mixing ratios for realism',
      date: '04. Juni 2026',
      desc: language === 'de' ? 'Unsere Künstliche Intelligenz berechnet jetzt Nadel- und Farbtropfenempfehlungen mit 20% höherer Genauigkeit.' : 'Our artificial intelligence now calculates needles and ink-drop recommendations with 20% higher precision.'
    },
    {
      id: 'news-3',
      title: language === 'de' ? 'Sicherheitshinweis: Firestore & OAuth verstärkt' : 'Security Advisory: Firestore & OAuth hardened',
      date: '28. Mai 2026',
      desc: language === 'de' ? 'Alle Kundendaten werden nach AES-256 standardisiert und sicher mit Ihrer Instanz synchronisiert.' : 'Customer datasets are standardized according to AES-256 and securely synchronized with your instance.'
    }
  ];

  const handleQuickDraftSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftContent) return;
    
    // Set custom prompt and redirect directly to Stencil Generator view
    setCustomPrompt(draftContent);
    setDraftSavedMsg(true);
    
    setTimeout(() => {
      setDraftSavedMsg(false);
      setDraftTitle('');
      setDraftContent('');
      setCurrentView('stencil');
    }, 1000);
  };

  const handleViewHomeAndNav = (viewName: any) => {
    setCurrentView(viewName);
    setMobileMenuOpen(false);
  };

  // Quota percentage calculation
  const quotaPercent = Math.min(Math.round((stencilCount / userQuota) * 100), 100);

  // Dashboard sidebar menu configs
  const menuItems = [
    {
      id: 'dashboard',
      label: language === 'de' ? 'Dashboard' : 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
      action: () => handleViewHomeAndNav('home')
    },
    {
      id: 'stencil',
      label: language === 'de' ? 'Stencil Generator' : 'Stencil Generator',
      icon: <PenTool className="w-4 h-4" />,
      action: () => handleViewHomeAndNav('stencil')
    },
    {
      id: 'textbender',
      label: language === 'de' ? 'Bogen Text' : 'Arc Text (Curved)',
      icon: <Type className="w-4 h-4" />,
      action: () => handleViewHomeAndNav('textbender')
    },
    {
      id: 'upscaler',
      label: language === 'de' ? 'AI Upscaler' : 'AI Upscaler HD',
      icon: <Maximize2 className="w-4 h-4" />,
      action: () => handleViewHomeAndNav('upscaler')
    },
    {
      id: 'history',
      label: language === 'de' ? 'Mediathek (Historie)' : 'Media Library',
      icon: <ImageIcon className="w-4 h-4" />,
      action: () => handleViewHomeAndNav('history')
    },
    {
      id: 'support',
      label: language === 'de' ? 'Hilfe & Support' : 'Support Center',
      icon: <HelpCircle className="w-4 h-4" />,
      action: () => handleViewHomeAndNav('support')
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#121315] text-[#e0e2e5] font-sans selection:bg-[#2271b1]/50 text-sm">
      {/* 1. Top Admin Bar */}
      <header id="adminbar" className="h-10 bg-[#1d2327] border-b border-zinc-800 text-[#c3c4c7] flex items-center justify-between px-3 fixed top-0 w-full z-50 select-none shadow-sm">
        <div className="flex items-center space-x-4">
          {/* Mobile hamburger menu */}
          <button 
            id="mobile-hamburger"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="md:hidden p-1.5 hover:bg-[#2c3338] hover:text-white rounded transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-orange-500" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Logo Custom Badge */}
          <div className="flex items-center space-x-1.5 cursor-pointer hover:bg-[#2c3338] px-2 py-1.5 rounded transition-all" onClick={() => handleViewHomeAndNav('home')}>
            <div className="w-4 h-4 bg-orange-600 rounded-full flex items-center justify-center font-bold text-[10px] text-white">S</div>
            <span className="font-semibold text-white tracking-wide text-xs hidden sm:inline">Pro Stencils Suite</span>
          </div>

          {/* Quick links */}
          <div className="hidden md:flex items-center space-x-2">
            <button 
              onClick={() => handleViewHomeAndNav('stencil')} 
              className="flex items-center space-x-1 hover:bg-[#2c3338] hover:text-white px-2.5 py-1.5 rounded text-xs transition-all"
            >
              <Plus className="w-3.5 h-3.5 text-zinc-400" />
              <span>{language === 'de' ? 'Neu' : 'New'}</span>
            </button>
            <button 
              onClick={() => setShowFeedback(true)} 
              className="flex items-center space-x-1 hover:bg-[#2c3338] hover:text-white px-2.5 py-1.5 rounded text-xs transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5 text-zinc-400" />
              <span className="bg-[#2271b1] text-white text-[9px] px-1.5 py-0.2 rounded-full font-bold">5</span>
            </button>
            <div className="h-4 w-px bg-zinc-800" />
            <div className="flex items-center space-x-1 bg-zinc-800/50 px-2 py-1 rounded text-[11px] text-zinc-400 font-mono">
              <Database className="w-3.5 h-3.5 text-orange-500" />
              <span>DB Online</span>
            </div>
          </div>
        </div>

        {/* User context & language toggle on right */}
        <div className="flex items-center space-x-3">
          {/* Language selector */}
          <button 
            onClick={() => setLanguage(language === 'de' ? 'en' : 'de')} 
            className="text-xs hover:text-white bg-zinc-800/60 hover:bg-zinc-850 px-2 py-1 rounded border border-zinc-700 flex items-center space-x-1 font-semibold uppercase text-zinc-400"
          >
            <Globe className="w-3 h-3 text-orange-500" />
            <span>{language}</span>
          </button>

          {/* Howdy User Profile drop */}
          <div className="relative">
            <button 
              id="adminbar-user-toggle"
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center space-x-2 hover:bg-[#2c3338] hover:text-white px-2.5 py-1 rounded transition-colors cursor-pointer select-none"
            >
              <span className="text-xs text-zinc-300 hidden md:inline">
                {language === 'de' ? 'Willkommen' : 'Howdy'}, <strong className="text-white">{user.displayName || 'Artist'}</strong>
              </span>
              {user.photoURL ? (
                <img src={user.photoURL} alt="" className="w-5 h-5 rounded-full object-cover border border-zinc-700 shadow-inner" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-5 h-5 rounded-full bg-orange-600 flex items-center justify-center text-[10px] text-white font-bold">
                  {user.displayName?.[0]?.toUpperCase() || 'A'}
                </div>
              )}
              <ChevronDown className="w-3 h-3 text-zinc-500" />
            </button>

            {/* Dropdown panel */}
            {profileDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setProfileDropdownOpen(false)} />
                <div id="profile-dropdown" className="absolute right-0 mt-1.5 w-56 bg-[#1d2327] border border-zinc-800 rounded-md shadow-2xl py-1 z-50 text-xs animate-in fade-in duration-100">
                  <div className="px-3 py-2 border-b border-zinc-800 flex items-center space-x-2">
                    {user.photoURL && <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full border border-zinc-700" referrerPolicy="no-referrer" />}
                    <div>
                      <h4 className="font-bold text-white text-xs truncate max-w-[140px]">{user.displayName || 'Artist'}</h4>
                      <p className="text-[10px] text-zinc-400 truncate max-w-[140px]">{user.email}</p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => { setShowProfile(true); setProfileDropdownOpen(false); }} 
                    className="w-full text-left px-4 py-2 hover:bg-[#2271b1] hover:text-white transition-colors flex items-center space-x-2 text-zinc-300"
                  >
                    <UserIcon className="w-3.5 h-3.5" />
                    <span>{language === 'de' ? 'Mein Profil' : 'My Profile'}</span>
                  </button>

                  {isAdmin && (
                    <button 
                      onClick={() => { setShowAdminPanel(true); setProfileDropdownOpen(false); }} 
                      className="w-full text-left px-4 py-2 hover:bg-[#2271b1] hover:text-white transition-colors flex items-center space-x-2 text-zinc-300"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      <span>{language === 'de' ? 'Admin-Panel' : 'Admin Panel'}</span>
                    </button>
                  )}

                  <hr className="border-zinc-800 my-1" />

                  <button 
                    onClick={() => { handleLogoutAction(); setProfileDropdownOpen(false); }} 
                    className="w-full text-left px-4 py-2 hover:bg-red-800 hover:text-white transition-colors flex items-center space-x-2 text-red-400"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{language === 'de' ? 'Abmelden' : 'Logout Log'}</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 pt-10 relative">
        {/* 2. Left Sidebar */}
        {/* Desktop Sidebar */}
        <aside 
          id="adminmenu" 
          className={`bg-[#1d2327] border-r border-zinc-800/60 hidden md:flex flex-col select-none pt-4 fixed h-[calc(100vh-40px)] shadow-lg left-0 transition-all duration-300 z-30 ${sidebarCollapsed ? 'w-14' : 'w-56'}`}
        >
          <div className="flex-1 space-y-1 px-1">
            {menuItems.map((item) => {
              // Check if current page is active
              // home viewport is selection viewport or home
              const isActive = (item.id === 'dashboard' && currentView === 'home') || 
                               (item.id === 'stencil' && currentView === 'stencil') ||
                               (item.id === 'textbender' && currentView === 'textbender') ||
                               (item.id === 'upscaler' && currentView === 'upscaler') ||
                               (item.id === 'history' && currentView === 'history') ||
                               (item.id === 'support' && currentView === 'support');

              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  className={`w-full flex items-center transition-all px-3 py-2.5 rounded text-xs select-none relative ${
                    isActive 
                      ? 'bg-[#2271b1] text-white font-bold' 
                      : 'text-zinc-300 hover:bg-[#2c3338] hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-center">
                    {item.icon}
                  </div>
                  {!sidebarCollapsed && (
                    <span className="ml-3 font-medium tracking-wide">
                      {item.label}
                    </span>
                  )}
                  {isActive && !sidebarCollapsed && (
                    <div className="absolute right-2 w-1.5 h-5 bg-orange-500 rounded-full" />
                  )}
                </button>
              );
            })}

            {isAdmin && (
              <button
                onClick={() => setShowAdminPanel(true)}
                className="w-full flex items-center text-zinc-400 hover:bg-[#2c3338] hover:text-white px-3 py-2.5 rounded text-xs transition-all mt-4"
              >
                <Settings className="w-4 h-4 text-orange-500 animate-pulse" />
                {!sidebarCollapsed && (
                  <span className="ml-3 font-bold text-orange-500">
                    {language === 'de' ? 'Einstellungen' : 'Settings'}
                  </span>
                )}
              </button>
            )}
          </div>

          {/* Account status widget in sidebar */}
          {!sidebarCollapsed && (
            <div className="m-3 p-3 bg-zinc-900/50 border border-zinc-800 rounded-xl space-y-2 text-[11px]">
              <div className="flex items-center justify-between text-zinc-400">
                <span>{language === 'de' ? 'Quota-Verbrauch' : 'Quota Usage'}</span>
                <span className="font-mono font-bold text-orange-500">{stencilCount} / {userQuota}</span>
              </div>
              <div className="w-full bg-zinc-850 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-orange-600 to-orange-400 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${quotaPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Collapse toggle at bottom */}
          <button 
            id="collapse-button"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-3 border-t border-zinc-800/80 text-center text-zinc-500 hover:text-white flex items-center justify-center hover:bg-[#2c3338] transition-colors"
          >
            <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${sidebarCollapsed ? '' : 'rotate-180'}`} />
            {!sidebarCollapsed && <span className="ml-2 text-xs font-medium">{language === 'de' ? 'Menü einklappen' : 'Collapse Menu'}</span>}
          </button>
        </aside>

        {/* Mobile Slide-out Menu */}
        {mobileMenuOpen && (
          <>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />
            <div className="fixed top-10 left-0 w-64 bg-[#1d2327] h-[calc(100vh-40px)] z-50 flex flex-col pt-4 animate-in slide-in-from-left duration-200 border-r border-zinc-800 justify-between">
              <div className="space-y-1.5 px-2">
                <div className="px-3 py-2 text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center justify-between">
                  <span>Navigation</span>
                  <button onClick={() => setMobileMenuOpen(false)}>
                    <X className="w-4 h-4 text-orange-500" />
                  </button>
                </div>
                {menuItems.map((item) => {
                  const isActive = (item.id === 'dashboard' && currentView === 'home') || 
                                   (item.id === 'stencil' && currentView === 'stencil') ||
                                   (item.id === 'textbender' && currentView === 'textbender') ||
                                   (item.id === 'upscaler' && currentView === 'upscaler') ||
                                   (item.id === 'history' && currentView === 'history') ||
                                   (item.id === 'support' && currentView === 'support');

                  return (
                    <button
                      key={item.id}
                      onClick={item.action}
                      className={`w-full flex items-center px-4 py-3 rounded-lg text-xs relative ${
                        isActive 
                          ? 'bg-[#2271b1] text-white font-bold' 
                          : 'text-zinc-300 hover:bg-[#2c3338] hover:text-white'
                      }`}
                    >
                      {item.icon}
                      <span className="ml-3 text-sm">{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Mobile Sidebar Footer Quota Info */}
              <div className="p-4 bg-zinc-950 border-t border-zinc-800 space-y-2 text-xs">
                <div className="flex items-center justify-between text-zinc-300">
                  <span>Usage quota</span>
                  <span className="font-mono text-orange-500">{stencilCount} / {userQuota}</span>
                </div>
                <div className="w-full bg-zinc-850 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-orange-500 h-full" 
                    style={{ width: `${quotaPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* 3. Central Application View Dynamic Area */}
        <main 
          id="body"
          className={`flex-grow p-4 md:p-6 lg:p-8 transition-all duration-300 min-h-[calc(100vh-40px)] overflow-y-auto ${
            sidebarCollapsed ? 'md:ml-14' : 'md:ml-56'
          }`}
        >
          {/* RENDER INTERNAL SUB-DASHBOARD HOME VIEW */}
          {currentView === 'home' ? (
            <div className="w-full max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
              {/* Styled header title */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-800/80 pb-4 gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                    {language === 'de' ? 'Künstler Dashboard' : 'Artist Dashboard'}
                  </h1>
                  <p className="text-zinc-400 text-xs mt-1">
                    {language === 'de' ? 'Willkommen im Administrationsbereich Ihrer Tattoo-Vorlagen-KIs.' : 'Manage your tattoo stencil generators and upscaler tools.'}
                  </p>
                </div>
                <button 
                  onClick={() => setCurrentView('stencil')}
                  className="px-4 py-2 bg-[#2271b1] hover:bg-[#135e96] border border-[#2271b1] hover:border-[#135e96] text-white font-semibold text-xs rounded transition-all flex items-center justify-center gap-1.5 focus:ring-2 focus:ring-[#2271b1]"
                >
                  <PenTool className="w-4 h-4" />
                  <span>{language === 'de' ? 'Neues Stencil erzeugen' : 'Create New Stencil'}</span>
                </button>
              </div>

              {/* WELCOME TO PRO-STENCILS BANNER */}
              <div className="bg-[#1d2327] border border-zinc-800 rounded-lg p-6 md:p-8 space-y-4 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
                <h2 className="text-xl md:text-2xl font-bold text-white">
                  {language === 'de' ? 'Willkommen bei Pro Stencils AI - Ihrem spezialisierten Netzwerk!' : 'Welcome to Pro Stencils AI - Your Custom Network!'}
                </h2>
                <p className="text-zinc-300 max-w-3xl leading-relaxed text-sm md:text-base">
                  {language === 'de' 
                    ? 'Wir haben eine maßgeschneiderte Suite zur Verfügung gestellt, um Ihren Stencil-Workflow vollautomatisch zu optimieren. Mit dem Stencil Generator, dem Bogen Text-Macher und dem AI Upscaler haben Sie die volle Kontrolle über Ihre Designlinie.'
                    : 'We built a bespoke suite combination to completely optimize your stencil workflow. With the Stencil Generator, the Arc Text maker, and the AI Upscaler, you retain complete high-definition administrative control over your lines.'}
                </p>
                <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold">
                  <button onClick={() => setCurrentView('stencil')} className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded">
                    {language === 'de' ? '1. Stencil Generator öffnen' : '1. Open Stencil Generator'}
                  </button>
                  <button onClick={() => setCurrentView('textbender')} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded border border-zinc-700">
                    {language === 'de' ? '2. Bogen Text gestalten' : '2. Curve Your Letters'}
                  </button>
                  <button onClick={() => setCurrentView('upscaler')} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded border border-zinc-700">
                    {language === 'de' ? '3. Bilder upscalen' : '3. Upscale Reference'}
                  </button>
                </div>
              </div>

              {/* BENTO GRID OF DASHBOARD WIDGETS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                
                {/* WIDGET 1: AT A GLANCE (AUF EINEN BLICK) */}
                <div className="bg-[#1d2327] border border-zinc-800 rounded-lg shadow-sm flex flex-col h-full overflow-hidden">
                  <div className="border-b border-zinc-800 px-4 py-3 bg-zinc-900/60 flex items-center justify-between">
                    <h3 className="font-bold text-white flex items-center gap-2">
                      <Layers className="w-4 h-4 text-[#2271b1]" />
                      <span>{language === 'de' ? 'Auf einen Blick' : 'At a Glance'}</span>
                    </h3>
                    <span className="text-[10px] bg-zinc-800 px-2 py-0.5 rounded text-zinc-400 font-mono">v5.4-Beta</span>
                  </div>
                  <div className="p-5 flex-1 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-zinc-900/30 border border-zinc-800/85 p-3 rounded-lg text-center">
                        <span className="text-2xl font-bold text-white block">{stencilCount}</span>
                        <span className="text-[11px] text-zinc-400">{language === 'de' ? 'Verbrauchte Stencils' : 'Generated Stencils'}</span>
                      </div>
                      <div className="bg-zinc-900/30 border border-zinc-800/85 p-3 rounded-lg text-center">
                        <span className="text-2xl font-bold text-orange-500 block">{userQuota - stencilCount}</span>
                        <span className="text-[11px] text-zinc-400">{language === 'de' ? 'Freies Guthaben' : 'Remaining Quota'}</span>
                      </div>
                    </div>
                    
                    <ul className="space-y-2.5 text-xs text-zinc-300 pt-2 border-t border-zinc-800/60">
                      <li className="flex items-center justify-between">
                        <span className="text-zinc-400">{language === 'de' ? 'Installiertes Theme' : 'Theme Active'}</span>
                        <span className="font-semibold text-white">Pro Stencils Suite v3.0</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span className="text-zinc-400">{language === 'de' ? 'System-Version' : 'System Core'}</span>
                        <span className="font-mono text-zinc-300">v3.0 (Node-Emulated)</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span className="text-zinc-400">{language === 'de' ? 'Suchmaschinen-Sichtbarkeit' : 'Search Engine Visibility'}</span>
                        <span className="text-green-400 bg-green-500/15 px-2 py-0.5 rounded font-bold text-[10px]">{language === 'de' ? 'Aktiviert' : 'Indexable'}</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span className="text-zinc-400">{language === 'de' ? 'Sicherer DB-Tunnel' : 'Strict Security Shield'}</span>
                        <span className="text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded font-bold text-[10px]">Firestore TLS</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* WIDGET 2: QUICK DRAFT (SCHNELLER ENTWURF) */}
                <div className="bg-[#1d2327] border border-zinc-800 rounded-lg shadow-sm flex flex-col h-full overflow-hidden">
                  <div className="border-b border-zinc-800 px-4 py-3 bg-zinc-900/60">
                    <h3 className="font-bold text-white flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-orange-500" />
                      <span>{language === 'de' ? 'Schneller Entwurf' : 'Quick Draft'}</span>
                    </h3>
                  </div>
                  <form onSubmit={handleQuickDraftSubmit} className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div>
                        <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">{language === 'de' ? 'Titel' : 'Title'}</label>
                        <input 
                          type="text" 
                          placeholder={language === 'de' ? 'Projekt-Idee (z.B. Drachenkopf)' : 'Project Idea (e.g. Dragon Shield)'} 
                          className="w-full bg-zinc-900/80 border border-zinc-800 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-[#2271b1] focus:border-[#2271b1] text-white"
                          value={draftTitle}
                          onChange={(e) => setDraftTitle(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">{language === 'de' ? 'Künstlerische Anweisung' : 'Artistic Instructions'}</label>
                        <textarea 
                          rows={3}
                          placeholder={language === 'de' ? 'Beschreibe dein Stencil (z.B. "Dünne outlines, scharf, kein Schatten")...' : 'Describe your stencil details (e.g. "Thin outlines, micro dotwork, zero grid lines")...'} 
                          className="w-full bg-zinc-900/80 border border-zinc-800 rounded px-3 py-2 text-xs focus:ring-1 focus:ring-[#2271b1] focus:border-[#2271b1] text-white resize-none"
                          value={draftContent}
                          onChange={(e) => setDraftContent(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      {draftSavedMsg ? (
                        <span className="text-[11px] text-green-400 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          {language === 'de' ? 'Entwurf gespeichert! Lade Generator...' : 'Draft saved! Opening generator...'}
                        </span>
                      ) : (
                        <span className="text-[11px] text-zinc-500 italic">
                          {language === 'de' ? 'Wird im Generator aktiv voreingestellt.' : 'Will auto-populate in the Stencil core.'}
                        </span>
                      )}
                      <button 
                        type="submit"
                        className="px-4 py-2 bg-zinc-800 hover:bg-[#2271b1] text-white font-semibold text-xs rounded transition-all flex items-center gap-1.5 border border-zinc-700"
                        disabled={draftSavedMsg}
                      >
                        {language === 'de' ? 'In Generator laden' : 'Load in Generator'}
                      </button>
                    </div>
                  </form>
                </div>

                {/* WIDGET 3: SYSTEM NEWS & UPDATES */}
                <div className="bg-[#1d2327] border border-zinc-800 rounded-lg shadow-sm flex flex-col h-full overflow-hidden">
                  <div className="border-b border-zinc-800 px-4 py-3 bg-zinc-900/60">
                    <h3 className="font-bold text-white flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-[#2271b1]" />
                      <span>{language === 'de' ? 'Tätowierer Neuigkeiten' : 'System & Tattoo News'}</span>
                    </h3>
                  </div>
                  <div className="p-5 flex-1 divide-y divide-zinc-800/60 overflow-y-auto max-h-[300px]">
                    {dashboardNews.map((news) => (
                      <div key={news.id} className="py-2.5 first:pt-0 last:pb-0 space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-orange-500 hover:underline cursor-pointer">{news.title}</span>
                          <span className="text-zinc-500 font-mono text-[10px]">{news.date}</span>
                        </div>
                        <p className="text-zinc-400 text-xs leading-relaxed">{news.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* RECENT STENCIL HISTORY WIDGET IN DASHBOARD */}
              <div className="bg-[#1d2327] border border-zinc-800 rounded-lg p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <h3 className="font-bold text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-500" />
                    <span>{language === 'de' ? 'Kürzliche Entwürfe (Aktivität)' : 'Recent Media History (Activity)'}</span>
                  </h3>
                  <button 
                    onClick={() => setCurrentView('history')} 
                    className="text-xs text-[#2271b1] hover:underline"
                  >
                    {language === 'de' ? 'Gesamte Mediathek anzeigen' : 'View entire Media library'}
                  </button>
                </div>

                {history.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {history.slice(0, 6).map((item) => (
                      <div 
                        key={item.id} 
                        onClick={() => handleViewHistory(item)}
                        className="group bg-zinc-900/40 border border-zinc-850 rounded-lg overflow-hidden cursor-pointer hover:border-orange-500/40 transition-all p-2 relative text-left"
                      >
                        <div className="aspect-square bg-zinc-950 flex items-center justify-center rounded">
                          <img src={item.stencilImage} alt="" className="h-full object-contain max-h-24" />
                        </div>
                        <div className="mt-1.5 text-[10px] text-zinc-400 flex items-center justify-between">
                          <span className="font-bold truncate max-w-[80px]">{item.styleName}</span>
                          <span className="font-mono text-[9px] text-zinc-500">{new Date(item.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-zinc-500 text-xs italic py-6 text-center">
                    {language === 'de' ? 'Noch keine Stencils in der Mediathek vorhanden.' : 'No stencils generated yet. Start create in Stencil Generator!'}
                  </p>
                )}
              </div>
            </div>
          ) : currentView === 'history' ? (
            /* MEDIATHEK RENDER (HISTORIE CORE) */
            <div className="w-full max-w-7xl mx-auto space-y-6">
              <div className="border-b border-zinc-800 pb-4">
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <ImageIcon className="w-6 h-6 text-[#2271b1]" />
                  <span>{language === 'de' ? 'System Mediathek' : 'System Media Library'}</span>
                </h1>
                <p className="text-zinc-400 text-xs mt-1">
                  {language === 'de' ? 'Verwalten Sie all Ihre generierten Tattoo-Stencils, hochauflösenden Designs und Linienarbeiten.' : 'Manage your generated tattoo stencils, custom curves, and upscaled images.'}
                </p>
              </div>

              {/* EMBED THE HISTORY GRID INSIDE A PANEL WRAPPER */}
              <div className="bg-[#1d2327] border border-zinc-800 rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-6">
                  <span className="font-bold text-sm text-zinc-200">
                    {language === 'de' ? 'Mediathek-Elemente' : 'Media items'} ({history.length})
                  </span>
                  <button 
                    onClick={() => setCurrentView('stencil')}
                    className="px-3 py-1.5 bg-[#2271b1] hover:bg-[#135e96] text-white font-semibold text-xs rounded transition-all"
                  >
                    {language === 'de' ? 'Datei hinzufügen (Generieren)' : 'Add New File (Generate)'}
                  </button>
                </div>

                {history.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {history.map((item) => (
                      <div key={item.id} className="group relative bg-[#121315] border border-zinc-800 rounded-lg overflow-hidden hover:border-orange-500/40 transition-all shadow-md">
                        <div className="aspect-[4/5] p-3 flex items-center justify-center bg-zinc-950">
                          <img src={item.stencilImage} alt="" className="max-h-full max-w-full object-contain" />
                        </div>
                        
                        {/* Overlay Controls */}
                        <div className="absolute inset-0 bg-black/85 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 px-3 text-center">
                          <button 
                            onClick={() => handleViewHistory(item)} 
                            className="w-full py-1.5 bg-[#2271b1] text-white rounded font-bold text-[11px] hover:bg-[#135e96] transition-colors"
                          >
                            {language === 'de' ? 'Ansehen & Editieren' : 'Edit & Customize'}
                          </button>
                          
                          <a 
                            href={item.stencilImage} 
                            download={`stencil-${item.id}.png`} 
                            className="w-full py-1.5 bg-white text-black rounded font-bold text-[11px] hover:bg-neutral-200 transition-colors block"
                          >
                            {t.downloadBtn}
                          </a>

                          <button 
                            onClick={() => deleteHistoryItem(item.id)} 
                            className="w-full py-1.2 bg-red-950/40 border border-red-900/60 text-red-400 rounded text-[10px] hover:bg-red-900 hover:text-white transition-all flex items-center justify-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>{t.deleteBtn}</span>
                          </button>
                        </div>

                        {/* Title details bar */}
                        <div className="p-2.5 bg-zinc-900/90 border-t border-zinc-800">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-zinc-300 truncate max-w-[80px]">{item.styleName}</span>
                            <span className="text-[10px] text-zinc-500 font-mono">{new Date(item.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 border-2 border-dashed border-zinc-800 rounded-lg space-y-4">
                    <ImageIcon className="w-12 h-12 text-zinc-600 mx-auto" />
                    <div>
                      <h4 className="font-bold text-white text-sm">{language === 'de' ? 'Keine Dateien in der Mediathek gefunden' : 'No items found in your media library'}</h4>
                      <p className="text-xs text-zinc-500">{language === 'de' ? 'Generieren Sie Stencils mit unserem Toolkit, um diese hier zu sichern.' : 'Run the Stencil generator, Arc bender, or Upscaler to stack files.'}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* DYNAMIC WORKSPACE FOR CHILDREN VIEWS (STENCIL, TEXTBENDER, UPSCALER, SUPPORT, ADMIN) */
            <div className="w-full max-w-7xl mx-auto space-y-4">
              <div id="sub-navigation" className="flex items-center gap-2 text-xs text-zinc-400 font-medium pb-2 border-b border-zinc-800/80 mb-4 select-none">
                <span className="hover:text-white cursor-pointer" onClick={() => handleViewHomeAndNav('home')}>{language === 'de' ? 'System-Admin' : 'System Admin'}</span>
                <ChevronRight className="w-3 h-3 text-zinc-600" />
                <span className="hover:text-white cursor-pointer" onClick={() => handleViewHomeAndNav(currentView)}>
                  {currentView === 'stencil' && 'Stencil Generator'}
                  {currentView === 'textbender' && 'Bogen Text'}
                  {currentView === 'upscaler' && 'AI Upscaler'}
                  {currentView === 'support' && 'Hilfe & Support'}
                </span>
                <div className="flex-1" />
                <div className="flex items-center gap-1 bg-zinc-800/40 px-2 py-0.5 rounded font-mono text-[10px] text-[#2271b1]">
                  <span>plugin-active</span>
                </div>
              </div>

              {/* Injection of actual app tool panels inside a beautiful, custom box */}
              <div className="bg-[#1d2327] border border-zinc-800 rounded-lg p-4 md:p-6 shadow-sm overflow-visible min-h-[70vh]">
                {children}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Footer stats bar */}
      <footer id="footer" className="bg-[#1d2327] border-t border-zinc-800/80 text-zinc-500 text-[11px] py-2 px-4 flex items-center justify-between relative z-40 select-none">
        <p className="flex items-center gap-1.5">
          <span>{language === 'de' ? 'Danke für das Nutzen von Pro Stencils AI.' : 'Thank you for creating with Pro Stencils AI.'}</span>
        </p>
        <p className="font-mono text-[10px]">
          v3.0.0-PRO | DB (Firestore TLS)
        </p>
      </footer>
    </div>
  );
};
