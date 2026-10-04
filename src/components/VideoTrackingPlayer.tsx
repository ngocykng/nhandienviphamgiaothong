import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Upload,
  Camera,
  Maximize2,
  Sliders,
  ShieldAlert,
  Car,
  AlertCircle,
  Eye,
  Crosshair,
  Sparkles,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { TrafficScenario, TrackedEntity, AIViolationAnalysis } from '../types/traffic';
import { PRESET_SCENARIOS } from '../data/presetScenarios';
import { TrafficCanvasSimulator } from './TrafficCanvasSimulator';
import { ViolationInspector } from './ViolationInspector';
import { RoboflowSettingsModal } from './RoboflowSettingsModal';
import { RoboflowInferenceResult } from '../types/traffic';
import { Cpu, Zap, Settings, RefreshCw } from 'lucide-react';

export const VideoTrackingPlayer: React.FC = () => {
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState(0);
  const scenario = PRESET_SCENARIOS[selectedScenarioIndex];

  const [currentTime, setCurrentTime] = useState(1.5);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(
    scenario.defaultSelectedEntityId || 'MOTO-88'
  );

  // Roboflow YOLOv8 Configuration
  const [showRoboflowModal, setShowRoboflowModal] = useState(false);
  const [roboflowConfig, setRoboflowConfig] = useState({
    apiKey: 'gYKfKrH2HNcdMBtoyKbb',
    modelEndpoint: 'ngoc-nguyen-ovzwb/nhan-dien-bien-bao-giao-thong-va/6',
    confidence: 40,
    overlap: 30,
    enabled: true,
  });
  const [roboflowResult, setRoboflowResult] = useState<RoboflowInferenceResult | null>(null);
  const [isScanningRoboflow, setIsScanningRoboflow] = useState(false);

  const [currentEntities, setCurrentEntities] = useState<TrackedEntity[]>([]);
  const [overlays, setOverlays] = useState({
    boxes: true,
    labels: true,
    trails: true,
    speed: true,
  });

  // AI analysis state for the currently inspected entity
  const [aiAnalysis, setAiAnalysis] = useState<AIViolationAnalysis | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [canvasCaptures, setCanvasCaptures] = useState<{
    fullFrame?: string;
    entityCrop?: string;
  }>({});

  // Custom user uploaded video state
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);
  const [isUploadedMode, setIsUploadedMode] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const simulatorRef = useRef<TrafficCanvasSimulator | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());

  // Initialize simulator
  useEffect(() => {
    if (canvasRef.current && !isUploadedMode) {
      simulatorRef.current = new TrafficCanvasSimulator(canvasRef.current);
    }
  }, [isUploadedMode, selectedScenarioIndex]);

  // When scenario changes, reset time and default entity
  useEffect(() => {
    setCurrentTime(1.0);
    setSelectedEntityId(scenario.defaultSelectedEntityId || null);
    setAiAnalysis(null);
    setAiError(null);
  }, [selectedScenarioIndex, scenario]);

  // Render loop for canvas simulation
  const renderFrame = useCallback(() => {
    if (!canvasRef.current || isUploadedMode) return;

    if (!simulatorRef.current) {
      simulatorRef.current = new TrafficCanvasSimulator(canvasRef.current);
    }

    const entities = simulatorRef.current.render(
      scenario,
      currentTime,
      selectedEntityId || undefined,
      overlays
    );
    setCurrentEntities(entities);

    // Update snapshots if we have a selected entity
    if (selectedEntityId) {
      const entity = entities.find((e) => e.id === selectedEntityId);
      if (entity) {
        const captures = simulatorRef.current.captureEntityCrop(entity);
        setCanvasCaptures(captures);
      }
    }
  }, [scenario, currentTime, selectedEntityId, overlays, isUploadedMode]);

  // Main playback animation loop
  useEffect(() => {
    if (!isPlaying) {
      renderFrame();
      return;
    }

    let running = true;
    lastTimeRef.current = performance.now();

    const loop = (now: number) => {
      if (!running) return;

      const deltaSeconds = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      setCurrentTime((prev) => {
        const next = prev + deltaSeconds * playbackSpeed;
        if (next >= scenario.duration) {
          return 0.1; // loop
        }
        return next;
      });

      renderFrame();
      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      running = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, playbackSpeed, scenario.duration, renderFrame]);

  // Handle click on canvas to select an entity
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    // Check if clicked inside any entity box
    const clickedEntity = currentEntities.find((ent) => {
      return (
        clickX >= ent.box.x &&
        clickX <= ent.box.x + ent.box.width &&
        clickY >= ent.box.y &&
        clickY <= ent.box.y + ent.box.height
      );
    });

    if (clickedEntity) {
      setSelectedEntityId(clickedEntity.id);
      setIsPlaying(false); // Pause to inspect
      triggerAIDiagnosis(clickedEntity);
    }
  };

  // Run AI analysis on the selected entity
  const triggerAIDiagnosis = async (targetEntity?: TrackedEntity, customQ?: string) => {
    const entity = targetEntity || currentEntities.find((e) => e.id === selectedEntityId);
    if (!entity) return;

    setIsLoadingAI(true);
    setAiError(null);

    try {
      // Capture current crop if simulator available
      let snapshotData = canvasCaptures.entityCrop || canvasCaptures.fullFrame;
      if (!snapshotData && simulatorRef.current) {
        const c = simulatorRef.current.captureEntityCrop(entity);
        snapshotData = c.entityCrop;
        setCanvasCaptures(c);
      }

      const res = await fetch('/api/traffic-video-detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: snapshotData || '',
          entityInfo: {
            id: entity.id,
            type: entity.label,
            speed: entity.speedKmH,
            detectedAction: entity.detectedAction,
            box: entity.box,
          },
          userQuestion:
            customQ ||
            `Xác định lỗi vi phạm và tra cứu mức phạt theo Nghị định 100/2019/NĐ-CP và Nghị định 123/2021/NĐ-CP cho phương tiện ${entity.label} (${entity.id}).`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Lỗi phân tích từ máy chủ');
      }

      setAiAnalysis(data.analysis);
    } catch (err: any) {
      console.error('Error diagnosing entity:', err);
      setAiError(err.message || 'Không thể kết nối dịch vụ AI phân tích');
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Trigger AI diagnosis when user changes selected entity
  const handleSelectEntity = (ent: TrackedEntity) => {
    setSelectedEntityId(ent.id);
    setIsPlaying(false);
    triggerAIDiagnosis(ent);
  };

  // Handle Custom Video Upload
  // Run Roboflow YOLOv8 Inference on current frame
  const handleRoboflowScan = async () => {
    setIsScanningRoboflow(true);
    try {
      let frameBase64 = canvasCaptures.fullFrame;
      if (!frameBase64 && canvasRef.current) {
        frameBase64 = canvasRef.current.toDataURL('image/jpeg', 0.9);
      }

      const activeKeyframe =
        scenario.keyframes.find((kf) => Math.abs(kf.timestamp - currentTime) <= 2.0) ||
        scenario.keyframes[0];

      const res = await fetch('/api/roboflow/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: frameBase64 || 'data:image/jpeg;base64,sample',
          modelEndpoint: roboflowConfig.modelEndpoint,
          apiKey: roboflowConfig.apiKey,
          confidence: roboflowConfig.confidence,
          overlap: roboflowConfig.overlap,
          scenarioKeyframe: activeKeyframe,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setRoboflowResult(data);
      }
    } catch (err) {
      console.error('Roboflow YOLOv8 scan error:', err);
    } finally {
      setIsScanningRoboflow(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedVideoUrl(url);
      setIsUploadedMode(true);
      setIsPlaying(false);
    }
  };

  const selectedEntity = currentEntities.find((e) => e.id === selectedEntityId) || null;

  return (
    <div className="space-y-6">
      {/* Roboflow + YOLOv8 Active Engine Banner */}
      <div className="bg-gradient-to-r from-purple-950/80 via-slate-900 to-slate-900 border border-purple-800/40 p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/20 text-purple-400 rounded-xl border border-purple-500/40">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                ĐỘNG CƠ NHẬN DIỆN: ROBOFLOW + YOLOV8
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-mono border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                {roboflowResult?.time ? `${roboflowResult.time}ms` : '32ms (Real-time)'}
              </span>
              <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 text-[10px] font-mono border border-purple-800 hidden sm:inline">
                Model: {roboflowConfig.modelEndpoint}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              YOLOv8 bám vết đối tượng với FPS cao &rarr; Chuyển tiếp thực thể sang Gemini AI đối chiếu Nghị định 100/123
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRoboflowScan}
            disabled={isScanningRoboflow}
            className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-purple-600/30 transition disabled:opacity-50"
          >
            {isScanningRoboflow ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>YOLOv8 đang quét...</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>Quét YOLOv8 Khung Hình Này</span>
              </>
            )}
          </button>

          <button
            onClick={() => setShowRoboflowModal(true)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition"
            title="Cài đặt Roboflow API Key & Model"
          >
            <Settings className="w-4 h-4 text-purple-300" />
          </button>
        </div>
      </div>

      {/* Roboflow Detections Bar if scanned */}
      {roboflowResult && roboflowResult.predictions.length > 0 && (
        <div className="bg-slate-900 border border-purple-900/50 rounded-xl p-3 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-2">
          <div className="flex items-center gap-2">
            <span className="text-purple-400 font-bold font-mono">
              [Roboflow YOLOv8: {roboflowResult.predictions.length} vật thể]:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {roboflowResult.predictions.map((p, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded bg-purple-950/60 border border-purple-800/80 text-[11px] font-mono text-purple-200"
                >
                  {p.class} ({Math.round(p.confidence * 100)}%)
                </span>
              ))}
            </div>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">
            Độ trễ xử lý: {roboflowResult.time}ms
          </span>
        </div>
      )}
      {/* Scenario / Video Selector Tabs */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-500/20 border border-blue-500/40 rounded-xl text-blue-400">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wide">
              Kịch Bản Video Giám Sát Thực Tế (Camera AI)
            </span>
            <h2 className="text-sm font-bold text-white">Chọn Tình Huống Giao Thông Hoặc Tải Video Lên</h2>
          </div>
        </div>

        {/* Preset Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {PRESET_SCENARIOS.map((sc, idx) => (
            <button
              key={sc.id}
              onClick={() => {
                setIsUploadedMode(false);
                setSelectedScenarioIndex(idx);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1.5 ${
                !isUploadedMode && selectedScenarioIndex === idx
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <span>{idx + 1}. {sc.title.split('-')[0].trim()}</span>
            </button>
          ))}

          {/* Upload Button */}
          <label className="cursor-pointer px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition">
            <Upload className="w-3.5 h-3.5 text-emerald-400" />
            <span>Tải video từ máy...</span>
            <input
              type="file"
              accept="video/mp4,video/webm"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Main Video & Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Video Canvas & Controls (7 or 8 columns) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          {/* Video Container */}
          <div className="relative bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden aspect-video flex items-center justify-center group">
            {isUploadedMode && uploadedVideoUrl ? (
              <video
                ref={videoRef}
                src={uploadedVideoUrl}
                controls
                className="w-full h-full object-contain"
              />
            ) : (
              <canvas
                ref={canvasRef}
                width={854}
                height={480}
                onClick={handleCanvasClick}
                className="w-full h-full object-contain cursor-crosshair"
              />
            )}

            {/* Click-to-inspect instruction badge */}
            <div className="absolute top-3 right-3 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-lg border border-slate-700 text-[11px] text-slate-300 flex items-center gap-1.5">
              <Crosshair className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
              <span>Nhấp vào xe để AI chẩn đoán vi phạm</span>
            </div>

            {/* In-canvas notification banner when violation moment is active */}
            {scenario.keyframes.some(
              (kf) => kf.isViolationMoment && Math.abs(currentTime - kf.timestamp) < 1.5
            ) && (
              <div className="absolute top-16 left-4 right-4 bg-red-950/80 backdrop-blur-md border border-red-800/80 rounded-xl p-3 flex items-center justify-between text-xs text-red-200 animate-pulse shadow-lg">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
                  <span className="font-semibold">
                    CẢNH BÁO VI PHẠM: Phát hiện hành vi vi phạm giao thông tại thời điểm T+
                    {currentTime.toFixed(1)}s!
                  </span>
                </div>
                <button
                  onClick={() => {
                    const violator = currentEntities.find((e) => e.status === 'VIOLATION');
                    if (violator) {
                      handleSelectEntity(violator);
                    }
                  }}
                  className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold transition shrink-0"
                >
                  Tra cứu lỗi ngay
                </button>
              </div>
            )}
          </div>

          {/* Timeline Scrubbing Bar with Violation Markers */}
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-1.5 text-white font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                THỜI GIAN: {currentTime.toFixed(1)}s / {scenario.duration.toFixed(1)}s
              </span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  Điểm vi phạm (Keyframes)
                </span>
                <span className="text-slate-500">Tốc độ: {playbackSpeed}x</span>
              </div>
            </div>

            {/* Custom Interactive Timeline Slider */}
            <div className="relative w-full py-1">
              <input
                type="range"
                min={0}
                max={scenario.duration}
                step={0.1}
                value={currentTime}
                onChange={(e) => {
                  setCurrentTime(parseFloat(e.target.value));
                  setIsPlaying(false);
                }}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />

              {/* Render Violation Markers on Timeline */}
              {scenario.keyframes
                .filter((kf) => kf.isViolationMoment)
                .map((kf, i) => {
                  const leftPercent = (kf.timestamp / scenario.duration) * 100;
                  return (
                    <button
                      key={i}
                      title={`Điểm vi phạm: ${kf.eventDescription}`}
                      onClick={() => {
                        setCurrentTime(kf.timestamp);
                        setIsPlaying(false);
                      }}
                      style={{ left: `${leftPercent}%` }}
                      className="absolute top-0 -translate-x-1/2 w-4 h-4 bg-red-500 hover:bg-red-400 border-2 border-slate-900 rounded-full shadow-lg shadow-red-500/50 cursor-pointer transform hover:scale-125 transition"
                    />
                  );
                })}
            </div>

            {/* Video Controls and Overlay Toggles */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-800">
              {/* Left Playback Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4" />
                      <span>Tạm dừng</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      <span>Phát video</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setCurrentTime(0.1)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                  title="Phát lại từ đầu"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                {/* Speed selector */}
                <div className="flex items-center bg-slate-800 rounded-xl p-0.5 text-xs text-slate-300 font-mono">
                  {[0.5, 1.0, 2.0].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => setPlaybackSpeed(spd)}
                      className={`px-2 py-1 rounded-lg transition ${
                        playbackSpeed === spd ? 'bg-blue-600 text-white font-bold' : 'hover:text-white'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Right: Layer Toggles (Boxes, Labels, Speed) */}
              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={() => setOverlays((prev) => ({ ...prev, boxes: !prev.boxes }))}
                  className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium transition ${
                    overlays.boxes
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  Khung Bounding Box
                </button>
                <button
                  onClick={() => setOverlays((prev) => ({ ...prev, labels: !prev.labels }))}
                  className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium transition ${
                    overlays.labels
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  Nhãn &amp; ID
                </button>
                <button
                  onClick={() => setOverlays((prev) => ({ ...prev, speed: !prev.speed }))}
                  className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium transition ${
                    overlays.speed
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  Tốc độ HUD
                </button>
              </div>
            </div>
          </div>

          {/* Currently Tracked Entities Bar */}
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
                <Car className="w-4 h-4 text-blue-400" />
                <span>Danh Sách Thực Thể Được Tracking Trong Khung Hình ({currentEntities.length})</span>
              </span>
              <span className="text-[11px] text-slate-400">Nhấp chọn phương tiện để AI tra cứu lỗi</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {currentEntities.map((ent) => {
                const isSelected = ent.id === selectedEntityId;
                const isViol = ent.status === 'VIOLATION';
                const isWarn = ent.status === 'WARNING';

                return (
                  <button
                    key={ent.id}
                    onClick={() => handleSelectEntity(ent)}
                    className={`p-3 rounded-xl border text-left transition flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-blue-600/20 border-blue-500 shadow-md shadow-blue-500/20'
                        : isViol
                        ? 'bg-red-950/40 border-red-800/80 hover:border-red-600'
                        : 'bg-slate-800/60 border-slate-700/80 hover:border-slate-500'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-white">#{ent.id}</span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                            isViol
                              ? 'bg-red-500 text-white'
                              : isWarn
                              ? 'bg-amber-500 text-black'
                              : 'bg-emerald-500 text-white'
                          }`}
                        >
                          {isViol ? 'VI PHẠM' : isWarn ? 'CẢNH BÁO' : 'BÌNH THƯỜNG'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 truncate mt-0.5">{ent.label}</p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {ent.speedKmH} km/h • {ent.licensePlate || 'N/A'}
                      </p>
                    </div>

                    <div className="shrink-0 p-1.5 bg-slate-900 rounded-lg text-slate-400">
                      <Eye className="w-4 h-4 text-blue-400" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: AI Violation Inspector Panel (4 or 5 columns) */}
        <div className="lg:col-span-5 xl:col-span-4">
          <ViolationInspector
            entity={selectedEntity}
            scenario={scenario}
            currentTime={currentTime}
            canvasCaptures={canvasCaptures}
            onRunAIDetection={(customQ?: string) => triggerAIDiagnosis(undefined, customQ)}
            aiAnalysis={aiAnalysis}
            isLoadingAI={isLoadingAI}
            aiError={aiError}
          />
        </div>
      </div>

      {/* Roboflow YOLOv8 Configuration Modal */}
      <RoboflowSettingsModal
        isOpen={showRoboflowModal}
        onClose={() => setShowRoboflowModal(false)}
        roboflowConfig={roboflowConfig}
        onSaveConfig={(newConfig) => {
          setRoboflowConfig(newConfig);
          // If scanned, trigger fresh scan
          handleRoboflowScan();
        }}
      />
    </div>
  );
};
