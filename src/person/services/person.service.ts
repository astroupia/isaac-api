import { Injectable } from '@nestjs/common';
import { PersonRepository } from '../repositories/person.repository';
import { CreatePersonDto } from '../dtos/create-person.dto';
import { UpdatePersonDto } from '../dtos/update-person.dto';
import { Types } from 'mongoose';

@Injectable()
export class PersonService {
  constructor(private readonly personRepo: PersonRepository) {}

  async create(dto: CreatePersonDto) {
    return this.personRepo.create(dto);
  }

  async findById(id: string) {
    return this.personRepo.findById(id);
  }

  async findAll() {
    return this.personRepo.findAll();
  }

  async update(id: string, dto: UpdatePersonDto) {
    // Convert string IDs to ObjectId where needed
    const updateData: any = { ...dto };
    if (dto.incidentIds) {
      updateData.incidentIds = dto.incidentIds.map(
        (id) => new Types.ObjectId(id),
      );
    }
    if (dto.vehicleIds) {
      updateData.vehicleIds = dto.vehicleIds.map(
        (id) => new Types.ObjectId(id),
      );
    }
    if (dto.evidenceIds) {
      updateData.evidenceIds = dto.evidenceIds.map(
        (id) => new Types.ObjectId(id),
      );
    }
    return this.personRepo.update(id, updateData);
  }

  async delete(id: string) {
    return this.personRepo.delete(id);
  }

  async findByIncidentId(incidentId: string) {
    return this.personRepo.findByIncidentId(incidentId);
  }
}
