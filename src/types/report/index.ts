import { Types } from 'mongoose';

export enum ReportStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PUBLISHED = 'published',
}

export enum ReportType {
  INCIDENT = 'incident',
  INVESTIGATION = 'investigation',
  ANALYSIS = 'analysis',
  SUMMARY = 'summary',
}

export interface IReport {
  incidentId: Types.ObjectId;
  title: string;
  type: ReportType;
  status: ReportStatus;
  createdBy: Types.ObjectId;
  assignedTo?: Types.ObjectId;
  approvedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  submittedAt?: Date;
  approvedAt?: Date;
  content?: Record<string, any>;
  aiContribution?: number;
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
