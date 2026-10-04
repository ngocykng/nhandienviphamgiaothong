import React, { useState } from 'react';
import { TrackedEntity, AIViolationAnalysis, TrafficScenario } from '../types/traffic';
import {
  AlertTriangle,
  CheckCircle,
  FileText,
  Sparkles,
  Loader2,
  HelpCircle,
  Send,
  Zap,
  Shield,
  Gauge,
  Info,
} from 'lucide-react';
import { ViolationNoticeModal } from './ViolationNoticeModal';

interface Props {
  entity: TrackedEntity | null;
  scenario: TrafficScenario;
  currentTime: number;
  canvasCaptures: { fullFrame?: string; entityCrop?: string };
  onRunAIDetection: (customQuestion?: string) => Promise<void>;
  aiAnalysis: AIViolationAnalysis | null;
  isLoadingAI: boolean;
  aiError: string | null;
}

export const ViolationInspector: React.FC<Props> = ({
  entity,
  scenario,
  currentTime,
  canvasCaptures,
  onRunAIDetection,
  aiAnalysis,
  isLoadingAI,
  aiError,
}) => {
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [customQuestion, setCustomQuestion] = useState('');

  if (!entity) {
    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 text-center text-slate-400 flex flex-col items-center justify-center min-h-[420px]">
        <div className="p-4 bg-slate-800/80 rounded-2xl text-slate-500 mb-3 border border-slate-700/60">
          <Shield className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-slate-300">Chưa Chọn Thực Thể</h3>
        <p className="text-xs text-slate-400 max-w-xs mt-1.5 leading-relaxed">
          Nhấp chuột trực tiếp vào một phương tiện trên khung hình video hoặc danh sách thực thể bên dưới để AI tracking và tra cứu lỗi vi phạm.
        </p>
      </div>
    );
  }

  const isViolation = entity.status === 'VIOLATION' || aiAnalysis?.violationStatus === 'CO_VI_PHAM';
  const isWarning = entity.status === 'WARNING';

  const fineDisplay =
    aiAnalysis?.fineRange?.display ||
    (entity.violationDetail
      ? `${entity.violationDetail.fineMin.toLocaleString('vi-VN')} đ - ${entity.violationDetail.fineMax.toLocaleString('vi-VN')} đ`
      : 'Đang chờ phân tích');

  const violationTitle =
    aiAnalysis?.violationName ||
    entity.violationDetail?.name ||
    entity.detectedAction ||
    'Đang theo dõi hành vi phương tiện';

  const legalClause =
    aiAnalysis?.legalClause ||
    entity.violationDetail?.clause ||
    'Nghị định 100/2019/NĐ-CP và Nghị định 123/2021/NĐ-CP';

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestion.trim() || isLoadingAI) return;
    await onRunAIDetection(customQuestion);
    setCustomQuestion('');
  };

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-5 space-y-5 text-slate-100 shadow-xl flex flex-col">
      {/* Top Header of Entity */}
      <div className="flex items-start justify-between border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-bold font-mono tracking-wide ${
                isViolation
                  ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                  : isWarning
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              }`}
            >
              {isViolation ? 'PHÁT HIỆN VI PHẠM' : isWarning ? 'CẢNH BÁO HÀNH VI' : 'BÌNH THƯỜNG'}
            </span>
            <span className="text-xs font-mono text-slate-400">ID: #{entity.id}</span>
          </div>
          <h3 className="text-base font-bold text-white mt-1">{entity.label}</h3>
          <p className="text-xs text-slate-400">
            Biển số:{' '}
            <span className="font-mono text-amber-300 font-semibold">
              {entity.licensePlate || 'Chưa nhận diện rõ'}
            </span>
          </p>
        </div>

        {/* Snapshot Crop Preview */}
        <div className="w-20 h-16 bg-slate-950 border border-slate-700 rounded-xl overflow-hidden relative shrink-0">
          {canvasCaptures.entityCrop ? (
            <img
              src={canvasCaptures.entityCrop}
              alt="Entity crop"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-500 font-mono text-center p-1">
              Ảnh cắt ROI
            </div>
          )}
          <span className="absolute bottom-0 right-0 px-1 py-0.2 bg-black/80 text-[8px] font-mono text-slate-400">
            T+{currentTime.toFixed(1)}s
          </span>
        </div>
      </div>

      {/* Telemetry metrics */}
      <div className="grid grid-cols-3 gap-2 text-xs font-mono">
        <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
          <span className="text-slate-400 block text-[10px]">VẬN TỐC</span>
          <span className="text-sm font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
            <Gauge className="w-3.5 h-3.5" />
            {entity.speedKmH} km/h
          </span>
        </div>
        <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
          <span className="text-slate-400 block text-[10px]">ĐỘ TIN CẬY</span>
          <span className="text-sm font-bold text-blue-400 mt-0.5 block">
            {Math.round(entity.confidence * 100)}%
          </span>
        </div>
        <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
          <span className="text-slate-400 block text-[10px]">ĐỐI TƯỢNG</span>
          <span className="text-xs font-semibold text-slate-300 mt-0.5 block truncate">
            {entity.type.toUpperCase()}
          </span>
        </div>
      </div>

      {/* AI Violation Trigger & Diagnosis Box */}
      <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wide">
              Chẩn Đoán Pháp Lý AI (Nghị Định 100/123)
            </span>
          </div>
          <button
            onClick={() => onRunAIDetection()}
            disabled={isLoadingAI}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-xs font-semibold text-white flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition disabled:opacity-50"
          >
            {isLoadingAI ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Đang phân tích...</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>Tra cứu lại AI</span>
              </>
            )}
          </button>
        </div>

        {aiError && (
          <div className="text-xs text-red-400 bg-red-950/30 border border-red-800/50 p-2.5 rounded-lg">
            {aiError}
          </div>
        )}

        {/* Violation info card */}
        <div className="space-y-2.5 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px] mb-0.5">Hành vi phát hiện:</span>
            <p className="font-semibold text-sm text-slate-100 leading-snug">
              {violationTitle}
            </p>
          </div>

          <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 space-y-1.5">
            <div className="flex justify-between items-baseline">
              <span className="text-slate-400 text-[11px]">Căn cứ pháp lý:</span>
              <span className="text-[11px] text-amber-300 font-mono text-right max-w-[200px]">
                {legalClause}
              </span>
            </div>
            <div className="flex justify-between items-baseline border-t border-slate-800/60 pt-1.5">
              <span className="text-slate-400 text-[11px]">Mức tiền phạt:</span>
              <span className="text-sm font-bold text-emerald-400">{fineDisplay}</span>
            </div>
            {(aiAnalysis?.additionalSanctions || entity.violationDetail?.licenseSuspension) && (
              <div className="flex justify-between items-baseline border-t border-slate-800/60 pt-1.5">
                <span className="text-slate-400 text-[11px]">Hình thức bổ sung:</span>
                <span className="text-xs text-rose-300 text-right">
                  {aiAnalysis?.additionalSanctions || entity.violationDetail?.licenseSuspension}
                </span>
              </div>
            )}
          </div>

          {aiAnalysis?.detailedExplanation && (
            <div className="text-[11px] text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60 leading-relaxed">
              <span className="font-semibold text-blue-300 block mb-1">Nhận định chi tiết:</span>
              {aiAnalysis.detailedExplanation}
            </div>
          )}
        </div>
      </div>

      {/* Button to Open Official Traffic Violation Notice */}
      <div className="space-y-2">
        <button
          onClick={() => setShowNoticeModal(true)}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-900/40 transition"
        >
          <FileText className="w-4 h-4" />
          <span>Xuất Biên Bản Vi Phạm &amp; Bằng Chứng</span>
        </button>
      </div>

      {/* Ask custom question to AI about this entity */}
      <form onSubmit={handleAskQuestion} className="pt-2 border-t border-slate-800 space-y-2">
        <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
          <span>Hỏi AI thêm về thực thể này:</span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={customQuestion}
            onChange={(e) => setCustomQuestion(e.target.value)}
            placeholder="VD: Lỗi này có bị giữ xe 7 ngày không?..."
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
          />
          <button
            type="submit"
            disabled={!customQuestion.trim() || isLoadingAI}
            className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold disabled:opacity-50 transition"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>

      {/* Modal Notice */}
      <ViolationNoticeModal
        isOpen={showNoticeModal}
        onClose={() => setShowNoticeModal(false)}
        entity={entity}
        analysis={aiAnalysis}
        scenario={scenario}
        timestamp={currentTime}
        snapshots={canvasCaptures}
      />
    </div>
  );
};
