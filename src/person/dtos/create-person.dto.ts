import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsEnum,
  IsEmail,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PersonRole, PersonStatus, PersonGender } from '../../types/person';

class EmergencyContactDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  relationship: string;

  @IsString()
  @IsNotEmpty()
  phone: string;
}

export class CreatePersonDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsNumber()
  @IsNotEmpty()
  age: number;

  @IsEnum(PersonGender)
  @IsNotEmpty()
  gender: PersonGender;

  @IsEnum(PersonRole)
  @IsNotEmpty()
  role: PersonRole;

  @IsEnum(PersonStatus)
  @IsNotEmpty()
  status: PersonStatus;

  @IsString()
  @IsOptional()
  contactNumber?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  licenseNumber?: string;

  @IsString()
  @IsOptional()
  insuranceInfo?: string;

  @IsArray()
  @IsOptional()
  medicalConditions?: string[];

  @ValidateNested()
  @Type(() => EmergencyContactDto)
  @IsOptional()
  emergencyContact?: EmergencyContactDto;

  @IsArray()
  @IsOptional()
  incidentIds?: string[];

  @IsArray()
  @IsOptional()
  vehicleIds?: string[];

  @IsArray()
  @IsOptional()
  evidenceIds?: string[];
}
