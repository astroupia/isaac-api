import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

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

@Schema({ timestamps: true })
export class AiAnalysisResult {
  @Prop({ type: Types.ObjectId, ref: 'Evidence', required: true })
  evidenceId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Report' })
  reportId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Incident' })
  incidentId?: Types.ObjectId;

  @Prop({ required: true, enum: AnalysisType })
  analysisType: AnalysisType;

  @Prop({
    required: true,
    enum: AnalysisStatus,
    default: AnalysisStatus.PENDING,
  })
  status: AnalysisStatus;

  @Prop({ required: true })
  prompt: string;

  @Prop({ type: Object })
  analysisResult: Record<string, any>;

  @Prop({ min: 0, max: 1 })
  confidenceScore?: number;

  @Prop({ type: Object })
  detectedObjects?: {
    vehicles?: Array<{
      type: string;
      confidence: number;
      boundingBox?: any;
      damage?: string[];
    }>;
    persons?: Array<{
      position: string;
      confidence: number;
      injuries?: string[];
    }>;
    roadSigns?: Array<{
      type: string;
      text?: string;
      confidence: number;
    }>;
    roadConditions?: Array<{
      type: string;
      severity: string;
      confidence: number;
    }>;
  };

  @Prop({ type: Object })
  sceneAnalysis?: {
    weatherConditions?: string[];
    lightingConditions?: string;
    roadType?: string;
    trafficFlow?: string;
    visibility?: string;
    timeOfDay?: string;
  };

  @Prop({ type: Object })
  damageAssessment?: {
    vehicleDamage?: Array<{
      vehicleId?: string;
      severity: string;
      areas: string[];
      estimatedCost?: number;
    }>;
    propertyDamage?: Array<{
      type: string;
      severity: string;
      description: string;
    }>;
  };

  @Prop({ type: Object })
  recommendations?: {
    investigationPriority?: string;
    additionalEvidenceNeeded?: string[];
    expertConsultation?: string[];
    legalImplications?: string[];
  };

  @Prop()
  processingTime?: number;

  @Prop()
  tokensUsed?: number;

  @Prop()
  errorMessage?: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const AiAnalysisResultSchema =
  SchemaFactory.createForClass(AiAnalysisResult);
export type AiAnalysisResultDocument = AiAnalysisResult & Document;
