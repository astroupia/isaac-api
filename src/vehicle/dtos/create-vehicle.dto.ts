import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsNumber,
  IsBoolean,
  Min,
  IsEnum,
} from 'class-validator';
import { VehicleType, DamageSeverity } from '../../types/vehicle';

export class CreateVehicleDto {
  @IsString()
  @IsNotEmpty()
  make: string;

  @IsString()
  @IsNotEmpty()
  model: string;

  @IsNumber()
  @IsOptional()
  year?: number;

  @IsString()
  @IsOptional()
  color?: string;

  @IsString()
  @IsOptional()
  licensePlate?: string;

  @IsString()
  @IsOptional()
  vin?: string;

  @IsEnum(VehicleType)
  @IsNotEmpty()
  vehicleType: VehicleType;

  @IsNumber()
  @Min(0)
  occupantsCount: number;

  @IsString()
  @IsOptional()
  driver?: string;

  @IsArray()
  @IsOptional()
  passengers?: string[];

  @IsString()
  @IsOptional()
  damageDescription?: string;

  @IsEnum(DamageSeverity)
  @IsOptional()
  damageSeverity?: DamageSeverity;

  @IsArray()
  @IsOptional()
  damageAreas?: string[];

  @IsBoolean()
  @IsOptional()
  airbagDeployed?: boolean;

  @IsArray()
  @IsOptional()
  incidentIds?: string[];
}
