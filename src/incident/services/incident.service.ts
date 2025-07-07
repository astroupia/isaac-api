import { Injectable } from '@nestjs/common';
import { IncidentRepository } from '../repositories/incident.repository';
import { CreateIncidentDto } from '../dtos/create-incident.dto';
import { UpdateIncidentDto } from '../dtos/update-incident.dto';

@Injectable()
export class IncidentService {
  constructor(private readonly incidentRepo: IncidentRepository) {}

  async create(dto: CreateIncidentDto) {
    return this.incidentRepo.create(dto);
  }

  async findById(id: string) {
    return this.incidentRepo.findById(id);
  }

  async findAll() {
    return this.incidentRepo.findAll();
  }

  async update(id: string, dto: UpdateIncidentDto) {
    // Repository handles string to ObjectId conversion
    return this.incidentRepo.update(id, dto);
  }

  async delete(id: string) {
    return this.incidentRepo.delete(id);
  }
}
