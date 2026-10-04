import { TrafficScenario, TrackedEntity } from '../types/traffic';

export class TrafficCanvasSimulator {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Canvas 2D context not available');
    }
    this.ctx = context;
  }

  public render(
    scenario: TrafficScenario,
    currentTime: number,
    selectedEntityId?: string,
    showOverlays: {
      boxes: boolean;
      labels: boolean;
      trails: boolean;
      speed: boolean;
    } = { boxes: true, labels: true, trails: true, speed: true }
  ): TrackedEntity[] {
    const { width, height } = this.canvas;
    const ctx = this.ctx;

    // Clear
    ctx.clearRect(0, 0, width, height);

    // Interpolate or pick current keyframe & entities
    const currentKeyframe = this.getCurrentKeyframe(scenario, currentTime);
    const entities = this.interpolateEntities(scenario, currentTime);

    // 1. Draw Environment (Road, Lines, Traffic Lights)
    this.drawEnvironment(scenario, currentKeyframe?.trafficLightState || 'GREEN', width, height);

    // 2. Draw Moving Vehicles & Entities
    entities.forEach((entity) => {
      this.drawVehicle(entity, width, height);
    });

    // 3. Draw AI Computer Vision Tracking Overlays
    if (showOverlays.boxes) {
      entities.forEach((entity) => {
        const isSelected = entity.id === selectedEntityId;
        this.drawEntityOverlay(entity, isSelected, showOverlays, width, height);
      });
    }

    // 4. Draw CCTV HUD / Telemetry Watermark
    this.drawCCTVMeta(scenario, currentTime, width, height);

    return entities;
  }

  private getCurrentKeyframe(scenario: TrafficScenario, currentTime: number) {
    let activeKeyframe = scenario.keyframes[0];
    for (const kf of scenario.keyframes) {
      if (currentTime >= kf.timestamp) {
        activeKeyframe = kf;
      }
    }
    return activeKeyframe;
  }

  private interpolateEntities(scenario: TrafficScenario, currentTime: number): TrackedEntity[] {
    // Find closest keyframes around currentTime
    const keyframes = scenario.keyframes;
    if (keyframes.length === 0) return [];
    if (keyframes.length === 1) return keyframes[0].entities;

    let prevKf = keyframes[0];
    let nextKf = keyframes[keyframes.length - 1];

    for (let i = 0; i < keyframes.length; i++) {
      if (keyframes[i].timestamp <= currentTime) {
        prevKf = keyframes[i];
      }
      if (keyframes[i].timestamp >= currentTime) {
        nextKf = keyframes[i];
        break;
      }
    }

    const tSpan = Math.max(0.001, nextKf.timestamp - prevKf.timestamp);
    const alpha = Math.min(1, Math.max(0, (currentTime - prevKf.timestamp) / tSpan));

    // Combine entities
    const entityMap = new Map<string, TrackedEntity>();

    prevKf.entities.forEach((prevEntity) => {
      const nextEntity = nextKf.entities.find((e) => e.id === prevEntity.id);
      if (nextEntity) {
        // Interpolate position and speed
        const box = {
          x: prevEntity.box.x + (nextEntity.box.x - prevEntity.box.x) * alpha,
          y: prevEntity.box.y + (nextEntity.box.y - prevEntity.box.y) * alpha,
          width: prevEntity.box.width + (nextEntity.box.width - prevEntity.box.width) * alpha,
          height: prevEntity.box.height + (nextEntity.box.height - prevEntity.box.height) * alpha,
        };
        const speed = Math.round(prevEntity.speedKmH + (nextEntity.speedKmH - prevEntity.speedKmH) * alpha);
        const status = alpha > 0.5 ? nextEntity.status : prevEntity.status;
        const detectedAction = nextEntity.detectedAction || prevEntity.detectedAction;

        entityMap.set(prevEntity.id, {
          ...nextEntity,
          speedKmH: speed,
          status,
          box,
          detectedAction,
        });
      } else {
        entityMap.set(prevEntity.id, prevEntity);
      }
    });

    return Array.from(entityMap.values());
  }

  private drawEnvironment(scenario: TrafficScenario, lightState: 'RED' | 'YELLOW' | 'GREEN', w: number, h: number) {
    const ctx = this.ctx;

    // Sky / Background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h * 0.4);
    bgGrad.addColorStop(0, '#1e293b');
    bgGrad.addColorStop(1, '#334155');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // City skyline buildings in distance
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(w * 0.05, h * 0.15, w * 0.12, h * 0.25);
    ctx.fillRect(w * 0.2, h * 0.1, w * 0.15, h * 0.3);
    ctx.fillRect(w * 0.65, h * 0.12, w * 0.18, h * 0.28);
    ctx.fillRect(w * 0.85, h * 0.18, w * 0.1, h * 0.22);

    // Road asphalt
    const roadGrad = ctx.createLinearGradient(0, h * 0.35, 0, h);
    roadGrad.addColorStop(0, '#1f2937');
    roadGrad.addColorStop(1, '#111827');
    ctx.fillStyle = roadGrad;

    ctx.beginPath();
    ctx.moveTo(w * 0.15, h * 0.38);
    ctx.lineTo(w * 0.85, h * 0.38);
    ctx.lineTo(w * 1.0, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    // Sidewalks
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.moveTo(0, h * 0.38);
    ctx.lineTo(w * 0.15, h * 0.38);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(w * 0.85, h * 0.38);
    ctx.lineTo(w, h * 0.38);
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Road markings: Zebra Pedestrian Crossing
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    const zebraY = h * 0.52;
    const stripeCount = 9;
    for (let i = 0; i < stripeCount; i++) {
      const sx = w * 0.22 + (i * (w * 0.56)) / stripeCount;
      ctx.fillRect(sx, zebraY, w * 0.04, h * 0.045);
    }

    // Stop Line (Vạch dừng xe)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(w * 0.18, h * 0.58, w * 0.64, h * 0.015);

    // Lane divider dashed lines
    ctx.strokeStyle = '#facc15'; // Yellow divider
    ctx.lineWidth = 4;
    ctx.setLineDash([16, 12]);
    ctx.beginPath();
    ctx.moveTo(w * 0.5, h * 0.6);
    ctx.lineTo(w * 0.5, h);
    ctx.stroke();

    // White lane dividers
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(w * 0.32, h * 0.6);
    ctx.lineTo(w * 0.25, h);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(w * 0.68, h * 0.6);
    ctx.lineTo(w * 0.75, h);
    ctx.stroke();
    ctx.setLineDash([]);

    // Traffic Light Post on right side
    this.drawTrafficLight(w * 0.82, h * 0.25, lightState, w, h);
  }

  private drawTrafficLight(x: number, y: number, state: 'RED' | 'YELLOW' | 'GREEN', w: number, h: number) {
    const ctx = this.ctx;
    const poleWidth = 6;
    const boxW = 28;
    const boxH = 70;

    // Pole
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(x + boxW / 2 - poleWidth / 2, y + boxH, poleWidth, h * 0.4);

    // Traffic light housing
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x, y, boxW, boxH, 6);
    ctx.fill();
    ctx.stroke();

    // Visor hoods
    const radius = 9;
    const cx = x + boxW / 2;

    // Red
    ctx.fillStyle = state === 'RED' ? '#ef4444' : '#450a0a';
    ctx.beginPath();
    ctx.arc(cx, y + 16, radius, 0, Math.PI * 2);
    ctx.fill();
    if (state === 'RED') {
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 15;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Yellow
    ctx.fillStyle = state === 'YELLOW' ? '#eab308' : '#422006';
    ctx.beginPath();
    ctx.arc(cx, y + 36, radius, 0, Math.PI * 2);
    ctx.fill();
    if (state === 'YELLOW') {
      ctx.shadowColor = '#eab308';
      ctx.shadowBlur = 15;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Green
    ctx.fillStyle = state === 'GREEN' ? '#22c55e' : '#052e16';
    ctx.beginPath();
    ctx.arc(cx, y + 56, radius, 0, Math.PI * 2);
    ctx.fill();
    if (state === 'GREEN') {
      ctx.shadowColor = '#22c55e';
      ctx.shadowBlur = 15;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  private drawVehicle(entity: TrackedEntity, w: number, h: number) {
    const ctx = this.ctx;
    const px = (entity.box.x / 100) * w;
    const py = (entity.box.y / 100) * h;
    const pw = (entity.box.width / 100) * w;
    const ph = (entity.box.height / 100) * h;

    ctx.save();
    if (entity.type === 'car') {
      // Car Body
      const carColor = entity.status === 'VIOLATION' ? '#e11d48' : '#2563eb';
      ctx.fillStyle = carColor;
      ctx.beginPath();
      ctx.roundRect(px, py + ph * 0.25, pw, ph * 0.65, 8);
      ctx.fill();

      // Cabin / Roof
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(px + pw * 0.15, py + ph * 0.05, pw * 0.7, ph * 0.45, 6);
      ctx.fill();

      // Windshield
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(px + pw * 0.2, py + ph * 0.1, pw * 0.6, ph * 0.2);

      // Headlights
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(px + pw * 0.08, py + ph * 0.82, pw * 0.2, ph * 0.08);
      ctx.fillRect(px + pw * 0.72, py + ph * 0.82, pw * 0.2, ph * 0.08);

      // License plate
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(px + pw * 0.35, py + ph * 0.82, pw * 0.3, ph * 0.08);
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 8px monospace';
      ctx.fillText(entity.licensePlate || '30A-999', px + pw * 0.37, py + ph * 0.88);
    } else if (entity.type === 'motorbike') {
      // Motorbike frame & rider
      // Rider Body
      ctx.fillStyle = entity.status === 'VIOLATION' ? '#ef4444' : '#10b981';
      ctx.beginPath();
      ctx.roundRect(px + pw * 0.2, py + ph * 0.25, pw * 0.6, ph * 0.45, 5);
      ctx.fill();

      // Head / Helmet
      if (entity.detectedAction && entity.detectedAction.toLowerCase().includes('mũ')) {
        // No Helmet: Hair color
        ctx.fillStyle = '#451a03';
      } else {
        // Helmet: Red or yellow helmet
        ctx.fillStyle = '#f59e0b';
      }
      ctx.beginPath();
      ctx.arc(px + pw * 0.5, py + ph * 0.15, pw * 0.25, 0, Math.PI * 2);
      ctx.fill();

      // Wheels
      ctx.fillStyle = '#09090b';
      ctx.fillRect(px + pw * 0.3, py + ph * 0.75, pw * 0.4, ph * 0.25);
    } else if (entity.type === 'bus' || entity.type === 'truck') {
      // Heavy vehicle
      ctx.fillStyle = entity.type === 'bus' ? '#059669' : '#d97706';
      ctx.beginPath();
      ctx.roundRect(px, py, pw, ph * 0.9, 10);
      ctx.fill();

      // Windows
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(px + pw * 0.05, py + ph * 0.1, pw * 0.9, ph * 0.25);
    } else {
      // Pedestrian
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(px + pw * 0.5, py + ph * 0.2, pw * 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(px + pw * 0.25, py + ph * 0.35, pw * 0.5, ph * 0.6);
    }
    ctx.restore();
  }

  private drawEntityOverlay(
    entity: TrackedEntity,
    isSelected: boolean,
    showOverlays: { labels: boolean; trails: boolean; speed: boolean },
    w: number,
    h: number
  ) {
    const ctx = this.ctx;
    const px = (entity.box.x / 100) * w;
    const py = (entity.box.y / 100) * h;
    const pw = (entity.box.width / 100) * w;
    const ph = (entity.box.height / 100) * h;

    let color = '#22c55e'; // Green
    if (entity.status === 'WARNING') color = '#eab308'; // Amber
    if (entity.status === 'VIOLATION') color = '#ef4444'; // Red

    // Bounding Box
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = isSelected ? 3 : 2;

    // Corner brackets style
    const corner = Math.min(14, pw * 0.25);
    ctx.beginPath();
    // Top-left
    ctx.moveTo(px, py + corner);
    ctx.lineTo(px, py);
    ctx.lineTo(px + corner, py);
    // Top-right
    ctx.moveTo(px + pw - corner, py);
    ctx.lineTo(px + pw, py);
    ctx.lineTo(px + pw, py + corner);
    // Bottom-left
    ctx.moveTo(px, py + ph - corner);
    ctx.lineTo(px, py + ph);
    ctx.lineTo(px + corner, py + ph);
    // Bottom-right
    ctx.moveTo(px + pw - corner, py + ph);
    ctx.lineTo(px + pw, py + ph);
    ctx.lineTo(px + pw, py + ph - corner);
    ctx.stroke();

    // Semi-transparent box fill
    ctx.fillStyle = isSelected ? 'rgba(239, 68, 68, 0.2)' : 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(px, py, pw, ph);

    // Pulse radar effect if selected or violation
    if (isSelected || entity.status === 'VIOLATION') {
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.strokeRect(px - 4, py - 4, pw + 8, ph + 8);
    }

    // Top Label Banner
    if (showOverlays.labels) {
      const labelText = `#${entity.id} • ${entity.label}`;
      ctx.font = '600 11px "JetBrains Mono", monospace';
      const textWidth = ctx.measureText(labelText).width;

      ctx.fillStyle = color;
      ctx.fillRect(px, py - 20, Math.max(textWidth + 12, 85), 20);

      ctx.fillStyle = '#ffffff';
      ctx.fillText(labelText, px + 6, py - 6);
    }

    // Bottom Speed / Status HUD
    if (showOverlays.speed) {
      const statusText =
        entity.status === 'VIOLATION'
          ? `VIOLATION: ${entity.speedKmH} km/h`
          : `${entity.speedKmH} km/h [${Math.round(entity.confidence * 100)}%]`;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(px, py + ph, Math.max(pw, 95), 18);

      ctx.fillStyle = color;
      ctx.font = '500 10px "JetBrains Mono", monospace';
      ctx.fillText(statusText, px + 4, py + ph + 13);
    }

    ctx.restore();
  }

  private drawCCTVMeta(scenario: TrafficScenario, currentTime: number, w: number, h: number) {
    const ctx = this.ctx;
    ctx.save();

    // Top Left: Camera Info
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.fillRect(10, 10, 320, 48);

    ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
    ctx.lineWidth = 1;
    ctx.strokeRect(10, 10, 320, 48);

    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(24, 26, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = '700 12px "JetBrains Mono", monospace';
    ctx.fillText(`REC • ${scenario.cameraType} [AI TRACKING ACTIVE]`, 36, 28);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 10px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`${scenario.location} | T: ${currentTime.toFixed(1)}s / ${scenario.duration}s`, 36, 46);

    // Crosshairs in center
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.beginPath();
    ctx.moveTo(w * 0.5 - 20, h * 0.5);
    ctx.lineTo(w * 0.5 + 20, h * 0.5);
    ctx.moveTo(w * 0.5, h * 0.5 - 20);
    ctx.lineTo(w * 0.5, h * 0.5 + 20);
    ctx.stroke();

    ctx.restore();
  }

  // Extract a high-res cropped snapshot of a specific entity from canvas as base64 JPEG
  public captureEntityCrop(entity: TrackedEntity): { fullFrame: string; entityCrop: string } {
    const fullFrame = this.canvas.toDataURL('image/jpeg', 0.9);

    // Create an offscreen canvas to crop the bounding box
    const offCanvas = document.createElement('canvas');
    const w = this.canvas.width;
    const h = this.canvas.height;

    const sx = Math.max(0, (entity.box.x / 100) * w - 20);
    const sy = Math.max(0, (entity.box.y / 100) * h - 20);
    const sWidth = Math.min(w - sx, (entity.box.width / 100) * w + 40);
    const sHeight = Math.min(h - sy, (entity.box.height / 100) * h + 40);

    offCanvas.width = sWidth;
    offCanvas.height = sHeight;
    const offCtx = offCanvas.getContext('2d');
    if (offCtx) {
      offCtx.drawImage(this.canvas, sx, sy, sWidth, sHeight, 0, 0, sWidth, sHeight);
    }
    const entityCrop = offCanvas.toDataURL('image/jpeg', 0.92);

    return { fullFrame, entityCrop };
  }
}
