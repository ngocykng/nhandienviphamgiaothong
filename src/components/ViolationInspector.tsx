import React, { useState } from 'react';
import { TrackedEntity, AIViolationAnalysis, TrafficScenario } from '../types/traffic';
import {
  AlertTriangle,
  FileText,
  Sparkles,
  Loader2,
  HelpCircle,
  Send,
  Zap,
  Shield,
  Gauge,
  Scale,
  Car,
  CheckCircle2,
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
      <div className="glass rounded-2xl p-8 text-center flex flex-col items-center justify-center min-h-[420px] animate-fade-in border border-slate-300">
        <h3 className="text-lg font-extrabold text-slate-950">Chưa Chọn Phương Tiện</h3>
        <p className="text-xs text-slate-700 font-medium max-w-xs mt-2 leading-relaxed">
          Nhấp chuột vào bất kỳ phương tiện nào trên video hoặc danh sách bên dưới để AI tiến hành theo dõi và tra cứu lỗi vi phạm.
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
    'Nghị định 100/2019/NĐ-CP & Nghị định 123/2021/NĐ-CP';

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestion.trim() || isLoadingAI) return;
    await onRunAIDetection(customQuestion);
    setCustomQuestion('');
  };

  return (
    <div className="glass rounded-2xl p-5 space-y-5 flex flex-col animate-slide-up border border-slate-300 shadow-md">
      {/* Top Header */}
      <div className="flex items-start justify-between pb-4 border-b border-slate-300">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-lg text-xs font-black font-mono tracking-wider shadow-xs ${
                isViolation
                  ? 'bg-rose-100 text-rose-950 border-2 border-rose-400'
                  : isWarning
                  ? 'bg-amber-100 text-amber-950 border-2 border-amber-400'
                  : 'bg-emerald-100 text-emerald-950 border-2 border-emerald-400'
              }`}
            >
              {isViolation ? 'PHÁT HIỆN VI PHẠM' : isWarning ? 'CẢNH BÁO HÀNH VI' : 'BÌNH THƯỜNG'}
            </span>
            <span className="text-xs font-mono text-slate-700 font-extrabold">#{entity.id}</span>
          </div>

          <h3 className="text-lg font-black text-slate-950 mt-2.5 flex items-center gap-2">
            <Car className="w-5 h-5 text-blue-700 shrink-0" />
            <span>{entity.label}</span>
          </h3>

          <div className="text-xs text-slate-900 font-bold mt-1.5 flex items-center gap-2">
            <span>Biển số xe:</span>
            <span className="font-mono text-xs font-black text-slate-950 bg-amber-200 px-2.5 py-1 rounded border-2 border-amber-400 shadow-xs">
              {entity.licensePlate || 'Chưa nhận diện'}
            </span>
          </div>
        </div>

        {/* Snapshot Preview */}
        <div className="w-20 h-16 rounded-xl overflow-hidden relative shrink-0 bg-slate-900 border-2 border-slate-400 shadow-sm">
          {canvasCaptures.entityCrop ? (
            <img
              src={canvasCaptures.entityCrop}
              alt="Entity crop"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-300 font-mono font-bold text-center p-1">
              ROI
            </div>
          )}
          <span className="absolute bottom-0 right-0 px-1.5 py-0.5 text-[8px] font-mono text-white font-bold bg-black/80 rounded-tl">
            T+{currentTime.toFixed(1)}s
          </span>
        </div>
      </div>

      {/* Telemetry Stats */}
      <div className="grid grid-cols-3 gap-2.5 text-xs">
        <div className="bg-white border-2 border-slate-300 rounded-xl p-2.5 shadow-sm">
          <span className="text-slate-800 block text-[11px] font-extrabold uppercase tracking-wider">VẬN TỐC</span>
          <span className="text-base font-black text-emerald-700 mt-0.5 flex items-center gap-1 font-mono">
            <Gauge className="w-4 h-4 text-emerald-600" />
            {entity.speedKmH} km/h
          </span>
        </div>

        <div className="bg-white border-2 border-slate-300 rounded-xl p-2.5 shadow-sm">
          <span className="text-slate-800 block text-[11px] font-extrabold uppercase tracking-wider">ĐỘ TIN CẬY</span>
          <span className="text-base font-black text-blue-700 mt-0.5 block font-mono">
            {Math.round(entity.confidence * 100)}%
          </span>
        </div>

        <div className="bg-white border-2 border-slate-300 rounded-xl p-2.5 shadow-sm">
          <span className="text-slate-800 block text-[11px] font-extrabold uppercase tracking-wider">LOẠI XE</span>
          <span className="text-sm font-black text-indigo-900 mt-1 block uppercase truncate">
            {entity.type}
          </span>
        </div>
      </div>

      {/* AI Diagnosis */}
      <div className="bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/60 border-2 border-indigo-200 rounded-2xl p-4 space-y-3.5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-200 text-amber-950 rounded-lg">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-xs font-black text-slate-950 uppercase tracking-wider">
              Chẩn Đoán AI
            </span>
          </div>
          <button
            onClick={() => onRunAIDetection()}
            disabled={isLoadingAI}
            className="btn btn-primary text-xs py-1.5 px-3.5 font-bold disabled:opacity-50"
          >
            {isLoadingAI ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Đang tra cứu...</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>Tra Cứu AI</span>
              </>
            )}
          </button>
        </div>

        {aiError && (
          <div className="text-xs p-3 rounded-xl bg-rose-100 border-2 border-rose-400 text-rose-950 animate-fade-in font-bold">
            {aiError}
          </div>
        )}

        {/* Violation info card */}
        <div className="space-y-3 text-xs">
          <div>
            <span className="text-slate-800 block text-xs font-extrabold mb-1">Hành vi ghi nhận:</span>
            <p className="font-black text-base text-slate-950 leading-snug">
              {violationTitle}
            </p>
          </div>

          <div className="bg-white rounded-xl p-3.5 space-y-3 border-2 border-slate-300 shadow-sm">
            <div className="flex justify-between items-start gap-2">
              <span className="text-slate-800 text-xs font-bold shrink-0">Căn cứ pháp lý:</span>
              <span className="text-xs text-amber-950 font-black text-right bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-300">
                {legalClause}
              </span>
            </div>

            <div className="flex justify-between items-center pt-2.5 border-t border-slate-200">
              <span className="text-slate-800 text-xs font-bold">Mức tiền phạt dự kiến:</span>
              <span className="text-base font-black text-emerald-800 bg-emerald-100 px-3 py-1 rounded-lg border border-emerald-300 font-mono">
                {fineDisplay}
              </span>
            </div>

            {(aiAnalysis?.additionalSanctions || entity.violationDetail?.licenseSuspension) && (
              <div className="flex justify-between items-start gap-2 pt-2.5 border-t border-slate-200">
                <span className="text-slate-800 text-xs font-bold shrink-0">Xử phạt bổ sung:</span>
                <span className="text-xs text-rose-950 font-bold text-right bg-rose-100 px-2.5 py-1 rounded-lg border border-rose-300">
                  {aiAnalysis?.additionalSanctions || entity.violationDetail?.licenseSuspension}
                </span>
              </div>
            )}
          </div>

          {aiAnalysis?.detailedExplanation && (
            <div className="text-xs text-slate-900 font-semibold bg-blue-50 border-2 border-blue-200 rounded-xl p-3.5 leading-relaxed animate-fade-in shadow-xs">
              <span className="font-black text-blue-950 block mb-1.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-700" />
                Nhận định chi tiết từ Chuyên gia AI:
              </span>
              {aiAnalysis.detailedExplanation}
            </div>
          )}
        </div>
      </div>

      {/* Export Button */}
      <button
        onClick={() => setShowNoticeModal(true)}
        className="btn w-full py-3.5 text-xs font-black text-white shadow-md transition hover:brightness-105 uppercase tracking-wider"
        style={{ background: 'var(--gradient-danger)', boxShadow: '0 4px 14px -4px rgba(239,68,68,0.5)' }}
      >
        <FileText className="w-4 h-4" />
        <span>Xuất Biên Bản Vi Phạm &amp; Bằng Chứng</span>
      </button>

      {/* Ask AI Input */}
      <form onSubmit={handleAskQuestion} className="space-y-2 pt-3 border-t border-slate-300">
        <label className="text-xs font-black text-slate-900 flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-indigo-700" />
          <span>Hỏi AI thêm về thực thể này:</span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={customQuestion}
            onChange={(e) => setCustomQuestion(e.target.value)}
            placeholder="VD: Lỗi này có bị giữ xe 7 ngày không?"
            className="input-field flex-1 py-2.5 text-xs font-semibold text-slate-950 placeholder:text-slate-500 border-2 border-slate-300 focus:border-blue-600"
          />
          <button
            type="submit"
            disabled={!customQuestion.trim() || isLoadingAI}
            className="btn btn-primary p-2.5 text-white disabled:opacity-40"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>

      {/* Notice Modal */}
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
