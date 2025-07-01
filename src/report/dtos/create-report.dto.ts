import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsDateString,
  IsNumber,
  IsObject,
  IsEnum,
} from 'class-validator';
import { ReportPriority, ReportStatus, ReportType } from '../../types/report';

export class CreateReportDto {
  @IsString()
  @IsNotEmpty()
  incidentId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsEnum(ReportType)
  @IsNotEmpty()
  type: ReportType;

  @IsEnum(ReportStatus)
  @IsNotEmpty()
  status: ReportStatus;

  @IsEnum(ReportPriority)
  @IsNotEmpty()
  priority: ReportPriority;

  @IsString()
  @IsNotEmpty()
  createdBy: string;

  @IsString()
  @IsOptional()
  assignedTo?: string;

  @IsString()
  @IsOptional()
  approvedBy?: string;

  @IsDateString()
  @IsOptional()
  createdAt?: Date;

  @IsDateString()
  @IsOptional()
  updatedAt?: Date;

  @IsDateString()
  @IsOptional()
  submittedAt?: Date;

  @IsDateString()
  @IsOptional()
  approvedAt?: Date;

  @IsObject()
  @IsOptional()
  content?: any;

  @IsNumber()
  @IsOptional()
  aiContribution?: number;

  @IsNumber()
  @IsOptional()
  aiOverallConfidence?: number;

  @IsNumber()
  @IsOptional()
  aiObjectDetection?: number;

  @IsNumber()
  @IsOptional()
  aiSceneReconstruction?: number;

  @IsArray()
  @IsOptional()
  comments?: any[];

  @IsArray()
  @IsOptional()
  revisionHistory?: any[];

  @IsArray()
  @IsOptional()
  relatedReports?: string[];

  @IsArray()
  @IsOptional()
  tags?: string[];
}
