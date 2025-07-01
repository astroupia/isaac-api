import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PersonSchemaClass, PersonDocument } from '../entities/person.entity';
import { CreatePersonDto } from '../dtos/create-person.dto';

@Injectable()
export class PersonRepository {
  constructor(
    @InjectModel('Person')
    private readonly personModel: Model<PersonDocument>,
  ) {}

  private convertToObjectId(id: string | Types.ObjectId): Types.ObjectId {
    return typeof id === 'string' ? new Types.ObjectId(id) : id;
  }

  private convertArrayToObjectIds(
    ids: (string | Types.ObjectId)[] = [],
  ): Types.ObjectId[] {
    return ids.map((id) => this.convertToObjectId(id));
  }

  async create(createPersonDto: CreatePersonDto): Promise<PersonDocument> {
    const person = new this.personModel({
      ...createPersonDto,
      incidentIds: this.convertArrayToObjectIds(createPersonDto.incidentIds),
      vehicleIds: this.convertArrayToObjectIds(createPersonDto.vehicleIds),
      evidenceIds: this.convertArrayToObjectIds(createPersonDto.evidenceIds),
    });
    return await person.save();
  }

  async findById(id: string): Promise<PersonDocument> {
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
    updateData: Partial<PersonSchemaClass>,
  ): Promise<PersonDocument> {
    const dataToUpdate = { ...updateData };
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
  }

  async delete(id: string): Promise<PersonDocument> {
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
    return this.personModel
      .find({ incidentIds: this.convertToObjectId(incidentId) })
      .populate('incidentIds')
      .populate('vehicleIds')
      .populate('evidenceIds')
      .exec();
  }
}
