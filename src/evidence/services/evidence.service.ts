import { Injectable } from '@nestjs/common';
import { EvidenceRepository } from '../repositories/evidence.repository';
import { CreateEvidenceDto } from '../dtos/create-evidence.dto';
import { UpdateEvidenceDto } from '../dtos/update-evidence.dto';
import { Types } from 'mongoose';
import { IncidentService } from '../../incident/services/incident.service';

@Injectable()
export class EvidenceService {
  constructor(
    private readonly evidenceRepo: EvidenceRepository,
    private readonly incidentService: IncidentService,
  ) {}

  async create(dto: CreateEvidenceDto) {
    return this.evidenceRepo.create(dto);
  }

  async findById(id: string) {
    return this.evidenceRepo.findById(id);
  }

  async findAll() {
    return this.evidenceRepo.findAll();
  }

  async update(id: string, dto: UpdateEvidenceDto) {
    // Convert string IDs to ObjectId where needed
    const updateData: any = { ...dto };
    if (dto.uploadedBy) {
      updateData.uploadedBy = new Types.ObjectId(dto.uploadedBy);
    }
    if (dto.relatedTo) {
      updateData.relatedTo = {
        vehicleIds: dto.relatedTo.vehicleIds?.map(
          (id) => new Types.ObjectId(id),
        ),
        personIds: dto.relatedTo.personIds?.map((id) => new Types.ObjectId(id)),
      };
    }
    return this.evidenceRepo.update(id, updateData);
  }

  async delete(id: string) {
    return this.evidenceRepo.delete(id);
  }

  async findByIncidentId(incidentId: string) {
    const incident = await this.incidentService.findById(incidentId);
    if (!incident.evidenceIds || incident.evidenceIds.length === 0) {
      return [];
    }

    const evidenceIds = incident.evidenceIds.map((id) => id.toString());
    return this.evidenceRepo.findByIds(evidenceIds);
  }
}
