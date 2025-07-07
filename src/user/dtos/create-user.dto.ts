import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsEnum,
  IsEmail,
  IsBoolean,
  IsNumber,
  Min,
  Max,
  MinLength,
} from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsEnum(['traffic', 'investigator', 'chief', 'admin'])
  @IsNotEmpty()
  role: UserRole;

  @IsString()
  @IsOptional()
  badgeId?: string;

  @IsString()
  @IsOptional()
  department?: string;

  @IsString()
  @IsOptional()
  profileImageUrl?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  // Traffic Personnel specific fields
  @IsString()
  @IsOptional()
  district?: string;

  @IsString()
  @IsOptional()
  vehicleId?: string;

  @IsEnum(['morning', 'afternoon', 'night'])
  @IsOptional()
  shift?: 'morning' | 'afternoon' | 'night';

  @IsNumber()
  @Min(0)
  @IsOptional()
  reportsSubmitted?: number;

  // Investigator specific fields
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  specialization?: string[];

  @IsNumber()
  @Min(0)
  @IsOptional()
  currentCaseload?: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  maxCaseload?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  completedCases?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  averageResolutionTime?: number;

  // Chief Analyst specific fields
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  subordinates?: string[];

  @IsNumber()
  @Min(0)
  @IsOptional()
  totalCasesManaged?: number;

  @IsBoolean()
  @IsOptional()
  analyticsAccess?: boolean;

  // Admin specific fields
  @IsNumber()
  @Min(1)
  @Max(10)
  @IsOptional()
  accessLevel?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  systemPermissions?: string[];
}
