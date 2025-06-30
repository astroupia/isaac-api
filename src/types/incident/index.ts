import { Types } from 'mongoose';

export enum IncidentType {
  TRAFFIC_COLLISION = 'traffic_collision',
  PEDESTRIAN_ACCIDENT = 'pedestrian_accident',
  VEHICLE_FIRE = 'vehicle_fire',
  HAZMAT_SPILL = 'hazmat_spill',
  WEATHER_RELATED = 'weather_related',
  OTHER = 'other',
}

export enum IncidentSeverity {
  MINOR = 'minor',
  MODERATE = 'moderate',
  MAJOR = 'major',
  CRITICAL = 'critical',
}

export interface IIncident {
  incidentLocation: string;
  incidentType: IncidentType;
  incidentSeverity: IncidentSeverity;
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

export interface ICreateIncidentDto {
  incidentLocation: string;
  incidentType: IncidentType;
  incidentSeverity: IncidentSeverity;
  dateTime: Date;
  numberOfCasualties: number;
  incidentDescription: string;
  weatherConditions?: string[];
  roadConditions?: string[];
  evidenceIds?: string[];
  vehicleIds?: string[];
  personIds?: string[];
  environmentId?: string;
}

export type IUpdateIncidentDto = Partial<ICreateIncidentDto>;
