import { Types } from 'mongoose';

export enum ReportStatus {
  DRAFT = 'Draft',
  SUBMITTED = 'Submitted',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  PUBLISHED = 'Published',
  NEEDS_REVIEW = 'Needs Review',
}

export enum ReportType {
  INCIDENT = 'Incident',
  INVESTIGATION = 'Investigation',
  ANALYSIS = 'Analysis',
  SUMMARY = 'Summary',
}

export enum ReportPriority {
  HIGH = 'High Priority',
  MEDIUM = 'Medium Priority',
  LOW = 'Low Priority',
}

export interface IReport {
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
  content?: Record<string, any>;
  aiContribution?: number;
  aiOverallConfidence?: number;
  aiObjectDetection?: number;
  aiSceneReconstruction?: number;
  comments?: any[];
  revisionHistory?: any[];
  relatedReports?: Types.ObjectId[];
  tags?: string[];
}

export interface ICreateReportDto {
  incidentId: string;
  title: string;
  type: ReportType;
  status: ReportStatus;
  createdBy: string;
  assignedTo?: string;
  approvedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
  submittedAt?: Date;
  approvedAt?: Date;
  content?: Record<string, any>;
  aiContribution?: number;
  comments?: any[];
  revisionHistory?: any[];
  relatedReports?: string[];
  tags?: string[];
}

export type IUpdateReportDto = Partial<ICreateReportDto>;
