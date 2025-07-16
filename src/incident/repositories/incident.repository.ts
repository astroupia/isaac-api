import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  IncidentSchemaClass,
  IncidentDocument,
} from '../entities/incident.entity';
import { CreateIncidentDto } from '../dtos/create-incident.dto';
import { convertToObjectId, convertArrayToObjectIds } from '../../common/objectid.utils';

@Injectable()
export class IncidentRepository {
  constructor(
    @InjectModel('Incident')
    private readonly incidentModel: Model<IncidentDocument>,
  ) {}

  async create(
    createIncidentDto: CreateIncidentDto,
  ): Promise<IncidentDocument> {
    try {
      const incident = new this.incidentModel({
        ...createIncidentDto,
        evidenceIds: convertArrayToObjectIds(
          createIncidentDto.evidenceIds,
        ),
        vehicleIds: convertArrayToObjectIds(createIncidentDto.vehicleIds),
        personIds: convertArrayToObjectIds(createIncidentDto.personIds),
        environmentId: createIncidentDto.environmentId
          ? convertToObjectId(createIncidentDto.environmentId)
          : undefined,
      });
      return await incident.save();
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

  async findById(id: string): Promise<IncidentDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid ObjectId format: ${id}`);
    }

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
    updateData: Partial<CreateIncidentDto>,
  ): Promise<IncidentDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid ObjectId format: ${id}`);
    }

    try {
      const dataToUpdate: any = { ...updateData };
      if (updateData.evidenceIds) {
        dataToUpdate.evidenceIds = convertArrayToObjectIds(
          updateData.evidenceIds,
        );
      }
      if (updateData.vehicleIds) {
        dataToUpdate.vehicleIds = convertArrayToObjectIds(
          updateData.vehicleIds,
        );
      }
      if (updateData.personIds) {
        dataToUpdate.personIds = convertArrayToObjectIds(
          updateData.personIds,
        );
      }
      if (updateData.environmentId) {
        dataToUpdate.environmentId = convertToObjectId(
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

  async delete(id: string): Promise<IncidentDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid ObjectId format: ${id}`);
    }

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
