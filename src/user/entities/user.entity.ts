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
@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
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
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email',
    ],
  })
  email: string;

  @Prop({ required: true, minlength: 6 })
  password: string;

  @Prop({
    required: true,
    enum: ['traffic', 'investigator', 'chief', 'admin'],
    message: 'Role must be traffic, investigator, chief, or admin',
  })
  role: UserRole;

  @Prop({ unique: true, sparse: true, trim: true })
  badgeId?: string;

  @Prop({ trim: true })
  department?: string;

  @Prop({ trim: true })
  profileImageUrl?: string;

  @Prop({
    trim: true,
    match: [/^[+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number'],
  })
  phoneNumber?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  lastLogin?: Date;

  // Traffic Personnel specific fields
  @Prop({ trim: true })
  district?: string;

  @Prop({ trim: true })
  vehicleId?: string;

  @Prop({
    enum: ['morning', 'afternoon', 'night'],
    message: 'Shift must be morning, afternoon, or night',
  })
  shift?: 'morning' | 'afternoon' | 'night';

  @Prop({ default: 0, min: 0 })
  reportsSubmitted?: number;

  // Investigator specific fields
  @Prop({ type: [String], trim: true })
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

  @Prop({ type: [String], trim: true })
  systemPermissions?: string[];
}

export const UserSchema = SchemaFactory.createForClass(UserSchemaClass);
export type UserDocument = UserSchemaClass & Document;

// Virtual methods
UserSchema.virtual('displayName').get(function () {
  return `${this.firstName} ${this.lastName}`.trim();
});

UserSchema.virtual('fullNameWithRole').get(function () {
  const displayName = `${this.firstName} ${this.lastName}`.trim();
  const roleNames = {
    traffic: 'Traffic Personnel',
    investigator: 'Investigator',
    chief: 'Chief Analyst',
    admin: 'Administrator',
  };
  return `${displayName} (${roleNames[this.role]})`;
});

UserSchema.virtual('initials').get(function () {
  if (this.firstName && this.lastName) {
    return `${this.firstName[0]}${this.lastName[0]}`.toUpperCase();
  }

  // Fallback to role-based initials
  const roleInitials = {
    traffic: 'TP',
    investigator: 'IN',
    chief: 'CA',
    admin: 'AD',
  };
  return roleInitials[this.role];
});

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ badgeId: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ department: 1 });
UserSchema.index({ isActive: 1 });
