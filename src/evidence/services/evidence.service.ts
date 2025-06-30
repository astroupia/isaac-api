import { Injectable } from '@nestjs/common';
import { EvidenceRepository } from '../repositories/evidence.repository';
import { CreateEvidenceDto } from '../dtos/create-evidence.dto';
import { UpdateEvidenceDto } from '../dtos/update-evidence.dto';
import { Types } from 'mongoose';

@Injectable()
export class EvidenceService {
  constructor(private readonly evidenceRepo: EvidenceRepository) {}

  async create(dto: CreateEvidenceDto) {
    return this.evidenceRepo.create(dto);
  }

  async findById(id: string) {
    return this.evidenceRepo.findById(id);
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
}
