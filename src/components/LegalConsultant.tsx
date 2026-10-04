import React, { useState } from 'react';
import {
  Search,
  BookOpen,
  ExternalLink,
  Sparkles,
  Loader2,
  Copy,
  Check,
  Globe,
  ShieldCheck,
  HelpCircle,
  FileCheck2,
  Scale,
} from 'lucide-react';
import { POPULAR_LEGAL_TOPICS } from '../data/trafficLaws';
import { LegalConsultationResponse } from '../types/traffic';

export const LegalConsultant: React.FC = () => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('traffic_light');
  const [searchMoit, setSearchMoit] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<LegalConsultationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Preset query click
  const handleSelectPreset = (presetQuery: string, presetCategory: string) => {
    setQuery(presetQuery);
    setCategory(presetCategory);
    runConsultation(presetQuery, presetCategory);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;
    runConsultation(query, category);
  };

  const runConsultation = async (queryString: string, catString: string) => {
    setIsLoading(true);
    setError(null);
    setCopied(false);

    try {
      const res = await fetch('/api/traffic-legal-consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: queryString,
          category: catString,
          searchMoit: searchMoit,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Lỗi khi tra cứu dữ liệu pháp luật');
      }

      setResponse(data);
    } catch (err: any) {
      console.error('Error during legal consultation:', err);
      setError(err.message || 'Không thể kết nối đến máy chủ tra cứu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!response?.answer) return;
    navigator.clipboard.writeText(response.answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-slate-900 border border-blue-900/40 p-6 rounded-2xl shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-semibold border border-blue-500/30 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5" />
                TRA CỨU PHÁP LUẬT VIỆT NAM CHÍNH THỐNG
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[11px] font-mono flex items-center gap-1">
                <Globe className="w-3 h-3" />
                moit.gov.vn Grounded
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white">
              Tư Vấn Luật Giao Thông AI &amp; Tra Cứu Cổng TTĐT Chính Phủ
            </h2>
            <p className="text-xs md:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Hệ thống AI tự động tra cứu, đối chiếu các điều khoản pháp luật từ Nghị định 100/2019/NĐ-CP, Nghị định 123/2021/NĐ-CP, Luật Trật tự an toàn giao thông đường bộ và Cổng thông tin điện tử Bộ Công Thương (moit.gov.vn), Bộ Công An.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-xs text-slate-300">
            <input
              type="checkbox"
              id="searchMoit"
              checked={searchMoit}
              onChange={(e) => setSearchMoit(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-700 bg-slate-800 cursor-pointer"
            />
            <label htmlFor="searchMoit" className="cursor-pointer select-none">
              <span className="font-semibold text-white block">Tra cứu moit.gov.vn</span>
              <span className="text-[11px] text-slate-400">Kiểm tra thông tin từ Cổng TTĐT Bộ Công Thương</span>
            </label>
          </div>
        </div>
      </div>

      {/* Query Search Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nhập tình huống hoặc câu hỏi pháp luật (VD: Mức phạt vượt đèn đỏ ô tô năm 2026? Nồng độ cồn tước bằng mấy tháng?...)"
            className="w-full bg-slate-900 border border-slate-700 rounded-2xl py-4 pl-12 pr-36 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-xl transition"
          />
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <button
            type="submit"
            disabled={!query.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-600/30 transition disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang tra cứu...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Tra Cứu AI</span>
              </>
            )}
          </button>
        </div>

        {/* Popular Topic Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
            <span>Chủ đề phổ biến:</span>
          </span>
          {POPULAR_LEGAL_TOPICS.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectPreset(item.query, item.category)}
              className="text-xs px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition"
            >
              {item.title}
            </button>
          ))}
        </div>
      </form>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-red-950/40 border border-red-800 rounded-2xl text-xs text-red-300 flex items-center gap-3">
          <div className="p-2 bg-red-500/20 rounded-lg text-red-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold block">Thông báo từ hệ thống:</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Response Display */}
      {response && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl">
          {/* Header of Response */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-400">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">
                  KẾT QUẢ TƯ VẤN PHÁP LUẬT CHÍNH THỨC
                </span>
                <h3 className="text-sm font-bold text-white">
                  Căn cứ Nghị định 100/2019/NĐ-CP &amp; Cổng TTĐT Chính Phủ
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 border border-slate-700 transition"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Đã sao chép</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Sao chép câu trả lời</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Formatted Answer Body */}
          <div className="prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed space-y-4">
            {response.answer.split('\n\n').map((paragraph, index) => {
              // Heading
              if (paragraph.startsWith('###') || paragraph.startsWith('##') || paragraph.startsWith('1.') || paragraph.startsWith('2.') || paragraph.startsWith('3.') || paragraph.startsWith('4.') || paragraph.startsWith('5.') || paragraph.startsWith('6.')) {
                return (
                  <div key={index} className="pt-2">
                    <p className="font-bold text-base text-blue-300 border-l-2 border-blue-500 pl-3">
                      {paragraph.replace(/^#+\s*/, '')}
                    </p>
                  </div>
                );
              }
              // Bullet lists
              if (paragraph.includes('\n- ') || paragraph.startsWith('- ')) {
                return (
                  <ul key={index} className="list-disc pl-5 space-y-1 text-slate-300">
                    {paragraph.split('\n').map((line, lIdx) => (
                      <li key={lIdx}>{line.replace(/^-\s*/, '')}</li>
                    ))}
                  </ul>
                );
              }
              return (
                <p key={index} className="text-slate-300">
                  {paragraph}
                </p>
              );
            })}
          </div>

          {/* Verified Official Sources (Google Search Grounding & moit.gov.vn) */}
          {response.sources && response.sources.length > 0 && (
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                <span>Nguồn tham chiếu &amp; Cổng thông tin xác thực ({response.sources.length}):</span>
              </span>
              <div className="flex flex-wrap gap-2 pt-1">
                {response.sources.map((src, i) => (
                  <a
                    key={i}
                    href={src.uri}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1.5 transition"
                  >
                    <span>{src.title || 'Cổng thông tin bộ ngành'}</span>
                    <ExternalLink className="w-3 h-3 text-slate-500" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Official government links */}
          <div className="border-t border-slate-800 pt-4 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-3">
            <span className="font-mono">
              Thời gian xác thực: {new Date(response.timestamp).toLocaleTimeString('vi-VN')}
            </span>
            <div className="flex items-center gap-4">
              <a
                href="https://moit.gov.vn/"
                target="_blank"
                rel="noreferrer"
                className="hover:text-blue-400 underline transition"
              >
                Cổng TTĐT Bộ Công Thương (moit.gov.vn)
              </a>
              <a
                href="https://csgt.vn/"
                target="_blank"
                rel="noreferrer"
                className="hover:text-blue-400 underline transition"
              >
                Cổng tra cứu CSGT (csgt.vn)
              </a>
              <a
                href="https://dichvucong.gov.vn"
                target="_blank"
                rel="noreferrer"
                className="hover:text-blue-400 underline transition"
              >
                Dịch vụ công Quốc gia
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
