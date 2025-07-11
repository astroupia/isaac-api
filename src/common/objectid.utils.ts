import { BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';

export type ObjectIdInput = string | Types.ObjectId | { _id: string | Types.ObjectId } | { id: string | Types.ObjectId };

/**
 * Converts various input types to a valid MongoDB ObjectId
 * Handles: strings, ObjectIds, and document objects with _id or id fields
 */
export function convertToObjectId(input: ObjectIdInput): Types.ObjectId {
  if (!input) {
    throw new BadRequestException('ObjectId input cannot be null or undefined');
  }

  // Handle string input
  if (typeof input === 'string') {
    if (!Types.ObjectId.isValid(input)) {
      throw new BadRequestException(`Invalid ObjectId format: ${input}`);
    }
    return new Types.ObjectId(input);
  }

  // Handle ObjectId input
  if (input instanceof Types.ObjectId) {
    return input;
  }

  // Handle document object with _id field
  if (typeof input === 'object' && input !== null && '_id' in input) {
    return convertToObjectId(input._id);
  }

  // Handle document object with id field
  if (typeof input === 'object' && input !== null && 'id' in input) {
    return convertToObjectId(input.id);
  }

  throw new BadRequestException(`Invalid ObjectId format: ${JSON.stringify(input)}`);
}

/**
 * Converts an array of ObjectId inputs to an array of valid MongoDB ObjectIds
 */
export function convertArrayToObjectIds(inputs: ObjectIdInput[] = []): Types.ObjectId[] {
  return inputs.map((input) => convertToObjectId(input));
}

/**
 * Safely converts an ObjectId to a string representation
 */
export function objectIdToString(id: string | Types.ObjectId | { _id: string | Types.ObjectId } | { id: string | Types.ObjectId }): string {
  if (typeof id === 'string') {
    return id;
  }
  
  if (id instanceof Types.ObjectId) {
    return id.toString();
  }
  
  if (typeof id === 'object' && id !== null && '_id' in id) {
    return objectIdToString(id._id);
  }
  
  if (typeof id === 'object' && id !== null && 'id' in id) {
    return objectIdToString(id.id);
  }
  
  throw new BadRequestException(`Cannot convert to string: ${JSON.stringify(id)}`);
} 