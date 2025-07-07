import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsNumber,
  IsBoolean,
  IsObject,
} from 'class-validator';

export class CreateEvidenceDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsOptional()
  fileUrl?: string;

  @IsString()
  @IsOptional()
  fileName?: string;

  @IsNumber()
  @IsOptional()
  fileSize?: number;

  @IsString()
  @IsOptional()
  fileType?: string;

  @IsString()
  @IsNotEmpty()
  uploadedBy: string;

  @IsOptional()
  uploadedAt?: Date;

  @IsArray()
  @IsOptional()
  tags?: string[];

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @IsBoolean()
  @IsOptional()
  aiProcessed?: boolean;

  @IsArray()
  @IsOptional()
  aiAnnotations?: any[];

  @IsObject()
  @IsOptional()
  relatedTo?: {
    vehicleIds?: string[];
    personIds?: string[];
  };
}
