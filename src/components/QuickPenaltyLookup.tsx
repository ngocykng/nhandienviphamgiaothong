import React, { FormEvent, useState } from 'react';
import { ExternalLink, FileSearch, Loader2, Search, ShieldCheck, Sparkles } from 'lucide-react';

interface LegalSource {
  title: string;
  uri: string;
}

interface LegalSearchResult {
  query: string;
  answer: string;
  sources: LegalSource[];
  timestamp: string;
}

const LEGAL_DOCUMENTS = [
  {
    code: 'Luật 36/2024/QH15',
    title: 'Luật Trật tự, an toàn giao thông đường bộ',
    note: 'Quy tắc và trách nhiệm khi tham gia giao thông; hiệu lực từ 01/01/2025.',
    url: 'https://vanban.chinhphu.vn/?docid=211194&pageid=27160',
  },
  {
    code: 'Luật 35/2024/QH15',
    title: 'Luật Đường bộ',
    note: 'Quản lý, khai thác, sử dụng và bảo trì kết cấu hạ tầng đường bộ.',
    url: 'https://vanban.chinhphu.vn/?classid=1&docid=211193&pageid=27160&typegroupid=3',
  },
  {
    code: 'Nghị định 168/2024/NĐ-CP',
    title: 'Quy định xử phạt vi phạm giao thông đường bộ',
    note: 'Quy định mức phạt, trừ điểm và phục hồi điểm giấy phép lái xe.',
    url: 'https://vanban.chinhphu.vn/?classid=1&docid=212167&pageid=27160',
  },
  {
    code: 'Nghị định 238/2026/NĐ-CP',
    title: 'Sửa đổi quy định xử phạt giao thông',
    note: 'Sửa đổi Nghị định 168/2024/NĐ-CP; hiệu lực từ 15/08/2026.',
    url: 'https://vanban.chinhphu.vn/?classid=0&docid=218613&pageid=27160',
  },
];

const COMMON_SEARCHES = [
  'Ô tô vượt đèn đỏ bị phạt bao nhiêu?',
  'Xe máy vi phạm nồng độ cồn bị phạt thế nào?',
  'Chạy quá tốc độ 10–20 km/h bị phạt bao nhiêu?',
  'Không đội mũ bảo hiểm bị phạt bao nhiêu?',
  'Đi sai làn đường bị phạt thế nào?',
  'Không có giấy phép lái xe bị phạt bao nhiêu?',
];

export const QuickPenaltyLookup: React.FC = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<LegalSearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchLaw = async (searchQuery: string) => {
    const normalizedQuery = searchQuery.trim();
    if (!normalizedQuery || isLoading) return;
    setQuery(normalizedQuery);
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/traffic-legal-consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          query: normalizedQuery,
          category: 'Tra cứu mức phạt giao thông đường bộ',
          searchMoit: false,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'AI không thể tra cứu mức phạt lúc này');
      setResult({ ...data, query: normalizedQuery });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Không thể kết nối đến máy chủ tra cứu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    void searchLaw(query);
  };

  const answerBlocks = result?.answer.split(/\n\s*\n/).filter(Boolean) || [];

  return (
    <div className="space-y-6">
      <section className="glass rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50/80 via-white to-blue-50/70 p-6 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:to-slate-900">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-700"><ShieldCheck className="h-5 w-5" /></div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wide text-emerald-700">Tra cứu mức phạt bằng AI</span>
            <h2 className="mt-1 text-xl font-extrabold text-slate-900 dark:text-white">Khung mức phạt giao thông đường bộ</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Nhập hành vi và loại phương tiện. AI sẽ tra cứu quy định hiện hành, nêu mức phạt, căn cứ pháp lý và nguồn tham khảo.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-2 sm:flex-row">
          <label className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Ví dụ: Xe máy vượt đèn đỏ bị phạt bao nhiêu?"
              className="input-field w-full py-3 pl-10 text-sm"
            />
          </label>
          <button type="submit" disabled={!query.trim() || isLoading} className="btn btn-primary justify-center px-5 py-3 text-sm font-bold disabled:opacity-50">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-amber-300" />}
            <span>{isLoading ? 'Đang tra cứu...' : 'Tra cứu mức phạt'}</span>
          </button>
        </form>
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-200">
          <FileSearch className="h-4 w-4 text-blue-600" /> Chủ đề phổ biến
        </div>
        <div className="flex flex-wrap gap-2">
          {COMMON_SEARCHES.map((item) => (
            <button key={item} type="button" disabled={isLoading} onClick={() => void searchLaw(item)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-blue-300 hover:text-blue-700 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
              {item}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="text-sm font-bold text-slate-800 dark:text-slate-200">Văn bản giao thông chính thức</div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {LEGAL_DOCUMENTS.map((document) => (
            <a key={document.code} href={document.url} target="_blank" rel="noreferrer" className="glass group rounded-xl border border-slate-200 bg-white p-4 transition hover:border-blue-300 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wide text-blue-600">{document.code}</span>
                  <h3 className="mt-1 text-sm font-bold text-slate-900 dark:text-white">{document.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{document.note}</p>
                </div>
                <ExternalLink className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-blue-600" />
              </div>
            </a>
          ))}
        </div>
      </section>

      {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>}

      {isLoading && (
        <div className="glass flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Đang tra cứu văn bản pháp luật hiện hành...</p>
          <p className="text-xs text-slate-500">Có thể mất vài giây để tìm nguồn và đối chiếu mức phạt.</p>
        </div>
      )}

      {result && (
        <section className="glass space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-6">
          <div className="border-b border-slate-100 pb-3 dark:border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wide text-emerald-700">Kết quả tra cứu AI</span>
            <h3 className="mt-1 text-base font-bold text-slate-900 dark:text-white">{result.query}</h3>
          </div>
          <div className="space-y-3 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
            {answerBlocks.map((block, index) => {
              const lines = block.split('\n');
              const isList = lines.every((line) => /^\s*([-*]|\d+\.)\s/.test(line));
              if (isList) {
                return <ul key={index} className="list-disc space-y-1 pl-5">{lines.map((line, lineIndex) => <li key={lineIndex}>{line.replace(/^\s*([-*]|\d+\.)\s*/, '')}</li>)}</ul>;
              }
              return <p key={index} className="whitespace-pre-wrap">{block.replace(/^#{1,4}\s*/gm, '')}</p>;
            })}
          </div>
          {result.sources?.length > 0 && (
            <div className="space-y-2 border-t border-slate-100 pt-4 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Nguồn AI đã tham khảo</span>
              <div className="flex flex-wrap gap-2">
                {result.sources.map((source, index) => (
                  <a key={`${source.uri}-${index}`} href={source.uri} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700 hover:border-blue-400 dark:border-slate-700 dark:bg-slate-800 dark:text-blue-300">
                    <span>{source.title || 'Văn bản tham khảo'}</span><ExternalLink className="h-3 w-3" />
                  </a>
                ))}
              </div>
            </div>
          )}
          <p className="text-[11px] text-slate-500">Tra cứu lúc {new Date(result.timestamp).toLocaleString('vi-VN')}. Hãy mở văn bản nguồn để đối chiếu tình tiết cụ thể.</p>
        </section>
      )}
    </div>
  );
};
