import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PersonSchemaClass, PersonDocument } from '../entities/person.entity';
import { CreatePersonDto } from '../dtos/create-person.dto';
import { IncidentDocument } from '../../incident/entities/incident.entity';

@Injectable()
export class PersonRepository {
  constructor(
    @InjectModel('Person')
    private readonly personModel: Model<PersonDocument>,
    @InjectModel('Incident')
    private readonly incidentModel: Model<IncidentDocument>,
  ) {}

  private convertToObjectId(id: string | Types.ObjectId): Types.ObjectId {
    if (typeof id === 'string') {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException(`Invalid ObjectId format: ${id}`);
      }
      return new Types.ObjectId(id);
    }
    return id;
  }

  private convertArrayToObjectIds(
    ids: (string | Types.ObjectId)[] = [],
  ): Types.ObjectId[] {
    return ids.map((id) => this.convertToObjectId(id));
  }

  async create(createPersonDto: CreatePersonDto): Promise<PersonDocument> {
    try {
      const person = new this.personModel({
        ...createPersonDto,
        incidentIds: this.convertArrayToObjectIds(createPersonDto.incidentIds),
        vehicleIds: this.convertArrayToObjectIds(createPersonDto.vehicleIds),
        evidenceIds: this.convertArrayToObjectIds(createPersonDto.evidenceIds),
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
        dataToUpdate.incidentIds = this.convertArrayToObjectIds(
          updateData.incidentIds,
        );
      }
      if (updateData.vehicleIds) {
        dataToUpdate.vehicleIds = this.convertArrayToObjectIds(
          updateData.vehicleIds,
        );
      }
      if (updateData.evidenceIds) {
        dataToUpdate.evidenceIds = this.convertArrayToObjectIds(
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

    const objectId = this.convertToObjectId(incidentId);

    // First, try to find persons that have this incident in their incidentIds
    const personsFromPersonSide = await this.personModel
      .find({ incidentIds: objectId })
      .populate('incidentIds')
      .populate('vehicleIds')
      .populate('evidenceIds')
      .exec();

    // If we found persons, return them
    if (personsFromPersonSide.length > 0) {
      return personsFromPersonSide;
    }

    // If no persons found from person side, try to find the incident and get personIds from there
    try {
      const incident = await this.incidentModel
        .findById(objectId)
        .populate('personIds')
        .exec();

      if (incident && incident.personIds && incident.personIds.length > 0) {
        // Get the person IDs from the incident
        const personIds = incident.personIds.map(
          (person: any) => person._id || person,
        );

        // Find all persons with those IDs
        const personsFromIncidentSide = await this.personModel
          .find({ _id: { $in: personIds } })
          .populate('incidentIds')
          .populate('vehicleIds')
          .populate('evidenceIds')
          .exec();

        return personsFromIncidentSide;
      }
    } catch (error: any) {
      // If incident model is not available or other error, just return empty array
      console.warn('Could not query incident model:', error.message);
    }

    // Return empty array if no persons found in either direction
    return [];
  }
}
