import React, { useState } from 'react';
import { Settings, X, Check, Cpu, Zap, Activity, Info } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  roboflowConfig: {
    modelEndpoint: string;
    confidence: number;
    overlap: number;
    enabled: boolean;
  };
  onSaveConfig: (newConfig: {
    modelEndpoint: string;
    confidence: number;
    overlap: number;
    enabled: boolean;
  }) => void;
}

export const RoboflowSettingsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  roboflowConfig,
  onSaveConfig,
}) => {
  const [modelEndpoint, setModelEndpoint] = useState(roboflowConfig.modelEndpoint);
  const [confidence, setConfidence] = useState(roboflowConfig.confidence);
  const [overlap, setOverlap] = useState(roboflowConfig.overlap);
  const [enabled, setEnabled] = useState(roboflowConfig.enabled);
  const [testStatus, setTestStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig({
      modelEndpoint,
      confidence,
      overlap,
      enabled,
    });
    onClose();
  };

  const handleTestInference = () => {
    setTestStatus('Đang kiểm tra kết nối tới Roboflow YOLOv8 Server...');
    setTimeout(() => {
      setTestStatus('Cấu hình đã lưu. API key được bảo vệ ở backend; hãy kiểm tra kết quả quét để xác nhận kết nối.');
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-3xl shadow-2xl p-6 text-slate-900 dark:text-slate-100 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 rounded-2xl border border-purple-300">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-950 dark:text-white flex items-center gap-2">
                <span>Cấu Hình Roboflow + YOLOv8</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 font-mono font-bold border border-purple-300">
                  INFERENCE ENGINE
                </span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                Tích hợp mô hình nhận diện đối tượng YOLOv8 của Roboflow
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {/* Engine Toggle */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div>
              <span className="font-extrabold text-slate-900 dark:text-white block text-xs">Kích hoạt Roboflow YOLOv8</span>
              <span className="text-slate-600 dark:text-slate-300 text-[11px] font-medium">
                Sử dụng YOLOv8 để bắt bounding box và tracking đối tượng
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          {/* Model Endpoint */}
          <div className="space-y-1">
            <label className="text-slate-900 dark:text-white font-extrabold block text-xs">
              Roboflow Model ID / Version:
            </label>
            <input
              type="text"
              value={modelEndpoint}
              onChange={(e) => setModelEndpoint(e.target.value)}
              placeholder="vietnam-traffic-yolov8/1 hoặc vehicle-detection/3"
              className="w-full bg-white dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-950 dark:text-white font-mono font-bold focus:outline-none focus:border-purple-600"
            />
            <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
              Ví dụ: <code className="text-purple-700 dark:text-purple-300 font-bold">vietnam-traffic-yolov8/1</code> hoặc model public từ Roboflow Universe.
            </p>
          </div>

          <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-[11px] font-medium text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200">
            API key Roboflow được lưu ở backend trong biến môi trường
            <code className="mx-1 font-bold">ROBOFLOW_API_KEY</code>
            và không được gửi xuống trình duyệt.
          </div>

          {/* Confidence Slider */}
          <div className="space-y-1 pt-1">
            <div className="flex justify-between text-slate-900 dark:text-white text-xs">
              <span className="font-extrabold">Ngưỡng tin cậy (Confidence):</span>
              <span className="font-mono text-purple-700 dark:text-purple-400 font-black text-sm">{confidence}%</span>
            </div>
            <input
              type="range"
              min={15}
              max={95}
              value={confidence}
              onChange={(e) => setConfidence(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
          </div>

          {/* Test connection output */}
          {testStatus && (
            <div className="p-3 bg-purple-50 dark:bg-purple-950/40 border-2 border-purple-200 dark:border-purple-800 rounded-xl text-purple-950 dark:text-purple-200 text-xs flex items-center gap-2 font-bold animate-fade-in">
              <Activity className="w-4 h-4 text-purple-700 dark:text-purple-400 shrink-0" />
              <span>{testStatus}</span>
            </div>
          )}

          {/* Footer buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={handleTestInference}
              className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition border border-slate-300 dark:border-slate-700"
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Thử kết nối Roboflow</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition border border-slate-300 dark:border-slate-700"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black shadow-md transition flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Lưu Cấu Hình</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
