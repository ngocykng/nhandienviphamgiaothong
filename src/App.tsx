import React, { useState, useEffect } from 'react';
import { AuthScreen } from './components/AuthScreen';
import {
  VideoTrackingPlayer,
} from './components/VideoTrackingPlayer';
import {
  LegalConsultant,
} from './components/LegalConsultant';
import {
  QuickPenaltyLookup,
} from './components/QuickPenaltyLookup';
import {
  ShieldAlert,
  Video,
  FileSpreadsheet,
  ExternalLink,
  Scale,
  Sparkles,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Activity,
  Cpu,
  Globe,
  Sun,
  Moon,
} from 'lucide-react';

type TabKey = 'tracking' | 'consultant' | 'matrix';

const NAV_ITEMS: { key: TabKey; icon: React.ElementType; label: string; desc: string }[] = [
  { key: 'tracking', icon: Video, label: 'AI Tracking Video', desc: 'Giám sát & phân tích phương tiện' },
  { key: 'consultant', icon: Scale, label: 'Tư Vấn Luật', desc: 'Tra cứu pháp luật giao thông' },
  { key: 'matrix', icon: FileSpreadsheet, label: 'Khung Mức Phạt', desc: 'Bảng biểu mức xử phạt' },
];

const FOOTER_LINKS = [
  { label: 'Bộ Công Thương', url: 'https://moit.gov.vn/', domain: 'moit.gov.vn' },
  { label: 'Cục CSGT', url: 'https://csgt.vn/', domain: 'csgt.vn' },
  { label: 'Dịch vụ công QG', url: 'https://dichvucong.gov.vn', domain: 'dichvucong.gov.vn' },
];

export default function App() {
  const [user, setUser] = useState<{ id: number; fullName: string; email: string } | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('tracking');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('viet_traffic_theme') === 'dark';
  });

  // Apply theme to document element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('viet_traffic_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('viet_traffic_theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => setUser(data?.user || null))
      .catch(() => setUser(null))
      .finally(() => setAuthChecked(true));
  }, []);

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25" style={{ background: 'var(--gradient-primary)' }}>
            <ShieldAlert className="w-7 h-7 text-white animate-float" />
          </div>
          <div className="w-40 h-1.5 rounded-full overflow-hidden bg-slate-200">
            <div className="h-full rounded-full animate-shimmer" style={{ background: 'var(--gradient-primary)', width: '60%' }} />
          </div>
        </div>
      </div>
    );
  }

  if (!user) return <AuthScreen onAuthenticated={setUser} />;

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    setUser(null);
  };

  return (
    <div className="min-h-screen selection:bg-blue-600 selection:text-white" style={{ color: 'var(--text-primary)' }}>

      {/* ══ Mobile Top Bar ══ */}
      <header className="lg:hidden sticky top-0 z-50 glass px-4 py-3 flex items-center justify-between border-b border-slate-200/80">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-xl hover:bg-slate-100 text-slate-700 transition"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm" style={{ background: 'var(--gradient-primary)' }}>
            <ShieldAlert className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-sm text-slate-900">
            VietTraffic <span className="text-gradient">AI</span>
          </span>
        </div>
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition"
          title={isDarkMode ? 'Chuyển sang chế độ Sáng' : 'Chuyển sang chế độ Tối'}
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-600" />}
        </button>
      </header>

      {/* ══ Sidebar Overlay (mobile) ══ */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-slate-900/30 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ══ Sidebar ══ */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Brand */}
        <div className="flex items-center justify-between px-2 mb-6 animate-fade-in">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 glow-blue shadow-md"
              style={{ background: 'var(--gradient-primary)' }}
            >
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-extrabold tracking-tight text-slate-900 leading-tight">
                VietTraffic <span className="text-gradient">AI</span>
              </h1>
              <p className="text-[10px] text-slate-500 truncate font-medium">
                Giám sát &amp; Tư vấn Giao thông
              </p>
            </div>
          </div>

          {/* Theme Switcher in Sidebar */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition shrink-0"
            title={isDarkMode ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>
        </div>

        {/* Status Badge */}
        <div className="bg-slate-100/80 dark:bg-slate-800/60 rounded-xl px-3 py-2.5 mb-6 flex items-center gap-2.5 border border-slate-200/80 dark:border-slate-700/60 animate-fade-in">
          <div className="status-dot online" />
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
              GEMINI 3.8 FLASH
            </span>
            <span className="text-[9px] text-slate-500 dark:text-slate-400 font-medium">
              Hệ thống AI trực tuyến
            </span>
          </div>
          <Cpu className="w-3.5 h-3.5 text-slate-400" />
        </div>

        {/* Navigation */}
        <div className="space-y-1.5 flex-1 stagger-children">
          <span className="section-label block mb-2 mt-1">Chức năng</span>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => {
                  setActiveTab(item.key);
                  setSidebarOpen(false);
                }}
                className={`nav-item w-full text-left ${isActive ? 'active shadow-sm' : ''}`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className={`block text-[13px] leading-tight truncate font-semibold ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>
                    {item.label}
                  </span>
                  <span className={`text-[10px] leading-tight block ${isActive ? 'text-blue-500/80 dark:text-blue-300/70' : 'text-slate-500'}`}>
                    {item.desc}
                  </span>
                </div>
                {isActive && (
                  <ChevronRight className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Links */}
        <div className="mt-auto pt-4 space-y-3">
          <span className="section-label block">Cổng thông tin chính thức</span>
          <div className="space-y-1">
            {FOOTER_LINKS.map((link) => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] text-slate-600 hover:text-blue-600 hover:bg-blue-50 dark:text-slate-400 dark:hover:text-blue-400 dark:hover:bg-slate-800 transition group font-medium"
              >
                <Globe className="w-3 h-3 shrink-0 text-slate-400 group-hover:text-blue-600 transition" />
                <span className="flex-1 truncate">{link.label}</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition" />
              </a>
            ))}
          </div>

          {/* User Profile */}
          <div className="bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl p-3 flex items-center gap-3 mt-4 shadow-sm">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold text-white shadow-sm" style={{ background: 'var(--gradient-accent)' }}>
              {user.fullName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate">{user.fullName}</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">{user.email}</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ══ Main Content ══ */}
      <main className="main-content">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6 animate-fade-in">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>{NAV_ITEMS.find(n => n.key === activeTab)?.label}</span>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              {NAV_ITEMS.find(n => n.key === activeTab)?.desc}
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <div className="bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300 shadow-sm font-medium">
              <Activity className="w-3.5 h-3.5 text-emerald-500" />
              <span>Hệ thống giám sát vận hành tối ưu</span>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="animate-slide-up" key={activeTab}>
          {activeTab === 'tracking' && <VideoTrackingPlayer />}
          {activeTab === 'consultant' && <LegalConsultant />}
          {activeTab === 'matrix' && <QuickPenaltyLookup />}
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-slate-200/80 dark:border-slate-800 pb-8 text-center">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            VietTraffic AI — Nền tảng Trí tuệ Nhân tạo Giám sát Giao thông &amp; Tư vấn Pháp luật.
            Dẫn chiếu theo Nghị định 100/2019/NĐ-CP, Nghị định 123/2021/NĐ-CP và Luật Trật tự an toàn giao thông đường bộ Việt Nam.
          </p>
        </footer>
      </main>
    </div>
  );
}
