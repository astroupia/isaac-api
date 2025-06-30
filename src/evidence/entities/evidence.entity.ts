import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// Domain entity
export class Evidence {
  title: string;
  description?: string;
  type: string;
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

// Mongoose schema class
@Schema({ timestamps: true })
export class EvidenceSchemaClass {
  @Prop({ required: true }) title: string;
  @Prop() description?: string;
  @Prop({ required: true }) type: string;
  @Prop() fileUrl?: string;
  @Prop() fileName?: string;
  @Prop() fileSize?: number;
  @Prop() fileType?: string;
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  uploadedBy: Types.ObjectId;
  @Prop({ default: Date.now }) uploadedAt?: Date;
  @Prop({ type: [String] }) tags?: string[];
  @Prop({ type: Object }) metadata?: Record<string, any>;
  @Prop({ default: false }) aiProcessed?: boolean;
  @Prop({ type: [Object] }) aiAnnotations?: any[];
  @Prop({
    type: {
      vehicleIds: [Types.ObjectId],
      personIds: [Types.ObjectId],
    },
  })
  relatedTo?: {
    vehicleIds?: Types.ObjectId[];
    personIds?: Types.ObjectId[];
  };
}

export const EvidenceSchema = SchemaFactory.createForClass(EvidenceSchemaClass);
export type EvidenceDocument = EvidenceSchemaClass & Document;
