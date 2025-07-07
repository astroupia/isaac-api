import { Injectable } from '@nestjs/common';
import { ReportRepository } from '../repositories/report.repository';
import { CreateReportDto } from '../dtos/create-report.dto';
import { UpdateReportDto } from '../dtos/update-report.dto';

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
    // Repository handles string to ObjectId conversion
    return this.reportRepo.update(id, dto);
  }

  async delete(id: string) {
    return this.reportRepo.delete(id);
  }

  async findByIncidentId(incidentId: string) {
    return this.reportRepo.findByIncidentId(incidentId);
  }
}
