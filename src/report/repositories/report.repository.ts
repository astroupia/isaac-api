import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ReportSchemaClass, ReportDocument } from '../entities/report.entity';
import { CreateReportDto } from '../dtos/create-report.dto';

@Injectable()
export class ReportRepository {
  constructor(
    @InjectModel('Report')
    private readonly reportModel: Model<ReportDocument>,
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

  async create(createReportDto: CreateReportDto): Promise<ReportDocument> {
    try {
      const report = new this.reportModel({
        ...createReportDto,
        incidentId: this.convertToObjectId(createReportDto.incidentId),
        createdBy: this.convertToObjectId(createReportDto.createdBy),
        assignedTo: createReportDto.assignedTo
          ? this.convertToObjectId(createReportDto.assignedTo)
          : undefined,
        approvedBy: createReportDto.approvedBy
          ? this.convertToObjectId(createReportDto.approvedBy)
          : undefined,
        relatedReports: this.convertArrayToObjectIds(
          createReportDto.relatedReports,
        ),
      });
      return await report.save();
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

  async findById(id: string): Promise<ReportDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid ObjectId format: ${id}`);
    }

    const report = await this.reportModel
      .findById(id)
      .populate('incidentId')
      .populate('createdBy')
      .populate('assignedTo')
      .populate('approvedBy')
      .populate('relatedReports')
      .exec();
    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }
    return report;
  }

  async update(
    id: string,
    updateData: Partial<CreateReportDto>,
  ): Promise<ReportDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid ObjectId format: ${id}`);
    }

    try {
      const dataToUpdate: any = { ...updateData };
      if (updateData.incidentId) {
        dataToUpdate.incidentId = this.convertToObjectId(updateData.incidentId);
      }
      if (updateData.createdBy) {
        dataToUpdate.createdBy = this.convertToObjectId(updateData.createdBy);
      }
      if (updateData.assignedTo) {
        dataToUpdate.assignedTo = this.convertToObjectId(updateData.assignedTo);
      }
      if (updateData.approvedBy) {
        dataToUpdate.approvedBy = this.convertToObjectId(updateData.approvedBy);
      }
      if (updateData.relatedReports) {
        dataToUpdate.relatedReports = this.convertArrayToObjectIds(
          updateData.relatedReports,
        );
      }
      const report = await this.reportModel
        .findByIdAndUpdate(id, dataToUpdate, { new: true })
        .exec();
      if (!report) {
        throw new NotFoundException(`Report with ID ${id} not found`);
      }
      return report;
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

  async delete(id: string): Promise<ReportDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid ObjectId format: ${id}`);
    }

    const report = await this.reportModel.findByIdAndDelete(id).exec();
    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }
    return report;
  }

  async findAll(): Promise<ReportDocument[]> {
    return this.reportModel
      .find()
      .populate('incidentId')
      .populate('createdBy')
      .populate('assignedTo')
      .populate('approvedBy')
      .populate('relatedReports')
      .exec();
  }

  async findByIncidentId(incidentId: string): Promise<ReportDocument[]> {
    if (!Types.ObjectId.isValid(incidentId)) {
      throw new BadRequestException(`Invalid ObjectId format: ${incidentId}`);
    }

    return this.reportModel
      .find({ incidentId: this.convertToObjectId(incidentId) })
      .populate('incidentId')
      .populate('createdBy')
      .populate('assignedTo')
      .populate('approvedBy')
      .populate('relatedReports')
      .exec();
  }
}
