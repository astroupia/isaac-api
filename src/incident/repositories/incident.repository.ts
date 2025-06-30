import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  IncidentSchemaClass,
  IncidentDocument,
} from '../entities/incident.entity';
import { CreateIncidentDto } from '../dtos/create-incident.dto';

@Injectable()
export class IncidentRepository {
  constructor(
    @InjectModel('Incident')
    private readonly incidentModel: Model<IncidentDocument>,
  ) {}

  private convertToObjectId(id: string | Types.ObjectId): Types.ObjectId {
    return typeof id === 'string' ? new Types.ObjectId(id) : id;
  }

  private convertArrayToObjectIds(
    ids: (string | Types.ObjectId)[] = [],
  ): Types.ObjectId[] {
    return ids.map((id) => this.convertToObjectId(id));
  }

  async create(
    createIncidentDto: CreateIncidentDto,
  ): Promise<IncidentDocument> {
    const incident = new this.incidentModel({
      ...createIncidentDto,
      evidenceIds: this.convertArrayToObjectIds(createIncidentDto.evidenceIds),
      vehicleIds: this.convertArrayToObjectIds(createIncidentDto.vehicleIds),
      personIds: this.convertArrayToObjectIds(createIncidentDto.personIds),
      environmentId: createIncidentDto.environmentId
        ? this.convertToObjectId(createIncidentDto.environmentId)
        : undefined,
    });
    return await incident.save();
  }

  async findById(id: string): Promise<IncidentDocument> {
    const incident = await this.incidentModel
      .findById(id)
      .populate('evidenceIds')
      .populate('vehicleIds')
      .populate('personIds')
      .populate('environmentId')
      .exec();
    if (!incident) {
      throw new NotFoundException(`Incident with ID ${id} not found`);
    }
    return incident;
  }

  async update(
    id: string,
    updateData: Partial<IncidentSchemaClass>,
  ): Promise<IncidentDocument> {
    const dataToUpdate = { ...updateData };
    if (updateData.evidenceIds) {
      dataToUpdate.evidenceIds = this.convertArrayToObjectIds(
        updateData.evidenceIds,
      );
    }
    if (updateData.vehicleIds) {
      dataToUpdate.vehicleIds = this.convertArrayToObjectIds(
        updateData.vehicleIds,
      );
    }
    if (updateData.personIds) {
      dataToUpdate.personIds = this.convertArrayToObjectIds(
        updateData.personIds,
      );
    }
    if (updateData.environmentId) {
      dataToUpdate.environmentId = this.convertToObjectId(
        updateData.environmentId,
      );
    }
    const incident = await this.incidentModel
      .findByIdAndUpdate(id, dataToUpdate, { new: true })
      .exec();
    if (!incident) {
      throw new NotFoundException(`Incident with ID ${id} not found`);
    }
    return incident;
  }

  async delete(id: string): Promise<IncidentDocument> {
    const incident = await this.incidentModel.findByIdAndDelete(id).exec();
    if (!incident) {
      throw new NotFoundException(`Incident with ID ${id} not found`);
    }
    return incident;
  }

  async findAll(): Promise<IncidentDocument[]> {
    return this.incidentModel
      .find()
      .populate('evidenceIds')
      .populate('vehicleIds')
      .populate('personIds')
      .populate('environmentId')
      .exec();
  }
}
