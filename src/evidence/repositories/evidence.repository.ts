import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  EvidenceSchemaClass,
  EvidenceDocument,
} from '../entities/evidence.entity';
import { CreateEvidenceDto } from '../dtos/create-evidence.dto';

@Injectable()
export class EvidenceRepository {
  constructor(
    @InjectModel('Evidence')
    private readonly evidenceModel: Model<EvidenceDocument>,
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
    createEvidenceDto: CreateEvidenceDto,
  ): Promise<EvidenceDocument> {
    const evidence = new this.evidenceModel({
      ...createEvidenceDto,
      uploadedBy: this.convertToObjectId(createEvidenceDto.uploadedBy),
      relatedTo: createEvidenceDto.relatedTo
        ? {
            vehicleIds: this.convertArrayToObjectIds(
              createEvidenceDto.relatedTo.vehicleIds,
            ),
            personIds: this.convertArrayToObjectIds(
              createEvidenceDto.relatedTo.personIds,
            ),
          }
        : undefined,
    });
    return await evidence.save();
  }

  async findById(id: string): Promise<EvidenceDocument> {
    const evidence = await this.evidenceModel
      .findById(id)
      .populate('uploadedBy')
      .exec();
    if (!evidence) {
      throw new NotFoundException(`Evidence with ID ${id} not found`);
    }
    return evidence;
  }

  async update(
    id: string,
    updateData: Partial<EvidenceSchemaClass>,
  ): Promise<EvidenceDocument> {
    const dataToUpdate = { ...updateData };
    if (updateData.uploadedBy) {
      dataToUpdate.uploadedBy = this.convertToObjectId(updateData.uploadedBy);
    }
    if (updateData.relatedTo) {
      dataToUpdate.relatedTo = {
        vehicleIds: this.convertArrayToObjectIds(
          updateData.relatedTo.vehicleIds,
        ),
        personIds: this.convertArrayToObjectIds(updateData.relatedTo.personIds),
      };
    }
    const evidence = await this.evidenceModel
      .findByIdAndUpdate(id, dataToUpdate, { new: true })
      .exec();
    if (!evidence) {
      throw new NotFoundException(`Evidence with ID ${id} not found`);
    }
    return evidence;
  }

  async delete(id: string): Promise<EvidenceDocument> {
    const evidence = await this.evidenceModel.findByIdAndDelete(id).exec();
    if (!evidence) {
      throw new NotFoundException(`Evidence with ID ${id} not found`);
    }
    return evidence;
  }

  async findAll(): Promise<EvidenceDocument[]> {
    return this.evidenceModel.find().populate('uploadedBy').exec();
  }

  async findByIds(ids: string[]): Promise<EvidenceDocument[]> {
    const objectIds = ids.map((id) => this.convertToObjectId(id));
    return this.evidenceModel
      .find({ _id: { $in: objectIds } })
      .populate('uploadedBy')
      .exec();
  }
}
