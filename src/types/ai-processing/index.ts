import { Types } from 'mongoose';

export enum AnalysisType {
  IMAGE_ANALYSIS = 'image_analysis',
  VIDEO_ANALYSIS = 'video_analysis',
  AUDIO_ANALYSIS = 'audio_analysis',
  DOCUMENT_ANALYSIS = 'document_analysis',
  SCENE_RECONSTRUCTION = 'scene_reconstruction',
  DAMAGE_ASSESSMENT = 'damage_assessment',
  TRAFFIC_FLOW_ANALYSIS = 'traffic_flow_analysis',
}

export enum AnalysisStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  RETRY = 'retry',
}

export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
}

export enum ConversationStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
}

export interface IDetectedVehicle {
  type: string;
  confidence: number;
  position?: string;
  damage?: string[];
  damageSeverity?: string;
  licensePlate?: string;
  color?: string;
  estimatedSpeed?: string;
  boundingBox?: any;
}

export interface IDetectedPerson {
  position: string;
  confidence: number;
  apparentInjuries?: string[];
  location?: string;
  injuries?: string[];
}

export interface IDetectedRoadSign {
  type: string;
  text?: string;
  confidence: number;
  relevance?: string;
}

export interface IDetectedRoadCondition {
  type: string;
  severity: string;
  confidence: number;
}

export interface IDetectedObjects {
  vehicles?: IDetectedVehicle[];
  persons?: IDetectedPerson[];
  roadSigns?: IDetectedRoadSign[];
  roadConditions?: IDetectedRoadCondition[];
}

export interface ISceneAnalysis {
  weatherConditions?: string[];
  lightingConditions?: string;
  roadType?: string;
  trafficFlow?: string;
  visibility?: string;
  timeOfDay?: string;
  skidMarks?: string;
  impactPoint?: string;
  postImpactMovement?: string;
}

export interface IVehicleDamage {
  vehicleId?: string;
  severity: string;
  areas: string[];
  estimatedCost?: number | string;
  airbagDeployment?: string;
  structuralDamage?: string;
}

export interface IPropertyDamage {
  type: string;
  severity: string;
  description: string;
}

export interface IDamageAssessment {
  vehicleDamage?: IVehicleDamage[];
  propertyDamage?: IPropertyDamage[];
}

export interface IRecommendations {
  investigationPriority?: string;
  additionalEvidenceNeeded?: string[];
  expertConsultation?: string[];
  legalImplications?: string[];
  safetyRecommendations?: string[];
}

export interface IAiAnalysisResult {
  evidenceId: Types.ObjectId;
  reportId?: Types.ObjectId;
  incidentId?: Types.ObjectId;
  analysisType: AnalysisType;
  status: AnalysisStatus;
  prompt: string;
  analysisResult: Record<string, any>;
  confidenceScore?: number;
  detectedObjects?: IDetectedObjects;
  sceneAnalysis?: ISceneAnalysis;
  damageAssessment?: IDamageAssessment;
  recommendations?: IRecommendations;
  processingTime?: number;
  tokensUsed?: number;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateAiAnalysisDto {
  evidenceId: string;
  reportId?: string;
  incidentId?: string;
  analysisType: AnalysisType;
  prompt: string;
  customPrompt?: string;
}

export interface IConversationMessage {
  role: MessageRole;
  content: string;
  timestamp: Date;
  tokensUsed?: number;
  attachments?: Array<{
    type: string;
    url: string;
    description?: string;
  }>;
}

export interface IConversationContext {
  incidentId?: Types.ObjectId;
  evidenceIds?: Types.ObjectId[];
  focusAreas?: string[];
  analysisGoals?: string[];
  reportSummary?: string;
  evidenceSummary?: string;
}

export interface IConversationSummary {
  keyFindings?: string[];
  recommendations?: string[];
  confidenceLevel?: number;
  areasOfConcern?: string[];
  nextSteps?: string[];
}

export interface IAiConversation {
  reportId: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  status: ConversationStatus;
  messages: IConversationMessage[];
  context: IConversationContext;
  summary?: IConversationSummary;
  totalTokensUsed: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateConversationDto {
  reportId: string;
  title: string;
  initialMessage?: string;
}

export interface ISendMessageDto {
  message: string;
  attachments?: Array<{
    type: string;
    url: string;
    description?: string;
  }>;
}

export interface IProcessEvidenceDto {
  evidenceId: string;
  evidenceType: string;
  fileUrl: string;
  customPrompt?: string;
  reportId?: string;
  incidentId?: string;
}

export interface IBatchAnalysisDto {
  evidenceItems: Array<{
    evidenceId: string;
    type: string;
    fileUrl: string;
    customPrompt?: string;
  }>;
  reportId?: string;
  incidentId?: string;
}

export interface IReportEnhancement {
  aiContribution: number;
  overallConfidence: number;
  objectDetectionScore: number;
  sceneReconstructionScore: number;
  sections: {
    executiveSummary: string;
    vehicleAnalysis: IDetectedVehicle[];
    sceneAnalysis: ISceneAnalysis;
    damageAssessment: IDamageAssessment;
    recommendations: IRecommendations;
    confidenceAnalysis: any;
  };
}

export interface IIncidentSummary {
  incidentId: string;
  summary: string;
  analysisCount: number;
  overallConfidence: number;
  keyFindings: string[];
  recommendations: string[];
  generatedAt: Date;
}

export interface IAiProcessingStats {
  totalAnalyses: number;
  totalConversations: number;
  averageConfidence: number;
  processingTime: number;
  popularAnalysisTypes: Array<{
    type: AnalysisType;
    count: number;
  }>;
}

export interface IVideoAnalysis {
  duration: string;
  quality: string;
  viewpoint: string;
  timeline: Array<{
    timestamp: string;
    event: string;
    significance: string;
  }>;
}

export interface IVehicleMovement {
  vehicleId: string;
  preImpactBehavior: string;
  speed: string;
  direction: string;
  lanePosition: string;
  brakingEvidence: string;
  signalUsage: string;
}

export interface IImpactAnalysis {
  impactType: string;
  impactForce: string;
  impactAngle: string;
  primaryImpactPoint: string;
  secondaryImpacts: string[];
}

export interface IAudioAnalysis {
  duration: string;
  quality: string;
  source: string;
  backgroundNoise: string;
  soundEvents: Array<{
    timestamp: string;
    soundType: string;
    description: string;
    intensity: string;
    relevance: string;
  }>;
}

export interface IDocumentAnalysis {
  documentType: string;
  dateCreated: string;
  author: string;
  completeness: string;
  legibility: string;
  keyInformation: any;
  factualFindings: any;
  inconsistencies: any[];
  missingInformation: any[];
}

export type IUpdateAiAnalysisDto = Partial<ICreateAiAnalysisDto>;
export type IUpdateConversationDto = Partial<ICreateConversationDto>;
