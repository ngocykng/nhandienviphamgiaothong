import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Upload,
  Camera,
  Sliders,
  ShieldAlert,
  Car,
  Eye,
  Crosshair,
  Sparkles,
  CheckCircle2,
  Cpu,
  Zap,
  Settings,
  RefreshCw,
  Layers,
  Tag,
  Gauge,
} from 'lucide-react';
import { TrafficScenario, TrackedEntity, AIViolationAnalysis } from '../types/traffic';
import { PRESET_SCENARIOS } from '../data/presetScenarios';
import { TrafficCanvasSimulator } from './TrafficCanvasSimulator';
import { ViolationInspector } from './ViolationInspector';
import { RoboflowSettingsModal } from './RoboflowSettingsModal';
import { RoboflowInferenceResult } from '../types/traffic';

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
    modelEndpoint: '',
    confidence: 40,
    overlap: 30,
    enabled: true,
  });
  const [roboflowResult, setRoboflowResult] = useState<RoboflowInferenceResult | null>(null);
  const [isScanningRoboflow, setIsScanningRoboflow] = useState(false);
  const [uploadedVideoError, setUploadedVideoError] = useState<string | null>(null);

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
  const videoFrameCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const detectionOverlayRef = useRef<HTMLCanvasElement | null>(null);
  const simulatorRef = useRef<TrafficCanvasSimulator | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());

  // Initialize simulator
  useEffect(() => {
    if (canvasRef.current && !isUploadedMode) {
      simulatorRef.current = new TrafficCanvasSimulator(canvasRef.current);
    }
  }, [isUploadedMode, selectedScenarioIndex]);

  // When scenario changes, reset everything fundamentally
  useEffect(() => {
    // 1. Reset timing and selection
    setCurrentTime(1.0);
    setSelectedEntityId(scenario.defaultSelectedEntityId || null);

    // 2. Clear AI analysis and errors
    setAiAnalysis(null);
    setAiError(null);

    // 3. Wipe all entity and detection data
    setCurrentEntities([]);
    setRoboflowResult(null);

    // 4. Force re-initialize the simulator to clear its internal state/cache
    if (canvasRef.current && !isUploadedMode) {
      simulatorRef.current = new TrafficCanvasSimulator(canvasRef.current);
    }
  }, [selectedScenarioIndex, scenario, isUploadedMode]);

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

  // Helper to sync Roboflow predictions with the Tracking list
  const updateEntitiesFromPredictions = useCallback((predictions: any[]) => {
    const detectedEntities: TrackedEntity[] = predictions.map((p: any, idx: number) => ({
      id: `RF-${Date.now()}-${idx}`,
      type: p.class === 'car' ? 'car' : p.class === 'motorcycle' ? 'motorbike' : 'car',
      label: `${p.class} (AI Detected)`,
      confidence: p.confidence,
      speedKmH: Math.floor(Math.random() * 20) + 30,
      status: 'NORMAL',
      licensePlate: 'Unknown',
      box: {
        x: p.x - p.width / 2,
        y: p.y - p.height / 2,
        width: p.width,
        height: p.height,
      },
    }));

    setCurrentEntities((prev) => {
      if (isUploadedMode) return detectedEntities;
      return [...prev, ...detectedEntities];
    });
  }, [isUploadedMode]);

  // Run Roboflow YOLOv8 Inference on current frame
  const handleRoboflowScan = async () => {
    setIsScanningRoboflow(true);
    try {
      let frameBase64 = canvasCaptures.fullFrame;
      if (!frameBase64 && canvasRef.current) {
        frameBase64 = canvasRef.current.toDataURL('image/jpeg', 0.9);
      }

      const res = await fetch('/api/roboflow/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: frameBase64 || 'data:image/jpeg;base64,sample',
          modelEndpoint: roboflowConfig.modelEndpoint,
          confidence: roboflowConfig.confidence,
          overlap: roboflowConfig.overlap,
          // Only send scenarioKeyframe if we are NOT in uploaded mode
          ...(!isUploadedMode && {
            scenarioKeyframe: scenario.keyframes.find((kf) => Math.abs(kf.timestamp - currentTime) <= 2.0) || scenario.keyframes[0],
          }),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setRoboflowResult(data);
        updateEntitiesFromPredictions(data.predictions || []);
      }
    } catch (err) {
      console.error('Roboflow YOLOv8 scan error:', err);
    } finally {
      setIsScanningRoboflow(false);
    }
  };

  const scanUploadedVideoFrame = useCallback(async () => {
    const video = videoRef.current;
    const frameCanvas = videoFrameCanvasRef.current;
    const overlay = detectionOverlayRef.current;
    if (!video || !frameCanvas || !overlay || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;

    const width = video.videoWidth;
    const height = video.videoHeight;
    if (!width || !height) return;

    frameCanvas.width = width;
    frameCanvas.height = height;
    overlay.width = width;
    overlay.height = height;
    const frameContext = frameCanvas.getContext('2d');
    const overlayContext = overlay.getContext('2d');
    if (!frameContext || !overlayContext) return;

    frameContext.drawImage(video, 0, 0, width, height);
    const frameBase64 = frameCanvas.toDataURL('image/jpeg', 0.82);

    try {
      const response = await fetch('/api/roboflow/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: frameBase64,
          modelEndpoint: roboflowConfig.modelEndpoint,
          confidence: roboflowConfig.confidence,
          overlap: roboflowConfig.overlap,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || data.detail || 'Không thể nhận diện khung hình');

      overlayContext.clearRect(0, 0, width, height);
      overlayContext.lineWidth = Math.max(2, width / 400);
      overlayContext.font = `${Math.max(14, width / 55)}px sans-serif`;
      for (const prediction of data.predictions || []) {
        const left = prediction.x - prediction.width / 2;
        const top = prediction.y - prediction.height / 2;
        overlayContext.strokeStyle = '#22c55e';
        overlayContext.fillStyle = '#22c55e';
        overlayContext.strokeRect(left, top, prediction.width, prediction.height);
        const label = `${prediction.class} ${(prediction.confidence * 100).toFixed(0)}%`;
        const labelWidth = overlayContext.measureText(label).width + 12;
        overlayContext.fillRect(left, Math.max(0, top - 28), labelWidth, 28);
        overlayContext.fillStyle = '#07111f';
        overlayContext.fillText(label, left + 6, Math.max(20, top - 8));
      }
      setRoboflowResult(data);
      updateEntitiesFromPredictions(data.predictions || []);
      setUploadedVideoError(null);
    } catch (error) {
      setUploadedVideoError(error instanceof Error ? error.message : 'Không thể nhận diện video');
    }
  }, [roboflowConfig, updateEntitiesFromPredictions]);

  useEffect(() => {
    if (!isUploadedMode || !uploadedVideoUrl) return;
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleLoadedMetadata = () => {
      setCurrentTime(0);
      void scanUploadedVideoFrame();
    };
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    const timer = window.setInterval(() => {
      if (!video.paused && !video.ended) {
        setCurrentTime(video.currentTime);
        void scanUploadedVideoFrame();
      }
    }, 700);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      window.clearInterval(timer);
    };
  }, [isUploadedMode, uploadedVideoUrl, scanUploadedVideoFrame]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedVideoUrl(url);
      setIsUploadedMode(true);
      setIsPlaying(false);
      setUploadedVideoError(null);
      setRoboflowResult(null);
    }
  };

  const selectedEntity = currentEntities.find((e) => e.id === selectedEntityId) || null;

  return (
    <div className="space-y-5">
      {/* Roboflow + YOLOv8 Engine Banner */}
      <div className="glass rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 animate-fade-in border border-slate-300 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-md" style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black text-slate-950 dark:text-white uppercase tracking-wider">
                ROBOFLOW + YOLOV8
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-950 border border-emerald-300">
                <div className="status-dot online" style={{ width: '5px', height: '5px' }} />
                {roboflowResult?.time ? `${roboflowResult.time}ms` : '32ms'}
              </span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 font-medium mt-0.5">
              YOLOv8 tracking → Gemini AI đối chiếu Nghị định 100/123
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRoboflowScan}
            disabled={isScanningRoboflow}
            className="btn text-xs py-2 font-bold disabled:opacity-50 text-white"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', boxShadow: '0 4px 14px -4px rgba(139,92,246,0.5)' }}
          >
            {isScanningRoboflow ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Đang quét...</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>Quét YOLOv8</span>
              </>
            )}
          </button>

          <button
            onClick={() => setShowRoboflowModal(true)}
            className="btn btn-ghost p-2.5 border-2 border-slate-300 shadow-xs"
            title="Cài đặt Roboflow"
          >
            <Settings className="w-4 h-4 text-purple-700 dark:text-purple-300" />
          </button>
        </div>
      </div>

      {/* Roboflow Detections Bar */}
      {roboflowResult && roboflowResult.predictions.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-300 rounded-xl p-3 flex flex-wrap items-center justify-between text-xs text-slate-800 gap-2 animate-fade-in shadow-xs">
          <div className="flex items-center gap-2">
            <span className="text-purple-900 dark:text-purple-300 font-black font-mono text-xs">
              [YOLOv8: {roboflowResult.predictions.length} vật thể]:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {roboflowResult.predictions.map((p, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-lg text-xs font-mono font-bold bg-purple-100 text-purple-950 border border-purple-300"
                >
                  {p.class} ({Math.round(p.confidence * 100)}%)
                </span>
              ))}
            </div>
          </div>
          <span className="text-xs text-slate-700 dark:text-slate-400 font-mono font-bold">
            {roboflowResult.time}ms
          </span>
        </div>
      )}

      {/* Scenario Selector */}
      <div className="glass rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 animate-fade-in border border-slate-300 shadow-sm" style={{ animationDelay: '60ms' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-blue-100 text-blue-700 border-2 border-blue-200">
            <Camera className="w-5 h-5 text-blue-700" />
          </div>
          <div>
            <span className="text-[11px] font-black text-blue-700 uppercase tracking-wider">
              KỊCH BẢN VIDEO GIÁM SÁT
            </span>
            <h2 className="text-sm font-black text-slate-950 dark:text-white">Chọn Tình Huống Hoặc Tải Video</h2>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {PRESET_SCENARIOS.map((sc, idx) => (
            <button
              key={sc.id}
              onClick={() => {
                setIsUploadedMode(false);
                setSelectedScenarioIndex(idx);
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                !isUploadedMode && selectedScenarioIndex === idx
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-blue-400 shadow-xs'
              }`}
            >
              <span>{idx + 1}. {sc.title.split('-')[0].trim()}</span>
            </button>
          ))}

          <label className="btn btn-ghost text-xs py-2 cursor-pointer font-bold border-2 border-slate-300">
            <Upload className="w-3.5 h-3.5 text-emerald-600" />
            <span>Tải video...</span>
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Side: Video Canvas & Controls */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          {/* Video Container */}
          <div className="relative rounded-2xl overflow-hidden group bg-slate-950 border-2 border-slate-800 shadow-lg">
            <div className="aspect-video flex items-center justify-center">
              {isUploadedMode && uploadedVideoUrl ? (
                <div className="relative w-full h-full">
                  <video
                    ref={videoRef}
                    src={uploadedVideoUrl}
                    controls
                    className="w-full h-full object-contain"
                  />
                  <canvas
                    ref={detectionOverlayRef}
                    className="pointer-events-none absolute inset-0 h-full w-full object-contain"
                  />
                  <canvas ref={videoFrameCanvasRef} className="hidden" />
                  {uploadedVideoError && (
                    <div className="absolute bottom-14 left-3 right-3 rounded-xl border border-amber-400 bg-amber-950/90 px-3 py-2 text-xs font-semibold text-amber-100">
                      Chưa nhận diện được video: {uploadedVideoError}
                    </div>
                  )}
                </div>
              ) : (
                <canvas
                  ref={canvasRef}
                  width={854}
                  height={480}
                  onClick={handleCanvasClick}
                  className="w-full h-full object-contain cursor-crosshair"
                />
              )}
            </div>

            {/* Click-to-inspect hint */}
            <div className="absolute top-3 right-3 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-slate-900/90 border border-slate-700 px-3 py-1.5 rounded-xl text-xs text-white font-bold flex items-center gap-1.5 shadow-md">
              <Crosshair className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
              <span>Nhấp vào xe để AI chẩn đoán</span>
            </div>

            {/* Violation alert */}
            {scenario.keyframes.some(
              (kf) => kf.isViolationMoment && Math.abs(currentTime - kf.timestamp) < 1.5
            ) && (
              <div className="absolute top-14 left-4 right-4 rounded-xl p-3 flex items-center justify-between text-xs animate-pulse bg-red-950/90 border-2 border-red-500 text-red-100 font-bold shadow-lg">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
                  <span>
                    CẢNH BÁO: Phát hiện vi phạm tại T+{currentTime.toFixed(1)}s!
                  </span>
                </div>
                <button
                  onClick={() => {
                    const violator = currentEntities.find((e) => e.status === 'VIOLATION');
                    if (violator) {
                      handleSelectEntity(violator);
                    }
                  }}
                  className="btn text-xs py-1.5 px-3 shrink-0 font-black text-white"
                  style={{ background: 'var(--gradient-danger)' }}
                >
                  Tra cứu lỗi
                </button>
              </div>
            )}
          </div>

          {/* Timeline Controls */}
          <div className="glass rounded-2xl p-4 space-y-3 border border-slate-300 shadow-sm">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="flex items-center gap-2 text-slate-950 dark:text-white font-black text-sm">
                <div className="status-dot online" style={{ width: '6px', height: '6px' }} />
                {currentTime.toFixed(1)}s / {scenario.duration.toFixed(1)}s
              </span>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-xs text-slate-900 dark:text-white font-extrabold">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--gradient-danger)' }} />
                  Điểm vi phạm
                </span>
                <span className="text-slate-900 dark:text-white font-bold">{playbackSpeed}x</span>
              </div>
            </div>

            {/* Timeline Slider */}
            <div className="relative w-full py-2">
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
                className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-blue-600 bg-slate-200 dark:bg-slate-700"
              />

              {/* Violation Markers */}
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
                      style={{ left: `${leftPercent}%`, background: 'var(--gradient-danger)' }}
                      className="absolute top-1 -translate-x-1/2 w-4 h-4 rounded-full cursor-pointer transform hover:scale-125 transition-transform border-2 border-white shadow-md"
                    />
                  );
                })}
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="btn btn-primary text-xs py-2 font-bold text-white shadow-sm"
                >
                  {isPlaying ? (
                    <><Pause className="w-4 h-4" /><span>Dừng</span></>
                  ) : (
                    <><Play className="w-4 h-4" /><span>Phát</span></>
                  )}
                </button>

                <button
                  onClick={() => setCurrentTime(0.1)}
                  className="btn btn-ghost p-2 border border-slate-300"
                  title="Phát lại từ đầu"
                >
                  <RotateCcw className="w-4 h-4 text-slate-700" />
                </button>

                <div className="flex items-center p-0.5 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">
                  {[0.5, 1.0, 2.0].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => setPlaybackSpeed(spd)}
                      className={`px-2.5 py-1.5 rounded-lg font-bold transition-all ${
                        playbackSpeed === spd
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-700 dark:text-slate-300 hover:text-blue-600'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Layer Toggles */}
              <div className="flex items-center gap-1.5 text-xs">
                {[
                  { key: 'boxes' as const, icon: Layers, label: 'Box' },
                  { key: 'labels' as const, icon: Tag, label: 'Nhãn' },
                  { key: 'speed' as const, icon: Gauge, label: 'Tốc độ' },
                ].map(({ key, icon: Icon, label }) => (
                  <button
                    key={key}
                    onClick={() => setOverlays((prev) => ({ ...prev, [key]: !prev[key] }))}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                      overlays[key]
                        ? 'bg-blue-100 text-blue-900 border-2 border-blue-400 shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-2 border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tracked Entities */}
          <div className="glass rounded-2xl p-4 space-y-3 border border-slate-300 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-950 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Car className="w-4 h-4 text-blue-700" />
                <span>Thực Thể Tracking ({currentEntities.length})</span>
              </span>
              <span className="text-xs text-slate-700 dark:text-slate-300 font-bold">Nhấp chọn để AI phân tích</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 stagger-children">
              {currentEntities.map((ent) => {
                const isSelected = ent.id === selectedEntityId;
                const isViol = ent.status === 'VIOLATION';
                const isWarn = ent.status === 'WARNING';

                return (
                  <button
                    key={ent.id}
                    onClick={() => handleSelectEntity(ent)}
                    className={`p-3 rounded-xl text-left transition-all flex items-center justify-between gap-2 card-interactive ${
                      isSelected
                        ? 'bg-blue-50 border-2 border-blue-600 shadow-md ring-2 ring-blue-400'
                        : isViol
                        ? 'bg-rose-50 border-2 border-rose-300 shadow-xs'
                        : isWarn
                        ? 'bg-amber-50 border-2 border-amber-300 shadow-xs'
                        : 'bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 shadow-xs'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-black text-slate-950 dark:text-white">#{ent.id}</span>
                        <span
                          className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                            isViol
                              ? 'bg-rose-100 text-rose-950 border border-rose-400'
                              : isWarn
                              ? 'bg-amber-100 text-amber-950 border border-amber-400'
                              : 'bg-emerald-100 text-emerald-950 border border-emerald-400'
                          }`}
                        >
                          {isViol ? 'VI PHẠM' : isWarn ? 'CẢNH BÁO' : 'OK'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-800 dark:text-slate-200 font-bold truncate mt-0.5">{ent.label}</p>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 font-mono font-semibold">
                        {ent.speedKmH} km/h • {ent.licensePlate || 'N/A'}
                      </p>
                    </div>

                    <div className="shrink-0 p-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                      <Eye className="w-3.5 h-3.5" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: AI Inspector */}
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

      {/* Roboflow Settings Modal */}
      <RoboflowSettingsModal
        isOpen={showRoboflowModal}
        onClose={() => setShowRoboflowModal(false)}
        roboflowConfig={roboflowConfig}
        onSaveConfig={(newConfig) => {
          setRoboflowConfig(newConfig);
          handleRoboflowScan();
        }}
      />
    </div>
  );
};
