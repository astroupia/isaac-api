import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { PersonRole, PersonStatus, PersonGender } from '../../types/person';

// Domain entity
export class Person {
  firstName: string;
  lastName: string;
  age: Date;
  gender: PersonGender;
  role: PersonRole;
  status: PersonStatus;
  contactNumber?: string;
  email?: string;
  address?: string;
  licenseNumber?: string;
  insuranceInfo?: string;
  medicalConditions?: string[];
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  incidentIds?: Types.ObjectId[];
  vehicleIds?: Types.ObjectId[];
  evidenceIds?: Types.ObjectId[];
}

// Mongoose schema class
@Schema({ timestamps: true })
export class PersonSchemaClass {
  @Prop({ required: true }) firstName: string;
  @Prop({ required: true }) lastName: string;
  @Prop({ required: true }) age: number;
  @Prop({ required: true, enum: PersonGender }) gender: PersonGender;
  @Prop({ required: true, enum: PersonRole }) role: PersonRole;
  @Prop({ required: true, enum: PersonStatus }) status: PersonStatus;
  @Prop() contactNumber?: string;
  @Prop() email?: string;
  @Prop() address?: string;
  @Prop() licenseNumber?: string;
  @Prop() insuranceInfo?: string;
  @Prop({ type: [String] }) medicalConditions?: string[];
  @Prop({
    type: {
      name: { type: String, required: true },
      relationship: { type: String, required: true },
      phone: { type: String, required: true },
    },
  })
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Incident' }] })
  incidentIds?: Types.ObjectId[];
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Vehicle' }] })
  vehicleIds?: Types.ObjectId[];
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Evidence' }] })
  evidenceIds?: Types.ObjectId[];
}

export const PersonSchema = SchemaFactory.createForClass(PersonSchemaClass);
export type PersonDocument = PersonSchemaClass & Document;
