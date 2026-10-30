import React, { useState } from 'react';
import { PRESET_TRAFFIC_LAWS } from '../data/trafficLaws';
import { LawItem } from '../types/traffic';
import { Search, ShieldCheck, Car, Bike, AlertTriangle, ExternalLink, Filter } from 'lucide-react';

export const QuickPenaltyLookup: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedVehicle, setSelectedVehicle] = useState<'all' | 'car' | 'motorbike'>('all');

  const categories = [
    { id: 'all', label: 'Tất cả lĩnh vực' },
    { id: 'traffic_light', label: 'Đèn tín hiệu & Vạch kẻ' },
    { id: 'speed', label: 'Tốc độ quy định' },
    { id: 'alcohol', label: 'Nồng độ cồn' },
    { id: 'lane', label: 'Làn đường & Đi ngược chiều' },
    { id: 'helmet', label: 'Mũ bảo hiểm' },
  ];

  const filteredLaws = PRESET_TRAFFIC_LAWS.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.decreeClause.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' || item.category === selectedCategory;

    const matchesVehicle =
      selectedVehicle === 'all' ||
      item.vehicleType === selectedVehicle ||
      item.vehicleType === 'both';

    return matchesSearch && matchesCategory && matchesVehicle;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 bg-gradient-to-r from-emerald-50/70 via-white to-blue-50/60 dark:from-slate-900 dark:to-slate-900 border border-emerald-100 dark:border-slate-800 shadow-sm animate-fade-in">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold text-emerald-700 bg-emerald-100/70 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              BIỂU MỨC XỬ PHẠT CHUẨN NGHỊ ĐỊNH 100 &amp; 123
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
            Khung Mức Xử Phạt Giao Thông Đường Bộ
          </h2>
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
            Hệ thống biểu mức tiền phạt vi phạm quy tắc an toàn giao thông đường bộ đối với người điều khiển Ô tô, Xe máy và phương tiện chuyên dụng.
          </p>
        </div>

        {/* Vehicle filter pills */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shrink-0">
          {[
            { key: 'all' as const, label: 'Tất cả xe', icon: null },
            { key: 'car' as const, label: 'Ô tô', icon: Car },
            { key: 'motorbike' as const, label: 'Xe máy', icon: Bike },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setSelectedVehicle(key)}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                selectedVehicle === key
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {Icon && <Icon className="w-3.5 h-3.5" />}
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 animate-fade-in" style={{ animationDelay: '60ms' }}>
        {/* Search */}
        <div className="md:col-span-5 relative group">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 p-1 rounded-lg bg-blue-50 text-blue-600">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo từ khóa (vượt đèn đỏ, nồng độ cồn...)"
            className="input-field pl-12 py-2.5 text-xs rounded-xl shadow-xs"
          />
        </div>

        {/* Categories */}
        <div className="md:col-span-7 flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all card-interactive ${
                selectedCategory === cat.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-emerald-700 hover:border-emerald-300 shadow-xs'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center gap-2 text-[11px] text-slate-500 px-1 font-medium">
        <Filter className="w-3 h-3 text-slate-400" />
        <span>Hiển thị {filteredLaws.length} quy định xử phạt</span>
      </div>

      {/* Law items list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-children">
        {filteredLaws.map((item) => (
          <div
            key={item.id}
            className="glass rounded-2xl p-5 space-y-4 card-interactive flex flex-col justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold font-mono uppercase ${
                    item.vehicleType === 'car'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : item.vehicleType === 'motorbike'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {item.vehicleType === 'car'
                    ? 'Ô TÔ'
                    : item.vehicleType === 'motorbike'
                    ? 'XE MÁY'
                    : 'ÁP DỤNG CHUNG'}
                </span>
                <span className="text-[10px] text-slate-400 font-mono font-semibold">
                  {item.id.toUpperCase()}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">{item.title}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{item.description}</p>
            </div>

            <div className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-baseline justify-between bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">Khung phạt tiền:</span>
                <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                  {item.fineMin.toLocaleString('vi-VN')} đ - {item.fineMax.toLocaleString('vi-VN')} đ
                </span>
              </div>

              {item.penaltyAdditional && (
                <div className="text-xs p-3 rounded-xl flex items-start gap-2 bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                  <span>{item.penaltyAdditional}</span>
                </div>
              )}

              <div className="text-[11px] font-mono p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 dark:bg-amber-950/30 dark:border-amber-900 dark:text-amber-300">
                <span className="text-slate-500 dark:text-slate-400 block mb-1 text-[10px] font-sans font-bold">Căn cứ pháp lý:</span>
                {item.decreeClause}
              </div>

              {item.officialRefUrl && (
                <div className="flex justify-end pt-1">
                  <a
                    href={item.officialRefUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-blue-600 hover:text-blue-700 dark:text-blue-400 font-semibold flex items-center gap-1.5 transition group"
                  >
                    <span>Tra cứu tại Cổng TTĐT</span>
                    <ExternalLink className="w-3 h-3 opacity-70 group-hover:opacity-100 transition" />
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
