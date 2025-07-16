export enum AIAnalysisType {
  OBJECT_DETECTION = 'object_detection',
  SCENE_RECONSTRUCTION = 'scene_reconstruction',
  DAMAGE_ASSESSMENT = 'damage_assessment',
  TRAFFIC_ANALYSIS = 'traffic_analysis',
  WITNESS_STATEMENT_ANALYSIS = 'witness_statement_analysis',
  DOCUMENT_ANALYSIS = 'document_analysis',
  AUDIO_TRANSCRIPTION = 'audio_transcription',
  GENERAL_ANALYSIS = 'general_analysis',
}

export enum MediaProcessingStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface AIAnalysisResult {
  analysisType: AIAnalysisType;
  confidence: number;
  results: any;
  insights: string[];
  suggestions: string[];
  detectedObjects?: DetectedObject[];
  transcription?: string;
  summary?: string;
  processedAt: Date;
  processingDuration: number;
  metadata?: Record<string, any>;
}

export interface DetectedObject {
  name: string;
  confidence: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  attributes?: Record<string, any>;
}

export interface MediaProcessingRequest {
  evidenceId: string;
  mediaUrl: string;
  mediaType: 'image' | 'video' | 'audio' | 'document';
  analysisTypes: AIAnalysisType[];
  customPrompt?: string;
  options?: {
    maxTokens?: number;
    temperature?: number;
    topP?: number;
  };
}

export interface ReportAnalysisRequest {
  reportId: string;
  analysisType: 'summary' | 'insights' | 'recommendations' | 'discussion';
  context?: string;
  customPrompt?: string;
  includeEvidence?: boolean;
}

export interface ReportDiscussion {
  id: string;
  reportId: string;
  question: string;
  response: string;
  context: any[];
  timestamp: Date;
  confidence: number;
  sources: string[];
}

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
  variables: string[];
  category: AIAnalysisType;
  isDefault: boolean;
}

export interface AIProcessingConfig {
  geminiApiKey: string;
  model: string;
  maxRetries: number;
  timeoutMs: number;
  defaultTemperature: number;
  defaultTopP: number;
  maxTokens: number;
}
