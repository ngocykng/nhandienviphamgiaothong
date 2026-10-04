import React, { useState } from 'react';
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
  BookOpen,
  FileSpreadsheet,
  Globe,
  Radio,
  ExternalLink,
  Car,
  Scale,
  Sparkles,
  HelpCircle,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'tracking' | 'consultant' | 'matrix'>('tracking');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-600/30 text-white">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1">
                  VietTraffic <span className="text-blue-400">AI</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  GEMINI 3.8 FLASH
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Hệ thống AI Tracking Phương Tiện &amp; Tư Vấn Luật Giao Thông
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('tracking')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'tracking'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>AI Tracking Video</span>
            </button>

            <button
              onClick={() => setActiveTab('consultant')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'consultant'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Tư Vấn Luật (moit.gov.vn)</span>
            </button>

            <button
              onClick={() => setActiveTab('matrix')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'matrix'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Khung Mức Phạt</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'tracking' && <VideoTrackingPlayer />}
        {activeTab === 'consultant' && <LegalConsultant />}
        {activeTab === 'matrix' && <QuickPenaltyLookup />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center md:text-left">
            <p className="font-semibold text-slate-300">
              VietTraffic AI - Nền tảng Trí tuệ Nhân tạo Giám sát Giao thông &amp; Tư vấn Pháp luật
            </p>
            <p className="text-[11px] text-slate-400">
              Dẫn chiếu theo Nghị định 100/2019/NĐ-CP, Nghị định 123/2021/NĐ-CP và Luật Trật tự an toàn giao thông đường bộ Việt Nam.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px]">
            <a
              href="https://moit.gov.vn/"
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-blue-400 flex items-center gap-1 transition"
            >
              <span>Bộ Công Thương (moit.gov.vn)</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://csgt.vn/"
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-blue-400 flex items-center gap-1 transition"
            >
              <span>Cục CSGT (csgt.vn)</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://dichvucong.gov.vn"
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-blue-400 flex items-center gap-1 transition"
            >
              <span>Dịch vụ công Quốc gia</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
