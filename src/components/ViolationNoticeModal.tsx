import React from 'react';
import { TrackedEntity, AIViolationAnalysis, TrafficScenario } from '../types/traffic';
import { ShieldAlert, Printer, X, Download, CheckCircle, ExternalLink, QrCode } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  entity: TrackedEntity;
  analysis?: AIViolationAnalysis | null;
  scenario: TrafficScenario;
  timestamp: number;
  snapshots: { fullFrame?: string; entityCrop?: string };
}

export const ViolationNoticeModal: React.FC<Props> = ({
  isOpen,
  onClose,
  entity,
  analysis,
  scenario,
  timestamp,
  snapshots,
}) => {
  if (!isOpen) return null;

  const fineText =
    analysis?.fineRange?.display ||
    (entity.violationDetail
      ? `${entity.violationDetail.fineMin.toLocaleString('vi-VN')} đ - ${entity.violationDetail.fineMax.toLocaleString('vi-VN')} đ`
      : '300.000 đ - 1.000.000 đ');

  const violationName =
    analysis?.violationName ||
    entity.violationDetail?.name ||
    entity.detectedAction ||
    'Không chấp hành quy tắc giao thông đường bộ';

  const legalClause =
    analysis?.legalClause ||
    entity.violationDetail?.clause ||
    'Nghị định 100/2019/NĐ-CP và Nghị định 123/2021/NĐ-CP';

  const additionalSanctions =
    analysis?.additionalSanctions ||
    entity.violationDetail?.licenseSuspension ||
    'Tước quyền sử dụng GPLX từ 01 tháng đến 03 tháng (nếu áp dụng)';

  const recordCode = `BB-GT-${new Date().getFullYear()}/AI-${entity.id.replace(/[^A-Za-z0-9]/g, '')}-${Math.floor(
    1000 + Math.random() * 9000
  )}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-3xl shadow-2xl overflow-hidden my-8 text-slate-950 dark:text-slate-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white p-5 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 border border-white/30 rounded-2xl text-white shadow-sm">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black px-2 py-0.5 rounded bg-black/30 text-white tracking-wider">
                  HỆ THỐNG TRÍ TUỆ NHÂN TẠO AI TRACKING
                </span>
                <span className="text-xs text-white/90 font-mono font-bold">Mã: {recordCode}</span>
              </div>
              <h2 className="text-lg font-black text-white tracking-wide mt-1">
                TRÍCH XUẤT BẰNG CHỨNG &amp; BIÊN BẢN VI PHẠM GIAO THÔNG
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Top Info Banner */}
          <div className="bg-slate-100 dark:bg-slate-800/80 border-2 border-slate-300 dark:border-slate-700 rounded-2xl p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono shadow-xs">
            <div>
              <span className="text-slate-700 dark:text-slate-300 block mb-1 font-sans font-extrabold text-[11px]">MÃ PHƯƠNG TIỆN</span>
              <span className="text-sm font-black text-blue-700 dark:text-blue-400">#{entity.id}</span>
            </div>
            <div>
              <span className="text-slate-700 dark:text-slate-300 block mb-1 font-sans font-extrabold text-[11px]">BIỂN SỐ XE</span>
              <span className="text-sm font-black text-slate-950 dark:text-white bg-amber-200 px-2 py-0.5 rounded border border-amber-400">
                {entity.licensePlate || '29E2-567.89'}
              </span>
            </div>
            <div>
              <span className="text-slate-700 dark:text-slate-300 block mb-1 font-sans font-extrabold text-[11px]">TỐC ĐỘ GHI NHẬN</span>
              <span className="text-sm font-black text-emerald-700 dark:text-emerald-400">{entity.speedKmH} km/h</span>
            </div>
            <div>
              <span className="text-slate-700 dark:text-slate-300 block mb-1 font-sans font-extrabold text-[11px]">THỜI ĐIỂM</span>
              <span className="text-sm font-black text-slate-900 dark:text-slate-100">
                T+{timestamp.toFixed(1)}s (Camera AI)
              </span>
            </div>
          </div>

          {/* Evidence Snapshots */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <span>HÌNH ẢNH TRÍCH XUẤT TỪ CAMERA PHƯƠNG TIỆN NGHIỆP VỤ</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 bg-slate-950 border-2 border-slate-800 rounded-2xl overflow-hidden relative shadow-sm">
                <span className="absolute top-2 left-2 px-2.5 py-1 rounded bg-black/80 text-[10px] text-white font-mono font-bold">
                  KHUNG HÌNH TOÀN CẢNH (FULL SCENE)
                </span>
                {snapshots.fullFrame ? (
                  <img
                    src={snapshots.fullFrame}
                    alt="Toàn cảnh vi phạm"
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 flex items-center justify-center text-slate-400 text-xs font-bold">
                    Hình ảnh toàn cảnh sẵn sàng
                  </div>
                )}
              </div>
              <div className="bg-slate-950 border-2 border-slate-800 rounded-2xl overflow-hidden relative shadow-sm">
                <span className="absolute top-2 left-2 px-2.5 py-1 rounded bg-rose-950 text-[10px] text-rose-200 font-mono font-bold border border-rose-700">
                  CẬN CẢNH ĐỐI TƯỢNG (ROI CROP)
                </span>
                {snapshots.entityCrop ? (
                  <img
                    src={snapshots.entityCrop}
                    alt="Cận cảnh thực thể"
                    className="w-full h-48 object-contain bg-slate-950 p-2"
                  />
                ) : (
                  <div className="w-full h-48 flex items-center justify-center text-slate-400 text-xs font-bold">
                    Ảnh cắt thực thể
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Legal Diagnosis */}
          <div className="bg-slate-50 dark:bg-slate-800/60 border-2 border-slate-300 dark:border-slate-700 rounded-2xl p-5 space-y-4 shadow-sm">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-rose-700 dark:text-rose-400 block mb-1">
                HÀNH VI VI PHẠM PHÁT HIỆN QUA AI VISION
              </span>
              <h4 className="text-base font-black text-slate-950 dark:text-white">{violationName}</h4>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-medium mt-1 leading-relaxed">
                {analysis?.entityIdentified?.behaviorObserved ||
                  entity.detectedAction ||
                  'Hệ thống Computer Vision tự động theo dõi quỹ đạo và đối chiếu tín hiệu giao thông phát hiện hành vi không tuân thủ quy tắc an toàn giao thông.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-200 dark:border-slate-700">
              <div>
                <span className="text-xs text-slate-800 dark:text-slate-200 block mb-1 font-bold">
                  CĂN CỨ PHÁP LÝ XỬ PHẠT
                </span>
                <p className="text-xs text-amber-950 font-bold bg-amber-100 p-2.5 rounded-xl border border-amber-300">
                  {legalClause}
                </p>
              </div>
              <div>
                <span className="text-xs text-slate-800 dark:text-slate-200 block mb-1 font-bold">
                  MỨC TIỀN PHẠT QUY ĐỊNH
                </span>
                <p className="text-lg font-black text-emerald-800 bg-emerald-100 p-2 rounded-xl border border-emerald-300 font-mono">
                  {fineText}
                </p>
              </div>
            </div>

            <div className="pt-2">
              <span className="text-xs text-slate-800 dark:text-slate-200 block mb-1 font-bold">
                HÌNH THỨC XỬ PHẠT BỔ SUNG &amp; BIỆN PHÁP KHẮC PHỤC
              </span>
              <p className="text-xs text-rose-950 font-bold bg-rose-100 p-2.5 rounded-xl border border-rose-300">
                {additionalSanctions}
              </p>
            </div>

            {analysis?.detailedExplanation && (
              <div className="pt-2">
                <span className="text-xs text-slate-800 dark:text-slate-200 block mb-1 font-bold">
                  ĐÁNH GIÁ CHI TIẾT TỪ CHUYÊN GIA AI
                </span>
                <p className="text-xs text-slate-900 dark:text-slate-100 font-medium leading-relaxed bg-blue-50 dark:bg-blue-950/40 p-3 rounded-xl border-2 border-blue-200 dark:border-blue-800">
                  {analysis.detailedExplanation}
                </p>
              </div>
            )}
          </div>

          {/* Action / Next steps guidance */}
          <div className="bg-blue-50 dark:bg-blue-950/40 border-2 border-blue-200 dark:border-blue-800 rounded-2xl p-4 flex items-start gap-3 shadow-xs">
            <CheckCircle className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-800 dark:text-slate-200 space-y-1">
              <p className="font-bold text-blue-900 dark:text-blue-300">
                Hướng dẫn tra cứu phạt nguội và nộp phạt trực tuyến:
              </p>
              <p className="font-medium">
                Người vi phạm có thể tra cứu thông tin phạt nguội chính thức tại Cổng thông tin Cục CSGT{' '}
                <a
                  href="https://csgt.vn/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-700 dark:text-blue-400 font-bold underline"
                >
                  csgt.vn
                </a>{' '}
                hoặc nộp phạt điện tử qua Cổng Dịch vụ công Quốc gia{' '}
                <a
                  href="https://dichvucong.gov.vn"
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-700 dark:text-blue-400 font-bold underline"
                >
                  dichvucong.gov.vn
                </a>
                .
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-100 dark:bg-slate-950 border-t-2 border-slate-200 dark:border-slate-800 p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-400 font-mono font-bold">
            <QrCode className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            <span>Xác thực bởi VietTraffic AI System</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 border-2 border-slate-300 dark:border-slate-700 transition shadow-xs"
            >
              <Printer className="w-4 h-4 text-slate-700" />
              <span>In Biên Bản / Tải PDF</span>
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-black text-white shadow-md transition"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
