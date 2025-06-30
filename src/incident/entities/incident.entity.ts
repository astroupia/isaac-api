import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// Domain entity
export class Incident {
  incidentLocation: string;
  incidentType: string;
  incidentSeverity: string;
  dateTime: Date;
  numberOfCasualties: number;
  incidentDescription: string;
  weatherConditions?: string[];
  roadConditions?: string[];
  evidenceIds?: Types.ObjectId[];
  vehicleIds?: Types.ObjectId[];
  personIds?: Types.ObjectId[];
  environmentId?: Types.ObjectId;
}

// Mongoose schema class
@Schema({ timestamps: true })
export class IncidentSchemaClass {
  @Prop({ required: true }) incidentLocation: string;
  @Prop({ required: true }) incidentType: string;
  @Prop({ required: true }) incidentSeverity: string;
  @Prop({ required: true }) dateTime: Date;
  @Prop({ required: true }) numberOfCasualties: number;
  @Prop({ required: true }) incidentDescription: string;
  @Prop({ type: [String] }) weatherConditions?: string[];
  @Prop({ type: [String] }) roadConditions?: string[];
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Evidence' }] })
  evidenceIds?: Types.ObjectId[];
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Vehicle' }] })
  vehicleIds?: Types.ObjectId[];
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Person' }] })
  personIds?: Types.ObjectId[];
  @Prop({ type: Types.ObjectId, ref: 'EnvironmentalFactor' })
  environmentId?: Types.ObjectId;
}

export const IncidentSchema = SchemaFactory.createForClass(IncidentSchemaClass);
export type IncidentDocument = IncidentSchemaClass & Document;
