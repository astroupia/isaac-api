import { Types } from 'mongoose';

export enum EvidenceType {
  PHOTO = 'photo',
  VIDEO = 'video',
  DOCUMENT = 'document',
  AUDIO = 'audio',
  WITNESS_STATEMENT = 'witness_statement',
  OTHER = 'other',
}

export interface IEvidence {
  title: string;
  description?: string;
  type: EvidenceType;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  uploadedBy: Types.ObjectId;
  uploadedAt?: Date;
  tags?: string[];
  metadata?: Record<string, any>;
  aiProcessed?: boolean;
  aiAnnotations?: any[];
  relatedTo?: {
    vehicleIds?: Types.ObjectId[];
    personIds?: Types.ObjectId[];
  };
}

export interface ICreateEvidenceDto {
  title: string;
  description?: string;
  type: EvidenceType;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  uploadedBy: string;
  uploadedAt?: Date;
  tags?: string[];
  metadata?: Record<string, any>;
  aiProcessed?: boolean;
  aiAnnotations?: any[];
  relatedTo?: {
    vehicleIds?: string[];
    personIds?: string[];
  };
}

export type IUpdateEvidenceDto = Partial<ICreateEvidenceDto>;
