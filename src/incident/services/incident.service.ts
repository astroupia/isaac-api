import { Injectable } from '@nestjs/common';
import { IncidentRepository } from '../repositories/incident.repository';
import { CreateIncidentDto } from '../dtos/create-incident.dto';
import { UpdateIncidentDto } from '../dtos/update-incident.dto';
import { Types } from 'mongoose';

@Injectable()
export class IncidentService {
  constructor(private readonly incidentRepo: IncidentRepository) {}

  async create(dto: CreateIncidentDto) {
    return this.incidentRepo.create(dto);
  }

  async findById(id: string) {
    return this.incidentRepo.findById(id);
  }

  async update(id: string, dto: UpdateIncidentDto) {
    // Convert string IDs to ObjectId where needed
    const updateData: any = { ...dto };
    if (dto.environmentId) {
      updateData.environmentId = new Types.ObjectId(dto.environmentId);
    }
    if (dto.evidenceIds) {
      updateData.evidenceIds = dto.evidenceIds.map(
        (id) => new Types.ObjectId(id),
      );
    }
    if (dto.vehicleIds) {
      updateData.vehicleIds = dto.vehicleIds.map(
        (id) => new Types.ObjectId(id),
      );
    }
    if (dto.personIds) {
      updateData.personIds = dto.personIds.map((id) => new Types.ObjectId(id));
    }
    return this.incidentRepo.update(id, updateData);
  }

  async delete(id: string) {
    return this.incidentRepo.delete(id);
  }
}
