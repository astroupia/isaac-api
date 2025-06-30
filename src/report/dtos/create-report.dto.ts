import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsDateString,
  IsNumber,
  IsObject,
} from 'class-validator';

export class CreateReportDto {
  @IsString()
  @IsNotEmpty()
  incidentId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  status: string;

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
