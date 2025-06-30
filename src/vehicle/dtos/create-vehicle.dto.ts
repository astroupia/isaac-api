import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsArray,
  IsBoolean,
} from 'class-validator';

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

  @IsString()
  @IsNotEmpty()
  vehicleType: string;

  @IsNumber()
  @IsNotEmpty()
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

  @IsString()
  @IsOptional()
  damageSeverity?: string;

  @IsArray()
  @IsOptional()
  damageAreas?: string[];

  @IsBoolean()
  @IsOptional()
  airbagDeployed?: boolean;
}
