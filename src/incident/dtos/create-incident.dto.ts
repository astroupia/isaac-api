import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsDateString,
  IsNumber,
  Min,
} from 'class-validator';
import { Types } from 'mongoose';

export class CreateIncidentDto {
  @IsString()
  @IsNotEmpty()
  incidentLocation: string;

  @IsString()
  @IsNotEmpty()
  incidentType: string;

  @IsString()
  @IsNotEmpty()
  incidentSeverity: string;

  @IsDateString()
  @IsNotEmpty()
  dateTime: Date;

  @IsNumber()
  @Min(0)
  numberOfCasualties: number;

  @IsString()
  @IsNotEmpty()
  incidentDescription: string;

  @IsArray()
  @IsOptional()
  weatherConditions?: string[];

  @IsArray()
  @IsOptional()
  roadConditions?: string[];

  @IsArray()
  @IsOptional()
  evidenceIds?: Types.ObjectId[];

  @IsArray()
  @IsOptional()
  vehicleIds?: Types.ObjectId[];

  @IsArray()
  @IsOptional()
  personIds?: Types.ObjectId[];

  @IsString()
  @IsOptional()
  environmentId?: string;
}
