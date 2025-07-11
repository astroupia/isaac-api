import { Injectable } from '@nestjs/common';
import { EvidenceRepository } from '../repositories/evidence.repository';
import { CreateEvidenceDto } from '../dtos/create-evidence.dto';
import { UpdateEvidenceDto } from '../dtos/update-evidence.dto';
import { IncidentService } from '../../incident/services/incident.service';
import { objectIdToString } from '../../common/objectid.utils';

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
    // Repository handles string to ObjectId conversion
    return this.evidenceRepo.update(id, dto);
  }

  async delete(id: string) {
    return this.evidenceRepo.delete(id);
  }

  async findByIncidentId(incidentId: string) {
    const incident = await this.incidentService.findById(incidentId);
    if (!incident.evidenceIds || incident.evidenceIds.length === 0) {
      return [];
    }

    const evidenceIds = incident.evidenceIds.map((id) => objectIdToString(id));
    return this.evidenceRepo.findByIds(evidenceIds);
  }
}
