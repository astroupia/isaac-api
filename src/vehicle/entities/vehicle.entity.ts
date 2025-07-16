import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// Domain entity
export class Vehicle {
  make: string;
  model: string;
  year?: number;
  color?: string;
  licensePlate?: string;
  vin?: string;
  vehicleType: string;
  occupantsCount: number;
  driver?: Types.ObjectId;
  passengers?: Types.ObjectId[];
  damageDescription?: string;
  damageSeverity?: string;
  damageAreas?: string[];
  airbagDeployed?: boolean;
  incidentIds?: Types.ObjectId[];
}

// Mongoose schema class
@Schema({ timestamps: true })
export class VehicleSchemaClass {
  @Prop({ required: true }) make: string;
  @Prop({ required: true }) model: string;
  @Prop() year?: number;
  @Prop() color?: string;
  @Prop() licensePlate?: string;
  @Prop() vin?: string;
  @Prop({ required: true }) vehicleType: string;
  @Prop({ required: true }) occupantsCount: number;
  @Prop({ type: Types.ObjectId, ref: 'Person' }) driver?: Types.ObjectId;
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Person' }] })
  passengers?: Types.ObjectId[];
  @Prop() damageDescription?: string;
  @Prop() damageSeverity?: string;
  @Prop({ type: [String] }) damageAreas?: string[];
  @Prop() airbagDeployed?: boolean;
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Incident' }] })
  incidentIds?: Types.ObjectId[];
}

export const VehicleSchema = SchemaFactory.createForClass(VehicleSchemaClass);
export type VehicleDocument = VehicleSchemaClass & Document;
