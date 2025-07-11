import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PersonSchemaClass, PersonDocument } from '../entities/person.entity';
import { CreatePersonDto } from '../dtos/create-person.dto';
import { convertToObjectId, convertArrayToObjectIds } from '../../common/objectid.utils';

@Injectable()
export class PersonRepository {
  constructor(
    @InjectModel('Person')
    private readonly personModel: Model<PersonDocument>,
  ) {}

  async create(createPersonDto: CreatePersonDto): Promise<PersonDocument> {
    try {
      const person = new this.personModel({
        ...createPersonDto,
        incidentIds: convertArrayToObjectIds(createPersonDto.incidentIds),
        vehicleIds: convertArrayToObjectIds(createPersonDto.vehicleIds),
        evidenceIds: convertArrayToObjectIds(createPersonDto.evidenceIds),
      });
      return await person.save();
    } catch (error: any) {
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(
          (err: any) => err.message,
        );
        throw new BadRequestException(
          `Validation failed: ${messages.join(', ')}`,
        );
      }
      throw error;
    }
  }

  async findById(id: string): Promise<PersonDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid ObjectId format: ${id}`);
    }

    const person = await this.personModel
      .findById(id)
      .populate('incidentIds')
      .populate('vehicleIds')
      .populate('evidenceIds')
      .exec();
    if (!person) {
      throw new NotFoundException(`Person with ID ${id} not found`);
    }
    return person;
  }

  async update(
    id: string,
    updateData: Partial<CreatePersonDto>,
  ): Promise<PersonDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid ObjectId format: ${id}`);
    }

    try {
      const dataToUpdate: any = { ...updateData };
      if (updateData.incidentIds) {
        dataToUpdate.incidentIds = convertArrayToObjectIds(
          updateData.incidentIds,
        );
      }
      if (updateData.vehicleIds) {
        dataToUpdate.vehicleIds = convertArrayToObjectIds(
          updateData.vehicleIds,
        );
      }
      if (updateData.evidenceIds) {
        dataToUpdate.evidenceIds = convertArrayToObjectIds(
          updateData.evidenceIds,
        );
      }
      const person = await this.personModel
        .findByIdAndUpdate(id, dataToUpdate, { new: true })
        .exec();
      if (!person) {
        throw new NotFoundException(`Person with ID ${id} not found`);
      }
      return person;
    } catch (error: any) {
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(
          (err: any) => err.message,
        );
        throw new BadRequestException(
          `Validation failed: ${messages.join(', ')}`,
        );
      }
      throw error;
    }
  }

  async delete(id: string): Promise<PersonDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid ObjectId format: ${id}`);
    }

    const person = await this.personModel.findByIdAndDelete(id).exec();
    if (!person) {
      throw new NotFoundException(`Person with ID ${id} not found`);
    }
    return person;
  }

  async findAll(): Promise<PersonDocument[]> {
    return this.personModel
      .find()
      .populate('incidentIds')
      .populate('vehicleIds')
      .populate('evidenceIds')
      .exec();
  }

  async findByIncidentId(incidentId: string): Promise<PersonDocument[]> {
    if (!Types.ObjectId.isValid(incidentId)) {
      throw new BadRequestException(`Invalid ObjectId format: ${incidentId}`);
    }

    return this.personModel
      .find({ incidentIds: convertToObjectId(incidentId) })
      .populate('incidentIds')
      .populate('vehicleIds')
      .populate('evidenceIds')
      .exec();
  }
}
