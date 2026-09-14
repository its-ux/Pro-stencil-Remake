import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Trash2, GripVertical, Eye, EyeOff, Sparkles, 
  Settings2, Layout, Type, Image as ImageIcon, Check,
  ChevronRight, ChevronLeft, Save, Globe, Smartphone, Tablet, Zap,
  PenTool, Maximize2, Copy, AlignLeft, AlignCenter, AlignRight,
  Sliders, Palette, Columns, Grid, Clock, ChevronDown, CheckCircle2,
  Phone, Star, AlertCircle, Sparkle, Paintbrush, ArrowRight
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface Section {
  id: string;
  label: string;
  visible: boolean;
  type: string;
  data: any;
  style?: {
    bgStyle?: 'solid' | 'gradient' | 'image';
    bgColor?: string;
    bgGradient?: string;
    bgImage?: string;
    overlayOpacity?: number;
    padding?: 'none' | 'sm' | 'md' | 'lg';
    textAlign?: 'left' | 'center' | 'right';
    animation?: 'none' | 'fadeIn' | 'slideUp' | 'slideRight' | 'scaleUp';
    gridCols?: number;
    textColor?: string;
    accentColor?: string;
  };
}

interface SiteBuilderProps {
  content: any;
  onChange: (newContent: any) => void;
  onSave: () => void;
}

const SiteBuilder: React.FC<SiteBuilderProps> = ({ content, onChange, onSave }) => {
  const [activePage, setActivePage] = useState<'landing' | 'stencil' | 'upscaler'>('landing');
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [isAiGenerating, setIsAiGenerating] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showAddSection, setShowAddSection] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<'content' | 'design' | 'advanced'>('content');
  const [hoveredSectionId, setHoveredSectionId] = useState<string | null>(null);

  // Lazy initialize Google Gen AI
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  // Fallback for missing/empty layout structure on old objects
  useEffect(() => {
    if (!content.layout || content.layout.length === 0) {
      const defaultLayout = [
        { id: 'hero', visible: true, label: 'Hero Section', type: 'hero', data: {} },
        { id: 'info', visible: true, label: 'Info Section', type: 'info', data: {} },
        { id: 'styles', visible: true, label: 'Styles Section', type: 'styles', data: {} },
        { id: 'features', visible: true, label: 'Features Section', type: 'features', data: {} }
      ];
      onChange({ ...content, layout: defaultLayout });
    }
  }, [content, onChange]);

  const handleAiRewrite = async (field: string, currentText: string, contextPrompt?: string) => {
    setIsAiGenerating(field);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `You are a world-class copywriter for premium tattoo technologies. 
        Optimize this website copy for maximal high-end conversion, keeping it punchy, professional, and slightly edgy.
        Target audience: Pro tattoo artists.
        Additional request: ${contextPrompt || "Rewrite cleanly for a luxury look."}
        Original text: "${currentText}"`,
      });
      
      const newText = response.text;
      if (newText) {
        if (field.includes('.')) {
          const parts = field.split('.');
          if (parts.length === 2) {
            onChange({
              ...content,
              [parts[0]]: {
                ...content[parts[0]],
                [parts[1]]: newText.trim()
              }
            });
          }
        } else {
          onChange({ ...content, [field]: newText.trim() });
        }
      }
    } catch (err) {
      console.error("AI Copywriting generation failed", err);
    } finally {
      setIsAiGenerating(null);
    }
  };

  const handleUpdateSection = (id: string, updates: Partial<Section>) => {
    const newLayout = content.layout.map((s: Section) => 
      s.id === id ? { ...s, ...updates } : s
    );
    onChange({ ...content, layout: newLayout });
  };

  const handleUpdateSectionData = (id: string, dataUpdates: any) => {
    const newLayout = content.layout.map((s: Section) => 
      s.id === id ? { ...s, data: { ...s.data, ...dataUpdates } } : s
    );
    onChange({ ...content, layout: newLayout });
  };

  const handleUpdateSectionStyle = (id: string, styleUpdates: any) => {
    const newLayout = content.layout.map((s: Section) => 
      s.id === id ? { 
        ...s, 
        style: { ...(s.style || {}), ...styleUpdates } 
      } : s
    );
    onChange({ ...content, layout: newLayout });
  };

  const cloneSection = (id: string) => {
    const index = content.layout.findIndex((s: Section) => s.id === id);
    if (index === -1) return;
    const source = content.layout[index];
    const newId = `${source.type}_${Date.now()}`;
    const cloned: Section = {
      ...source,
      id: newId,
      label: `${source.label} (Copy)`
    };
    const newLayout = [...content.layout];
    newLayout.splice(index + 1, 0, cloned);
    onChange({ ...content, layout: newLayout });
    setActiveSectionId(newId);
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= content.layout.length) return;
    
    const newLayout = [...content.layout];
    const item = newLayout[index];
    newLayout.splice(index, 1);
    newLayout.splice(newIndex, 0, item);
    onChange({ ...content, layout: newLayout });
  };

  const activeSectionData = activeSectionId ? content.layout.find((s: Section) => s.id === activeSectionId) : null;

  const handleAddSection = (type: string) => {
    const defaultStyles: any = {
      bgStyle: 'solid',
      bgColor: '#000000',
      padding: 'md',
      textAlign: 'center',
      animation: 'fadeIn',
      gridCols: 3,
      textColor: '#ffffff',
      accentColor: content.theme?.primaryColor || '#ea580c'
    };

    const sectionTemplates: Record<string, any> = {
      faq: {
        label: "FAQ Accordion",
        type: 'faq',
        data: {
          title: "Frequently Asked Questions",
          subtitle: "Everything you need to know about easy stencils",
          items: [
            { q: "How exact are the AI outline stencils?", a: "Our system applies advanced edge tracking, delivering near 99.9% curve accuracy." },
            { q: "Is registration required for export?", a: "Registered artists enjoy permanent cloud history with unlimited access features." }
          ]
        }
      },
      pricing: {
        label: "Pricing Tiers",
        type: 'pricing',
        data: {
          title: "Affordable Enterprise Rates",
          subtitle: "Select the ideal tier for your work volume. Cancel anytime.",
          plans: [
            { name: "Daily Pass", price: "4.99", features: ["5 Ultra High-Res Stencils", "Standard Support"] },
            { name: "Artist Pro", price: "24.99", features: ["Unlimited Conversions", "Fine-Line Mode", "Fast AI Upscaling", "Dedicated support"] }
          ]
        }
      },
      testimonials: {
        label: "Artist Feedback Showcase",
        type: 'testimonials',
        data: {
          title: "What Master Artists Say",
          subtitle: "Hear feedback from leading studios worldwide",
          items: [
            { name: "Lukas Vance", role: "Traditional Master", text: "Finally an AI app made for tattooers, not generic designers." },
            { name: "Vera Cruz", role: "Realism Elite", text: "The fine-line details generated saves me hours of manual drawing." }
          ]
        }
      },
      contact: {
        label: "Reach Studio Form",
        type: 'contact',
        data: { 
          title: "Elevate Your Tattoo Craft", 
          subtitle: "Drop us your email or call for customized enterprise licenses.",
          email: "support@easy-stencil.io" 
        }
      },
      cta: {
        label: "Promotional Banner (CTA)",
        type: 'cta',
        data: { 
          title: "Ready to Revolutionize Your Ink?", 
          subtitle: "Join over 10,000+ elite artists who trust our algorithm daily.",
          buttonText: "Create Free Account" 
        },
        style: { ...defaultStyles, bgStyle: 'gradient', bgGradient: 'linear-gradient(to right, #ea580c, #9a3412)' }
      },
      stats: {
        label: "Impact Counters Block",
        type: 'stats',
        data: {
          title: "Stencils in Numbers",
          subtitle: "Performance benchmarks that showcase industry excellence",
          items: [
            { value: "4.8M+", label: "Stencils Rendered" },
            { value: "12,000+", label: "Verified Artists" },
            { value: "99.9%", label: "Edge Precision" }
          ]
        }
      },
      gallery: {
        label: "Stencil Master Gallery",
        type: 'gallery',
        data: {
          title: "Community Creations Showcase",
          subtitle: "Explore high-fidelity results rendered with our active modifiers",
          items: [
            { title: "Neo-Traditional Dragon", artist: "Ken G.", img: "https://images.unsplash.com/photo-1590247813693-5541d1c609fd?q=80&w=600" },
            { title: "Geisha Fine-Line", artist: "Mio H.", img: "https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?q=80&w=600" },
            { title: "Realistic Lion Portrait", artist: "Lars K.", img: "https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?q=80&w=600" }
          ]
        }
      },
      countdown: {
        label: "Scarcity Launch Countdown",
        type: 'countdown',
        data: {
          title: "Special Pre-Opening Offer Expires Soon",
          subtitle: "Unlock Artist Pro with lifetime 50% discount.",
          targetTime: "2 hours, 14 minutes"
        },
        style: { ...defaultStyles, bgColor: '#111827' }
      },
      banner: {
        label: "Horizontal Info Banner",
        type: 'banner',
        data: {
          text: "💥 Server Update: Faster generation speeds and enhanced edge smoothing algorithms are now active!"
        }
      }
    };

    const template = sectionTemplates[type];
    if (template) {
      const newSection: Section = {
        id: `${type}_${Date.now()}`,
        visible: true,
        label: template.label,
        type: template.type,
        data: template.data,
        style: template.style || defaultStyles
      };

      onChange({
        ...content,
        layout: [...(content.layout || []), newSection]
      });
      setShowAddSection(false);
      setActiveSectionId(newSection.id);
    }
  };

  const applyThemePreset = (presetName: string) => {
    let newTheme = {};
    if (presetName === 'cyberpunk') {
      newTheme = {
        primaryColor: '#ec4899',
        accentColor: '#8b5cf6',
        fontFamily: 'JetBrains Mono',
        borderRadius: '0.75rem',
        glassOpacity: '0.2'
      };
    } else if (presetName === 'minimal') {
      newTheme = {
        primaryColor: '#18181b',
        accentColor: '#71717a',
        fontFamily: 'Inter',
        borderRadius: '0px',
        glassOpacity: '0.8'
      };
    } else if (presetName === 'luxury') {
      newTheme = {
        primaryColor: '#ca8a04',
        accentColor: '#78350f',
        fontFamily: 'Georgia',
        borderRadius: '1.5rem',
        glassOpacity: '0.5'
      };
    } else { // default orange-stencil
      newTheme = {
        primaryColor: '#ea580c',
        accentColor: '#9a3412',
        fontFamily: 'Inter',
        borderRadius: '2.5rem',
        glassOpacity: '0.4'
      };
    }
    onChange({ ...content, theme: newTheme });
  };

  return (
    <div className="flex h-[85vh] bg-zinc-950 text-white rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl relative">
      
      {/* 1. STRUCTURAL DIRECTORY LAYOUT (LEFT RAIL) */}
      <div className="w-80 border-r border-white/5 bg-zinc-950 flex flex-col shrink-0">
        
        {/* Scope Indicator */}
        <div className="p-4 bg-zinc-900/30 border-b border-white/5 flex items-center justify-between">
          <span className="text-[10px] tracking-widest font-black text-orange-600 uppercase">Admin block editor</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] text-zinc-500 font-bold">LIVE SYNC</span>
          </div>
        </div>

        {/* View Switcher */}
        <div className="p-3 border-b border-white/5 bg-zinc-950/50 grid grid-cols-3 gap-1">
          {[
            { id: 'landing', icon: Globe, label: 'Landing' },
            { id: 'stencil', icon: PenTool, label: 'Generator' },
            { id: 'upscaler', icon: Maximize2, label: 'Upscale' }
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setActivePage(p.id as any);
                setActiveSectionId(null);
              }}
              className={`p-2 rounded-xl flex flex-col items-center gap-1.5 transition-all text-center ${
                activePage === p.id 
                  ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/10' 
                  : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/5'
              }`}
            >
              <p.icon className="w-4 h-4 shrink-0" />
              <span className="text-[8px] font-bold uppercase tracking-tight">{p.label}</span>
            </button>
          ))}
        </div>

        {/* Dynamic section stack list */}
        <div className="p-4 flex items-center justify-between border-b border-white/5">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
            <Layout className="w-3.5 h-3.5 text-orange-500" />
            Page Blocks ({activePage === 'landing' ? content.layout?.length || 0 : 1})
          </h3>
          {activePage === 'landing' && (
            <button 
              onClick={() => setShowAddSection(true)}
              className="p-1.5 bg-orange-600 hover:bg-orange-700 hover:scale-105 active:scale-95 text-white rounded-lg transition-all"
              title="Add Gutenberg Block"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Reordering and properties manager stack */}
        <div className="flex-grow overflow-y-auto p-3 space-y-1.5 custom-scrollbar bg-black/40">
          {activePage === 'landing' ? (
            content.layout?.map((section: Section, index: number) => (
              <div 
                key={section.id}
                onClick={() => setActiveSectionId(section.id)}
                onMouseEnter={() => setHoveredSectionId(section.id)}
                onMouseLeave={() => setHoveredSectionId(null)}
                className={`group flex items-center gap-2 p-2.5 rounded-xl cursor-pointer transition-all border ${
                  activeSectionId === section.id 
                    ? 'bg-orange-600/10 border-orange-600/50 text-white' 
                    : 'border-transparent bg-zinc-900/40 hover:bg-zinc-800/60 hover:border-white/5'
                }`}
              >
                {/* Grab handle with arrow selectors */}
                <div className="flex flex-col items-center gap-0.5 pr-1 opacity-40 group-hover:opacity-100 transition-all">
                  <button 
                    disabled={index === 0}
                    onClick={(e) => { e.stopPropagation(); moveSection(index, 'up'); }}
                    className="p-0.5 hover:bg-white/10 rounded disabled:opacity-20 text-zinc-400"
                  >
                    <ChevronDown className="w-3.5 h-3.5 rotate-180" />
                  </button>
                  <button 
                    disabled={index === content.layout.length - 1}
                    onClick={(e) => { e.stopPropagation(); moveSection(index, 'down'); }}
                    className="p-0.5 hover:bg-white/10 rounded disabled:opacity-20 text-zinc-400"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Info and action tools */}
                <div className="flex-grow flex items-center justify-between overflow-hidden">
                  <div className="truncate pr-2">
                    <div className="text-[11px] font-bold truncate">{section.label || section.id}</div>
                    <div className="text-[8px] text-zinc-500 uppercase tracking-widest">{section.type || 'Custom'}</div>
                  </div>
                  
                  <div className="flex items-center gap-1 shrink-0">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateSection(section.id, { visible: !section.visible });
                      }}
                      className={`p-1 rounded-lg transition-colors ${section.visible ? 'text-zinc-300 hover:text-white' : 'text-zinc-600 hover:text-zinc-450'}`}
                      title={section.visible ? "Hide Block" : "Show Block"}
                    >
                      {section.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5-red-500" />}
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        cloneSection(section.id);
                      }}
                      className="p-1 hover:bg-white/5 text-zinc-500 hover:text-zinc-300 rounded-lg transition-all"
                      title="Duplicate Block"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Remove block "${section.label}"?`)) {
                          onChange({ ...content, layout: content.layout.filter((s: any) => s.id !== section.id) });
                          if (activeSectionId === section.id) setActiveSectionId(null);
                        }
                      }}
                      className="p-1 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                      title="Delete Block"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div 
              onClick={() => setActiveSectionId(activePage)}
              className={`flex items-center gap-3.5 p-3 rounded-2xl cursor-pointer transition-all border ${
                activeSectionId === activePage 
                  ? 'bg-orange-600/10 border-orange-600' 
                  : 'border-white/5 bg-zinc-900/30 hover:bg-white/5 text-zinc-300'
              }`}
            >
              <div className="w-10 h-10 bg-orange-600/15 rounded-xl flex items-center justify-center">
                <Settings2 className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="font-bold text-sm text-white">Full Configuration</div>
                <div className="text-[10px] text-zinc-600 uppercase tracking-wider">Configure Page Schema</div>
              </div>
            </div>
          )}
        </div>

        {/* Global branding swapper */}
        <div className="p-4 bg-zinc-950 border-t border-white/5">
          <label className="text-[9px] uppercase tracking-widest font-bold text-zinc-500 block mb-2">Preset Web Theme Styles</label>
          <div className="grid grid-cols-4 gap-1">
            {[
              { id: 'classic', label: 'Easy', bg: 'bg-orange-600' },
              { id: 'cyberpunk', label: 'Cyber', bg: 'bg-pink-600' },
              { id: 'minimal', label: 'Light', bg: 'bg-zinc-200 text-black' },
              { id: 'luxury', label: 'Gold', bg: 'bg-yellow-600' }
            ].map(preset => (
              <button
                key={preset.id}
                onClick={() => applyThemePreset(preset.id)}
                className={`py-1 text-[8px] font-bold rounded-lg ${preset.bg} opacity-85 hover:opacity-100 uppercase transition-all shadow-md active:scale-95`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Global Save Trigger */}
        <div className="p-4 border-t border-white/5 bg-[#0e0e11]">
          <button 
            onClick={onSave}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-xs transition-all shadow-xl hover:shadow-orange-600/10 active:translate-y-0.5"
          >
            <Save className="w-4 h-4" />
            Publish Changes
          </button>
        </div>
      </div>

      {/* 2. CHASSIS CONTAINER & CANVAS OVERLAY (CENTER STAGE) */}
      <div className="flex-grow flex flex-col bg-zinc-950 overflow-hidden relative">
        
        {/* Device view responsive trigger */}
        <div className="h-14 border-b border-white/5 bg-[#08080a] flex items-center justify-between px-6 z-10 shrink-0">
          <div className="flex items-center gap-2">
            <span className="p-1 px-2.5 bg-zinc-900 border border-white/5 rounded-full text-[10px] font-mono text-zinc-500">
              {previewMode === 'desktop' ? '1280px (Fluid Fullwidth)' : previewMode === 'tablet' ? '768px (iPad Mini)' : '375px (iPhone 15)'}
            </span>
          </div>

          <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-white/5">
            {[
              { mode: 'desktop', icon: Globe },
              { mode: 'tablet', icon: Tablet },
              { mode: 'mobile', icon: Smartphone }
            ].map(d => (
              <button 
                key={d.mode}
                onClick={() => setPreviewMode(d.mode as any)}
                className={`p-1.5 px-3 rounded-lg flex items-center gap-1 transition-all ${
                  previewMode === d.mode 
                    ? 'bg-orange-600 text-white shadow' 
                    : 'text-zinc-500 hover:text-white'
                }`}
              >
                <d.icon className="w-4 h-4" />
              </button>
            ))}
          </div>
          
          <div className="w-10 h-10" /> {/* Spacer */}
        </div>

        {/* Fully Interactive Live Preview Board */}
        <div className="flex-grow p-4 md:p-8 flex justify-center items-start overflow-y-auto scrollbar-hide bg-zinc-900/30">
          <motion.div 
            layout
            className={`bg-black border border-white/5 shadow-2xl rounded-2xl md:rounded-[2.5rem] overflow-hidden transition-all duration-300 ${
              previewMode === 'desktop' ? 'w-full max-w-5xl' : 
              previewMode === 'tablet' ? 'w-[768px]' : 
              'w-[375px]'
            } min-h-full`}
            style={{ fontFamily: content.theme?.fontFamily || 'Inter' }}
          >
            <div className="p-3 md:p-6 space-y-6">
              
              {activePage === 'landing' ? (
                content.layout?.filter((s: Section) => s.visible).map((section: Section, index: number) => {
                  const styleObj = section.style || {};
                  
                  // Deduce background render
                  let bgClass = "bg-zinc-900 border border-white/5";
                  let bgInlineStyle: React.CSSProperties = {};
                  if (styleObj.bgStyle === 'solid') {
                    bgInlineStyle.backgroundColor = styleObj.bgColor || '#18181b';
                  } else if (styleObj.bgStyle === 'gradient') {
                    bgInlineStyle.backgroundImage = styleObj.bgGradient || 'linear-gradient(to right, #27272a, #09090b)';
                  } else if (styleObj.bgStyle === 'image') {
                    bgInlineStyle.backgroundImage = `url(${styleObj.bgImage || 'https://images.unsplash.com/photo-1479767574301-a01c78234a0c?q=40'})`;
                    bgInlineStyle.backgroundSize = 'cover';
                    bgInlineStyle.backgroundPosition = 'center';
                  }

                  // Deduce paddings
                  const paddingClass = 
                    styleObj.padding === 'none' ? 'p-0' :
                    styleObj.padding === 'sm' ? 'p-4 md:p-8' :
                    styleObj.padding === 'lg' ? 'p-12 md:p-24' :
                    'p-6 md:p-14'; // default md
                  
                  // Deduce alignments
                  const textAlignClass = 
                    styleObj.textAlign === 'left' ? 'text-left' :
                    styleObj.textAlign === 'right' ? 'text-right' :
                    'text-center';

                  return (
                    <div 
                      key={section.id}
                      onClick={() => setActiveSectionId(section.id)}
                      onMouseEnter={() => setHoveredSectionId(section.id)}
                      onMouseLeave={() => setHoveredSectionId(null)}
                      className={`rounded-2xl md:rounded-[2rem] transition-all relative border overflow-hidden cursor-pointer group/item ${
                        activeSectionId === section.id 
                          ? 'ring-2 ring-orange-500 ring-offset-2 ring-offset-black scale-[0.99] shadow-2xl shadow-orange-500/5' 
                          : hoveredSectionId === section.id
                            ? 'border-orange-550 border-dashed scale-[1.002]'
                            : 'border-white/5 hover:border-white/10'
                      }`}
                      style={bgInlineStyle}
                    >
                      {/* Dark image background tint overlay */}
                      {styleObj.bgStyle === 'image' && (
                        <div 
                          className="absolute inset-0 bg-black pointer-events-none" 
                          style={{ opacity: (styleObj.overlayOpacity ?? 70) / 100 }}
                        />
                      )}

                      {/* HOVER GUTENBERG FLOATING BLOCK TOOLBAR */}
                      <AnimatePresence>
                        {(hoveredSectionId === section.id || activeSectionId === section.id) && (
                          <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute top-3 right-3 z-30 bg-zinc-950/95 border border-white/10 rounded-xl p-1 shadow-2xl flex items-center gap-1 backdrop-blur-md"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span className="text-[8px] font-black tracking-widest text-zinc-500 px-2 uppercase">{section.label}</span>
                            <div className="h-4 w-px bg-white/10" />
                            <button 
                              onClick={() => { moveSection(index, 'up'); }}
                              disabled={index === 0}
                              className="p-1.5 hover:bg-white/5 text-zinc-400 hover:text-white rounded disabled:opacity-20 transition"
                            >
                              <ChevronDown className="w-3.5 h-3.5 rotate-180" />
                            </button>
                            <button 
                              onClick={() => { moveSection(index, 'down'); }}
                              disabled={index === content.layout.length - 1}
                              className="p-1.5 hover:bg-white/5 text-zinc-400 hover:text-white rounded disabled:opacity-20 transition"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => cloneSection(section.id)}
                              className="p-1.5 hover:bg-white/5 text-zinc-400 hover:text-white rounded transition"
                              title="Duplicate Block"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => {
                                onChange({ ...content, layout: content.layout.filter((s: any) => s.id !== section.id) });
                                if (activeSectionId === section.id) setActiveSectionId(null);
                              }}
                              className="p-1.5 hover:bg-red-500/10 text-zinc-400 hover:text-red-500 rounded transition"
                              title="Delete Block"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className={`${paddingClass} ${textAlignClass} relative z-10`}>
                        
                        {/* CORE BLOCK PREVIEWS */}

                        {/* HERO SECTION BLOCK */}
                        {section.type === 'hero' && (
                          <div className="space-y-4 max-w-2xl mx-auto py-8">
                            <h1 className="text-3xl md:text-5xl font-black tracking-tight" style={{ color: styleObj.textColor || '#ffffff' }}>
                              {content.heroTitle || 'ART MEETS PRECISION'}
                            </h1>
                            <p className="text-zinc-400 text-xs md:text-sm max-w-md mx-auto leading-relaxed">
                              {content.heroSubtitle || 'The ultimate AI-powered stencil generator for professional tattoo artists.'}
                            </p>
                            <div className="flex justify-center gap-3 pt-4">
                              <div className="px-5 py-2.5 rounded-full text-xs font-bold text-white shadow-lg" style={{ backgroundColor: styleObj.accentColor || '#ea580c' }}>
                                START GENERATING
                              </div>
                              <div className="px-5 py-2.5 rounded-full text-xs font-bold bg-white/5 border border-white/10 text-white">
                                EXPLORE APP
                              </div>
                            </div>
                          </div>
                        )}

                        {/* INFO / INTRO SUMMARY BLOCK */}
                        {section.type === 'info' && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center py-6">
                            <div className="space-y-3.5 text-left">
                              <h3 className="text-xl md:text-2xl font-bold" style={{ color: styleObj.textColor || '#ffffff' }}>
                                {content.infoTitle || 'A Legacy of Expression'}
                              </h3>
                              <p className="text-zinc-400 text-[11px] md:text-xs leading-relaxed">
                                {content.infoDescription || 'Tattooing is one of the oldest forms of human expression.'}
                              </p>
                            </div>
                            <div className="aspect-video bg-zinc-950/60 rounded-2xl relative border border-white/5 flex items-center justify-center overflow-hidden">
                              <img 
                                src="https://images.unsplash.com/photo-1704345911717-b9c422bf6ef0?q=80&w=600" 
                                className="w-full h-full object-cover opacity-60 grayscale"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                          </div>
                        )}

                        {/* CARD CAROUSEL / STYLE SELECTORS BLOCK */}
                        {section.type === 'styles' && (
                          <div className="space-y-6">
                            <div className="text-center">
                              <h3 className="text-xl font-bold">{section.data?.title || 'Tattoo Styles Portfolio'}</h3>
                              <p className="text-[10px] text-zinc-500 mt-1">{section.data?.subtitle || 'Selected reference images used to fine-tune our models'}</p>
                            </div>
                            <div className={`grid gap-4`} style={{ gridTemplateColumns: `repeat(${styleObj.gridCols || 4}, minmax(0, 1fr))` }}>
                              {(content.styles || []).slice(0, styleObj.gridCols || 4).map((s: any, i: number) => (
                                <div key={i} className="aspect-[3/4] bg-zinc-950 border border-white/5 rounded-xl flex flex-col justify-end p-3 overflow-hidden relative group/card">
                                  {s.img && <img src={s.img} className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover/card:scale-110 transition duration-500" referrerPolicy="no-referrer" />}
                                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                                  <div className="relative z-10 text-left">
                                    <span className="text-[10px] font-bold uppercase tracking-tight block text-white">{s.name}</span>
                                    <span className="text-[8px] text-zinc-500 block truncate leading-none mt-1">{s.desc}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* VALUE PROPOSITIONS / FEATURES GRID BLOCK */}
                        {section.type === 'features' && (
                          <div className="space-y-6">
                            <div className="text-center">
                              <h3 className="text-xl font-bold">{section.data?.title || 'Built For Serious Studios'}</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {(content.features || []).map((f: any, i: number) => (
                                <div key={i} className="p-4 bg-zinc-950/60 border border-white/5 rounded-2xl text-left space-y-3">
                                  <div className="w-6 h-6 bg-orange-600/15 rounded-lg flex items-center justify-center">
                                    <Zap className="w-3.5 h-3.5 text-orange-500" />
                                  </div>
                                  <h4 className="text-xs font-bold text-white uppercase tracking-tight">{f.title}</h4>
                                  <p className="text-[10px] text-zinc-500 leading-snug">{f.desc}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* DYNAMIC TEMPLATE: FAQ ACCORDION BLOCK */}
                        {section.type === 'faq' && (
                          <div className="space-y-4 max-w-xl mx-auto text-left">
                            <div className="text-center mb-6">
                              <h3 className="text-xl font-bold">{section.data?.title}</h3>
                              <p className="text-[10px] text-zinc-500 mt-1">{section.data?.subtitle}</p>
                            </div>
                            <div className="space-y-2">
                              {(section.data?.items || []).map((item: any, i: number) => (
                                <div key={i} className="p-3.5 bg-zinc-950 border border-white/5 rounded-xl">
                                  <div className="font-bold text-[11px] flex justify-between items-center text-white">
                                    <span>{item.q}</span>
                                    <ChevronDown className="w-3.5 h-3.5 text-orange-500" />
                                  </div>
                                  <div className="text-[9px] text-zinc-400 mt-2 leading-relaxed">{item.a}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* DYNAMIC TEMPLATE: PRICING CARD TIERS BLOCK */}
                        {section.type === 'pricing' && (
                          <div className="space-y-6">
                            <div className="text-center mb-6">
                              <h3 className="text-xl font-bold">{section.data?.title}</h3>
                              <p className="text-[10px] text-zinc-500 mt-1">{section.data?.subtitle}</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                              {(section.data?.plans || []).map((plan: any, i: number) => (
                                <div key={i} className="p-5 bg-zinc-950 border border-white/5 rounded-2xl text-left flex flex-col justify-between relative overflow-hidden group/plan">
                                  <div className="space-y-3">
                                    <span className="text-[8px] uppercase font-bold tracking-widest text-zinc-500 block">{plan.name}</span>
                                    <div className="flex items-baseline gap-1">
                                      <span className="text-2xl font-black text-white">${plan.price}</span>
                                      <span className="text-[8px] text-zinc-500">/monthly</span>
                                    </div>
                                    <div className="h-px bg-white/5" />
                                    <div className="space-y-1.5 pt-2">
                                      {(plan.features || []).map((feat: string, idx: number) => (
                                        <div key={idx} className="text-[9px] text-zinc-400 flex items-center gap-1.5">
                                          <CheckCircle2 className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                                          <span>{feat}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  <button className="w-full mt-6 py-2 bg-white/5 hover:bg-orange-600 hover:text-white border border-white/10 rounded-xl text-[9px] font-bold text-zinc-300 transition-all">
                                    Get Started
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* DYNAMIC TEMPLATE: ARTIST TESTIMONIALS BLOCK */}
                        {section.type === 'testimonials' && (
                          <div className="space-y-6 max-w-lg mx-auto">
                            <div className="flex justify-center gap-1.5 mb-2">
                              {[1,2,3,4,5].map(i => <Star key={i} className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />)}
                            </div>
                            <div className="space-y-4">
                              {(section.data?.items || []).map((t: any, i: number) => (
                                <div key={i} className="text-center space-y-2">
                                  <p className="text-xs italic text-zinc-350 leading-relaxed font-serif">"{t.text}"</p>
                                  <div>
                                    <div className="font-bold text-[10px] text-white tracking-tight">{t.name}</div>
                                    <div className="text-[8px] text-orange-500 uppercase font-black">{t.role}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* DYNAMIC TEMPLATE: IMPACT COUNTERS STATS BLOCK */}
                        {section.type === 'stats' && (
                          <div className="space-y-6">
                            <div className="text-center">
                              <h3 className="text-lg font-bold">{section.data?.title}</h3>
                              {section.data?.subtitle && <p className="text-[10px] text-zinc-400">{section.data?.subtitle}</p>}
                            </div>
                            <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto py-4">
                              {(section.data?.items || []).map((stat: any, i: number) => (
                                <div key={i} className="text-center p-3.5 bg-zinc-950/60 rounded-xl border border-white/5">
                                  <h4 className="text-xl font-black text-orange-500 tracking-tight">{stat.value}</h4>
                                  <p className="text-[9px] font-bold text-zinc-300 mt-1 uppercase leading-none">{stat.label}</p>
                                  {stat.desc && <p className="text-[7px] text-zinc-500 truncate mt-1">{stat.desc}</p>}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* DYNAMIC TEMPLATE: STENCIL COMMUNITY ART GALLERY BLOCK */}
                        {section.type === 'gallery' && (
                          <div className="space-y-6">
                            <div className="text-center">
                              <h3 className="text-lg font-bold">{section.data?.title}</h3>
                              <p className="text-[9px] text-zinc-500">{section.data?.subtitle}</p>
                            </div>
                            <div className="grid grid-cols-3 gap-3.5">
                              {(section.data?.items || []).map((item: any, i: number) => (
                                <div key={i} className="group/gal aspect-square rounded-xl overflow-hidden bg-zinc-950 relative border border-white/5">
                                  {item.img && <img src={item.img} className="w-full h-full object-cover opacity-60 group-hover/gal:scale-105 transition duration-500" referrerPolicy="no-referrer" />}
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-2.5 text-left">
                                    <div className="text-[9px] font-black text-white truncate leading-none">{item.title}</div>
                                    <div className="text-[7px] text-orange-500 font-bold uppercase tracking-widest mt-1">Artist: {item.artist}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* DYNAMIC TEMPLATE: CONTACT DIRECT LINK BLOCK */}
                        {section.type === 'contact' && (
                          <div className="space-y-4 max-w-xs mx-auto py-4 text-center">
                            <h3 className="text-sm font-black text-white uppercase tracking-wider">{section.data?.title}</h3>
                            <p className="text-[9px] text-zinc-500 leading-normal">{section.data?.subtitle || 'Contact direct to find customizable team layout packages.'}</p>
                            <div className="flex flex-col gap-1.5 pt-2">
                              <div className="text-xs select-all font-mono py-1 px-2.5 bg-zinc-950 border border-white/5 rounded-lg text-orange-500">
                                {section.data?.email}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* DYNAMIC TEMPLATE: CALL TO ACTION BLOCK */}
                        {section.type === 'cta' && (
                          <div className="py-6 space-y-4 text-center max-w-md mx-auto">
                            <h3 className="text-lg md:text-xl font-bold leading-tight">{section.data?.title}</h3>
                            <p className="text-[9px] text-zinc-300">{section.data?.subtitle}</p>
                            <button className="px-6 py-2.5 bg-white text-black font-black text-[10px] rounded-full uppercase tracking-wider hover:bg-orange-50 hover:scale-105 shadow transition-all">
                              {section.data?.buttonText || 'Discover Stencil Now'}
                            </button>
                          </div>
                        )}

                        {/* DYNAMIC TEMPLATE: SCARCITY COUNTDOWN TIMER BLOCK */}
                        {section.type === 'countdown' && (
                          <div className="py-4 text-center space-y-3 bg-zinc-950/40 rounded-xl">
                            <span className="text-[8px] uppercase tracking-widest font-black text-orange-650 animate-pulse block">🔥 SEATS FILLING FAST</span>
                            <h3 className="text-xs font-bold text-white">{section.data?.title}</h3>
                            <div className="flex justify-center gap-2 items-center pt-1">
                              <div className="p-1 px-3 bg-red-650 text-white rounded font-mono text-[10px] font-bold">
                                {section.data?.targetTime || '1h 45m'}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* DYNAMIC TEMPLATE: TEXT NOTIFICATION BANNER BLOCK */}
                        {section.type === 'banner' && (
                          <div className="text-xs font-bold tracking-tight text-white/90 leading-relaxed py-1">
                            {section.data?.text}
                          </div>
                        )}

                      </div>
                    </div>
                  );
                })
              ) : activePage === 'stencil' ? (
                <div className="space-y-8 py-12 text-center px-4">
                  <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{content.stencilPage?.title || 'Stencil Creator'}</h1>
                  <p className="text-zinc-500 text-xs md:text-sm max-w-md mx-auto leading-relaxed">{content.stencilPage?.subtitle}</p>
                  <div className="aspect-[16/9] max-w-lg mx-auto bg-zinc-900 border border-dashed border-white/10 rounded-[2rem] flex flex-col items-center justify-center p-8 space-y-4">
                    <ImageIcon className="w-12 h-12 text-zinc-700" />
                    <div>
                      <div className="font-bold text-xs text-zinc-300">{content.stencilPage?.uploadLabel}</div>
                      <div className="text-[9px] text-zinc-500 uppercase tracking-widest mt-1">{content.stencilPage?.uploadSub || 'Drop raster file'}</div>
                    </div>
                  </div>
                </div>
              ) : activePage === 'upscaler' ? (
                <div className="space-y-8 py-12 text-center px-4">
                  <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{content.upscalerPage?.title || 'High Fidelity Upscaling'}</h1>
                  <p className="text-zinc-500 text-xs md:text-sm max-w-md mx-auto leading-relaxed">{content.upscalerPage?.subtitle}</p>
                  <div className="aspect-square max-w-xs mx-auto bg-zinc-900 border border-dashed border-white/10 rounded-[2rem] flex flex-col items-center justify-center p-8 space-y-4">
                    <Maximize2 className="w-10 h-10 text-zinc-700" />
                    <div className="font-bold text-xs text-zinc-300">{content.upscalerPage?.uploadLabel || 'Drop preview snapshot'}</div>
                    <button className="px-6 py-2 bg-orange-600 rounded-full font-bold text-[9px] uppercase tracking-wider">
                      {content.upscalerPage?.buttonText || 'Begin Scaling'}
                    </button>
                  </div>
                </div>
              ) : null}

            </div>
          </motion.div>
        </div>
      </div>

      {/* 3. DOCKABLE PARAMETER SIDEBAR CUSTOMIZER (RIGHT RAIL) */}
      <AnimatePresence>
        {activeSectionId && (
          <motion.div 
            initial={{ x: 380, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 380, opacity: 0 }}
            className="w-[380px] border-l border-white/5 bg-zinc-950/95 backdrop-blur-xl p-6 flex flex-col shrink-0 overflow-hidden relative"
          >
            {/* Header section name */}
            <div className="flex items-center justify-between pb-4 border-b border-white/5 relative z-10">
              <div className="truncate pr-4">
                <span className="text-[8px] uppercase tracking-widest font-black text-orange-500 block">PRO GUTENBERG EDITOR</span>
                <h3 className="text-sm font-bold text-zinc-100 truncate flex items-center gap-1.5 leading-none mt-1">
                  <Settings2 className="w-4 h-4 text-orange-600 flex-shrink-0" />
                  {activeSectionId === 'stencil' ? 'Generator Copy' : activeSectionId === 'upscaler' ? 'Upscale Copy' : activeSectionData ? activeSectionData.label : 'General Setup'}
                </h3>
              </div>
              <button 
                onClick={() => setActiveSectionId(null)}
                className="p-1.5 hover:bg-white/5 text-zinc-500 hover:text-zinc-300 rounded-lg transition"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* BLOCK CLONE TABS IN SIDEBAR (Content vs Design overrides) */}
            {activeSectionId !== 'stencil' && activeSectionId !== 'upscaler' && (
              <div className="grid grid-cols-3 gap-0.5 p-1 bg-zinc-900 border border-white/5 rounded-xl my-4 text-center relative z-10 shrink-0">
                {[
                  { id: 'content', icon: Type, label: 'Content' },
                  { id: 'design', icon: Paintbrush, label: 'Design' },
                  { id: 'advanced', icon: Sliders, label: 'Flow' }
                ].map(tb => (
                  <button
                    key={tb.id}
                    onClick={() => setSidebarTab(tb.id as any)}
                    className={`py-1.5 rounded-lg flex flex-col items-center gap-1 cursor-pointer transition-all ${
                      sidebarTab === tb.id 
                        ? 'bg-orange-600/10 text-orange-500 font-bold border border-orange-500/25' 
                        : 'text-zinc-500 hover:text-zinc-300 font-normal'
                    }`}
                  >
                    <tb.icon className="w-3.5 h-3.5" />
                    <span className="text-[8px] uppercase tracking-wide">{tb.label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Multi-tier tab config contents */}
            <div className="flex-grow overflow-y-auto space-y-6 pr-1.5 py-2 custom-scrollbar relative z-10">
              
              {/* COMPATIBILITY INTERMEDIATE ROUTE CHASSIS */}
              {activeSectionId === 'stencil' && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-zinc-500">Creator Title</label>
                    <input 
                      type="text"
                      value={content.stencilPage?.title || ''}
                      onChange={(e) => onChange({ ...content, stencilPage: { ...content.stencilPage, title: e.target.value } })}
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-orange-600"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-zinc-500">Subtitle Copy</label>
                    <textarea 
                      value={content.stencilPage?.subtitle || ''}
                      onChange={(e) => onChange({ ...content, stencilPage: { ...content.stencilPage, subtitle: e.target.value } })}
                      className="w-full h-24 bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-orange-600 resize-none font-sans"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-zinc-500">Upload Label</label>
                    <input 
                      type="text"
                      value={content.stencilPage?.uploadLabel || ''}
                      onChange={(e) => onChange({ ...content, stencilPage: { ...content.stencilPage, uploadLabel: e.target.value } })}
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-orange-600"
                    />
                  </div>
                </div>
              )}

              {activeSectionId === 'upscaler' && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-zinc-500">Upscaler Title</label>
                    <input 
                      type="text"
                      value={content.upscalerPage?.title || ''}
                      onChange={(e) => onChange({ ...content, upscalerPage: { ...content.upscalerPage, title: e.target.value } })}
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-orange-600 font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-zinc-500">Subtitle Copy</label>
                    <textarea 
                      value={content.upscalerPage?.subtitle || ''}
                      onChange={(e) => onChange({ ...content, upscalerPage: { ...content.upscalerPage, subtitle: e.target.value } })}
                      className="w-full h-20 bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-orange-600 resize-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-zinc-500">Action Button Text</label>
                    <input 
                      type="text"
                      value={content.upscalerPage?.buttonText || ''}
                      onChange={(e) => onChange({ ...content, upscalerPage: { ...content.upscalerPage, buttonText: e.target.value } })}
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-orange-600"
                    />
                  </div>
                </div>
              )}

              {/* CORE GUTENBERG STYLE PARAMETERS SECTOR BY ACTIVE TABS */}
              {activeSectionData && (
                <>
                  {/* TAB 1: SECTION COPYCONTENT WRITING AND CORE ELEMENTS */}
                  {sidebarTab === 'content' && (
                    <div className="space-y-5">
                      
                      {/* Hero fields editing */}
                      {activeSectionData.type === 'hero' && (
                        <>
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                              <label className="text-[10px] pb-1 font-bold text-zinc-500 uppercase">Interactive Large Title</label>
                              <button 
                                onClick={() => handleAiRewrite('heroTitle', content.heroTitle)}
                                disabled={isAiGenerating === 'heroTitle'}
                                className="text-[9px] flex items-center gap-1 text-orange-400 hover:text-orange-350 transition font-bold"
                              >
                                <Sparkles className="w-3 h-3" />
                                {isAiGenerating === 'heroTitle' ? 'Optimizing...' : 'Sells Better Copy'}
                              </button>
                            </div>
                            <input 
                              type="text"
                              value={content.heroTitle || ''}
                              onChange={(e) => onChange({ ...content, heroTitle: e.target.value })}
                              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-orange-500"
                            />
                          </div>
                          
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                              <label className="text-[10px] pb-1 font-bold text-zinc-500 uppercase">Punchy Sub-Headline</label>
                              <button 
                                onClick={() => handleAiRewrite('heroSubtitle', content.heroSubtitle)}
                                disabled={isAiGenerating === 'heroSubtitle'}
                                className="text-[9px] flex items-center gap-1 text-orange-400 hover:text-orange-350 transition font-bold"
                              >
                                <Sparkles className="w-3 h-3" />
                                {isAiGenerating === 'heroSubtitle' ? 'Optimizing...' : 'Optimize Copy'}
                              </button>
                            </div>
                            <textarea 
                              value={content.heroSubtitle || ''}
                              onChange={(e) => onChange({ ...content, heroSubtitle: e.target.value })}
                              className="w-full h-24 bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-orange-500 resize-none font-sans leading-relaxed"
                            />
                          </div>
                        </>
                      )}

                      {/* Info fields editing */}
                      {activeSectionData.type === 'info' && (
                        <>
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                              <label className="text-[10px] pb-1 font-bold text-zinc-500 uppercase">Information Sub-Title</label>
                              <button 
                                onClick={() => handleAiRewrite('infoTitle', content.infoTitle)}
                                disabled={isAiGenerating === 'infoTitle'}
                                className="text-[9px] flex items-center gap-1 text-orange-400 font-bold"
                              >
                                <Sparkles className="w-3 h-3" /> {isAiGenerating === 'infoTitle' ? 'Optimizing...' : 'AI Slogan'}
                              </button>
                            </div>
                            <input 
                              type="text"
                              value={content.infoTitle || ''}
                              onChange={(e) => onChange({ ...content, infoTitle: e.target.value })}
                              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-orange-500 font-bold"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                              <label className="text-[10px] pb-1 font-bold text-zinc-500 uppercase">Storytelling Description</label>
                              <button 
                                onClick={() => handleAiRewrite('infoDescription', content.infoDescription)}
                                disabled={isAiGenerating === 'infoDescription'}
                                className="text-[9px] flex items-center gap-1 text-orange-400 font-bold"
                              >
                                <Sparkles className="w-3 h-3" /> {isAiGenerating === 'infoDescription' ? 'Optimizing...' : 'AI Story'}
                              </button>
                            </div>
                            <textarea 
                              value={content.infoDescription || ''}
                              onChange={(e) => onChange({ ...content, infoDescription: e.target.value })}
                              className="w-full h-32 bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-orange-500 resize-none font-sans leading-relaxed"
                            />
                          </div>
                        </>
                      )}

                      {/* Card lists showcase styling */}
                      {activeSectionData.type === 'styles' && (
                        <div className="space-y-4">
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-zinc-500">Block Header</label>
                            <input 
                              type="text"
                              value={activeSectionData.data?.title || 'Tattoo Portfolio Styles'}
                              onChange={(e) => handleUpdateSectionData(activeSectionId, { title: e.target.value })}
                              className="w-full bg-zinc-900 border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none focus:border-orange-500"
                            />
                          </div>
                          <div className="space-y-3">
                            <label className="text-[10px] uppercase font-bold text-zinc-500 block">Manage Cards</label>
                            {(content.styles || []).map((style: any, i: number) => (
                              <div key={i} className="p-3 bg-zinc-900 border border-white/5 rounded-xl space-y-2 relative group-item">
                                <input 
                                  value={style.name || ''}
                                  onChange={(e) => {
                                    const newStyles = [...content.styles];
                                    newStyles[i].name = e.target.value;
                                    onChange({ ...content, styles: newStyles });
                                  }}
                                  className="w-full bg-transparent font-bold text-xs text-white outline-none"
                                />
                                <input 
                                  value={style.desc || ''}
                                  onChange={(e) => {
                                    const newStyles = [...content.styles];
                                    newStyles[i].desc = e.target.value;
                                    onChange({ ...content, styles: newStyles });
                                  }}
                                  className="w-full bg-transparent text-[10px] text-zinc-500 outline-none"
                                />
                                <input 
                                  value={style.img || ''}
                                  onChange={(e) => {
                                    const newStyles = [...content.styles];
                                    newStyles[i].img = e.target.value;
                                    onChange({ ...content, styles: newStyles });
                                  }}
                                  placeholder="Background Image url"
                                  className="w-full bg-transparent text-[9px] text-orange-500 truncate outline-none font-mono"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Feature propositions text content */}
                      {activeSectionData.type === 'features' && (
                        <div className="space-y-4">
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-zinc-500">Section Headline Title</label>
                            <input 
                              type="text"
                              value={activeSectionData.data?.title || ''}
                              onChange={(e) => handleUpdateSectionData(activeSectionId, { title: e.target.value })}
                              className="w-full bg-zinc-900 border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none"
                            />
                          </div>
                          <div className="space-y-3">
                            {(content.features || []).map((feat: any, i: number) => (
                              <div key={i} className="p-3 bg-zinc-900 border border-white/5 rounded-xl space-y-2">
                                <input 
                                  value={feat.title || ''}
                                  onChange={(e) => {
                                    const newFeatures = [...content.features];
                                    newFeatures[i].title = e.target.value;
                                    onChange({ ...content, features: newFeatures });
                                  }}
                                  className="w-full bg-transparent font-bold text-xs text-white outline-none"
                                />
                                <textarea 
                                  value={feat.desc || ''}
                                  onChange={(e) => {
                                    const newFeatures = [...content.features];
                                    newFeatures[i].desc = e.target.value;
                                    onChange({ ...content, features: newFeatures });
                                  }}
                                  className="w-full bg-transparent text-[10px] text-zinc-500 h-12 resize-none font-sans outline-none leading-relaxed"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* FAQ items configuration settings */}
                      {activeSectionData.type === 'faq' && (
                        <div className="space-y-4">
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-zinc-500">Accordion Title</label>
                            <input 
                              value={activeSectionData.data?.title || ''}
                              onChange={(e) => handleUpdateSectionData(activeSectionId, { title: e.target.value })}
                              className="w-full bg-zinc-900 border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none"
                            />
                          </div>
                          <div className="space-y-2.5">
                            {(activeSectionData.data?.items || []).map((item: any, i: number) => (
                              <div key={i} className="p-3 bg-zinc-900 border border-white/5 rounded-xl space-y-2">
                                <input 
                                  value={item.q || ''}
                                  onChange={(e) => {
                                    const newItems = [...activeSectionData.data.items];
                                    newItems[i].q = e.target.value;
                                    handleUpdateSectionData(activeSectionId, { items: newItems });
                                  }}
                                  placeholder="Question Text"
                                  className="w-full bg-transparent font-bold text-xs text-white outline-none"
                                />
                                <textarea 
                                  value={item.a || ''}
                                  onChange={(e) => {
                                    const newItems = [...activeSectionData.data.items];
                                    newItems[i].a = e.target.value;
                                    handleUpdateSectionData(activeSectionId, { items: newItems });
                                  }}
                                  placeholder="Answer Detail Description"
                                  className="w-full bg-transparent text-[10px] text-zinc-500 h-16 resize-none font-sans outline-none leading-relaxed"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Pricing list customized arrays */}
                      {activeSectionData.type === 'pricing' && (
                        <div className="space-y-4">
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-zinc-500">Block Headline</label>
                            <input 
                              value={activeSectionData.data?.title || ''}
                              onChange={(e) => handleUpdateSectionData(activeSectionId, { title: e.target.value })}
                              className="w-full bg-zinc-900 border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none"
                            />
                          </div>
                          <div className="space-y-3">
                            {(activeSectionData.data?.plans || []).map((plan: any, i: number) => (
                              <div key={i} className="p-4 bg-zinc-900 border border-white/5 rounded-xl space-y-2">
                                <div className="flex gap-2 items-center justify-between">
                                  <input 
                                    value={plan.name || ''}
                                    onChange={(e) => {
                                      const newPlans = [...activeSectionData.data.plans];
                                      newPlans[i].name = e.target.value;
                                      handleUpdateSectionData(activeSectionId, { plans: newPlans });
                                    }}
                                    className="font-black text-xs text-white bg-transparent outline-none"
                                  />
                                  <div className="flex items-center gap-1">
                                    <span className="text-zinc-500 text-xs">$</span>
                                    <input 
                                      value={plan.price || ''}
                                      onChange={(e) => {
                                        const newPlans = [...activeSectionData.data.plans];
                                        newPlans[i].price = e.target.value;
                                        handleUpdateSectionData(activeSectionId, { plans: newPlans });
                                      }}
                                      className="font-mono text-xs w-16 text-orange-500 bg-transparent text-right outline-none font-bold"
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Testimonial texts */}
                      {activeSectionData.type === 'testimonials' && (
                        <div className="space-y-4">
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-zinc-500">Block Slogan Title</label>
                            <input 
                              value={activeSectionData.data?.title || ''}
                              onChange={(e) => handleUpdateSectionData(activeSectionId, { title: e.target.value })}
                              className="w-full bg-zinc-900 border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none"
                            />
                          </div>
                          <div className="space-y-3">
                            {(activeSectionData.data?.items || []).map((t: any, i: number) => (
                              <div key={i} className="p-3 bg-zinc-900 border border-white/5 rounded-xl space-y-2">
                                <input 
                                  value={t.name || ''}
                                  onChange={(e) => {
                                    const newItems = [...activeSectionData.data.items];
                                    newItems[i].name = e.target.value;
                                    handleUpdateSectionData(activeSectionId, { items: newItems });
                                  }}
                                  placeholder="Artist Name"
                                  className="w-full bg-transparent text-xs text-white font-bold outline-none"
                                />
                                <input 
                                  value={t.role || ''}
                                  onChange={(e) => {
                                    const newItems = [...activeSectionData.data.items];
                                    newItems[i].role = e.target.value;
                                    handleUpdateSectionData(activeSectionId, { items: newItems });
                                  }}
                                  placeholder="Role"
                                  className="w-full bg-transparent text-[10px] text-orange-500 outline-none"
                                />
                                <textarea 
                                  value={t.text || ''}
                                  onChange={(e) => {
                                    const newItems = [...activeSectionData.data.items];
                                    newItems[i].text = e.target.value;
                                    handleUpdateSectionData(activeSectionId, { items: newItems });
                                  }}
                                  placeholder="Testimonial Quote text"
                                  className="w-full bg-transparent text-[10px] text-zinc-500 h-14 resize-none outline-none leading-relaxed"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Stats counter list */}
                      {activeSectionData.type === 'stats' && (
                        <div className="space-y-4">
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-zinc-500">Block title</label>
                            <input 
                              value={activeSectionData.data?.title || ''}
                              onChange={(e) => handleUpdateSectionData(activeSectionId, { title: e.target.value })}
                              className="w-full bg-zinc-900 border border-white/10 rounded-xl p-2.5 text-xs"
                            />
                          </div>
                          <div className="space-y-3">
                            {(activeSectionData.data?.items || []).map((stat: any, i: number) => (
                              <div key={i} className="p-3 bg-zinc-900 border border-white/5 rounded-xl space-y-2">
                                <input 
                                  value={stat.value || ''}
                                  onChange={(e) => {
                                    const newItems = [...activeSectionData.data.items];
                                    newItems[i].value = e.target.value;
                                    handleUpdateSectionData(activeSectionId, { items: newItems });
                                  }}
                                  className="font-black text-xs text-orange-500 bg-transparent outline-none"
                                />
                                <input 
                                  value={stat.label || ''}
                                  onChange={(e) => {
                                    const newItems = [...activeSectionData.data.items];
                                    newItems[i].label = e.target.value;
                                    handleUpdateSectionData(activeSectionId, { items: newItems });
                                  }}
                                  className="font-bold text-[10px] text-white bg-transparent outline-none"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Contact card direct mail override */}
                      {activeSectionData.type === 'contact' && (
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-zinc-500">Call-to-Action email</label>
                            <input 
                              value={activeSectionData.data?.email || ''}
                              onChange={(e) => handleUpdateSectionData(activeSectionId, { email: e.target.value })}
                              className="w-full bg-zinc-900 border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-zinc-500">Headline</label>
                            <input 
                              value={activeSectionData.data?.title || ''}
                              onChange={(e) => handleUpdateSectionData(activeSectionId, { title: e.target.value })}
                              className="w-full bg-zinc-900 border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none"
                            />
                          </div>
                        </div>
                      )}

                      {/* Call to action element customization */}
                      {activeSectionData.type === 'cta' && (
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-zinc-500">Title</label>
                            <input 
                              value={activeSectionData.data?.title || ''}
                              onChange={(e) => handleUpdateSectionData(activeSectionId, { title: e.target.value })}
                              className="w-full bg-zinc-900 border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-zinc-500">Button Display</label>
                            <input 
                              value={activeSectionData.data?.buttonText || ''}
                              onChange={(e) => handleUpdateSectionData(activeSectionId, { buttonText: e.target.value })}
                              className="w-full bg-zinc-900 border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none"
                            />
                          </div>
                        </div>
                      )}

                      {/* Countdown urgency scarcity bar */}
                      {activeSectionData.type === 'countdown' && (
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-zinc-500">Scarcity Message</label>
                            <input 
                              value={activeSectionData.data?.title || ''}
                              onChange={(e) => handleUpdateSectionData(activeSectionId, { title: e.target.value })}
                              className="w-full bg-zinc-900 border border-white/10 rounded-xl p-2.5 text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-zinc-500">Urgency timer text</label>
                            <input 
                              value={activeSectionData.data?.targetTime || ''}
                              onChange={(e) => handleUpdateSectionData(activeSectionId, { targetTime: e.target.value })}
                              className="w-full bg-zinc-900 border border-white/10 rounded-xl p-2.5 text-xs font-mono"
                            />
                          </div>
                        </div>
                      )}

                      {/* Generic text header widget banner */}
                      {activeSectionData.type === 'banner' && (
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-bold text-zinc-500">Announcement body copy</label>
                          <textarea 
                            value={activeSectionData.data?.text || ''}
                            onChange={(e) => handleUpdateSectionData(activeSectionId, { text: e.target.value })}
                            className="w-full h-24 bg-zinc-900 border border-white/10 rounded-xl p-3 text-xs text-white outline-none resize-none"
                          />
                        </div>
                      )}

                    </div>
                  )}

                  {/* TAB 2: BLOCK INTERACTIVE STYLING AND OVERLAYS */}
                  {sidebarTab === 'design' && (
                    <div className="space-y-6">
                      
                      {/* Flex/Align Selector */}
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-zinc-400 block">Text Alignment</label>
                        <div className="grid grid-cols-3 gap-1 bg-zinc-900 p-1 border border-white/5 rounded-xl">
                          {[
                            { value: 'left', icon: AlignLeft },
                            { value: 'center', icon: AlignCenter },
                            { value: 'right', icon: AlignRight }
                          ].map(align => (
                            <button
                              key={align.value}
                              onClick={() => handleUpdateSectionStyle(activeSectionId, { textAlign: align.value })}
                              className={`py-2 rounded-lg flex items-center justify-center transition-all ${
                                (activeSectionData.style?.textAlign || 'center') === align.value 
                                  ? 'bg-orange-600 text-white shadow' 
                                  : 'text-zinc-500 hover:text-white'
                              }`}
                            >
                              <align.icon className="w-4 h-4" />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Dimensions layout space card spacing */}
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-zinc-400 block">Vertical Paddings</label>
                        <div className="grid grid-cols-4 gap-1 bg-zinc-900 p-1 border border-white/5 rounded-xl text-center text-[10px] font-bold">
                          {[
                            { value: 'none', label: 'None' },
                            { value: 'sm', label: 'Slim' },
                            { value: 'md', label: 'Medium' },
                            { value: 'lg', label: 'Generous' }
                          ].map(pad => (
                            <button
                              key={pad.value}
                              onClick={() => handleUpdateSectionStyle(activeSectionId, { padding: pad.value })}
                              className={`py-1.5 rounded-lg transition-all ${
                                (activeSectionData.style?.padding || 'md') === pad.value 
                                  ? 'bg-orange-600 text-white font-bold' 
                                  : 'text-zinc-500 hover:text-white'
                              }`}
                            >
                              {pad.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Columns grid spacing if portfolio */}
                      {activeSectionData.type === 'styles' && (
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase font-bold text-zinc-400 block">Responsive Grid Columns</label>
                          <div className="grid grid-cols-3 gap-1 bg-zinc-900 p-1 border border-white/5 rounded-xl text-center text-xs font-mono font-bold">
                            {[2, 3, 4].map(cols => (
                              <button
                                key={cols}
                                onClick={() => handleUpdateSectionStyle(activeSectionId, { gridCols: cols })}
                                className={`py-1.5 rounded-lg transition-all ${
                                  (activeSectionData.style?.gridCols || 4) === cols 
                                    ? 'bg-orange-600 text-white shadow' 
                                    : 'text-zinc-500 hover:text-white'
                                }`}
                              >
                                {cols} cols
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Advanced Gutenberg background switcher layout */}
                      <div className="space-y-4 pt-3 border-t border-white/5">
                        <label className="text-[10px] uppercase font-bold text-zinc-400 block">Block Background Style</label>
                        
                        <div className="grid grid-cols-3 gap-1 bg-zinc-900 p-1 border border-white/5 rounded-xl text-center text-[9px] uppercase font-bold">
                          {[
                            { value: 'solid', label: 'Solid' },
                            { value: 'gradient', label: 'Gradient' },
                            { value: 'image', label: 'Image URL' }
                          ].map(bg => (
                            <button
                              key={bg.value}
                              onClick={() => handleUpdateSectionStyle(activeSectionId, { bgStyle: bg.value })}
                              className={`py-1.5 rounded-lg transition-all ${
                                (activeSectionData.style?.bgStyle || 'solid') === bg.value 
                                  ? 'bg-orange-600/15 text-orange-500 font-bold border border-orange-500/25' 
                                  : 'text-zinc-500 hover:text-white'
                              }`}
                            >
                              {bg.label}
                            </button>
                          ))}
                        </div>

                        {/* Rendering fields based on choice */}
                        {(activeSectionData.style?.bgStyle || 'solid') === 'solid' && (
                          <div className="space-y-1.5">
                            <span className="text-[9px] uppercase font-bold text-zinc-500">Pick Background Hex Color</span>
                            <div className="flex gap-2 items-center bg-zinc-900 p-2 rounded-xl border border-white/10">
                              <input 
                                type="color" 
                                value={activeSectionData.style?.bgColor || '#000000'}
                                onChange={(e) => handleUpdateSectionStyle(activeSectionId, { bgColor: e.target.value })}
                                className="w-8 h-8 rounded-lg bg-transparent cursor-pointer border-none"
                              />
                              <input 
                                type="text"
                                value={activeSectionData.style?.bgColor || '#000000'}
                                onChange={(e) => handleUpdateSectionStyle(activeSectionId, { bgColor: e.target.value })}
                                className="w-24 bg-transparent outline-none font-mono text-xs text-white uppercase"
                              />
                            </div>
                          </div>
                        )}

                        {(activeSectionData.style?.bgStyle || 'solid') === 'gradient' && (
                          <div className="space-y-2">
                            <span className="text-[9px] uppercase font-bold text-zinc-500 block">Gradient Preset Schemes</span>
                            <div className="grid grid-cols-2 gap-1.5">
                              {[
                                { key: 'linear-gradient(to right, #09090b, #181c24)', label: 'Cosmic Shadows' },
                                { key: 'linear-gradient(to right, #ea580c, #9a3412)', label: 'Molten Fire' },
                                { key: 'linear-gradient(to right, #ec4899, #8b5cf6)', label: 'Vapor Wave' },
                                { key: 'linear-gradient(to right, #06b6d4, #0f172a)', label: 'Aqua Neon' },
                                { key: 'linear-gradient(to right, #10b981, #065f46)', label: 'Jade Ink' },
                                { key: 'linear-gradient(to right, #ca8a04, #451a03)', label: 'Imperial Gold' }
                              ].map(gr => (
                                <button
                                  key={gr.key}
                                  onClick={() => handleUpdateSectionStyle(activeSectionId, { bgGradient: gr.key })}
                                  className={`p-2.5 rounded-lg text-[9px] font-bold text-white transition-all text-left truncate shadow ${
                                    activeSectionData.style?.bgGradient === gr.key 
                                      ? 'ring-2 ring-orange-500 saturate-150 scale-95' 
                                      : 'opacity-80 hover:opacity-100'
                                  }`}
                                  style={{ backgroundImage: gr.key }}
                                >
                                  {gr.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {(activeSectionData.style?.bgStyle || 'solid') === 'image' && (
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <span className="text-[9px] uppercase font-bold text-zinc-500">Image Asset URL</span>
                              <input 
                                type="text"
                                value={activeSectionData.style?.bgImage || ''}
                                onChange={(e) => handleUpdateSectionStyle(activeSectionId, { bgImage: e.target.value })}
                                placeholder="https://images.unsplash.com/photo-..."
                                className="w-full bg-zinc-900 border border-white/10 rounded-xl p-2.5 text-xs text-white"
                              />
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between items-center text-[9px] uppercase font-bold text-zinc-500">
                                <span>Dark Overlay Opacity</span>
                                <span className="font-mono text-orange-500">{activeSectionData.style?.overlayOpacity ?? 70}%</span>
                              </div>
                              <input 
                                type="range" min="0" max="100" step="5"
                                value={activeSectionData.style?.overlayOpacity ?? 70}
                                onChange={(e) => handleUpdateSectionStyle(activeSectionId, { overlayOpacity: parseInt(e.target.value) })}
                                className="w-full accent-orange-500 cursor-pointer"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Foreground color parameters */}
                      <div className="space-y-4 pt-3 border-t border-white/5">
                        <label className="text-[10px] uppercase font-bold text-zinc-400 block">Foreground Theme Palette</label>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <span className="text-[8px] uppercase tracking-wider font-extrabold text-zinc-500 block">Primary Text</span>
                            <input 
                              type="color" 
                              value={activeSectionData.style?.textColor || '#ffffff'}
                              onChange={(e) => handleUpdateSectionStyle(activeSectionId, { textColor: e.target.value })}
                              className="w-full h-8 bg-transparent rounded-lg cursor-pointer border-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <span className="text-[8px] uppercase tracking-wider font-extrabold text-zinc-500 block">Accent Buttons</span>
                            <input 
                              type="color" 
                              value={activeSectionData.style?.accentColor || '#ea580c'}
                              onChange={(e) => handleUpdateSectionStyle(activeSectionId, { accentColor: e.target.value })}
                              className="w-full h-8 bg-transparent rounded-lg cursor-pointer border-none"
                            />
                          </div>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* TAB 3: SCHEDULING INTERACTION CONTROL LAYOUT */}
                  {sidebarTab === 'advanced' && (
                    <div className="space-y-6">
                      <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-4 space-y-4">
                        <span className="text-[8px] uppercase tracking-widest font-black text-orange-500 block">Actions</span>
                        
                        <button
                          onClick={() => cloneSection(activeSectionId)}
                          className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-805 border border-white/10 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 transition"
                        >
                          <Copy className="w-4 h-4 text-orange-500" />
                          Clone Entire Block
                        </button>

                        <button
                          onClick={() => {
                            if (window.confirm("Confirm deletion of this block?")) {
                              onChange({ ...content, layout: content.layout.filter((s: any) => s.id !== activeSectionId) });
                              setActiveSectionId(null);
                            }
                          }}
                          className="w-full py-2.5 bg-red-650/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-600/20 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete Block
                        </button>
                      </div>

                      <div className="space-y-4 pt-3">
                        <span className="text-[10px] uppercase font-bold text-zinc-400 block">Scroll Anchor (ID Attribute)</span>
                        <div className="space-y-1.5">
                          <input 
                            type="text"
                            value={activeSectionData.id}
                            disabled
                            className="w-full bg-zinc-900/40 border border-white/5 text-zinc-500 rounded-xl p-2.5 text-xs font-mono"
                          />
                          <span className="text-[8px] text-zinc-650 leading-normal block">This ID allows anchoring links directly to this block. Stencil systems manage database references using timestamps.</span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. CHOOSE ACCORDION SCHEMA TEMPLATE MODAL */}
      {showAddSection && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6 md:p-12">
           <motion.div 
             initial={{ scale: 0.95, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             className="max-w-3xl w-full bg-zinc-950 border border-white/10 rounded-[2.5rem] p-8 md:p-10 space-y-6 relative overflow-hidden"
           >
             <div className="flex justify-between items-center pb-4 border-b border-white/5">
               <div>
                 <h2 className="text-2xl font-black text-white italic tracking-tight uppercase flex items-center gap-2">
                   <Palette className="w-6 h-6 text-orange-500" />
                   Insert Block Element
                 </h2>
                 <p className="text-zinc-500 text-[10px] uppercase tracking-widest mt-1">Gutenberg layout builder template catalog</p>
               </div>
               <button 
                 onClick={() => setShowAddSection(false)} 
                 className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-all"
               >
                 <Trash2 className="w-5 h-5 text-zinc-500" />
               </button>
             </div>
             
             <div className="grid grid-cols-2 md:grid-cols-4 gap-3 overflow-y-auto max-h-[50vh] pr-2 custom-scrollbar">
                {[
                  { label: "FAQ Area", id: 'faq', icon: Globe, desc: 'Interactive questions accordion' },
                  { label: "Pricing Tables", id: 'pricing', icon: Columns, desc: 'Enterprise rate tables' },
                  { label: "Feedback/Reviews", id: 'testimonials', icon: Star, desc: 'Slide artist testimonials' },
                  { label: "Quick Contact", id: 'contact', icon: Phone, desc: 'Contact parameters & keys' },
                  { label: "Call Choice CTA", id: 'cta', icon: Zap, desc: 'Urgent sign up button' },
                  { label: "Numbers Stat", id: 'stats', icon: Columns, desc: 'Counter charts benchmarks' },
                  { label: "Community Art", id: 'gallery', icon: ImageIcon, desc: 'Fidelity outline screenshots' },
                  { label: "Countdown Urgency", id: 'countdown', icon: Clock, desc: 'Scarce timeline offer bar' },
                  { label: "Alert Ribbon", id: 'banner', icon: AlertCircle, desc: 'Simple horizontal text stream' }
                ].map(tmpl => (
                  <button 
                    key={tmpl.id}
                    onClick={() => handleAddSection(tmpl.id)}
                    className="p-4 bg-zinc-900/60 border border-white/5 rounded-2xl hover:border-orange-500 hover:bg-orange-600/5 transition-all text-left relative group flex flex-col gap-3 h-28"
                  >
                    <div className="w-8 h-8 rounded-lg bg-zinc-950 flex items-center justify-center text-zinc-500 group-hover:text-orange-500 transition-colors">
                      <tmpl.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-extrabold text-[11px] text-white block truncate leading-none">{tmpl.label}</span>
                      <span className="text-[8px] text-zinc-500 block leading-tight mt-1">{tmpl.desc}</span>
                    </div>
                  </button>
                ))}
             </div>
           </motion.div>
        </div>
      )}

    </div>
  );
};

export default SiteBuilder;
