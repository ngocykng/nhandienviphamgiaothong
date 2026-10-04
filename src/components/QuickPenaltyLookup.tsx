import React, { useState } from 'react';
import { PRESET_TRAFFIC_LAWS } from '../data/trafficLaws';
import { LawItem } from '../types/traffic';
import { Search, Filter, ShieldCheck, Car, Bike, AlertTriangle, ExternalLink } from 'lucide-react';

export const QuickPenaltyLookup: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedVehicle, setSelectedVehicle] = useState<'all' | 'car' | 'motorbike'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { id: 'all', label: 'Tất cả nhóm lỗi' },
    { id: 'traffic_light', label: 'Đèn tín hiệu giao thông' },
    { id: 'alcohol', label: 'Nồng độ cồn' },
    { id: 'lane', label: 'Làn đường & Vạch kẻ' },
    { id: 'speed', label: 'Tốc độ quy định' },
    { id: 'helmet', label: 'Mũ bảo hiểm' },
    { id: 'commercial', label: 'Vận tải hàng hóa & MoIT' },
  ];

  const filteredLaws = PRESET_TRAFFIC_LAWS.filter((item) => {
    const matchCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchVehicle =
      selectedVehicle === 'all' ||
      item.vehicleType === selectedVehicle ||
      item.vehicleType === 'both';
    const matchSearch =
      !searchTerm.trim() ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.decreeClause.toLowerCase().includes(searchTerm.toLowerCase());

    return matchCategory && matchVehicle && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wide flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            BẢNG BIỂU MỨC PHẠT CHUẨN NGHỊ ĐỊNH 100/123
          </span>
          <h2 className="text-lg md:text-xl font-bold text-white mt-1">
            Tra Cứu Nhanh Khung Xử Phạt Vi Phạm Giao Thông
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Bộ tra cứu định lượng mức tiền phạt, thời gian tước GPLX và điều khoản pháp luật hiện hành.
          </p>
        </div>

        {/* Vehicle filter pills */}
        <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setSelectedVehicle('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              selectedVehicle === 'all'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Tất cả xe
          </button>
          <button
            onClick={() => setSelectedVehicle('car')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              selectedVehicle === 'car'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>Ô tô</span>
          </button>
          <button
            onClick={() => setSelectedVehicle('motorbike')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              selectedVehicle === 'motorbike'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bike className="w-3.5 h-3.5" />
            <span>Xe máy</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Search */}
        <div className="md:col-span-6 relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo từ khóa (vượt đèn đỏ, nồng độ cồn, ngược chiều...)"
            className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        {/* Categories */}
        <div className="md:col-span-6 flex gap-1.5 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition ${
                selectedCategory === cat.id
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Law items list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredLaws.map((item) => (
          <div
            key={item.id}
            className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 space-y-3 transition shadow-lg flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[10px] font-bold font-mono uppercase border border-blue-500/30">
                  {item.vehicleType === 'car'
                    ? 'DÀNH CHO Ô TÔ'
                    : item.vehicleType === 'motorbike'
                    ? 'DÀNH CHO XE MÁY'
                    : 'ÁP DỤNG CHUNG'}
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  Mã: {item.id.toUpperCase()}
                </span>
              </div>

              <h3 className="text-sm font-bold text-white leading-snug">{item.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
            </div>

            <div className="space-y-2.5 pt-3 border-t border-slate-800/80">
              <div className="flex items-baseline justify-between bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 font-medium">Khung phạt tiền:</span>
                <span className="text-sm font-bold text-emerald-400 font-mono">
                  {item.fineMin.toLocaleString('vi-VN')} đ - {item.fineMax.toLocaleString('vi-VN')} đ
                </span>
              </div>

              {item.penaltyAdditional && (
                <div className="text-xs text-rose-300 bg-rose-950/20 border border-rose-900/40 p-2 rounded-lg flex items-start gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                  <span>{item.penaltyAdditional}</span>
                </div>
              )}

              <div className="text-[11px] text-amber-300/90 font-mono bg-amber-950/20 p-2 rounded-lg border border-amber-900/30">
                <span className="text-slate-400 block mb-0.5">Căn cứ pháp lý:</span>
                {item.decreeClause}
              </div>

              {item.officialRefUrl && (
                <div className="pt-1 flex justify-end">
                  <a
                    href={item.officialRefUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 transition"
                  >
                    <span>Tra cứu tại Cổng TTĐT</span>
                    <ExternalLink className="w-3 h-3" />
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
