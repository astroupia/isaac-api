import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  EvidenceSchemaClass,
  EvidenceDocument,
} from '../entities/evidence.entity';
import { CreateEvidenceDto } from '../dtos/create-evidence.dto';
import {
  convertToObjectId,
  convertArrayToObjectIds,
} from '../../common/objectid.utils';

@Injectable()
export class EvidenceRepository {
  constructor(
    @InjectModel('Evidence')
    private readonly evidenceModel: Model<EvidenceDocument>,
  ) {}

  async create(
    createEvidenceDto: CreateEvidenceDto,
  ): Promise<EvidenceDocument> {
    try {
      const evidence = new this.evidenceModel({
        ...createEvidenceDto,
        uploadedBy: convertToObjectId(createEvidenceDto.uploadedBy),
        relatedTo: createEvidenceDto.relatedTo
          ? {
              vehicleIds: convertArrayToObjectIds(
                createEvidenceDto.relatedTo.vehicleIds,
              ),
              personIds: convertArrayToObjectIds(
                createEvidenceDto.relatedTo.personIds,
              ),
            }
          : undefined,
      });
      return await evidence.save();
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

  async findById(id: string): Promise<EvidenceDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid ObjectId format: ${id}`);
    }

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
    updateData: Partial<CreateEvidenceDto>,
  ): Promise<EvidenceDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid ObjectId format: ${id}`);
    }

    try {
      const dataToUpdate: any = { ...updateData };
      if (updateData.uploadedBy) {
        dataToUpdate.uploadedBy = convertToObjectId(updateData.uploadedBy);
      }
      if (updateData.relatedTo) {
        dataToUpdate.relatedTo = {
          vehicleIds: convertArrayToObjectIds(updateData.relatedTo.vehicleIds),
          personIds: convertArrayToObjectIds(updateData.relatedTo.personIds),
        };
      }
      const evidence = await this.evidenceModel
        .findByIdAndUpdate(id, dataToUpdate, { new: true })
        .exec();
      if (!evidence) {
        throw new NotFoundException(`Evidence with ID ${id} not found`);
      }
      return evidence;
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

  async delete(id: string): Promise<EvidenceDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid ObjectId format: ${id}`);
    }

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
    const objectIds = ids.map((id) => convertToObjectId(id));
    return this.evidenceModel
      .find({ _id: { $in: objectIds } })
      .populate('uploadedBy')
      .exec();
  }
}
