import { Injectable } from '@nestjs/common';
import { PersonRepository } from '../repositories/person.repository';
import { CreatePersonDto } from '../dtos/create-person.dto';
import { UpdatePersonDto } from '../dtos/update-person.dto';

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
    // Repository handles string to ObjectId conversion
    return this.personRepo.update(id, dto);
  }

  async delete(id: string) {
    return this.personRepo.delete(id);
  }

  async findByIncidentId(incidentId: string) {
    return this.personRepo.findByIncidentId(incidentId);
  }
}
