import { Injectable } from '@nestjs/common';
import { VehicleRepository } from '../repositories/vehicle.repository';
import { CreateVehicleDto } from '../dtos/create-vehicle.dto';
import { UpdateVehicleDto } from '../dtos/update-vehicle.dto';

@Injectable()
export class VehicleService {
  constructor(private readonly vehicleRepo: VehicleRepository) {}

  create(dto: CreateVehicleDto) {
    return this.vehicleRepo.create(dto);
  }

  findById(id: string) {
    return this.vehicleRepo.findById(id);
  }

  update(id: string, dto: UpdateVehicleDto) {
    return this.vehicleRepo.update(id, dto);
  }

  delete(id: string) {
    return this.vehicleRepo.delete(id);
  }

  findAll() {
    return this.vehicleRepo.findAll();
  }

  async findByIncidentId(incidentId: string) {
    return this.vehicleRepo.findByIncidentId(incidentId);
  }
}
