
import React, { useState, useEffect, useRef, useMemo, Suspense, lazy } from 'react';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import UploadCard from './components/UploadCard';
import StyleSelector from './components/StyleSelector';
import SettingsSelector from './components/SettingsSelector';
import GenerateActions from './components/GenerateActions';
import PreviewSection from './components/PreviewSection';
import HistorySection from './components/HistorySection';
import { SelectionView } from './src/components/SelectionView';
import { StencilView } from './src/components/StencilView';
import { Footer } from './src/components/Footer';
import { FeedbackModal } from './src/components/FeedbackModal';
import { AppDashboard } from './src/components/AppDashboard';

// Lazy loaded components for performance
const PrivacyPolicy = lazy(() => import('./components/PrivacyPolicy'));
const SupportCenter = lazy(() => import('./components/SupportCenter'));
const TermsOfService = lazy(() => import('./components/TermsOfService'));
const AdminPanel = lazy(() => import('./src/components/AdminPanel'));
const ProfileModal = lazy(() => import('./src/components/ProfileModal'));
const UpscalerTool = lazy(() => import('./src/components/UpscalerTool'));
const AdminContact = lazy(() => import('./src/components/AdminContact'));
const TextBenderTool = lazy(() => import('./src/components/TextBenderTool').then(m => ({ default: m.TextBenderTool })));

import { downloadImage } from './src/lib/download';
import { generateStencil, fileToBase64, analyzeTattooTechnique, compressImage } from './services/geminiService';
import { AppState, StencilResult, StencilStyle, StencilHistoryItem, BackgroundMode, ArtistInsights, Language } from './types';
import { getBaseStencilStyles } from './src/constants/stencilStyles';
import { AlertTriangle, ArrowLeft, ArrowRight, LogOut, Maximize2, Settings as SettingsIcon, ShieldAlert, PenTool, Sparkles, Type, Instagram, Facebook, Terminal, X } from 'lucide-react';
import { Logo } from './components/Logo';
import { TutorialModal } from './components/TutorialModal';
import { DiscoverSection } from './components/DiscoverSection';
import { auth, loginWithGoogle, logout, db, handleFirestoreError, OperationType, checkIfAdmin } from './src/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, doc, setDoc, deleteDoc, onSnapshot, query, orderBy, limit, getDoc, updateDoc, writeBatch } from 'firebase/firestore';
import { TRANSLATIONS } from './src/translations';
import { useAuth } from './src/hooks/useAuth';
import { useStencilHistory } from './src/hooks/useStencilHistory';
import { useSiteConfig } from './src/hooks/useSiteConfig';

const LOCAL_STORAGE_KEY = 'easy_stencil_history';
const LANG_STORAGE_KEY = 'easy_stencil_lang';

const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(LANG_STORAGE_KEY);
      return (saved as Language) || 'de';
    } catch (e) {
      console.warn("localStorage blocked for language setting:", e);
      return 'de';
    }
  });
  
  const [currentView, setCurrentView] = useState<'home' | 'selection' | 'stencil' | 'upscaler' | 'textbender' | 'privacy' | 'terms' | 'support' | 'discover'>('home');
  const [showTutorial, setShowTutorial] = useState(false);
  
  const { 
    user, isAdmin, isAuthLoading, isLoggingIn, loginError, setLoginError, userStatus, userQuota, 
    stencilCount, setStencilCount, handleLogin, handleEmailLogin, handleEmailRegister, handleGuestLogin, handleLogout 
  } = useAuth(currentView, setCurrentView, setShowTutorial);

  const { siteConfig, customStencilStyles } = useSiteConfig();
  const { history, saveToHistory, deleteHistoryItem } = useStencilHistory(user);
  
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  
  const t = TRANSLATIONS[language];

  const STENCIL_STYLES = useMemo(() => {
    const defaultStyles = getBaseStencilStyles(language);
    if (!customStencilStyles || customStencilStyles.length === 0) {
      return defaultStyles;
    }
    
    // Create a map of custom styles for easy lookup
    const customMap = new Map<string, StencilStyle>(customStencilStyles.map(s => [s.id, s]));
    
    // Merge base styles with any overrides from custom styles
    const mergedStyles = defaultStyles.map(baseStyle => {
      const customOverride = customMap.get(baseStyle.id);
      if (customOverride) {
        return {
          ...baseStyle,
          name: customOverride.name && customOverride.name.trim() !== "" ? customOverride.name : baseStyle.name,
          description: customOverride.description && customOverride.description.trim() !== "" ? customOverride.description : baseStyle.description,
          promptModifier: customOverride.promptModifier && customOverride.promptModifier.trim() !== "" ? customOverride.promptModifier : baseStyle.promptModifier
        };
      }
      return baseStyle;
    });
    
    // Also include any purely custom styles that aren't in the default list
    const defaultIds = new Set(defaultStyles.map(s => s.id));
    const extraStyles = customStencilStyles.filter(s => !defaultIds.has(s.id));
    
    return [...mergedStyles, ...extraStyles];
  }, [language, customStencilStyles]);

  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [selectedStyleId, setSelectedStyleId] = useState<string>('recommended');
  const [strength, setStrength] = useState<number>(0.95); // High density default
  
  const [lineColor, setLineColor] = useState<string>('#000000');
  const [brightness, setBrightness] = useState<number>(1);
  const [backgroundMode, setBackgroundMode] = useState<BackgroundMode>('white');
  const [backgroundColor, setBackgroundColor] = useState<string>('#ffffff');
  const [invert, setInvert] = useState<boolean>(false);
  const [gradientColors, setGradientColors] = useState<[string, string]>(['#4f46e5', '#ec4899']); 
  const [customPrompt, setCustomPrompt] = useState<string>('');

  const [result, setResult] = useState<StencilResult | null>(null);
  const [isPublishedToGallery, setIsPublishedToGallery] = useState(false);

  useEffect(() => {
    setIsPublishedToGallery(false);
  }, [result?.stencilImage]);

  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublishToGallery = async () => {
    if (!result?.stencilImage || !user || isPublishing) return;
    setIsPublishing(true);
    try {
      // Compress both original and stencil images to stay well below the 1MB Firestore limit
      const [compressedOriginal, compressedStencil] = await Promise.all([
        compressImage(result.originalImage, 800, 0.6, 'image/jpeg'),
        compressImage(result.stencilImage, 1024, 0.6, 'image/jpeg')
      ]);

      await setDoc(doc(collection(db, 'gallery')), {
        uid: user.uid,
        stencilImage: compressedStencil,
        originalImage: compressedOriginal,
        styleName: currentStyleName,
        createdAt: Date.now(),
        publishedAt: Date.now()
      });
      setIsPublishedToGallery(true);
    } catch (err) {
      console.error("Error publishing to gallery", err);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSelectDesign = (imageUrl: string) => {
    setPreviewUrl(imageUrl);
    setSelectedFile(null);
    setAppState(AppState.CONFIGURING);
    setCurrentView('stencil');
    setTimeout(() => styleSelectorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 150);
  };

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const styleSelectorRef = useRef<HTMLDivElement>(null);
  const previewSectionRef = useRef<HTMLDivElement>(null);

  const handleViewHistory = (item: StencilHistoryItem) => {
    setPreviewUrl(item.originalImage);
    setResult({
      originalImage: item.originalImage,
      stencilImage: item.stencilImage,
      insights: item.insights,
      dimensions: item.dimensions
    });
    setAppState(AppState.SUCCESS);
    setCurrentView('stencil');
    setTimeout(() => {
      previewSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleFileSelect = async (file: File) => {
    try {
      let base64 = await fileToBase64(file);
      
      // Memory Optimization: Compress large images locally before putting in state
      if (file.size > 2 * 1024 * 1024) {
        base64 = await compressImage(base64, 2048, 0.8, 'image/jpeg');
      }
      
      setPreviewUrl(base64);
      setSelectedFile(file);
      setAppState(AppState.CONFIGURING);
      setErrorMsg(null);
      setTimeout(() => styleSelectorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 150);
    } catch (e) {
      setErrorMsg("Failed to read file.");
    }
  };

  const handleGenerate = async () => {
    const input = selectedFile || previewUrl;
    if (!input) return;
    
    if (stencilCount >= userQuota) {
      alert(language === 'de' 
        ? `Limit erreicht! Sie haben ${stencilCount}/${userQuota} Stencils generiert. Kontaktieren Sie den Admin für ein Upgrade.`
        : `Quota reached! You have used ${stencilCount}/${userQuota} stencils. Contact admin to increase quota.`);
      return;
    }
    
    setAppState(AppState.PROCESSING);
    setErrorMsg(null);
    
    setTimeout(() => {
      previewSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);

    try {
      const style = STENCIL_STYLES.find(s => s.id === selectedStyleId) || STENCIL_STYLES[0];
      
      // Prioritize the stencil generation first for maximum speed
      const stencilData = await generateStencil(input, style, strength, { backgroundMode, backgroundColor, lineColor, invert, brightness, gradientColors, customPrompt });
      
      const intermediateResult: StencilResult = { 
        originalImage: previewUrl || '', 
        stencilImage: stencilData.stencilImage,
        dimensions: stencilData.dimensions
      };
      
      setResult(intermediateResult);
      setAppState(AppState.SUCCESS);

      // Trigger the tech analysis in the background only after the stencil is displayed to the user
      try {
        const techniqueAnalysis = await analyzeTattooTechnique(input, language);
        setResult(prev => prev ? { ...prev, insights: techniqueAnalysis } : null);
        
        // Save the final version to history
        saveToHistory({ 
          ...intermediateResult, 
          insights: techniqueAnalysis, 
          id: crypto.randomUUID(), 
          date: Date.now(), 
          styleName: style.name 
        });
      } catch (analysisErr) {
        console.error("Background analysis failed:", analysisErr);
        // Still save to history even if analysis failed
        saveToHistory({ 
          ...intermediateResult, 
          id: crypto.randomUUID(), 
          date: Date.now(), 
          styleName: style.name 
        });
      }
    } catch (err: any) {
      setAppState(AppState.ERROR);
      setErrorMsg(err instanceof Error ? err.message : "AI processing failed.");
    }
  };

  const toggleLanguage = () => setLanguage(l => l === 'en' ? 'de' : 'en');
  const resetApp = (toHome: boolean = false) => {
    setAppState(AppState.IDLE);
    setResult(null);
    setErrorMsg(null);
    setSelectedFile(null);
    setPreviewUrl(null);
    setCurrentView(toHome || !user ? 'home' : 'stencil');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDownload = (processedImage?: string) => {
    if (processedImage) {
      downloadImage(processedImage, `easy-stencil-ai-${Date.now()}.png`);
    } else if (result) {
      downloadImage(result.stencilImage, `easy-stencil-ai-${Date.now()}.png`);
    }
  };

  const currentStyleName = STENCIL_STYLES.find(s => s.id === selectedStyleId)?.name || 'Unknown';
  const isConfiguringOrSuccess = appState === AppState.CONFIGURING || appState === AppState.PROCESSING || appState === AppState.SUCCESS || appState === AppState.ERROR;

  const handleLogoutAction = async () => {
    await handleLogout(() => resetApp(true));
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user && userStatus === 'inactive' && !isAdmin) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center space-y-6">
        <ShieldAlert className="w-20 h-20 text-red-500 animate-pulse" />
        <h1 className="text-3xl font-bold">Account Deactivated</h1>
        <p className="text-zinc-400 max-w-md">Your account has been deactivated by an administrator. Please contact support if you believe this is an error.</p>
        <button onClick={handleLogoutAction} className="px-8 py-3 bg-white/10 hover:bg-white/20 rounded-full font-bold transition-all">
          Logout
        </button>
      </div>
    );
  }

  if (showAdminPanel && isAdmin) {
    return <AdminPanel onClose={() => setShowAdminPanel(false)} />;
  }

  if (!user) {
    if (currentView === 'privacy') return <Suspense><PrivacyPolicy onBack={() => setCurrentView('home')} /></Suspense>;
    if (currentView === 'terms') return <Suspense><TermsOfService onBack={() => setCurrentView('home')} /></Suspense>;
    if (currentView === 'support') return <Suspense><SupportCenter onBack={() => setCurrentView('home')} language={language} translations={t} /></Suspense>;

    return (
      <LandingPage 
        onLogin={handleLogin}
        onEmailLogin={handleEmailLogin}
        onEmailRegister={handleEmailRegister}
        onGuestLogin={handleGuestLogin}
        isAdmin={isAdmin} 
        onOpenAdmin={() => setShowAdminPanel(true)} 
        isLoggingIn={isLoggingIn} 
        siteConfig={siteConfig} 
        loginError={loginError}
        onClearLoginError={() => setLoginError(null)}
      />
    );
  }

  const socialLinksConfig = siteConfig?.plugins?.find((p: any) => p.id === 'social_links' && p.enabled)?.config;
  const announcementConfig = siteConfig?.plugins?.find((p: any) => p.id === 'announcement' && p.enabled)?.config;
  const maintenanceConfig = siteConfig?.plugins?.find((p: any) => p.id === 'maintenance' && p.enabled)?.config;

  if (maintenanceConfig && !isAdmin) {
    return (
      <div className="min-h-screen w-full bg-black text-white flex flex-col items-center justify-center p-6 text-center">
        <Logo className="w-16 h-16 mb-8 text-orange-500" />
        <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">We'll be right back</h1>
        <p className="text-xl text-zinc-400 max-w-lg mb-12 leading-relaxed">
          {maintenanceConfig.text || "We are currently down for maintenance. Please check back later."}
        </p>
        <button 
          onClick={async () => {
            await handleLogoutAction();
          }}
          className="text-xs text-zinc-600 hover:text-zinc-400 flex items-center gap-2"
        >
          <SettingsIcon className="w-4 h-4" />
          Switch Account (Admin)
        </button>
      </div>
    );
  }

  // RETURN CLINICAL ADMIN ENVIRONMENT FOR AUTHENTICATED ARTISTS
  if (user) {
    return (
      <AppDashboard
        user={user}
        isAdmin={isAdmin}
        language={language}
        setLanguage={setLanguage}
        handleLogoutAction={handleLogoutAction}
        siteConfig={siteConfig}
        currentView={currentView}
        setCurrentView={setCurrentView}
        userQuota={userQuota}
        stencilCount={stencilCount}
        history={history}
        deleteHistoryItem={deleteHistoryItem}
        handleViewHistory={handleViewHistory}
        t={t}
        setShowProfile={setShowProfile}
        setShowFeedback={setShowFeedback}
        setShowAdminPanel={setShowAdminPanel}
        setCustomPrompt={setCustomPrompt}
      >
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
            <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-zinc-500 font-medium animate-pulse">Loading artist tool...</p>
          </div>
        }>
          {currentView === 'privacy' && (
            <PrivacyPolicy onBack={() => setCurrentView('home')} />
          )}
          {currentView === 'discover' && <DiscoverSection currentUser={user} onBack={() => setCurrentView('home')} />}
          {currentView === 'terms' && <TermsOfService onBack={() => setCurrentView('home')} />}
          {currentView === 'textbender' && (
            <TextBenderTool 
              onBack={() => setCurrentView('home')} 
              language={language}
            />
          )}
          {currentView === 'support' && (
            <SupportCenter onBack={() => setCurrentView('home')} language={language} translations={t} />
          )}
          {currentView === 'stencil' && (
            <StencilView 
              t={t}
              language={language}
              appState={appState}
              previewUrl={previewUrl}
              selectedStyleId={selectedStyleId}
              setSelectedStyleId={setSelectedStyleId}
              strength={strength}
              setStrength={setStrength}
              lineColor={lineColor}
              setLineColor={setLineColor}
              backgroundMode={backgroundMode}
              setBackgroundMode={setBackgroundMode}
              backgroundColor={backgroundColor}
              setBackgroundColor={setBackgroundColor}
              invert={invert}
              setInvert={setInvert}
              brightness={brightness}
              setBrightness={setBrightness}
              gradientColors={gradientColors}
              setGradientColors={setGradientColors}
              customPrompt={customPrompt}
              setCustomPrompt={setCustomPrompt}
              result={result}
              errorMsg={errorMsg}
              history={history}
              user={user}
              userQuota={userQuota}
              stencilCount={stencilCount}
              siteConfig={siteConfig}
              STENCIL_STYLES={STENCIL_STYLES}
              isAdmin={isAdmin}
              isPublishedToGallery={isPublishedToGallery}
              handleFileSelect={handleFileSelect}
              handleGenerate={handleGenerate}
              handleDownload={handleDownload}
              handlePublishToGallery={handlePublishToGallery}
              handleViewHistory={handleViewHistory}
              deleteHistoryItem={deleteHistoryItem}
              resetApp={() => resetApp(false)}
              setCurrentView={setCurrentView}
            />
          )}
          {currentView === 'upscaler' && (
            <div className="w-full max-w-6xl mx-auto space-y-4 animate-in fade-in duration-300">
              <div className="bg-zinc-900/60 border border-white/5 rounded-3xl p-4 overflow-hidden">
                <UpscalerTool hideHeader config={siteConfig?.upscalerPage} />
              </div>
            </div>
          )}
        </Suspense>

        {/* Floating Modals inside wrapper layout */}
        <FeedbackModal 
          isOpen={showFeedback} 
          onClose={() => setShowFeedback(false)} 
          user={user} 
          translations={t} 
        />

        <Suspense fallback={null}>
          <ProfileModal 
            isOpen={showProfile}
            onClose={() => setShowProfile(false)}
            userData={{
              displayName: user.displayName,
              email: user.email,
              photoURL: user.photoURL,
              role: isAdmin ? 'Admin' : 'Artist',
              quota: userQuota,
              used: stencilCount
            }}
            lastStencils={history.slice(0, 3)}
            onDeleteStencil={deleteHistoryItem}
          />
        </Suspense>

        {showTutorial && (
          <TutorialModal 
            translations={t}
            onComplete={() => {
              setShowTutorial(false);
              try {
                localStorage.setItem(`tutorial_seen_${user.uid}`, 'true');
              } catch (e) {
                console.warn("localStorage blocked:", e);
              }
            }} 
          />
        )}

        {showAdminPanel && isAdmin && (
          <Suspense fallback={null}>
            <AdminPanel onClose={() => setShowAdminPanel(false)} />
          </Suspense>
        )}
      </AppDashboard>
    );
  }

  return (
    <div className="min-h-screen flex flex-col text-zinc-100 selection:bg-orange-500/30 relative bg-zinc-900 overflow-x-hidden">
      {/* Announcement Bar */}
      {announcementConfig && announcementConfig.text && (
        <div className="w-full text-white text-center py-2 px-4 font-medium text-sm flex items-center justify-center relative z-50 shadow-md" style={{ backgroundColor: siteConfig?.theme?.primaryColor || '#ea580c' }}>
          <span>{announcementConfig.text}</span>
          {announcementConfig.url && (
            <a href={announcementConfig.url} target="_blank" rel="noopener noreferrer" className="ml-2 font-bold underline hover:text-white/80 transition-colors">
              Read more
            </a>
          )}
        </div>
      )}
      
      {/* Background Image with Overlay */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <img 
          src="https://images.unsplash.com/photo-1479767574301-a01c78234a0c?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0" 
          alt="Tattoo Background" 
          className="w-full h-full object-cover opacity-60 grayscale contrast-125 transition-opacity duration-1000"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/40 via-zinc-900/60 to-zinc-900" />
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-orange-600/20 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[60%] bg-orange-900/10 rounded-full blur-[120px]" />
      </div>

      <Header 
        language={language} 
        onLanguageToggle={toggleLanguage} 
        onLogout={handleLogoutAction} 
        isAdmin={isAdmin} 
        onOpenAdmin={() => setShowAdminPanel(true)} 
        onOpenProfile={() => setShowProfile(true)}
        onOpenDiscover={() => setCurrentView('discover')}
        onOpenFeedback={() => setShowFeedback(true)}
        userPhoto={user?.photoURL}
        onLogoClick={() => setCurrentView('selection')}
      />
      
      <main className="flex-grow flex flex-col items-center justify-start relative z-10">
        <div className="w-full relative z-10 flex flex-col items-center px-4 md:px-8">
          <Suspense fallback={
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
              <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-zinc-500 font-medium animate-pulse">Loading artist tools...</p>
            </div>
          }>
            {currentView === 'privacy' && (
              <PrivacyPolicy onBack={() => { setCurrentView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
            )}
            {currentView === 'discover' && <DiscoverSection currentUser={user} onBack={() => setCurrentView('selection')} />}
            {currentView === 'terms' && <TermsOfService onBack={() => setCurrentView('selection')} />}
            {currentView === 'textbender' && (
              <TextBenderTool 
                onBack={() => { setCurrentView('selection'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
                language={language}
              />
            )}
            {currentView === 'support' && (
              <SupportCenter onBack={() => { setCurrentView('selection'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} language={language} translations={t} />
            )}
            {currentView === 'selection' && (
              <SelectionView 
                t={t} 
                siteConfig={siteConfig} 
                language={language} 
                setCurrentView={setCurrentView} 
              />
            )}
            {currentView === 'stencil' && (
              <StencilView 
                t={t}
                language={language}
                appState={appState}
                previewUrl={previewUrl}
                selectedStyleId={selectedStyleId}
                setSelectedStyleId={setSelectedStyleId}
                strength={strength}
                setStrength={setStrength}
                lineColor={lineColor}
                setLineColor={setLineColor}
                backgroundMode={backgroundMode}
                setBackgroundMode={setBackgroundMode}
                backgroundColor={backgroundColor}
                setBackgroundColor={setBackgroundColor}
                invert={invert}
                setInvert={setInvert}
                brightness={brightness}
                setBrightness={setBrightness}
                gradientColors={gradientColors}
                setGradientColors={setGradientColors}
                customPrompt={customPrompt}
                setCustomPrompt={setCustomPrompt}
                result={result}
                errorMsg={errorMsg}
                history={history}
                user={user}
                userQuota={userQuota}
                stencilCount={stencilCount}
                siteConfig={siteConfig}
                STENCIL_STYLES={STENCIL_STYLES}
                isAdmin={isAdmin}
                isPublishedToGallery={isPublishedToGallery}
                handleFileSelect={handleFileSelect}
                handleGenerate={handleGenerate}
                handleDownload={handleDownload}
                handlePublishToGallery={handlePublishToGallery}
                handleViewHistory={handleViewHistory}
                deleteHistoryItem={deleteHistoryItem}
                resetApp={resetApp}
                setCurrentView={setCurrentView}
              />
            )}
            {currentView === 'upscaler' && (
              <div className="w-full max-w-6xl mx-auto px-4 py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between mb-4">
                  <button 
                    onClick={() => setCurrentView('selection')}
                    className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm font-medium"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    {t.backToUpload}
                  </button>
                </div>
                <div className="bg-zinc-900/30 border border-white/5 rounded-[2.5rem] p-1 overflow-hidden">
                  <UpscalerTool hideHeader config={siteConfig?.upscalerPage} />
                </div>
              </div>
            )}
          </Suspense>
        </div>
      </main>

      <Footer 
        t={t} 
        siteConfig={siteConfig} 
        socialLinksConfig={socialLinksConfig} 
        setCurrentView={setCurrentView} 
      />

      <FeedbackModal 
        isOpen={showFeedback} 
        onClose={() => setShowFeedback(false)} 
        user={user} 
        translations={t} 
      />

      {user && (
        <Suspense fallback={null}>
          <ProfileModal 
            isOpen={showProfile}
            onClose={() => setShowProfile(false)}
            userData={{
              displayName: user.displayName,
              email: user.email,
              photoURL: user.photoURL,
              role: isAdmin ? 'Admin' : 'Artist',
              quota: userQuota,
              used: stencilCount
            }}
            lastStencils={history.slice(0, 3)}
            onDeleteStencil={deleteHistoryItem}
          />
        </Suspense>
      )}

      {showTutorial && user && (
        <TutorialModal 
          translations={t}
          onComplete={() => {
            setShowTutorial(false);
            try {
              localStorage.setItem(`tutorial_seen_${user.uid}`, 'true');
            } catch (e) {
              console.warn("localStorage blocked:", e);
            }
          }} 
        />
      )}

      {showAdminPanel && isAdmin && (
        <Suspense fallback={null}>
          <AdminPanel onClose={() => setShowAdminPanel(false)} />
        </Suspense>
      )}
    </div>
  );
};

export default App;
