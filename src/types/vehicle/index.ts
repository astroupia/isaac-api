import { Types } from 'mongoose';

export enum VehicleType {
  CAR = 'car',
  TRUCK = 'truck',
  MOTORCYCLE = 'motorcycle',
  BUS = 'bus',
  VAN = 'van',
  SUV = 'suv',
  TRACTOR = 'tractor',
  OTHER = 'other',
}

export enum DamageSeverity {
  NONE = 'none',
  MINOR = 'minor',
  MODERATE = 'moderate',
  SEVERE = 'severe',
  TOTALED = 'totaled',
}

export interface IVehicle {
  make: string;
  model: string;
  year?: number;
  color?: string;
  licensePlate?: string;
  vin?: string;
  vehicleType: VehicleType;
  occupantsCount: number;
  driver?: Types.ObjectId;
  passengers?: Types.ObjectId[];
  damageDescription?: string;
  damageSeverity?: DamageSeverity;
  damageAreas?: string[];
  airbagDeployed?: boolean;
}

export interface ICreateVehicleDto {
  make: string;
  model: string;
  year?: number;
  color?: string;
  licensePlate?: string;
  vin?: string;
  vehicleType: VehicleType;
  occupantsCount: number;
  driver?: string;
  passengers?: string[];
  damageDescription?: string;
  damageSeverity?: DamageSeverity;
  damageAreas?: string[];
  airbagDeployed?: boolean;
}

export type IUpdateVehicleDto = Partial<ICreateVehicleDto>;
