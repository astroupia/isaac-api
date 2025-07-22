import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class GeneratedCasualtyReport {
  @Prop({ type: Types.ObjectId, ref: 'Report', required: true, unique: true })
  reportId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Incident', required: true })
  incidentId: Types.ObjectId;

  @Prop({ required: true })
  generatedAt: Date;

  @Prop({ type: Object, required: true })
  processingSummary: {
    totalEvidence: number;
    successfullyProcessed: number;
    failedProcessing: number;
    overallConfidence: number;
  };

  @Prop({ type: Object, required: true })
  casualtyAssessment: {
    totalCasualties: number;
    casualties: Array<{
      position: string;
      confidence: number;
      location: string;
      injurySeverity?: string;
      injuries?: string[];
    }>;
    injuryBreakdown: {
      fatalities: number;
      seriousInjuries: number;
      minorInjuries: number;
    };
  };

  @Prop({ type: Object, required: true })
  vehicleAnalysis: {
    totalVehicles: number;
    vehicles: Array<{
      type: string;
      confidence: number;
      damage?: string[];
      damageSeverity?: string;
      color?: string;
      position?: string;
      make?: string;
      model?: string;
      year?: number;
    }>;
    damageAssessment: {
      vehicleDamage: Array<{
        vehicleId?: string;
        severity: string;
        areas: string[];
        estimatedCost?: number;
      }>;
      propertyDamage: Array<{
        type: string;
        severity: string;
        description: string;
      }>;
      totalEstimatedCost?: string;
    };
  };

  @Prop({ type: Object, required: true })
  environmentalAnalysis: {
    factors: string[];
    weatherConditions: string[];
    roadConditions: string[];
  };

  @Prop({ type: [Object], required: true })
  incidentTimeline: Array<{
    time: Date;
    description: string;
    source: string;
  }>;

  @Prop({ type: [String], required: true })
  recommendations: string[];

  @Prop({ type: Object, required: true })
  aiConfidence: {
    overall: number;
    vehicleDetection: number;
    casualtyAssessment: number;
    sceneReconstruction: number;
  };

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const GeneratedCasualtyReportSchema = SchemaFactory.createForClass(
  GeneratedCasualtyReport,
);
export type GeneratedCasualtyReportDocument = GeneratedCasualtyReport &
  Document;
