import { Injectable } from '@nestjs/common';
import { ReportRepository } from '../repositories/report.repository';
import { CreateReportDto } from '../dtos/create-report.dto';
import { UpdateReportDto } from '../dtos/update-report.dto';
import { Types } from 'mongoose';

@Injectable()
export class ReportService {
  constructor(private readonly reportRepo: ReportRepository) {}

  async create(dto: CreateReportDto) {
    return this.reportRepo.create(dto);
  }

  async findById(id: string) {
    return this.reportRepo.findById(id);
  }

  async findAll() {
    return this.reportRepo.findAll();
  }

  async update(id: string, dto: UpdateReportDto) {
    // Convert string IDs to ObjectId where needed
    const updateData: any = { ...dto };
    if (dto.incidentId) {
      updateData.incidentId = new Types.ObjectId(dto.incidentId);
    }
    if (dto.createdBy) {
      updateData.createdBy = new Types.ObjectId(dto.createdBy);
    }
    if (dto.assignedTo) {
      updateData.assignedTo = new Types.ObjectId(dto.assignedTo);
    }
    if (dto.approvedBy) {
      updateData.approvedBy = new Types.ObjectId(dto.approvedBy);
    }
    if (dto.relatedReports) {
      updateData.relatedReports = dto.relatedReports.map(
        (id) => new Types.ObjectId(id),
      );
    }
    return this.reportRepo.update(id, updateData);
  }

  async delete(id: string) {
    return this.reportRepo.delete(id);
  }

  async findByIncidentId(incidentId: string) {
    return this.reportRepo.findByIncidentId(incidentId);
  }
}
