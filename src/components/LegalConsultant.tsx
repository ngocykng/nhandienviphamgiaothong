import React, { useState } from 'react';
import {
  Search,
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
  MessageSquare,
  History,
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
  const [history, setHistory] = useState<Array<{ id: number; question: string; answer: string; category: string | null; created_at: string }>>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const loadHistory = async () => {
    setIsLoadingHistory(true);
    setHistoryError(null);
    try {
      const res = await fetch('/api/legal/history', { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Không thể tải lịch sử tư vấn');
      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      setHistoryError(err instanceof Error ? err.message : 'Không thể tải lịch sử tư vấn');
    } finally {
      setIsLoadingHistory(false);
    }
  };

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
      if (showHistory) void loadHistory();
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
      <div className="glass rounded-2xl p-6 animate-fade-in bg-gradient-to-r from-blue-50/80 via-white to-indigo-50/60 dark:from-slate-900/90 dark:to-slate-900/80 border border-blue-100 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold text-blue-700 bg-blue-100/70 border border-blue-200">
                <Scale className="w-3.5 h-3.5 text-blue-600" />
                TRA CỨU PHÁP LUẬT VIỆT NAM
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono text-emerald-700 bg-emerald-100/70 border border-emerald-200">
                <div className="status-dot online" style={{ width: '6px', height: '6px' }} />
                moit.gov.vn Grounded
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
              Tư Vấn Luật Giao Thông AI
            </h2>
            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
              Hệ thống AI tự động tra cứu, đối chiếu các điều khoản pháp luật từ Nghị định 100/2019/NĐ-CP, Nghị định 123/2021/NĐ-CP và Cổng thông tin điện tử Bộ Công Thương.
            </p>
          </div>

          <div
            className="flex items-center gap-3 shrink-0 bg-white/90 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 cursor-pointer select-none shadow-sm"
            onClick={() => setSearchMoit(!searchMoit)}
          >
            <input
              type="checkbox"
              id="searchMoit"
              checked={searchMoit}
              onChange={(e) => setSearchMoit(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 border-slate-300 cursor-pointer accent-blue-600"
            />
            <label htmlFor="searchMoit" className="cursor-pointer text-xs">
              <span className="font-bold text-slate-800 dark:text-white block">Tra cứu moit.gov.vn</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Đối chiếu từ Cổng TTĐT Bộ Công Thương</span>
            </label>
          </div>
        </div>
      </div>

      {/* Query Search Form */}
      <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in" style={{ animationDelay: '80ms' }}>
        <div className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-blue-50 text-blue-600">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nhập tình huống hoặc câu hỏi pháp luật (VD: Mức phạt vượt đèn đỏ ô tô năm 2026?)"
            className="input-field py-4 pl-14 pr-40 text-sm rounded-2xl shadow-sm"
          />
          <button
            type="submit"
            disabled={!query.trim() || isLoading}
            className="btn btn-primary absolute right-2.5 top-1/2 -translate-y-1/2 text-xs py-2.5 disabled:opacity-40"
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
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
            <span>Chủ đề nổi bật:</span>
          </span>
          {POPULAR_LEGAL_TOPICS.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectPreset(item.query, item.category)}
              className="text-[11px] px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-blue-600 hover:border-blue-300 dark:hover:text-blue-400 card-interactive shadow-xs font-medium"
            >
              {item.title}
            </button>
          ))}
        </div>
      </form>

      <section className="glass rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-4">
        <button
          type="button"
          onClick={() => {
            const next = !showHistory;
            setShowHistory(next);
            if (next) void loadHistory();
          }}
          className="flex w-full items-center justify-between text-sm font-bold text-slate-800 dark:text-white"
        >
          <span className="flex items-center gap-2"><History className="w-4 h-4 text-blue-600" /> Lịch sử tư vấn đã lưu</span>
          <span className="text-xs text-slate-500">{showHistory ? 'Ẩn' : 'Xem'}</span>
        </button>
        {showHistory && (
          <div className="space-y-3">
            {isLoadingHistory && <p className="text-xs text-slate-500">Đang tải lịch sử...</p>}
            {historyError && <p className="text-xs text-rose-600">{historyError}</p>}
            {!isLoadingHistory && !historyError && history.length === 0 && <p className="text-xs text-slate-500">Chưa có câu hỏi nào được lưu.</p>}
            {history.map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => { setQuery(item.question); setResponse({ answer: item.answer, sources: [], timestamp: item.created_at }); }}
                className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 p-3 text-left hover:border-blue-300"
              >
                <span className="block text-xs font-semibold text-slate-800 dark:text-slate-200">{item.question}</span>
                <span className="mt-1 block text-[10px] text-slate-500">{new Date(item.created_at).toLocaleString('vi-VN')}</span>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-2xl flex items-center gap-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 animate-fade-in font-medium">
          <div className="p-2 rounded-xl bg-rose-100 text-rose-600">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold block">Thông báo từ hệ thống:</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading && !response && (
        <div className="glass rounded-2xl p-12 flex flex-col items-center justify-center gap-4 animate-fade-in bg-white/90 dark:bg-slate-900/80">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center animate-pulse-glow shadow-md" style={{ background: 'var(--gradient-primary)' }}>
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Đang tra cứu và đối chiếu luật...</p>
            <p className="text-[11px] text-slate-500 mt-1">Gemini AI đang tổng hợp các nghị định và văn bản hiện hành</p>
          </div>
          <div className="w-48 h-1 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
            <div className="h-full rounded-full animate-shimmer" style={{ background: 'var(--gradient-primary)', width: '60%' }} />
          </div>
        </div>
      )}

      {/* Response Display */}
      {response && (
        <div className="glass rounded-2xl p-6 space-y-6 animate-slide-up bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
          {/* Header of Response */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-600">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                  KẾT QUẢ TỔNG HỢP TỪ GEMINI AI
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Đã đối chiếu nguồn pháp lý chính thức
                </h3>
              </div>
            </div>

            <button
              onClick={handleCopy}
              className="btn btn-ghost text-xs py-2 shadow-xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600 font-bold">Đã sao chép</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Sao chép kết quả</span>
                </>
              )}
            </button>
          </div>

          {/* Formatted Answer Body */}
          <div className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed space-y-4">
            {response.answer.split('\n\n').map((paragraph, index) => {
              // Heading
              if (
                paragraph.startsWith('###') ||
                paragraph.startsWith('##') ||
                paragraph.startsWith('1.') ||
                paragraph.startsWith('2.') ||
                paragraph.startsWith('3.') ||
                paragraph.startsWith('4.') ||
                paragraph.startsWith('5.') ||
                paragraph.startsWith('6.')
              ) {
                return (
                  <div key={index} className="pt-2 animate-fade-in" style={{ animationDelay: `${index * 40}ms` }}>
                    <p className="font-bold text-base text-blue-700 dark:text-blue-400 border-l-4 border-blue-600 pl-3">
                      {paragraph.replace(/^#+\s*/, '')}
                    </p>
                  </div>
                );
              }
              // Bullet lists
              if (paragraph.includes('\n- ') || paragraph.startsWith('- ')) {
                return (
                  <ul key={index} className="list-disc pl-5 space-y-1.5 text-slate-700 dark:text-slate-300">
                    {paragraph.split('\n').map((line, lIdx) => (
                      <li key={lIdx}>{line.replace(/^-\s*/, '')}</li>
                    ))}
                  </ul>
                );
              }
              return (
                <p key={index} className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {paragraph}
                </p>
              );
            })}
          </div>

          {/* Sources returned by Gemini grounding */}
          {response.sources && response.sources.length > 0 && (
            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-700 rounded-xl p-4 space-y-3">
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-blue-600" />
                <span>Nguồn tham chiếu &amp; Cổng thông tin ({response.sources.length}):</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {response.sources.map((src, i) => (
                  <a
                    key={i}
                    href={src.uri}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2 rounded-xl text-xs text-blue-700 bg-white dark:bg-slate-800 dark:text-blue-400 border border-blue-200 dark:border-slate-700 hover:border-blue-400 flex items-center gap-2 card-interactive shadow-xs font-medium"
                  >
                    <span>{src.title || 'Cổng thông tin bộ ngành'}</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Official government links */}
          <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <span className="font-mono">
              Thời gian xác thực: {new Date(response.timestamp).toLocaleTimeString('vi-VN')}
            </span>
            <div className="flex items-center gap-4 font-medium">
              <a href="https://moit.gov.vn/" target="_blank" rel="noreferrer" className="hover:text-blue-600 underline transition">
                moit.gov.vn
              </a>
              <a href="https://csgt.vn/" target="_blank" rel="noreferrer" className="hover:text-blue-600 underline transition">
                csgt.vn
              </a>
              <a href="https://dichvucong.gov.vn" target="_blank" rel="noreferrer" className="hover:text-blue-600 underline transition">
                dichvucong.gov.vn
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
