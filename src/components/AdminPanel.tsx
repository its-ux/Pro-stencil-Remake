import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Save, Layout, Image, Type, Plus, Trash2, ArrowLeft, 
  Settings, Users, Zap, BarChart3, Shield, ShieldAlert, 
  UserMinus, UserCheck, FileText, Search, Clock,
  MessageSquare, ScrollText, Sparkles, Terminal, Cpu,
  HardDrive, Server, Activity, Database, RefreshCw, Download,
  Lock, CheckCircle2, AlertTriangle, Key, ExternalLink, Code2, Sliders,
  Home, Folder, Wrench, Menu, ChevronDown, ChevronRight, HelpCircle,
  Eye, Check, X, FileCode, Layers, Radio, Monitor, User
} from 'lucide-react';
import { 
  db, auth, handleFirestoreError, OperationType, getStats, 
  getAllUsers, updateUser, deleteUser, getAllStencils, 
  deleteUserStencil, getAllLogs, getAdminMessages,
  deleteAdminMessage, createManualUser
} from '../firebase';
import { Language } from '../../types';
import { collection, getDocs, setDoc, doc, getDoc } from 'firebase/firestore';
import { getBaseStencilStyles } from '../constants/stencilStyles';
import SiteBuilder from './SiteBuilder';

interface AdminPanelProps {
  onClose: () => void;
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
    { title: "Hyper-Realism", desc: "Optimized for portraits and complex textures that traditional software misses." },
    { title: "Artist Insights", desc: "Get AI-driven tips on needle selection and ink mixing for every design." },
    { title: "Cloud History", desc: "Access your stencil library from any device, anywhere in the world." }
  ],
  layout: [
    { id: 'hero', visible: true, label: 'Hero Section' },
    { id: 'info', visible: true, label: 'Info Section' },
    { id: 'styles', visible: true, label: 'Styles Section' },
    { id: 'features', visible: true, label: 'Features Section' }
  ],
  theme: {
    primaryColor: '#2271b1',
    accentColor: '#135e96',
    fontFamily: 'Inter',
    borderRadius: '4px',
    glassOpacity: '0.9'
  },
  plugins: [
    { 
      id: 'demo_access', 
      enabled: true, 
      title: "Demo / Gast-Zugang (Plugin)", 
      description: "Erlaubt Besuchern das Testen der Anwendung im Demo-Modus als Gast ohne Registrierung.",
      config: { guestQuota: 10, guestNotice: "Willkommen im Gast-Demo-Modus." } 
    },
    { id: 'contact', enabled: false, title: "Contact Form", config: { email: "" } },
    { id: 'custom_html', enabled: false, title: "Custom HTML Widget", config: { html: "" } },
    { id: 'messaging', enabled: true, title: "User Messaging", config: {} },
    { id: 'announcement', enabled: false, title: "Announcement Bar", config: { text: "Welcome to Pro Stencils Art!", url: "" } },
    { id: 'social_links', enabled: false, title: "Social Links", config: { instagram: "", twitter: "", facebook: "" } },
    { id: 'maintenance', enabled: false, title: "Maintenance Mode", config: { text: "We are currently upgrading the site. Check back soon!" } }
  ],
  stencilStyles: [] as any[],
  adminNotes: "",
  legal: {
    impressum: "# Impressum\n\nAngaben gemäß § 5 TMG:\n\nMax Mustermann\nMusterstraße 1\n12345 Musterstadt\n\nKontakt:\nE-Mail: info@muster.de\n\nVertreten durch:\nMax Mustermann",
    privacyPolicy: "# Datenschutzerklärung\n\nWir nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung."
  },
  stencilPage: {
    title: "Stencil Generator",
    subtitle: "Pro-grade AI conversion for elite tattoo artists. Enhanced realism & precision.",
    uploadLabel: "Upload Your Image",
    uploadSub: "Drag and drop your image here, or click to browse",
    buttonText: "Generate Stencil"
  },
  upscalerPage: {
    title: "AI Upscaler",
    subtitle: "Enhance and sharpen blurry or low-res reference photos using advanced neural networks.",
    uploadLabel: "Drop image to upscale",
    buttonText: "Upscale Image"
  }
};

type Tab = 'stats' | 'users' | 'logs' | 'prompts' | 'code' | 'plugins' | 'sitebuilder' | 'stencils' | 'messages' | 'notes' | 'legal';

const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [stats, setStats] = useState({ totalUsers: 0, totalStencils: 0 });
  const [users, setUsers] = useState<any[]>([]);
  const [stencils, setStencils] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('stats');
  const [searchTerm, setSearchTerm] = useState('');
  const [appCode, setAppCode] = useState('');
  const [activeFile, setActiveFile] = useState('App.tsx');
  const [fileList, setFileList] = useState<string[]>(['App.tsx']);
  const [isCodeLoading, setIsCodeLoading] = useState(false);
  const [isCodeSaving, setIsCodeSaving] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserDisplayName, setNewUserDisplayName] = useState('');
  const [newUserRole, setNewUserRole] = useState('user');
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success'|'error'} | null>(null);
  const [logFilter, setLogFilter] = useState<string>('all');
  const [systemUptime, setSystemUptime] = useState<string>('00:00:00');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [noticeDismissed, setNoticeDismissed] = useState(false);

  // Uptime timer simulation
  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const diff = Math.floor((Date.now() - startTime) / 1000);
      const hours = String(Math.floor(diff / 3600)).padStart(2, '0');
      const minutes = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
      const seconds = String(diff % 60).padStart(2, '0');
      setSystemUptime(`${hours}:${minutes}:${seconds}`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchFileList = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/fs/list', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.files && data.files.length > 0) {
          setFileList(data.files);
        }
      }
    } catch (err) {
      console.error("Failed to fetch file list", err);
    }
  };

  const fetchAppCode = async (filePath: string = activeFile) => {
    setIsCodeLoading(true);
    setAppCode(`// Loading ${filePath} via secure API...`);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`/api/fs/read?path=${encodeURIComponent(filePath)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const data = await res.json();
      setAppCode(data.content || data.code || '');
    } catch (err: any) {
      console.error("Failed to fetch app code", err);
      if (err.message?.includes("ENOENT")) {
        setAppCode(`// ERROR: File not found.\n// Path: ${filePath}`);
      } else {
        setAppCode(`// ERROR: Failed to load source code.\n// ${err.message}`);
      }
      showToast(`Fetch error: ${err.message}`, 'error');
    } finally {
      setIsCodeLoading(false);
    }
  };

  const saveAppCode = async () => {
    setIsCodeSaving(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/fs/write', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ path: activeFile, content: appCode })
      });
      if (res.ok) {
        showToast(`${activeFile} saved successfully! Changes will reflect after reload.`);
      } else {
        const data = await res.json();
        showToast(`Failed to save: ${data.error || res.statusText}`, 'error');
      }
    } catch (err: any) {
      console.error("Failed to save app code", err);
      showToast(`Network or Server error.`, 'error');
    } finally {
      setIsCodeSaving(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'code') {
      fetchFileList();
      fetchAppCode(activeFile);
    }
    if (activeTab === 'logs') {
      const fetchLogs = async () => {
        const logsData = await getAllLogs();
        setLogs(logsData);
      };
      fetchLogs();
    }
    if (activeTab === 'messages') {
      const fetchMessages = async () => {
        const msgs = await getAdminMessages();
        setMessages(msgs);
      };
      fetchMessages();
    }
  }, [activeTab]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const docRef = doc(db, 'site', 'content');
      const [docSnap, statsData, usersData, stencilsData] = await Promise.all([
        getDoc(docRef),
        getStats(),
        getAllUsers(),
        getAllStencils()
      ]);
      
      if (docSnap.exists()) {
        const data = docSnap.data();

        const migratedStyles = (data.styles || []).map((s: any) => {
          if (s.img && s.img.includes("photo-1550537687-c91072c4792d")) {
            return { ...s, img: "https://images.unsplash.com/photo-1543244128-30d70d41e2a9?q=80&w=1167&auto=format&fit=crop" };
          }
          return s;
        });

        const baseStyles = getBaseStencilStyles('en');
        const savedStyles = data.stencilStyles || [];
        
        const mergedStencilStyles = baseStyles.map(bs => {
          const saved = savedStyles.find((s: any) => s.id === bs.id);
          if (!saved) return bs;
          return {
            ...bs,
            id: saved.id || bs.id,
            name: saved.name && saved.name.trim() !== "" ? saved.name : bs.name,
            description: saved.description && saved.description.trim() !== "" ? saved.description : bs.description,
            promptModifier: saved.promptModifier && saved.promptModifier.trim() !== "" ? saved.promptModifier : bs.promptModifier
          };
        });

        savedStyles.forEach((ss: any) => {
          if (!baseStyles.find(bs => bs.id === ss.id)) {
            mergedStencilStyles.push(ss);
          }
        });

        setContent({
          ...DEFAULT_CONTENT,
          ...data,
          styles: migratedStyles.length > 0 ? migratedStyles : (data.styles || DEFAULT_CONTENT.styles),
          stencilStyles: mergedStencilStyles,
          theme: {
            ...DEFAULT_CONTENT.theme,
            ...(data.theme || {})
          },
          plugins: DEFAULT_CONTENT.plugins.map((p) => {
            const savedPlugin = (data.plugins || []).find((sp: any) => sp.id === p.id);
            return {
              ...p,
              ...savedPlugin,
              config: {
                ...p.config,
                ...(savedPlugin?.config || {})
              }
            };
          }),
          adminNotes: data.adminNotes || ""
        });
      }
      setStats(statsData);
      setUsers(usersData);
      setStencils(stencilsData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'site', 'content'), content);
      showToast("Admin options & settings saved!");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'site/content');
      showToast("Error saving content.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleUserStatus = async (user: any) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    await updateUser(user.id, { status: newStatus });
    setUsers(users.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
  };

  const handleUpdateQuota = async (uid: string, quota: number) => {
    await updateUser(uid, { quota });
    setUsers(users.map(u => u.id === uid ? { ...u, quota } : u));
  };

  const handleUpdateCount = async (uid: string, stencilCount: number) => {
    await updateUser(uid, { stencilCount });
    setUsers(users.map(u => u.id === uid ? { ...u, stencilCount } : u));
  };

  const handleDeleteUser = async (uid: string) => {
    const targetUser = users.find(u => u.id === uid);
    const label = targetUser?.displayName || targetUser?.email || uid;
    if (window.confirm(`Möchtest du den Benutzer "${label}" wirklich dauerhaft löschen?`)) {
      try {
        await deleteUser(uid);
        setUsers(users.filter(u => u.id !== uid));
        showToast(`Benutzer "${label}" wurde erfolgreich gelöscht.`);
      } catch (err: any) {
        showToast(`Fehler beim Löschen des Benutzers: ${err.message}`, 'error');
      }
    }
  };

  const handleDeleteStencil = async (userId: string, stencilId: string) => {
    if (window.confirm("Permanently delete this stencil?")) {
      await deleteUserStencil(userId, stencilId);
      setStencils(stencils.filter(s => s.id !== stencilId));
      showToast("Stencil wurde gelöscht.");
    }
  };

  const handleDownloadStencil = (stencil: any) => {
    const imageUrl = stencil.stencilImage || stencil.imageUrl;
    if (!imageUrl) {
      showToast("Kein Stencil-Bild zum Herunterladen vorhanden.", "error");
      return;
    }
    try {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `stencil-${stencil.id || Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("Stencil-Download gestartet!");
    } catch (err) {
      console.error("Download error:", err);
      showToast("Fehler beim Herunterladen des Stencils.", "error");
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail || !newUserDisplayName) return;
    setIsCreatingUser(true);
    try {
      await createManualUser(newUserEmail, newUserDisplayName, newUserRole);
      showToast("User account created successfully!");
      setNewUserEmail('');
      setNewUserDisplayName('');
      fetchData();
    } catch (err: any) {
      showToast(`Error creating user: ${err.message}`, 'error');
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (window.confirm("Delete support message?")) {
      await deleteAdminMessage(id);
      setMessages(messages.filter(m => m.id !== id));
    }
  };

  const handleExportSystemAudit = () => {
    const dataStr = JSON.stringify({
      timestamp: new Date().toISOString(),
      stats,
      userCount: users.length,
      stencilsCount: stencils.length,
      logs,
      systemUptime
    }, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-audit-${Date.now()}.json`;
    a.click();
    showToast("System audit exported as JSON");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f0f0f1] flex flex-col items-center justify-center font-sans text-[#2c3338]">
        <div className="w-10 h-10 border-4 border-[#2271b1]/30 border-t-[#2271b1] rounded-full animate-spin mb-3" />
        <div className="flex items-center gap-2 text-sm text-[#1d2327] font-semibold">
          <span>Loading Admin Control Center...</span>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredStencils = stencils.filter(s => 
    s.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.prompt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLogs = logs.filter(log => {
    if (logFilter === 'all') return true;
    if (logFilter === 'auth') return log.category === 'auth';
    if (logFilter === 'error') return log.category === 'error';
    if (logFilter === 'system') return log.category !== 'auth' && log.category !== 'error';
    return true;
  });

  // WordPress Admin Menu Items
  const menuItems: { id: Tab; label: string; icon: any; badge?: number }[] = [
    { id: 'stats', label: 'Dashboard', icon: Home },
    { id: 'stencils', label: 'Stencils', icon: Image, badge: stencils.length },
    { id: 'users', label: 'Users', icon: Users, badge: users.length },
    { id: 'messages', label: 'Comments / Queue', icon: MessageSquare, badge: messages.length },
    { id: 'sitebuilder', label: 'Pages / Site Builder', icon: Layout },
    { id: 'plugins', label: 'Plugins', icon: Zap },
    { id: 'code', label: 'Theme File Editor', icon: Code2 },
    { id: 'logs', label: 'Audit Logs', icon: ScrollText },
    { id: 'prompts', label: 'AI Prompt Settings', icon: Sliders },
    { id: 'notes', label: 'Admin Scratchpad', icon: Clock },
    { id: 'legal', label: 'Legal Policies', icon: FileText },
  ];

  const getTabTitle = (tab: Tab) => {
    switch (tab) {
      case 'stats': return 'Dashboard';
      case 'stencils': return 'Stencils Library';
      case 'users': return 'Users Directory';
      case 'messages': return 'Support Messages Queue';
      case 'sitebuilder': return 'Site Builder & Pages';
      case 'plugins': return 'Installed Plugins';
      case 'code': return 'Theme File Editor';
      case 'logs': return 'System Audit Logs';
      case 'prompts': return 'AI Prompt Engine Settings';
      case 'notes': return 'Admin Scratchpad & Notes';
      case 'legal': return 'Privacy & Impressum Policies';
      default: return 'Dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f0f1] text-[#2c3338] font-sans antialiased flex flex-col selection:bg-[#2271b1] selection:text-white">
      
      {/* TOP ADMIN BAR */}
      <header className="bg-[#1d2327] text-[#f0f0f1] h-8 px-2 flex items-center justify-between text-xs font-normal border-b border-[#2c3338] sticky top-0 z-50 select-none">
        
        {/* Left Side Bar Controls */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          
          {/* Logo / Shield Icon */}
          <button 
            onClick={onClose}
            className="px-2 py-1 hover:bg-[#2c3338] text-[#a7aaad] hover:text-[#72aee6] transition-colors flex items-center gap-1.5 font-bold"
            title="Exit to Pro Stencils Art"
          >
            <div className="w-5 h-5 rounded bg-[#2271b1] text-white flex items-center justify-center font-sans text-[11px] font-black leading-none shadow-sm">
              <Shield className="w-3.5 h-3.5" />
            </div>
          </button>

          {/* Site Name & Visit Site */}
          <button 
            onClick={onClose}
            className="px-2 py-1 hover:bg-[#2c3338] text-[#f0f0f1] hover:text-[#72aee6] transition-colors flex items-center gap-1.5 font-semibold"
          >
            <Home className="w-3.5 h-3.5 text-[#a7aaad]" />
            <span className="hidden sm:inline">Pro Stencils Art</span>
            <ExternalLink className="w-3 h-3 text-[#a7aaad]" />
          </button>

          <div className="h-3 w-px bg-[#3c434a] hidden sm:block" />

          {/* Updates Badge */}
          <button 
            onClick={() => setActiveTab('stats')}
            className="px-2 py-1 hover:bg-[#2c3338] text-[#a7aaad] hover:text-[#72aee6] transition-colors flex items-center gap-1 hidden md:flex"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>0</span>
          </button>

          {/* Comments Badge */}
          <button 
            onClick={() => setActiveTab('messages')}
            className="px-2 py-1 hover:bg-[#2c3338] text-[#a7aaad] hover:text-[#72aee6] transition-colors flex items-center gap-1.5 hidden md:flex"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="bg-[#2271b1] text-white px-1.5 py-0.2 text-[10px] rounded-full font-bold">
              {messages.length}
            </span>
          </button>

          {/* + New Button */}
          <div className="relative group hidden sm:block">
            <button className="px-2 py-1 hover:bg-[#2c3338] text-[#a7aaad] hover:text-[#72aee6] transition-colors flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" />
              <span>New</span>
            </button>
            <div className="absolute left-0 top-full hidden group-hover:block bg-[#2c3338] text-[#f0f0f1] shadow-lg py-1 min-w-[140px] border border-[#3c434a] z-50">
              <button onClick={() => { setActiveTab('users'); }} className="w-full text-left px-3 py-1 hover:bg-[#2271b1] hover:text-white text-xs">User Account</button>
              <button onClick={() => { setActiveTab('stencils'); }} className="w-full text-left px-3 py-1 hover:bg-[#2271b1] hover:text-white text-xs">Stencil Design</button>
              <button onClick={() => { setActiveTab('prompts'); }} className="w-full text-left px-3 py-1 hover:bg-[#2271b1] hover:text-white text-xs">AI Prompt Style</button>
            </div>
          </div>
        </div>

        {/* Right Side Bar Controls */}
        <div className="flex items-center gap-2">
          
          {/* Commit Changes (Save) */}
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[#2271b1] hover:bg-[#135e96] disabled:opacity-50 text-white px-2.5 py-0.5 rounded-[3px] text-[11px] font-medium transition-colors flex items-center gap-1"
          >
            <Save className="w-3 h-3" />
            <span>{isSaving ? "Saving..." : "Save Changes"}</span>
          </button>

          <div className="h-3 w-px bg-[#3c434a]" />

          {/* User Profile dropdown */}
          <div className="flex items-center gap-2 px-2 py-1 hover:bg-[#2c3338] cursor-pointer text-[#f0f0f1]">
            <span className="text-xs text-[#a7aaad] hidden sm:inline">Howdy,</span>
            <span className="text-xs font-semibold">{auth.currentUser?.displayName || 'admin'}</span>
            {auth.currentUser?.photoURL ? (
              <img src={auth.currentUser.photoURL} className="w-5 h-5 rounded-full object-cover border border-[#a7aaad]" alt="" />
            ) : (
              <div className="w-5 h-5 rounded-full bg-[#2271b1] text-white flex items-center justify-center text-[10px] font-bold">
                A
              </div>
            )}
          </div>

          <button 
            onClick={onClose}
            className="px-2 py-0.5 bg-[#d63638] hover:bg-[#b32d2e] text-white rounded-[3px] text-[11px] font-medium transition-colors flex items-center gap-1"
            title="Exit Admin Panel"
          >
            <span>Log Out</span>
          </button>
        </div>
      </header>

      {/* BODY WITH LEFT SIDEBAR + MAIN CONTENT */}
      <div className="flex-1 flex overflow-hidden">

        {/* WORDPRESS LEFT SIDEBAR MENU */}
        <aside className={`${sidebarCollapsed ? 'w-12' : 'w-48'} bg-[#1d2327] border-r border-[#2c3338] transition-all duration-200 shrink-0 flex flex-col justify-between select-none`}>
          
          <nav className="py-2 space-y-0.5">
            {menuItems.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors relative ${
                    isActive 
                      ? 'bg-[#2271b1] text-white font-semibold' 
                      : 'text-[#f0f0f1] hover:bg-[#2c3338] hover:text-[#72aee6]'
                  }`}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#a7aaad]'}`} />
                    {!sidebarCollapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </div>

                  {!sidebarCollapsed && item.badge !== undefined && item.badge > 0 && (
                    <span className={`px-1.5 py-0.2 text-[10px] font-bold rounded-full ${
                      isActive ? 'bg-white text-[#2271b1]' : 'bg-[#d63638] text-white'
                    }`}>
                      {item.badge}
                    </span>
                  )}

                  {isActive && !sidebarCollapsed && (
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-[#72aee6]" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Collapse Menu Toggle Button */}
          <div className="p-2 border-t border-[#2c3338]">
            <button 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-full flex items-center gap-2 text-[#a7aaad] hover:text-[#72aee6] text-xs px-2 py-1.5 hover:bg-[#2c3338] rounded-[3px] transition-colors"
            >
              <Menu className="w-4 h-4 shrink-0" />
              {!sidebarCollapsed && <span>Collapse menu</span>}
            </button>
          </div>
        </aside>

        {/* MAIN WORDPRESS CONTENT AREA */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5 bg-[#f0f0f1] text-[#2c3338]">

          {/* Toast Notification */}
          <AnimatePresence>
            {toast && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`p-3 rounded-[3px] border-l-4 text-xs font-sans shadow-sm flex items-center justify-between ${
                  toast.type === 'error' 
                    ? 'bg-white text-[#d63638] border-[#d63638]' 
                    : 'bg-white text-[#00a32a] border-[#00a32a]'
                }`}
              >
                <div className="flex items-center gap-2">
                  {toast.type === 'error' ? <ShieldAlert className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span className="font-medium">{toast.message}</span>
                </div>
                <button onClick={() => setToast(null)} className="text-[#a7aaad] hover:text-[#1d2327]">
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* System Notice Banner */}
          {!noticeDismissed && (
            <div className="bg-white border-l-4 border-[#2271b1] p-3 shadow-sm border border-[#c3c4c7] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#1d2327]">Pro Stencils AI Control Center:</span>
                <span className="text-[#50575e]">All database collections, user quotas, and Gemini models are synchronized and operational.</span>
              </div>
              <button 
                onClick={() => setNoticeDismissed(true)}
                className="text-[#a7aaad] hover:text-[#1d2327] text-xs px-2 py-0.5 border border-[#c3c4c7] bg-[#f6f7f7] hover:bg-[#f0f0f1] rounded-[3px]"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* PAGE HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#c3c4c7] pb-3">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-normal text-[#1d2327]">
                {getTabTitle(activeTab)}
              </h1>
              
              {/* Add New Action Button */}
              {activeTab === 'users' && (
                <button 
                  onClick={() => {
                    const el = document.getElementById('add-user-form');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-2.5 py-1 text-xs border border-[#2271b1] text-[#2271b1] hover:bg-[#2271b1] hover:text-white rounded-[3px] font-semibold transition-colors bg-white"
                >
                  Add New User
                </button>
              )}

              {activeTab === 'stencils' && (
                <button 
                  onClick={fetchData}
                  className="px-2.5 py-1 text-xs border border-[#2271b1] text-[#2271b1] hover:bg-[#2271b1] hover:text-white rounded-[3px] font-semibold transition-colors bg-white flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  Refresh Library
                </button>
              )}
            </div>

            <div className="text-xs text-[#50575e] font-mono flex items-center gap-2">
              <span>Uptime: {systemUptime}</span>
              <span>•</span>
              <span>Cloud Run Node 20</span>
            </div>
          </div>

          {/* TAB CONTENT AREAS */}
          <AnimatePresence mode="wait">

            {/* DASHBOARD TAB */}
            {activeTab === 'stats' && (
              <motion.div 
                key="stats"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-5"
              >
                {/* Welcome Panel Widget */}
                <div className="bg-white border border-[#c3c4c7] p-5 rounded-[3px] shadow-sm relative overflow-hidden">
                  <div className="max-w-3xl space-y-2">
                    <h2 className="text-xl font-normal text-[#1d2327]">Welcome to Pro Stencils Art Admin Dashboard!</h2>
                    <p className="text-sm text-[#50575e] leading-relaxed">
                      We’ve assembled some links to get you started with managing tattoo artist accounts, stencil generations, system telemetry, and AI prompt customization.
                    </p>

                    <div className="pt-3 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div className="space-y-1">
                        <div className="font-bold text-[#1d2327] uppercase tracking-wider text-[11px]">Get Started</div>
                        <button onClick={() => setActiveTab('sitebuilder')} className="block text-[#2271b1] hover:underline font-semibold">Customize Your Site Layout</button>
                        <button onClick={() => setActiveTab('prompts')} className="block text-[#2271b1] hover:underline">Configure Gemini AI Styles</button>
                      </div>

                      <div className="space-y-1">
                        <div className="font-bold text-[#1d2327] uppercase tracking-wider text-[11px]">Next Steps</div>
                        <button onClick={() => setActiveTab('users')} className="block text-[#2271b1] hover:underline">Manage User Accounts ({stats.totalUsers})</button>
                        <button onClick={() => setActiveTab('stencils')} className="block text-[#2271b1] hover:underline">View Stencils Gallery ({stats.totalStencils})</button>
                      </div>

                      <div className="space-y-1">
                        <div className="font-bold text-[#1d2327] uppercase tracking-wider text-[11px]">More Actions</div>
                        <button onClick={() => setActiveTab('code')} className="block text-[#2271b1] hover:underline">Theme Source Code Editor</button>
                        <button onClick={() => setActiveTab('logs')} className="block text-[#2271b1] hover:underline">Review Audit Event Logs</button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Meta Boxes Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  
                  {/* Meta Box 1: At a Glance */}
                  <div className="bg-white border border-[#c3c4c7] rounded-[3px] shadow-sm overflow-hidden">
                    <div className="bg-[#f6f7f7] border-b border-[#c3c4c7] px-4 py-2.5 font-bold text-xs text-[#1d2327] flex items-center justify-between">
                      <span>At a Glance</span>
                      <Home className="w-3.5 h-3.5 text-[#50575e]" />
                    </div>
                    <div className="p-4 space-y-3 text-xs">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <Image className="w-4 h-4 text-[#2271b1]" />
                          <span className="font-bold text-sm text-[#1d2327]">{stats.totalStencils}</span>
                          <span className="text-[#50575e]">Stencils</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-[#2271b1]" />
                          <span className="font-bold text-sm text-[#1d2327]">{stats.totalUsers}</span>
                          <span className="text-[#50575e]">Users</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-[#2271b1]" />
                          <span className="font-bold text-sm text-[#1d2327]">{messages.length}</span>
                          <span className="text-[#50575e]">Support Messages</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-[#2271b1]" />
                          <span className="font-bold text-sm text-[#1d2327]">Gemini Flash</span>
                          <span className="text-[#50575e]">AI Engine</span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-[#f0f0f1] text-[#50575e] text-[11px] flex items-center justify-between">
                        <span>Pro Stencils 2.0 Engine Active</span>
                        <span className="text-[#00a32a] font-bold">Search engines encouraged</span>
                      </div>
                    </div>
                  </div>

                  {/* Meta Box 2: System Activity & Health */}
                  <div className="bg-white border border-[#c3c4c7] rounded-[3px] shadow-sm overflow-hidden">
                    <div className="bg-[#f6f7f7] border-b border-[#c3c4c7] px-4 py-2.5 font-bold text-xs text-[#1d2327] flex items-center justify-between">
                      <span>System Health & Telemetry</span>
                      <Activity className="w-3.5 h-3.5 text-[#00a32a]" />
                    </div>
                    <div className="p-4 space-y-3 text-xs">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="font-bold text-[#1d2327]">Firestore Database</span>
                          <span className="text-[#00a32a] font-semibold bg-[#e7f6ed] px-2 py-0.5 rounded-[3px]">Connected</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="font-bold text-[#1d2327]">Gemini API Gateway</span>
                          <span className="text-[#00a32a] font-semibold bg-[#e7f6ed] px-2 py-0.5 rounded-[3px]">Active</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="font-bold text-[#1d2327]">Estimated API Expenses</span>
                          <span className="text-[#1d2327] font-mono font-bold">${(stats.totalStencils * 0.0005).toFixed(4)}</span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-[#f0f0f1] flex items-center justify-between">
                        <button 
                          onClick={handleExportSystemAudit}
                          className="px-3 py-1 bg-[#f6f7f7] hover:bg-[#f0f0f1] border border-[#2271b1] text-[#2271b1] rounded-[3px] font-semibold transition-colors flex items-center gap-1 text-xs"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Export System Audit</span>
                        </button>

                        <button 
                          onClick={fetchData}
                          className="px-3 py-1 bg-[#2271b1] hover:bg-[#135e96] text-white rounded-[3px] font-semibold transition-colors flex items-center gap-1 text-xs"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Refresh Telemetry</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Meta Box 3: Quick Draft Scratchpad */}
                  <div className="bg-white border border-[#c3c4c7] rounded-[3px] shadow-sm overflow-hidden md:col-span-2">
                    <div className="bg-[#f6f7f7] border-b border-[#c3c4c7] px-4 py-2.5 font-bold text-xs text-[#1d2327] flex items-center justify-between">
                      <span>Quick Draft / Admin Scratchpad</span>
                      <Clock className="w-3.5 h-3.5 text-[#50575e]" />
                    </div>
                    <div className="p-4 space-y-3 text-xs">
                      <textarea 
                        value={content.adminNotes}
                        onChange={(e) => setContent({ ...content, adminNotes: e.target.value })}
                        className="w-full h-24 bg-[#f6f7f7] border border-[#c3c4c7] rounded-[3px] p-3 text-xs font-mono text-[#1d2327] outline-none focus:border-[#2271b1] resize-none"
                        placeholder="What's on your mind? Save notes or developer todos..."
                      />
                      <div className="flex justify-end">
                        <button 
                          onClick={handleSave}
                          disabled={isSaving}
                          className="px-4 py-1.5 bg-[#2271b1] hover:bg-[#135e96] text-white rounded-[3px] font-bold text-xs transition-colors"
                        >
                          {isSaving ? "Saving Draft..." : "Save Draft"}
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {/* USERS DIRECTORY TAB (WP LIST TABLE) */}
            {activeTab === 'users' && (
              <motion.div 
                key="users"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-5"
              >
                {/* Search Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 border border-[#c3c4c7] rounded-[3px]">
                  <div className="text-xs font-semibold text-[#1d2327]">
                    All Users ({users.length})
                  </div>

                  <div className="relative max-w-sm w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#50575e]" />
                    <input 
                      type="text"
                      placeholder="Search users by email, name, UID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-[#f6f7f7] border border-[#c3c4c7] rounded-[3px] pl-9 pr-3 py-1.5 text-xs text-[#1d2327] outline-none focus:border-[#2271b1]"
                    />
                  </div>
                </div>

                {/* Provision New User Form */}
                <div id="add-user-form" className="bg-white border border-[#c3c4c7] rounded-[3px] p-4 shadow-sm space-y-3">
                  <h3 className="text-sm font-bold text-[#1d2327] border-b border-[#f0f0f1] pb-2">
                    Add New User Account
                  </h3>

                  <form onSubmit={handleCreateUser} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="text-[11px] font-semibold text-[#50575e] block mb-1">Email (required)</label>
                      <input 
                        type="email" 
                        required
                        value={newUserEmail} 
                        onChange={(e) => setNewUserEmail(e.target.value)}
                        className="w-full bg-[#f6f7f7] border border-[#c3c4c7] rounded-[3px] px-3 py-1.5 outline-none focus:border-[#2271b1] text-[#1d2327]"
                        placeholder="artist@studio.com"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-[#50575e] block mb-1">Display Name</label>
                      <input 
                        type="text" 
                        required
                        value={newUserDisplayName} 
                        onChange={(e) => setNewUserDisplayName(e.target.value)}
                        className="w-full bg-[#f6f7f7] border border-[#c3c4c7] rounded-[3px] px-3 py-1.5 outline-none focus:border-[#2271b1] text-[#1d2327]"
                        placeholder="Tattoo Artist"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-[#50575e] block mb-1">Role</label>
                      <select 
                        value={newUserRole} 
                        onChange={(e) => setNewUserRole(e.target.value)}
                        className="w-full bg-[#f6f7f7] border border-[#c3c4c7] rounded-[3px] px-3 py-1.5 outline-none focus:border-[#2271b1] text-[#1d2327]"
                      >
                        <option value="user">Subscriber / Artist</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <button 
                        type="submit"
                        disabled={isCreatingUser}
                        className="w-full bg-[#2271b1] hover:bg-[#135e96] disabled:opacity-50 py-1.5 rounded-[3px] text-white font-bold transition-colors"
                      >
                        {isCreatingUser ? "Adding..." : "Add New User"}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Users Directory Table */}
                <div className="bg-white border border-[#c3c4c7] rounded-[3px] overflow-hidden shadow-sm">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[#c3c4c7] bg-[#f6f7f7] text-[#1d2327] font-semibold text-[11px]">
                        <th className="p-3">Username / Email</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-center">Stencils Created</th>
                        <th className="p-3 text-center">Quota Limit</th>
                        <th className="p-3">Role</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f0f0f1]">
                      {filteredUsers.map(user => (
                        <tr key={user.id} className="hover:bg-[#f6f7f7] transition-colors group">
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              {user.photoURL ? (
                                <img src={user.photoURL} alt="" className="w-7 h-7 rounded-full border border-[#c3c4c7] object-cover" />
                              ) : (
                                <div className="w-7 h-7 rounded-full bg-[#2271b1] text-white flex items-center justify-center font-bold text-xs">
                                  {user.displayName?.[0] || 'U'}
                                </div>
                              )}
                              <div>
                                <div className="font-bold text-[#1d2327]">{user.displayName || 'Unnamed Artist'}</div>
                                <div className="text-[11px] text-[#50575e]">{user.email} • <span className="font-mono text-[10px]">{user.id?.slice(0, 8)}</span></div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-[3px] text-[10px] font-bold uppercase tracking-wider ${
                              user.status === 'active' || !user.status
                                ? 'bg-[#e7f6ed] text-[#00a32a] border border-[#00a32a]/30' 
                                : 'bg-[#fcf0f1] text-[#d63638] border border-[#d63638]/30'
                            }`}>
                              {user.status || 'active'}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <input 
                              type="number" 
                              value={user.stencilCount || 0}
                              onChange={(e) => handleUpdateCount(user.id, parseInt(e.target.value) || 0)}
                              className="w-14 bg-[#f6f7f7] border border-[#c3c4c7] rounded-[3px] px-1.5 py-1 text-center outline-none focus:border-[#2271b1] font-mono text-xs"
                            />
                          </td>
                          <td className="p-3 text-center">
                            <input 
                              type="number" 
                              value={user.quota || 15}
                              onChange={(e) => handleUpdateQuota(user.id, parseInt(e.target.value) || 0)}
                              className="w-14 bg-[#f6f7f7] border border-[#c3c4c7] rounded-[3px] px-1.5 py-1 text-center outline-none focus:border-[#2271b1] font-mono text-xs"
                            />
                          </td>
                          <td className="p-3">
                            <select 
                              value={user.role || 'user'}
                              onChange={(e) => updateUser(user.id, { role: e.target.value })}
                              className="bg-[#f6f7f7] border border-[#c3c4c7] rounded-[3px] px-2 py-1 outline-none focus:border-[#2271b1] text-xs"
                            >
                              <option value="user">Subscriber / Artist</option>
                              <option value="admin">Administrator</option>
                            </select>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => handleToggleUserStatus(user)}
                                className="text-xs text-[#2271b1] hover:underline font-medium"
                              >
                                {user.status === 'active' ? 'Deactivate' : 'Activate'}
                              </button>
                              <span className="text-[#c3c4c7]">|</span>
                              <button 
                                onClick={() => handleDeleteUser(user.id)}
                                className="px-2 py-0.5 bg-[#fcf0f1] hover:bg-[#d63638] text-[#d63638] hover:text-white border border-[#d63638]/30 rounded-[3px] text-xs font-semibold transition-colors flex items-center gap-1"
                                title="Delete User"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Delete User</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* STENCILS STORAGE TAB */}
            {activeTab === 'stencils' && (
              <motion.div 
                key="stencils"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-4"
              >
                <div className="bg-white p-3 border border-[#c3c4c7] rounded-[3px] flex items-center justify-between text-xs">
                  <span className="font-bold text-[#1d2327]">Stencils Media Library ({filteredStencils.length})</span>
                  <input 
                    type="text"
                    placeholder="Search stencils by prompt or user..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-[#f6f7f7] border border-[#c3c4c7] rounded-[3px] px-3 py-1 text-xs outline-none focus:border-[#2271b1] w-64"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredStencils.map(stencil => (
                    <div key={stencil.id} className="bg-white border border-[#c3c4c7] rounded-[3px] p-3 shadow-sm space-y-2 relative group">
                      <div className="aspect-square bg-[#f0f0f1] rounded-[3px] overflow-hidden border border-[#c3c4c7] relative">
                        <img src={stencil.stencilImage || stencil.imageUrl} alt="" className="w-full h-full object-cover" />
                      </div>

                      <div className="space-y-1.5 text-xs">
                        <div className="font-bold text-[#1d2327] truncate">{stencil.userEmail || 'Anonymous'}</div>
                        <div className="text-[11px] text-[#50575e] line-clamp-2">{stencil.prompt || 'No prompt provided'}</div>
                        
                        <div className="pt-2 border-t border-[#f0f0f1] flex items-center justify-between text-[10px]">
                          <span className="text-[#50575e] font-semibold truncate max-w-[80px]">
                            {stencil.styleName || 'Custom'}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button 
                              onClick={() => handleDownloadStencil(stencil)}
                              className="px-2 py-0.5 bg-[#2271b1] hover:bg-[#135e96] text-white rounded-[3px] font-semibold flex items-center gap-1 text-[10px] transition-colors shadow-sm"
                              title="Stencil Herunterladen"
                            >
                              <Download className="w-3 h-3" />
                              <span>Download</span>
                            </button>
                            <button 
                              onClick={() => handleDeleteStencil(stencil.userId, stencil.id)}
                              className="px-1.5 py-0.5 bg-[#fcf0f1] hover:bg-[#d63638] text-[#d63638] hover:text-white border border-[#d63638]/30 rounded-[3px] font-semibold flex items-center gap-1 text-[10px] transition-colors"
                              title="Stencil Löschen"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* SUPPORT MESSAGES QUEUE TAB */}
            {activeTab === 'messages' && (
              <motion.div 
                key="messages"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-4"
              >
                <div className="bg-white border border-[#c3c4c7] rounded-[3px] p-4 shadow-sm">
                  <h3 className="text-sm font-bold text-[#1d2327] mb-3">Support Comments Queue ({messages.length})</h3>

                  {messages.length === 0 ? (
                    <div className="p-8 text-center text-[#50575e] italic text-xs">No pending messages in support queue.</div>
                  ) : (
                    <div className="space-y-3">
                      {messages.map((msg) => (
                        <div key={msg.id} className="p-3 border border-[#c3c4c7] rounded-[3px] bg-[#f6f7f7] space-y-2 relative">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-[#1d2327]">{msg.userName || 'Artist'} ({msg.userEmail})</span>
                            <button 
                              onClick={() => handleDeleteMessage(msg.id)}
                              className="text-[#d63638] hover:underline font-semibold"
                            >
                              Unapprove / Trash
                            </button>
                          </div>
                          <p className="text-xs text-[#2c3338] bg-white p-2.5 rounded border border-[#c3c4c7] italic">
                            "{msg.message}"
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* SITE BUILDER & PAGES TAB */}
            {activeTab === 'sitebuilder' && (
              <motion.div 
                key="sitebuilder"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
              >
                <SiteBuilder 
                  content={content} 
                  onChange={setContent} 
                  onSave={handleSave} 
                />
              </motion.div>
            )}

            {/* PLUGINS TAB */}
            {activeTab === 'plugins' && (
              <motion.div 
                key="plugins"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {(content.plugins || []).map((plugin, i) => (
                  <div key={plugin.id} className="bg-white border border-[#c3c4c7] rounded-[3px] p-4 shadow-sm space-y-3">
                    <div className="flex items-center justify-between border-b border-[#f0f0f1] pb-2">
                      <span className="font-bold text-xs text-[#1d2327]">{plugin.title}</span>
                      <button 
                        onClick={() => {
                          const newPlugins = [...content.plugins];
                          newPlugins[i].enabled = !newPlugins[i].enabled;
                          setContent({...content, plugins: newPlugins});
                        }}
                        className={`px-2.5 py-0.5 text-xs font-bold rounded-[3px] transition-colors ${
                          plugin.enabled ? 'bg-[#e7f6ed] text-[#00a32a] border border-[#00a32a]' : 'bg-[#f6f7f7] text-[#50575e] border border-[#c3c4c7]'
                        }`}
                      >
                        {plugin.enabled ? 'Active' : 'Deactivate'}
                      </button>
                    </div>

                    {plugin.id === 'demo_access' && (
                      <div className="text-xs space-y-3 pt-1">
                        <p className="text-[11px] text-[#50575e] leading-relaxed">
                          Schaltet die <strong>Gast- / Demo-Zugang</strong> Schaltfläche auf der Landingpage und im Login-Modal frei. Besucher können die Stencil-Generierung sofort als Anonymus ausprobieren.
                        </p>

                        <div className="grid grid-cols-1 gap-2 pt-1 border-t border-[#f0f0f1]">
                          <div>
                            <label className="text-[11px] font-semibold text-[#50575e] block mb-1">
                              Stencils Kontingent pro Gast (Quota)
                            </label>
                            <input 
                              type="number" 
                              min="1"
                              max="100"
                              value={plugin.config?.guestQuota ?? 10}
                              onChange={(e) => {
                                const newPlugins = [...content.plugins];
                                newPlugins[i].config = {
                                  ...newPlugins[i].config,
                                  guestQuota: parseInt(e.target.value) || 10
                                };
                                setContent({...content, plugins: newPlugins});
                              }}
                              className="w-full bg-[#f6f7f7] border border-[#c3c4c7] rounded-[3px] p-2 text-xs text-[#1d2327]"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] font-medium p-2 bg-[#f6f7f7] border border-[#c3c4c7] rounded-[3px]">
                          <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: plugin.enabled ? '#00a32a' : '#d63638' }} />
                          <span className="text-[#1d2327]">
                            Status: {plugin.enabled ? 'Aktiviert (Gast-Zugang für alle Besucher sichtbar)' : 'Deaktiviert (Gäste müssen sich registrieren)'}
                          </span>
                        </div>
                      </div>
                    )}

                    {plugin.id === 'contact' && (
                      <div className="text-xs space-y-1">
                        <label className="text-[11px] font-semibold text-[#50575e]">Recipient Support Email</label>
                        <input 
                          type="email" 
                          value={plugin.config.email || ''}
                          onChange={(e) => {
                            const newPlugins = [...content.plugins];
                            newPlugins[i].config.email = e.target.value;
                            setContent({...content, plugins: newPlugins});
                          }}
                          placeholder="admin@prostencils.com"
                          className="w-full bg-[#f6f7f7] border border-[#c3c4c7] rounded-[3px] p-2 text-xs text-[#1d2327]"
                        />
                      </div>
                    )}

                    {plugin.id === 'announcement' && (
                      <div className="text-xs space-y-1">
                        <label className="text-[11px] font-semibold text-[#50575e]">Announcement Banner Text</label>
                        <input 
                          type="text" 
                          value={plugin.config.text || ''}
                          onChange={(e) => {
                            const newPlugins = [...content.plugins];
                            newPlugins[i].config.text = e.target.value;
                            setContent({...content, plugins: newPlugins});
                          }}
                          className="w-full bg-[#f6f7f7] border border-[#c3c4c7] rounded-[3px] p-2 text-xs text-[#1d2327]"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </motion.div>
            )}

            {/* SOURCE CODE IDE TAB */}
            {activeTab === 'code' && (
              <motion.div 
                key="code"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-4"
              >
                <div className="bg-white border border-[#c3c4c7] rounded-[3px] p-4 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-[#1d2327]">Theme File Editor</h2>
                    <div className="flex items-center gap-2">
                      <select
                        value={activeFile}
                        onChange={(e) => {
                          const file = e.target.value;
                          setActiveFile(file);
                          fetchAppCode(file);
                        }}
                        className="bg-[#f6f7f7] border border-[#c3c4c7] rounded-[3px] px-3 py-1 text-xs text-[#1d2327]"
                      >
                        {fileList.map((file) => (
                          <option key={file} value={file}>{file}</option>
                        ))}
                      </select>

                      <button 
                        onClick={saveAppCode}
                        disabled={isCodeSaving || isCodeLoading}
                        className="px-3 py-1 bg-[#2271b1] hover:bg-[#135e96] disabled:opacity-50 text-white rounded-[3px] font-bold text-xs"
                      >
                        {isCodeSaving ? "Saving File..." : "Update File"}
                      </button>
                    </div>
                  </div>

                  <div className="relative border border-[#c3c4c7] rounded-[3px] overflow-hidden">
                    {isCodeLoading ? (
                      <div className="h-[450px] flex items-center justify-center bg-[#1d2327] text-white text-xs">
                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                        <span>Loading Theme File Code...</span>
                      </div>
                    ) : (
                      <textarea 
                        value={appCode}
                        onChange={(e) => setAppCode(e.target.value)}
                        spellCheck={false}
                        className="w-full h-[450px] bg-[#1d2327] p-4 font-mono text-xs text-[#a7aaad] outline-none resize-none leading-relaxed"
                      />
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* AUDIT LOGS TAB */}
            {activeTab === 'logs' && (
              <motion.div 
                key="logs"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-4"
              >
                <div className="bg-white border border-[#c3c4c7] rounded-[3px] p-4 shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-[#f0f0f1] pb-2">
                    <span className="font-bold text-sm text-[#1d2327]">System Audit Trail Logs ({filteredLogs.length})</span>
                    <div className="flex gap-1 text-xs">
                      {['all', 'auth', 'error', 'system'].map(cat => (
                        <button 
                          key={cat}
                          onClick={() => setLogFilter(cat)}
                          className={`px-2.5 py-0.5 rounded-[3px] font-semibold capitalize ${
                            logFilter === cat ? 'bg-[#2271b1] text-white' : 'bg-[#f6f7f7] text-[#50575e] border border-[#c3c4c7]'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[#1d2327] p-3 rounded-[3px] font-mono text-xs text-[#a7aaad] space-y-2 max-h-[500px] overflow-y-auto">
                    {filteredLogs.map((log, idx) => (
                      <div key={idx} className="border-b border-[#2c3338] pb-1.5 space-y-0.5">
                        <div className="text-[10px] text-[#72aee6] flex justify-between">
                          <span>[{log.timestamp?.toDate ? log.timestamp.toDate().toISOString() : new Date().toISOString()}]</span>
                          <span className="uppercase font-bold">{log.event || 'SYSTEM'}</span>
                        </div>
                        <div className="text-white">
                          <strong className="text-[#00a32a]">{log.user || 'SYS'}:</strong> {log.metadata?.message || JSON.stringify(log.metadata || {})}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* AI PROMPTS ENGINE TAB */}
            {activeTab === 'prompts' && (
              <motion.div 
                key="prompts"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-4"
              >
                <div className="bg-white border border-[#c3c4c7] rounded-[3px] p-4 shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-[#f0f0f1] pb-2">
                    <div>
                      <h2 className="text-sm font-bold text-[#1d2327]">AI Prompt Styles & Instruction Sets</h2>
                      <p className="text-xs text-[#50575e]">Configure how Gemini converts tattoo artwork into high-contrast stencils.</p>
                    </div>

                    <button 
                      onClick={() => {
                        const id = `custom-${Date.now()}`;
                        const newStyle = { id, name: "New Style", description: "Style description", promptModifier: "" };
                        setContent({...content, stencilStyles: [newStyle, ...(content.stencilStyles || [])]});
                      }}
                      className="px-3 py-1 bg-[#2271b1] hover:bg-[#135e96] text-white rounded-[3px] font-bold text-xs"
                    >
                      + Add New Style
                    </button>
                  </div>

                  <div className="space-y-4">
                    {(content.stencilStyles || []).map((style, i) => (
                      <div key={style.id || i} className="bg-[#f6f7f7] border border-[#c3c4c7] rounded-[3px] p-3 space-y-2">
                        <div className="flex justify-between items-center">
                          <input 
                            type="text" 
                            value={style.name || ''}
                            onChange={(e) => {
                              const newStyles = [...content.stencilStyles];
                              newStyles[i].name = e.target.value;
                              setContent({...content, stencilStyles: newStyles});
                            }}
                            className="bg-white border border-[#c3c4c7] rounded-[3px] px-2 py-1 text-xs font-bold text-[#1d2327] w-64"
                            placeholder="Style Name"
                          />

                          <button 
                            onClick={() => {
                              const newStyles = content.stencilStyles.filter((_, idx) => idx !== i);
                              setContent({...content, stencilStyles: newStyles});
                            }}
                            className="text-[#d63638] text-xs font-semibold hover:underline"
                          >
                            Remove
                          </button>
                        </div>

                        <textarea 
                          value={style.promptModifier || ''}
                          onChange={(e) => {
                            const newStyles = [...content.stencilStyles];
                            newStyles[i].promptModifier = e.target.value;
                            setContent({...content, stencilStyles: newStyles});
                          }}
                          className="w-full h-20 bg-white border border-[#c3c4c7] rounded-[3px] p-2 text-xs font-mono text-[#1d2327]"
                          placeholder="Master prompt modifier for Gemini..."
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ADMIN NOTES TAB */}
            {activeTab === 'notes' && (
              <motion.div 
                key="notes"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-4"
              >
                <div className="bg-white border border-[#c3c4c7] rounded-[3px] p-4 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-[#1d2327]">Administrator Scratchpad</h2>
                    <button 
                      onClick={handleSave}
                      disabled={isSaving}
                      className="px-3 py-1 bg-[#2271b1] hover:bg-[#135e96] text-white text-xs font-bold rounded-[3px]"
                    >
                      {isSaving ? "Saving..." : "Save Notes"}
                    </button>
                  </div>

                  <textarea 
                    value={content.adminNotes}
                    onChange={(e) => setContent({ ...content, adminNotes: e.target.value })}
                    className="w-full h-96 bg-[#f6f7f7] border border-[#c3c4c7] rounded-[3px] p-4 font-mono text-xs text-[#1d2327] outline-none focus:border-[#2271b1]"
                    placeholder="Enter internal release notes or system reminders..."
                  />
                </div>
              </motion.div>
            )}

            {/* LEGAL & POLICIES TAB */}
            {activeTab === 'legal' && (
              <motion.div 
                key="legal"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <div className="bg-white border border-[#c3c4c7] rounded-[3px] p-4 shadow-sm space-y-2">
                  <label className="text-xs font-bold text-[#1d2327] block">IMPRESSUM (MARKDOWN)</label>
                  <textarea 
                    value={content.legal?.impressum || ''}
                    onChange={(e) => setContent(prev => ({ 
                      ...prev, 
                      legal: { ...prev.legal, impressum: e.target.value } 
                    }))}
                    className="w-full h-80 bg-[#f6f7f7] border border-[#c3c4c7] rounded-[3px] p-3 text-xs font-mono text-[#1d2327] outline-none focus:border-[#2271b1]"
                  />
                </div>

                <div className="bg-white border border-[#c3c4c7] rounded-[3px] p-4 shadow-sm space-y-2">
                  <label className="text-xs font-bold text-[#1d2327] block">PRIVACY POLICY (MARKDOWN)</label>
                  <textarea 
                    value={content.legal?.privacyPolicy || ''}
                    onChange={(e) => setContent(prev => ({ 
                      ...prev, 
                      legal: { ...prev.legal, privacyPolicy: e.target.value } 
                    }))}
                    className="w-full h-80 bg-[#f6f7f7] border border-[#c3c4c7] rounded-[3px] p-3 text-xs font-mono text-[#1d2327] outline-none focus:border-[#2271b1]"
                  />
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;
