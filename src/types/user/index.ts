import { Types } from 'mongoose';

export enum UserRole {
  TRAFFIC = 'traffic',
  INVESTIGATOR = 'investigator',
  CHIEF = 'chief',
  ADMIN = 'admin',
}

export enum UserShift {
  MORNING = 'morning',
  AFTERNOON = 'afternoon',
  NIGHT = 'night',
}

export interface IUser {
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
  shift?: UserShift;
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

  // Computed fields
  displayName?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICreateUserDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  badgeId?: string;
  department?: string;
  profileImageUrl?: string;
  phoneNumber?: string;
  isActive?: boolean;

  // Traffic Personnel specific fields
  district?: string;
  vehicleId?: string;
  shift?: UserShift;
  reportsSubmitted?: number;

  // Investigator specific fields
  specialization?: string[];
  currentCaseload?: number;
  maxCaseload?: number;
  completedCases?: number;
  averageResolutionTime?: number;

  // Chief Analyst specific fields
  subordinates?: string[];
  totalCasesManaged?: number;
  analyticsAccess?: boolean;

  // Admin specific fields
  accessLevel?: number;
  systemPermissions?: string[];
}

export type IUpdateUserDto = Partial<ICreateUserDto>;

export interface IUserResponse {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  badgeId?: string;
  department?: string;
  profileImageUrl?: string;
  phoneNumber?: string;
  isActive: boolean;
  lastLogin?: Date;
  displayName: string;
  createdAt: Date;
  updatedAt: Date;

  // Role-specific fields (conditionally included based on role)
  district?: string;
  vehicleId?: string;
  shift?: UserShift;
  reportsSubmitted?: number;
  specialization?: string[];
  currentCaseload?: number;
  maxCaseload?: number;
  completedCases?: number;
  averageResolutionTime?: number;
  subordinates?: string[];
  totalCasesManaged?: number;
  analyticsAccess?: boolean;
  accessLevel?: number;
  systemPermissions?: string[];
}

// Authentication related interfaces
export interface ILoginDto {
  email: string;
  password: string;
}

export interface IAuthResponse {
  user: IUserResponse;
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}

export interface IChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface IResetPasswordDto {
  email: string;
  resetToken: string;
  newPassword: string;
}

// User statistics and performance interfaces
export interface IUserStatistics {
  userId: string;
  role: UserRole;

  // Traffic Personnel statistics
  totalReportsSubmitted?: number;
  reportsThisMonth?: number;
  averageReportsPerDay?: number;

  // Investigator statistics
  casesInProgress?: number;
  casesCompleted?: number;
  averageResolutionDays?: number;
  caseloadUtilization?: number; // percentage of max caseload

  // Chief statistics
  teamSize?: number;
  teamPerformance?: number;
  casesManaged?: number;

  // Admin statistics
  systemUsage?: number;
  userManagementActions?: number;

  lastUpdated: Date;
}

// User profile and preferences
export interface IUserProfile {
  userId: string;
  preferences: {
    theme?: 'light' | 'dark' | 'auto';
    language?: string;
    timezone?: string;
    notifications?: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    dashboard?: {
      layout: string;
      widgets: string[];
    };
  };
  settings: {
    twoFactorEnabled?: boolean;
    sessionTimeout?: number;
    autoSave?: boolean;
  };
}

// User filtering and search interfaces
export interface IUserFilters {
  role?: UserRole | UserRole[];
  department?: string | string[];
  isActive?: boolean;
  district?: string | string[];
  shift?: UserShift | UserShift[];
  specialization?: string | string[];
  accessLevel?: number | number[];
  search?: string; // for name, email, badge search
  createdAfter?: Date;
  createdBefore?: Date;
  lastLoginAfter?: Date;
  lastLoginBefore?: Date;
}

export interface IUserListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: IUserFilters;
}

export interface IUserListResponse {
  users: IUserResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters?: IUserFilters;
}

// Role-specific interfaces for better type safety
export interface ITrafficPersonnel extends IUser {
  role: UserRole.TRAFFIC;
  district: string;
  vehicleId?: string;
  shift: UserShift;
  reportsSubmitted: number;
}

export interface IInvestigator extends IUser {
  role: UserRole.INVESTIGATOR;
  specialization: string[];
  currentCaseload: number;
  maxCaseload: number;
  completedCases: number;
  averageResolutionTime?: number;
}

export interface IChiefAnalyst extends IUser {
  role: UserRole.CHIEF;
  subordinates: Types.ObjectId[];
  totalCasesManaged: number;
  analyticsAccess: boolean;
}

export interface IAdmin extends IUser {
  role: UserRole.ADMIN;
  accessLevel: number;
  systemPermissions: string[];
}

// User activity and audit interfaces
export interface IUserActivity {
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

export interface IUserSession {
  userId: string;
  sessionId: string;
  deviceInfo: {
    browser?: string;
    os?: string;
    device?: string;
  };
  ipAddress: string;
  loginTime: Date;
  lastActivity: Date;
  isActive: boolean;
  expiresAt: Date;
}

// Bulk operations
export interface IBulkUserOperation {
  operation: 'activate' | 'deactivate' | 'delete' | 'update' | 'assign_role';
  userIds: string[];
  data?: Partial<IUpdateUserDto>;
}

export interface IBulkUserResult {
  successful: string[];
  failed: Array<{
    userId: string;
    error: string;
  }>;
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}
