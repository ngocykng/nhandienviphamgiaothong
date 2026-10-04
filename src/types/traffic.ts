export type VehicleType = 'car' | 'motorbike' | 'truck' | 'bus' | 'pedestrian' | 'bicycle' | 'traffic_light';

export type ViolationStatus = 'NORMAL' | 'WARNING' | 'VIOLATION';

export interface BoundingBox {
  x: number; // percentage 0-100 or canvas px
  y: number;
  width: number;
  height: number;
}

export interface TrackedEntity {
  id: string;
  type: VehicleType;
  label: string;
  confidence: number;
  speedKmH: number;
  status: ViolationStatus;
  licensePlate?: string;
  detectedAction?: string;
  box: BoundingBox;
  trail?: { x: number; y: number }[];
  violationDetail?: {
    name: string;
    clause: string;
    fineMin: number;
    fineMax: number;
    licenseSuspension?: string;
  };
}

export interface ScenarioKeyframe {
  timestamp: number; // in seconds
  entities: TrackedEntity[];
  trafficLightState?: 'RED' | 'YELLOW' | 'GREEN';
  eventDescription?: string;
  isViolationMoment?: boolean;
}

export interface TrafficScenario {
  id: string;
  title: string;
  location: string;
  description: string;
  duration: number;
  sampleVideoUrl?: string;
  cameraType: 'CCTV Ngã Tư' | 'Dashcam Hành Trình' | 'Camera Cầu Vượt' | 'Flycam Đô Thị';
  keyframes: ScenarioKeyframe[];
  defaultSelectedEntityId?: string;
}

export interface AIViolationAnalysis {
  entityIdentified: {
    type: string;
    colorOrFeatures: string;
    positionInFrame: string;
    behaviorObserved: string;
  };
  violationStatus: 'CO_VI_PHAM' | 'KHONG_VI_PHAM' | 'NGHI_VAN_CAN_XAC_MINH';
  violationName: string;
  legalClause: string;
  fineRange: {
    minVnd: number;
    maxVnd: number;
    display: string;
  };
  additionalSanctions: string;
  severity: 'Thấp' | 'Trung bình' | 'Nghiêm trọng';
  detailedExplanation: string;
  recommendedAction: string;
}

export interface LegalSource {
  title: string;
  uri: string;
}

export interface LegalConsultationResponse {
  answer: string;
  sources: LegalSource[];
  timestamp: string;
}

export interface LawItem {
  id: string;
  category: 'speed' | 'alcohol' | 'traffic_light' | 'lane' | 'helmet' | 'documents' | 'parking' | 'commercial';
  title: string;
  description: string;
  vehicleType: 'car' | 'motorbike' | 'both';
  fineMin: number;
  fineMax: number;
  penaltyAdditional?: string;
  decreeClause: string;
  officialRefUrl?: string;
}

export interface RoboflowPrediction {
  x: number; // center x in px
  y: number; // center y in px
  width: number;
  height: number;
  class: string;
  confidence: number;
  class_id?: number;
  detection_id?: string;
}

export interface RoboflowInferenceResult {
  inference_id?: string;
  time?: number;
  image: { width: number; height: number };
  predictions: RoboflowPrediction[];
  engine: 'roboflow_live' | 'yolov8_local_engine';
  modelId: string;
}

