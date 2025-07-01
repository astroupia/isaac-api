import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ReportPriority, ReportStatus, ReportType } from '../../types/report';

// Domain entity
export class Report {
  incidentId: Types.ObjectId;
  title: string;
  type: ReportType;
  status: ReportStatus;
  priority: ReportPriority;
  createdBy: Types.ObjectId;
  assignedTo?: Types.ObjectId;
  approvedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  submittedAt?: Date;
  approvedAt?: Date;
  content: any;
  aiContribution?: number;
  aiOverallConfidence?: number;
  aiObjectDetection?: number;
  aiSceneReconstruction?: number;
  comments?: any[];
  revisionHistory?: any[];
  relatedReports?: Types.ObjectId[];
  tags?: string[];
}

// Mongoose schema class
@Schema({ timestamps: true })
export class ReportSchemaClass {
  @Prop({ type: Types.ObjectId, ref: 'Incident', required: true })
  incidentId: Types.ObjectId;
  @Prop({ required: true }) title: string;
  @Prop({ required: true, enum: ReportType }) type: ReportType;
  @Prop({ required: true, enum: ReportStatus }) status: ReportStatus;
  @Prop({ required: true, enum: ReportPriority }) priority: ReportPriority;
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'User' }) assignedTo?: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'User' }) approvedBy?: Types.ObjectId;
  @Prop() createdAt: Date;
  @Prop() updatedAt: Date;
  @Prop() submittedAt?: Date;
  @Prop() approvedAt?: Date;
  @Prop({ type: Object }) content?: Record<string, any>;
  @Prop() aiContribution?: number;
  @Prop() aiOverallConfidence?: number;
  @Prop() aiObjectDetection?: number;
  @Prop() aiSceneReconstruction?: number;
  @Prop({ type: [Object] }) comments?: any[];
  @Prop({ type: [Object] }) revisionHistory?: any[];
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Report' }] })
  relatedReports?: Types.ObjectId[];
  @Prop({ type: [String] }) tags?: string[];
}

export const ReportSchema = SchemaFactory.createForClass(ReportSchemaClass);
export type ReportDocument = ReportSchemaClass & Document;
