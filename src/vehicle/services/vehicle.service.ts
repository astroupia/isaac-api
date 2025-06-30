import { Injectable } from '@nestjs/common';
import { VehicleRepository } from '../repositories/vehicle.repository';
import { CreateVehicleDto } from '../dtos/create-vehicle.dto';
import { VehicleSchemaClass } from '../entities/vehicle.entity';

@Injectable()
export class VehicleService {
  constructor(private readonly vehicleRepo: VehicleRepository) {}

  create(dto: CreateVehicleDto) {
    return this.vehicleRepo.create(dto);
  }

  findById(id: string) {
    return this.vehicleRepo.findById(id);
  }

  update(id: string, dto: Partial<VehicleSchemaClass>) {
    return this.vehicleRepo.update(id, dto);
  }

  delete(id: string) {
    return this.vehicleRepo.delete(id);
  }

  findAll() {
    return this.vehicleRepo.findAll();
  }
}
