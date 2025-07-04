import { Types } from 'mongoose';

export enum PersonRole {
  DRIVER = 'driver',
  PASSENGER = 'passenger',
  PEDESTRIAN = 'pedestrian',
  WITNESS = 'witness',
  FIRST_RESPONDER = 'first_responder',
  LAW_ENFORCEMENT = 'law_enforcement',
  OTHER = 'other',
}

export enum PersonStatus {
  INJURED = 'injured',
  UNINJURED = 'uninjured',
  DECEASED = 'deceased',
  UNKNOWN = 'unknown',
}

export enum PersonGender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  PREFER_NOT_TO_SAY = 'prefer_not_to_say',
}

export interface IPerson {
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

export interface ICreatePersonDto {
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
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
  incidentIds?: string[];
  vehicleIds?: string[];
  evidenceIds?: string[];
}

export type IUpdatePersonDto = Partial<ICreatePersonDto>;
