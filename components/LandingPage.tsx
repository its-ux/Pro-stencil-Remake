import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, Info, Shield, Zap, Star, ArrowRight, Settings, ChevronDown, Mail, Instagram, Twitter, Facebook, AlertTriangle, X } from 'lucide-react';
import { Logo } from './Logo';
import { db } from '../src/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { LegalPagesModal } from './LegalPagesModal';
import { LoginModal } from './LoginModal';

interface LandingPageProps {
  onLogin: () => void;
  onEmailLogin?: (email: string, pass: string) => Promise<void>;
  onEmailRegister?: (email: string, pass: string, name: string) => Promise<void>;
  onGuestLogin?: (displayName?: string) => Promise<void>;
  isAdmin?: boolean;
  onOpenAdmin?: () => void;
  isLoggingIn?: boolean;
  siteConfig?: any;
  loginError?: string | null;
  onClearLoginError?: () => void;
}

const DEFAULT_CONTENT = {
  heroTitle: "ART MEETS PRECISION",
  heroSubtitle: "The ultimate AI-powered stencil generator for professional tattoo artists. Elevate your craft with surgical precision.",
  infoTitle: "A Legacy of Expression and Identity.",
  infoDescription: "Tattooing is one of the oldest forms of human expression, dating back thousands of years. From the 5,000-year-old \"Ötzi the Iceman\" to the intricate tribal patterns of the Polynesians, ink has always been more than just decoration—it's a map of a person's life, heritage, and soul.",
  styles: [
    { name: "Realism", desc: "Photographic accuracy on skin.", img: "https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?q=80&w=2071" },
    { name: "Traditional", desc: "Bold lines and vibrant colors.", img: "https://images.unsplash.com/photo-1543244128-30d70d41e2a9?q=80&w=1167&auto=format&fit=crop" },
    { name: "Fine Line", desc: "Delicate and intricate details.", img: "https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?q=80&w=2070" },
    { name: "Neo-Trad", desc: "Modern twist on classic roots.", img: "https://images.unsplash.com/photo-1590247813693-5541d1c609fd?q=80&w=2070" }
  ],
  features: [
    { title: "Hyper-Realism", desc: "Optimized for portraits and complex textures that traditional software misses.", icon: <Zap className="w-10 h-10" /> },
    { title: "Artist Insights", desc: "Get AI-driven tips on needle selection and ink mixing for every design.", icon: <Info className="w-10 h-10" /> },
    { title: "Cloud History", desc: "Access your stencil library from any device, anywhere in the world.", icon: <Shield className="w-10 h-10" /> }
  ],
  layout: [
    { id: 'hero', visible: true, label: 'Hero Section' },
    { id: 'info', visible: true, label: 'Info Section' },
    { id: 'styles', visible: true, label: 'Styles Section' },
    { id: 'features', visible: true, label: 'Features Section' }
  ],
  theme: {
    primaryColor: '#ea580c',
    accentColor: '#9a3412',
    fontFamily: 'Inter',
    borderRadius: '2.5rem',
    glassOpacity: '0.4'
  },
  plugins: [
    { id: 'demo_access', enabled: true, title: "Demo / Gast-Zugang (Plugin)", config: { guestQuota: 10 } },
    { id: 'contact', enabled: false, title: "Contact Form", config: { email: "" } },
    { id: 'custom_html', enabled: false, title: "Custom HTML Widget", config: { html: "" } }
  ],
  legal: {
    impressum: "# Impressum\n\nAngaben gemäß § 5 TMG:\n\nMax Mustermann\nMusterstraße 1\n12345 Musterstadt\n\nKontakt:\nE-Mail: info@muster.de\n\nVertreten durch:\nMax Mustermann",
    privacyPolicy: "# Datenschutzerklärung\n\nWir nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung."
  }
};

const LandingPage: React.FC<LandingPageProps> = ({ 
  onLogin, 
  onEmailLogin,
  onEmailRegister,
  onGuestLogin,
  isAdmin, 
  onOpenAdmin, 
  isLoggingIn, 
  siteConfig, 
  loginError, 
  onClearLoginError 
}) => {
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [expandedFeature, setExpandedFeature] = useState<number | null>(null);
  const [legalModal, setLegalModal] = useState<{isOpen: boolean, title: string, content: string}>({ isOpen: false, title: '', content: '' });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    if (loginError) {
      setIsLoginModalOpen(true);
    }
  }, [loginError]);

  useEffect(() => {
    if (siteConfig) {
      // Migrate old image URLs if they exist in the database
      const migratedStyles = (siteConfig.styles || []).map((s: any) => {
        if (s.img && s.img.includes("photo-1550537687-c91072c4792d")) {
          return { ...s, img: "https://images.unsplash.com/photo-1543244128-30d70d41e2a9?q=80&w=1167&auto=format&fit=crop" };
        }
        return s;
      });

      setContent({
        ...DEFAULT_CONTENT,
        ...siteConfig,
        styles: migratedStyles.length > 0 ? migratedStyles : DEFAULT_CONTENT.styles,
        features: DEFAULT_CONTENT.features.map((f, i) => ({
          ...f,
          ...(siteConfig.features?.[i] || {})
        }))
      });
    }
  }, [siteConfig]);

  const demoPlugin = (content.plugins || []).find((p: any) => p.id === 'demo_access');
  const isDemoEnabled = demoPlugin ? demoPlugin.enabled !== false : true;

  const renderPlugin = (plugin: any) => {
    if (!plugin.enabled) return null;

    switch (plugin.id) {
      case 'contact':
        return (
          <section key="plugin-contact" className="py-24 px-6 bg-zinc-950 border-t border-white/5 relative">
            <div className="max-w-3xl mx-auto text-center space-y-8">
              <div className="inline-flex items-center justify-center p-4 bg-orange-500/10 text-orange-500 rounded-2xl mb-4">
                <Mail className="w-8 h-8" />
              </div>
              <h2 className="text-4xl font-bold tracking-tight">Get in Touch</h2>
              <p className="text-zinc-400 text-lg">Have questions? Send us an email.</p>
              <a 
                href={`mailto:${plugin.config.email}`}
                className="inline-flex items-center gap-2 px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-full transition-all"
              >
                <Mail className="w-5 h-5" />
                Contact Us
              </a>
            </div>
          </section>
        );
      case 'custom_html':
        return (
          <section 
            key="plugin-custom" 
            className="py-12"
            dangerouslySetInnerHTML={{ __html: plugin.config.html }} 
          />
        );
      default:
        return null;
    }
  };

  const renderSection = (sectionId: string) => {
    const section = content.layout.find(s => s.id === sectionId);
    if (!section || !section.visible) return null;

    // Deduce custom styling configs
    const styleObj = section.style || {};
    let bgInlineStyle: React.CSSProperties = {
      fontFamily: content.theme?.fontFamily || 'Inter'
    };
    
    if (styleObj.bgStyle === 'solid') {
      bgInlineStyle.backgroundColor = styleObj.bgColor || '#000000';
    } else if (styleObj.bgStyle === 'gradient') {
      bgInlineStyle.backgroundImage = styleObj.bgGradient || 'linear-gradient(to right, #000000, #18181b)';
    } else if (styleObj.bgStyle === 'image') {
      bgInlineStyle.backgroundImage = `url(${styleObj.bgImage || 'https://images.unsplash.com/photo-1479767574301-a01c78234a0c?q=80'})`;
      bgInlineStyle.backgroundSize = 'cover';
      bgInlineStyle.backgroundPosition = 'center';
    }

    const paddingClass = 
      styleObj.padding === 'none' ? 'py-0' :
      styleObj.padding === 'sm' ? 'py-10 px-6 sm:px-12' :
      styleObj.padding === 'lg' ? 'py-28 px-6 sm:px-12' :
      'py-20 px-6 sm:px-12'; // default md

    const textAlignClass = 
      styleObj.textAlign === 'left' ? 'text-left' :
      styleObj.textAlign === 'right' ? 'text-right' :
      'text-center';

    const renderInnerContent = () => {
      const type = section.type || sectionId; // Backwards compatible with older layouts lacking explicit .type
      switch (type) {
        case 'hero':
          return (
            <div className="relative max-w-5xl mx-auto space-y-8 py-12">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="flex justify-center mb-6"
              >
                <div className="w-24 h-24 border border-white/10 rounded-3xl flex items-center justify-center shadow-2xl overflow-hidden" style={{ borderColor: `${content.theme.primaryColor}4d` }}>
                  <Logo className="w-full h-full" />
                </div>
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-5xl sm:text-6xl md:text-8xl font-bold tracking-tighter leading-tight"
                style={{ color: styleObj.textColor || '#ffffff' }}
              >
                {content.heroTitle.split(' ').map((word, i) => (
                  <span key={i} style={{ color: word === 'MEETS' ? content.theme.primaryColor : 'inherit' }}>
                    {word}{' '}
                  </span>
                ))}
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-zinc-400 text-lg sm:text-xl md:text-2xl max-w-2xl mx-auto font-medium px-4 leading-relaxed"
              >
                {content.heroSubtitle}
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8"
              >
                <button 
                  onClick={() => setIsLoginModalOpen(true)}
                  disabled={isLoggingIn}
                  className="group relative px-8 py-4 text-white font-bold rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-2xl disabled:opacity-50 disabled:scale-100"
                  style={{ backgroundColor: content.theme.primaryColor }}
                >
                  <div className="relative z-10 flex items-center gap-2">
                    {isLoggingIn ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <LogIn className="w-5 h-5" />
                    )}
                    <span>{isLoggingIn ? 'LOGGING IN...' : 'GET STARTED'}</span>
                    {!isLoggingIn && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                  </div>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundImage: `linear-gradient(to right, ${content.theme.primaryColor}, ${content.theme.accentColor})` }} />
                </button>
                <a 
                  href="#info"
                  className="px-8 py-4 bg-white/5 backdrop-blur-md border border-white/10 text-white font-bold rounded-full hover:bg-white/10 transition-all"
                >
                  LEARN MORE
                </a>
              </motion.div>

              {loginError && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-xl mx-auto p-4 bg-red-950/80 border border-red-500/30 rounded-2xl text-left flex items-start gap-3 mt-8 shadow-xl relative"
                >
                  <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <p className="font-bold text-red-400 text-sm">Login Failed</p>
                    <p className="text-zinc-300 text-xs leading-relaxed">{loginError}</p>
                  </div>
                  {onClearLoginError && (
                    <button 
                      onClick={onClearLoginError}
                      className="text-zinc-500 hover:text-zinc-300 transition-colors p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </motion.div>
              )}
            </div>
          );
        
        case 'info':
          return (
            <div className="max-w-7xl mx-auto py-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div className="space-y-8 text-left">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 border rounded-full text-sm font-bold tracking-widest" style={{ backgroundColor: `${content.theme.primaryColor}1a`, borderColor: `${content.theme.primaryColor}33`, color: content.theme.primaryColor }}>
                    <Info className="w-4 h-4" />
                    THE ART OF TATTOOING
                  </div>
                  <h2 className="text-4xl md:text-5xl font-bold leading-tight" style={{ color: styleObj.textColor || '#ffffff' }}>
                    {content.infoTitle}
                  </h2>
                  <p className="text-zinc-400 text-lg leading-relaxed">
                    {content.infoDescription}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <motion.div 
                      whileHover={{ y: -5 }}
                      className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-3 shadow-lg hover:shadow-orange-500/5 transition-all"
                    >
                      <Shield className="w-8 h-8" style={{ color: content.theme.primaryColor }} />
                      <h3 className="font-bold text-xl">Precision Stencils</h3>
                      <p className="text-zinc-500 text-sm">Our AI ensures every line is mapped perfectly for your transfer.</p>
                    </motion.div>
                    <motion.div 
                      whileHover={{ y: -5 }}
                      className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-3 shadow-lg hover:shadow-orange-500/5 transition-all"
                    >
                      <Zap className="w-8 h-8" style={{ color: content.theme.primaryColor }} />
                      <h3 className="font-bold text-xl">Instant Results</h3>
                      <p className="text-zinc-500 text-sm">Convert complex images into clean stencils in seconds.</p>
                    </motion.div>
                  </div>
                </div>
                <div className="relative isolate w-3/4 max-w-[280px] mx-auto md:w-full md:max-w-none md:scale-110 mt-8 md:mt-0">
                  <div className="aspect-square rounded-3xl md:rounded-[3rem] overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1704345911717-b9c422bf6ef0?q=80&w=735&auto=format&fit=crop" 
                      alt="Tattoo Detail" 
                      className="w-full h-full object-cover grayscale hover:scale-110 transition-transform duration-700"
                      style={{ 
                        WebkitMaskImage: 'radial-gradient(circle, black 60%, transparent 100%)',
                        maskImage: 'radial-gradient(circle, black 60%, transparent 100%)'
                      }}
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="absolute -bottom-6 -right-6 p-8 rounded-3xl shadow-2xl hidden md:block z-10 animate-bounce" style={{ backgroundColor: content.theme.primaryColor }}>
                    <Star className="w-12 h-12 text-white" />
                    <div className="mt-4 font-bold text-2xl">99.9%</div>
                    <div className="text-white/80 text-sm">Detail Accuracy</div>
                  </div>
                </div>
              </div>
            </div>
          );

        case 'styles':
          return (
            <div className="max-w-7xl mx-auto space-y-16">
              <div className="space-y-4">
                <h2 className="text-4xl font-bold">Explore <span style={{ color: content.theme.primaryColor }}>Tattoo Styles</span></h2>
                <p className="text-zinc-500 max-w-2xl mx-auto">From traditional roots to modern hyper-realism, every style requires a unique approach.</p>
              </div>

              <div className="grid gap-4 md:gap-6 px-2 sm:px-0" style={{ gridTemplateColumns: `repeat(${styleObj.gridCols || 4}, minmax(0, 1fr))` }}>
                {(content.styles || []).slice(0, styleObj.gridCols || 4).map((style, i) => (
                  <motion.div 
                    key={i} 
                    whileHover={{ y: -8 }}
                    className="group relative aspect-[3/4] rounded-xl md:rounded-2xl overflow-hidden border border-white/10 shadow-lg hover:shadow-orange-500/10 transition-all duration-300"
                  >
                    <img src={style.img || undefined} alt={style.name} className="w-full h-full object-cover grayscale group-hover:scale-110 group-hover:grayscale-0 transition-all duration-500" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-3 md:p-6 space-y-1 text-left">
                      <h3 className="text-base md:text-xl font-bold leading-tight">{style.name}</h3>
                      <p className="text-zinc-400 text-[10px] md:text-sm line-clamp-2 leading-snug">{style.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          );

        case 'features':
          return (
            <div className="max-w-7xl mx-auto space-y-16">
              <div className="space-y-4">
                <h2 className="text-4xl font-bold">Why Choose <span style={{ color: content.theme.primaryColor }}>Pro Stencils Art</span>?</h2>
                <p className="text-zinc-500 max-w-2xl mx-auto">Designed by artists, for artists. We understand the nuances of skin and ink.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {content.features.map((feature, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    whileHover={{ y: -8 }}
                    onClick={() => setExpandedFeature(expandedFeature === i ? null : i)}
                    className="group relative p-8 backdrop-blur-xl border border-white/5 text-left transition-all duration-300 hover:border-orange-500/30 hover:shadow-[0_20px_50px_rgba(234,88,12,0.15)] cursor-pointer flex flex-col"
                    style={{ 
                      borderRadius: content.theme.borderRadius,
                      backgroundColor: `rgba(24, 24, 27, ${content.theme.glassOpacity || 0.4})`
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" style={{ borderRadius: content.theme.borderRadius }} />
                    <div className="relative z-10 flex-grow">
                      <div className="p-4 rounded-2xl w-fit mb-6 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-lg" style={{ backgroundColor: `${content.theme.primaryColor}1a`, boxShadow: `0 8px 16px -4px ${content.theme.primaryColor}33` }}>
                        <Zap className="w-8 h-8" style={{ color: content.theme.primaryColor }} />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-white group-hover:text-orange-400 transition-colors uppercase tracking-tight pr-4">{feature.title}</h3>
                        <div className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center bg-orange-500/10 text-orange-500 group-hover:bg-orange-500/20 transition-colors">
                          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${expandedFeature === i ? 'rotate-180' : ''}`} />
                        </div>
                      </div>
                      
                      <AnimatePresence initial={false}>
                        {expandedFeature === i ? (
                          <motion.div
                            key="content"
                            initial={{ height: 0, opacity: 0, marginTop: 0 }}
                            animate={{ height: 'auto', opacity: 1, marginTop: '1rem' }}
                            exit={{ height: 0, opacity: 0, marginTop: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="overflow-hidden"
                          >
                            <p className="text-zinc-400 leading-snug text-sm font-medium">{feature.desc}</p>
                          </motion.div>
                        ) : null}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          );

        case 'faq':
          return (
            <div className="max-w-4xl mx-auto space-y-8 text-left">
              <div className="space-y-3">
                <h2 className="text-3xl font-bold text-white text-center">{section.data?.title || 'Frequently Asked Questions'}</h2>
                {section.data?.subtitle && <p className="text-zinc-500 text-center text-sm">{section.data?.subtitle}</p>}
              </div>
              <div className="space-y-4 max-w-2xl mx-auto">
                {(section.data?.items || []).map((item: any, i: number) => (
                  <div key={i} className="p-5 bg-white/5 border border-white/10 rounded-2xl space-y-3">
                    <h3 className="text-lg font-bold text-white flex items-center justify-between">
                      {item.q}
                      <ChevronDown className="w-5 h-5 text-zinc-500" />
                    </h3>
                    <p className="text-sm text-zinc-400 leading-relaxed">{item.a}</p>
                  </div>
                ))}
              </div>
            </div>
          );

        case 'pricing':
          return (
            <div className="max-w-7xl mx-auto space-y-12">
              <div className="space-y-3">
                <h2 className="text-3xl font-bold text-white">{section.data?.title || 'Affordable Plans'}</h2>
                {section.data?.subtitle && <p className="text-zinc-500 text-sm max-w-lg mx-auto">{section.data?.subtitle}</p>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                {(section.data?.plans || []).map((plan: any, i: number) => (
                  <div key={i} className="bg-white/5 border border-white/10 p-8 rounded-3xl text-left flex flex-col justify-between">
                    <div className="space-y-4">
                      <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest block">{plan.name}</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-black text-white">${plan.price}</span>
                        <span className="text-sm text-zinc-500">/mo</span>
                      </div>
                      <div className="h-px bg-white/10 pt-2" />
                      <div className="space-y-3 pt-4">
                        {(plan.features || []).map((f: string, idx: number) => (
                          <div key={idx} className="flex items-center gap-3 text-sm text-zinc-300">
                            <Star className="w-4 h-4 text-orange-500 fill-orange-500 flex-shrink-0" />
                            <span>{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <button onClick={onLogin} className="w-full mt-8 py-3.5 bg-orange-600 hover:bg-orange-700 font-bold rounded-xl text-center text-sm uppercase tracking-wider transition-all">
                      Choose Plan
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );

        case 'testimonials':
          return (
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="flex justify-center gap-2">
                {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />)}
              </div>
              <div className="space-y-8 max-w-lg mx-auto">
                {(section.data?.items || []).map((t: any, i: number) => (
                  <div key={i} className="space-y-4 text-center">
                    <p className="text-xl md:text-2xl italic font-serif leading-relaxed text-zinc-300">"{t.text}"</p>
                    <div>
                      <h4 className="font-bold text-base text-white">{t.name}</h4>
                      <span className="text-xs text-orange-500 uppercase tracking-widest font-bold">{t.role}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );

        case 'stats':
          return (
            <div className="max-w-7xl mx-auto space-y-12">
              <div className="space-y-3">
                <h2 className="text-3xl font-bold text-white">{section.data?.title || 'Performance Metrics'}</h2>
                {section.data?.subtitle && <p className="text-zinc-500 max-w-md mx-auto text-sm">{section.data?.subtitle}</p>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto py-4">
                {(section.data?.items || []).map((stat: any, i: number) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-2">
                    <h4 className="text-4xl font-extrabold text-orange-500 tracking-tight">{stat.value}</h4>
                    <p className="font-bold text-base text-zinc-200 uppercase">{stat.label}</p>
                    {stat.desc && <p className="text-xs text-zinc-500 mt-2">{stat.desc}</p>}
                  </div>
                ))}
              </div>
            </div>
          );

        case 'gallery':
          return (
            <div className="max-w-7xl mx-auto space-y-12">
              <div className="space-y-3">
                <h2 className="text-3xl font-bold text-white">{section.data?.title || 'Our Gallery'}</h2>
                <p className="text-zinc-500 max-w-lg mx-auto text-sm">{section.data?.subtitle}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {(section.data?.items || []).map((item: any, i: number) => (
                  <div key={i} className="group relative aspect-square rounded-3xl overflow-hidden bg-zinc-900 border border-white/5">
                    {item.img && <img src={item.img} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent flex flex-col justify-end p-6 text-left">
                      <h4 className="text-lg font-bold text-white truncate">{item.title}</h4>
                      <span className="text-xs font-bold text-orange-500 uppercase tracking-wider mt-1">Artist: {item.artist}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );

        case 'contact':
          return (
            <div className="max-w-lg mx-auto space-y-6">
              <div className="space-y-3">
                <h2 className="text-3xl font-extrabold text-white uppercase tracking-wider">{section.data?.title || 'Connect with Studio'}</h2>
                <p className="text-zinc-500 text-sm">{section.data?.subtitle}</p>
              </div>
              <div className="p-8 bg-white/5 border border-white/10 rounded-3xl">
                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest block mb-4">Direct Communication Channel</h3>
                <a href={`mailto:${section.data?.email}`} className="text-lg md:text-xl font-mono text-orange-500 hover:underline hover:text-orange-400 block transition">
                  {section.data?.email}
                </a>
              </div>
            </div>
          );

        case 'cta':
          return (
            <div className="max-w-4xl mx-auto py-8 text-center space-y-6">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight max-w-lg mx-auto">{section.data?.title || 'Ready to Elevate Your Ink?'}</h2>
              <p className="text-zinc-400 text-base max-w-md mx-auto">{section.data?.subtitle}</p>
              <button onClick={onLogin} className="px-10 py-4 bg-white text-black font-black text-xs rounded-full uppercase tracking-widest hover:bg-orange-50 hover:scale-105 shadow-2xl transition">
                {section.data?.buttonText || 'Claim Free Access'}
              </button>
            </div>
          );

        case 'countdown':
          return (
            <div className="max-w-2xl mx-auto py-6 space-y-4 bg-white/5 border border-white/10 rounded-3xl">
              <span className="text-xs tracking-widest font-black text-red-500 animate-pulse block uppercase">🔥 Launch scarcity promotion expiring soon</span>
              <h3 className="text-lg font-bold text-white">{section.data?.title}</h3>
              <div className="flex justify-center gap-2 items-center">
                <div className="py-2 px-6 bg-red-600 font-mono text-base font-bold text-white rounded-lg">
                  {section.data?.targetTime || '1h 30m'}
                </div>
              </div>
            </div>
          );

        case 'banner':
          return (
            <div className="w-full text-center py-4 bg-orange-600/10 text-orange-400 font-bold border border-orange-500/15 rounded-2xl text-xs sm:text-sm">
              <span>{section.data?.text}</span>
            </div>
          );

        default:
          return null;
      }
    };

    return (
      <section 
        key={section.id} 
        id={section.id} 
        style={bgInlineStyle} 
        className={`${paddingClass} ${textAlignClass} relative border-b border-white/5 overflow-hidden transition-all duration-300`}
      >
        {styleObj.bgStyle === 'image' && (
          <div 
            className="absolute inset-0 bg-black pointer-events-none" 
            style={{ opacity: (styleObj.overlayOpacity ?? 70) / 100 }}
          />
        )}
        <div className="relative z-10">
          {renderInnerContent()}
        </div>
      </section>
    );
  };

  const socialLinksConfig = content.plugins?.find(p => p.id === 'social_links' && p.enabled)?.config;
  const announcementConfig = content.plugins?.find(p => p.id === 'announcement' && p.enabled)?.config;
  const maintenanceConfig = content.plugins?.find(p => p.id === 'maintenance' && p.enabled)?.config;

  if (maintenanceConfig && !isAdmin) {
    return (
      <div className="min-h-screen w-full bg-black text-white flex flex-col items-center justify-center p-6 text-center" style={{ fontFamily: content.theme.fontFamily }}>
        <Logo className="w-16 h-16 mb-8 text-orange-500" />
        <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">We'll be right back</h1>
        <p className="text-xl text-zinc-400 max-w-lg mb-12 leading-relaxed">
          {maintenanceConfig.text || "We are currently down for maintenance. Please check back later."}
        </p>
        <button 
          onClick={onLogin}
          className="text-xs text-zinc-600 hover:text-zinc-400 flex items-center gap-2"
        >
          <Settings className="w-4 h-4" />
          Admin Login
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-black text-white overflow-x-hidden" style={{ fontFamily: content.theme.fontFamily }}>
      {/* Announcement Bar */}
      {announcementConfig && announcementConfig.text && (
        <div className="w-full text-white text-center py-2 px-4 font-medium text-sm flex items-center justify-center relative z-50 shadow-md" style={{ backgroundColor: content.theme.primaryColor }}>
          <span>{announcementConfig.text}</span>
          {announcementConfig.url && (
            <a href={announcementConfig.url} target="_blank" rel="noopener noreferrer" className="ml-2 font-bold underline hover:text-white/80 transition-colors">
              Read more
            </a>
          )}
        </div>
      )}

      {/* Admin Toggle */}
      {isAdmin && (
        <button 
          onClick={onOpenAdmin}
          className="fixed top-6 right-6 z-50 p-3 rounded-full shadow-2xl hover:scale-110 transition-transform"
          style={{ backgroundColor: content.theme.primaryColor }}
        >
          <Settings className="w-6 h-6" />
        </button>
      )}

      {content.layout.map(section => renderSection(section.id))}

      {content.plugins?.map(plugin => renderPlugin(plugin))}

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5 bg-black text-center relative pointer-events-auto">
        <div className="flex items-center justify-center gap-3 mb-8">
          <Logo className="w-8 h-8" />
          <span className="text-xl font-bold tracking-tight">Pro Stencils Art</span>
        </div>
        
        {socialLinksConfig && (
          <div className="flex items-center justify-center gap-6 mb-8">
            {socialLinksConfig.instagram && (
              <a href={socialLinksConfig.instagram} target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-orange-500 transition-colors">
                <Instagram className="w-6 h-6" />
              </a>
            )}
            {socialLinksConfig.tiktok && (
              <a href={socialLinksConfig.tiktok} target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-orange-500 transition-colors">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </a>
            )}
            {socialLinksConfig.facebook && (
              <a href={socialLinksConfig.facebook} target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-orange-500 transition-colors">
                <Facebook className="w-6 h-6" />
              </a>
            )}
          </div>
        )}
        
        <div className="flex items-center justify-center gap-6 mt-8 mb-4">
          <button 
            onClick={() => setLegalModal({ isOpen: true, title: 'Impressum', content: content.legal?.impressum || '' })}
            className="text-zinc-500 hover:text-white transition-colors text-sm"
          >
            Impressum
          </button>
          <button 
            onClick={() => setLegalModal({ isOpen: true, title: 'Datenschutzerklärung', content: content.legal?.privacyPolicy || '' })}
            className="text-zinc-500 hover:text-white transition-colors text-sm"
          >
            Datenschutz
          </button>
        </div>

        <p className="text-zinc-600 text-sm">© 2025 Pro Stencils Art. All rights reserved.</p>
      </footer>

      <LegalPagesModal
        isOpen={legalModal.isOpen}
        onClose={() => setLegalModal(prev => ({ ...prev, isOpen: false }))}
        title={legalModal.title}
        markdownContent={legalModal.content}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onGoogleLogin={onLogin}
        onEmailLogin={onEmailLogin}
        onEmailRegister={onEmailRegister}
        onGuestLogin={onGuestLogin}
        isLoggingIn={isLoggingIn}
        loginError={loginError}
        onClearLoginError={onClearLoginError}
        isDemoEnabled={isDemoEnabled}
      />
    </div>
  );
};

export default LandingPage;
