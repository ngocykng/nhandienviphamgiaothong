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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-8 text-slate-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-950 via-slate-900 to-slate-900 border-b border-red-900/40 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-500/20 border border-red-500/40 rounded-xl text-red-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
                  HỆ THỐNG TRÍ TUỆ NHÂN TẠO AI TRACKING
                </span>
                <span className="text-xs text-slate-400 font-mono">Mã: {recordCode}</span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-wide mt-1">
                TRÍCH XUẤT BẰNG CHỨNG &amp; BIÊN BẢN VI PHẠM GIAO THÔNG
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Top Info Banner */}
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
            <div>
              <span className="text-slate-400 block mb-1">MÃ PHƯƠNG TIỆN</span>
              <span className="text-sm font-bold text-blue-400">#{entity.id}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">BIỂN SỐ NHẬN DIỆN</span>
              <span className="text-sm font-bold text-amber-300">
                {entity.licensePlate || '29E2-567.89'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">TỐC ĐỘ GHI NHẬN</span>
              <span className="text-sm font-bold text-emerald-400">{entity.speedKmH} km/h</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">THỜI ĐIỂM XẢY RA</span>
              <span className="text-sm font-bold text-slate-200">
                T+{timestamp.toFixed(1)}s (Camera AI)
              </span>
            </div>
          </div>

          {/* Evidence Snapshots */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <span>HÌNH ẢNH TRÍCH XUẤT TỪ CAMERA PHƯƠNG TIỆN NGHIỆP VỤ</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden relative">
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[10px] text-slate-300 font-mono">
                  KHUNG HÌNH TOÀN CẢNH (FULL SCENE)
                </span>
                {snapshots.fullFrame ? (
                  <img
                    src={snapshots.fullFrame}
                    alt="Toàn cảnh vi phạm"
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 flex items-center justify-center text-slate-500 text-xs">
                    Hình ảnh toàn cảnh sẵn sàng
                  </div>
                )}
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden relative">
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-red-950/80 text-[10px] text-red-300 font-mono border border-red-800/50">
                  CẬN CẢNH ĐỐI TƯỢNG (ROI CROP)
                </span>
                {snapshots.entityCrop ? (
                  <img
                    src={snapshots.entityCrop}
                    alt="Cận cảnh thực thể"
                    className="w-full h-48 object-contain bg-slate-950 p-2"
                  />
                ) : (
                  <div className="w-full h-48 flex items-center justify-center text-slate-500 text-xs">
                    Ảnh cắt thực thể
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Legal Diagnosis */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800/80 border border-slate-700/80 rounded-xl p-5 space-y-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-red-400 block mb-1">
                HÀNH VI VI PHẠM PHÁT HIỆN QUA AI VISION
              </span>
              <h4 className="text-base font-bold text-white">{violationName}</h4>
              <p className="text-xs text-slate-300 mt-1">
                {analysis?.entityIdentified?.behaviorObserved ||
                  entity.detectedAction ||
                  'Hệ thống Computer Vision tự động theo dõi quỹ đạo và đối chiếu tín hiệu giao thông phát hiện hành vi không tuân thủ quy tắc an toàn giao thông.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-700/50">
              <div>
                <span className="text-xs text-slate-400 block mb-1 font-semibold">
                  CĂN CỨ PHÁP LÝ XỬ PHẠT
                </span>
                <p className="text-xs text-amber-300 bg-amber-950/30 p-2.5 rounded-lg border border-amber-800/40">
                  {legalClause}
                </p>
              </div>
              <div>
                <span className="text-xs text-slate-400 block mb-1 font-semibold">
                  MỨC TIỀN PHẠT QUY ĐỊNH
                </span>
                <p className="text-lg font-bold text-emerald-400 bg-emerald-950/30 p-2 rounded-lg border border-emerald-800/40">
                  {fineText}
                </p>
              </div>
            </div>

            <div className="pt-2">
              <span className="text-xs text-slate-400 block mb-1 font-semibold">
                HÌNH THỨC XỬ PHẠT BỔ SUNG &amp; BIỆN PHÁP KHẮC PHỤC
              </span>
              <p className="text-xs text-slate-300 bg-slate-800 p-2.5 rounded-lg border border-slate-700">
                {additionalSanctions}
              </p>
            </div>

            {analysis?.detailedExplanation && (
              <div className="pt-2">
                <span className="text-xs text-slate-400 block mb-1 font-semibold">
                  ĐÁNH GIÁ CHI TIẾT TỪ CHUYÊN GIA AI
                </span>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                  {analysis.detailedExplanation}
                </p>
              </div>
            )}
          </div>

          {/* Action / Next steps guidance */}
          <div className="bg-blue-950/30 border border-blue-900/40 rounded-xl p-4 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300 space-y-1">
              <p className="font-semibold text-blue-300">
                Hướng dẫn tra cứu phạt nguội và nộp phạt trực tuyến:
              </p>
              <p>
                Người vi phạm có thể tra cứu thông tin phạt nguội chính thức tại Cổng thông tin Cục CSGT{' '}
                <a
                  href="https://csgt.vn/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-400 underline hover:text-blue-300"
                >
                  csgt.vn
                </a>{' '}
                hoặc nộp phạt điện tử qua Cổng Dịch vụ công Quốc gia{' '}
                <a
                  href="https://dichvucong.gov.vn"
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-400 underline hover:text-blue-300"
                >
                  dichvucong.gov.vn
                </a>
                .
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-950 border-t border-slate-800 p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <QrCode className="w-4 h-4 text-slate-300" />
            <span>Xác thực bởi VietTraffic AI System</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-2 border border-slate-600 transition"
            >
              <Printer className="w-4 h-4" />
              <span>In Biên Bản / Tải PDF</span>
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-semibold text-white shadow-lg shadow-red-600/30 transition"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
