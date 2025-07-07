import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserRole = 'traffic' | 'investigator' | 'chief' | 'admin';

// Domain entity
export class User {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  badgeId?: string;
  department?: string;
  profileImageUrl?: string;
  phoneNumber?: string;
  isActive: boolean;
  lastLogin?: Date;

  // Traffic Personnel specific fields
  district?: string;
  vehicleId?: string;
  shift?: 'morning' | 'afternoon' | 'night';
  reportsSubmitted?: number;

  // Investigator specific fields
  specialization?: string[];
  currentCaseload?: number;
  maxCaseload?: number;
  completedCases?: number;
  averageResolutionTime?: number;

  // Chief Analyst specific fields
  subordinates?: Types.ObjectId[];
  totalCasesManaged?: number;
  analyticsAccess?: boolean;

  // Admin specific fields
  accessLevel?: number;
  systemPermissions?: string[];
}

// Mongoose schema class
@Schema({ timestamps: true })
export class UserSchemaClass {
  @Prop({ required: true, trim: true, maxlength: 50 })
  firstName: string;

  @Prop({ required: true, trim: true, maxlength: 50 })
  lastName: string;

  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  })
  email: string;

  @Prop({ required: true, minlength: 6 })
  password: string;

  @Prop({
    required: true,
    enum: ['traffic', 'investigator', 'chief', 'admin'],
    index: true,
  })
  role: UserRole;

  @Prop({ unique: true, sparse: true, trim: true, index: true })
  badgeId?: string;

  @Prop({ trim: true })
  department?: string;

  @Prop({ trim: true })
  profileImageUrl?: string;

  @Prop({ trim: true })
  phoneNumber?: string;

  @Prop({ default: true, index: true })
  isActive: boolean;

  @Prop()
  lastLogin?: Date;

  // Traffic Personnel specific fields
  @Prop({ trim: true })
  district?: string;

  @Prop({ trim: true })
  vehicleId?: string;

  @Prop({ enum: ['morning', 'afternoon', 'night'] })
  shift?: 'morning' | 'afternoon' | 'night';

  @Prop({ default: 0, min: 0 })
  reportsSubmitted?: number;

  // Investigator specific fields
  @Prop({ type: [String] })
  specialization?: string[];

  @Prop({ default: 0, min: 0 })
  currentCaseload?: number;

  @Prop({ default: 10, min: 1 })
  maxCaseload?: number;

  @Prop({ default: 0, min: 0 })
  completedCases?: number;

  @Prop({ min: 0 })
  averageResolutionTime?: number;

  // Chief Analyst specific fields
  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  subordinates?: Types.ObjectId[];

  @Prop({ default: 0, min: 0 })
  totalCasesManaged?: number;

  @Prop({ default: false })
  analyticsAccess?: boolean;

  // Admin specific fields
  @Prop({ min: 1, max: 10 })
  accessLevel?: number;

  @Prop({ type: [String] })
  systemPermissions?: string[];
}

export const UserSchema = SchemaFactory.createForClass(UserSchemaClass);
export type UserDocument = UserSchemaClass & Document;

// Simple virtual methods
UserSchema.virtual('displayName').get(function () {
  return `${this.firstName} ${this.lastName}`.trim();
});
