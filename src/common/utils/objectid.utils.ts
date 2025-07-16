import { BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';

/**
 * Shared ObjectId utility functions for consistent validation and conversion
 */
export class ObjectIdUtils {
  /**
   * Convert string or ObjectId to ObjectId with validation
   */
  static convertToObjectId(id: string | Types.ObjectId): Types.ObjectId {
    if (typeof id === 'string') {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException(`Invalid ObjectId format: ${id}`);
      }
      return new Types.ObjectId(id);
    }
    return id;
  }

  /**
   * Convert array of string or ObjectId to array of ObjectIds with validation
   */
  static convertArrayToObjectIds(
    ids: (string | Types.ObjectId)[] = [],
  ): Types.ObjectId[] {
    return ids.map((id) => this.convertToObjectId(id));
  }

  /**
   * Validate ObjectId format without conversion
   */
  static isValidObjectId(id: string | Types.ObjectId): boolean {
    if (typeof id === 'string') {
      return Types.ObjectId.isValid(id);
    }
    return id instanceof Types.ObjectId;
  }

  /**
   * Validate ObjectId format and throw error if invalid
   */
  static validateObjectId(id: string | Types.ObjectId): void {
    if (!this.isValidObjectId(id)) {
      const idStr = typeof id === 'string' ? id : id.toString();
      throw new BadRequestException(`Invalid ObjectId format: ${idStr}`);
    }
  }

  /**
   * Validate array of ObjectIds
   */
  static validateObjectIds(ids: (string | Types.ObjectId)[]): void {
    const invalidIds = ids.filter((id) => !this.isValidObjectId(id));
    if (invalidIds.length > 0) {
      throw new BadRequestException(
        `Invalid ObjectId format(s): ${invalidIds.join(', ')}`,
      );
    }
  }

  /**
   * Convert ObjectId to string
   */
  static toString(id: Types.ObjectId): string {
    return id.toString();
  }

  /**
   * Convert array of ObjectIds to strings
   */
  static toStringArray(ids: Types.ObjectId[]): string[] {
    return ids.map((id) => this.toString(id));
  }
}
