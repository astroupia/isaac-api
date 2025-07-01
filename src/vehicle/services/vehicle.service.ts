import { Injectable } from '@nestjs/common';
import { VehicleRepository } from '../repositories/vehicle.repository';
import { CreateVehicleDto } from '../dtos/create-vehicle.dto';
import { VehicleSchemaClass } from '../entities/vehicle.entity';
import { IncidentService } from '../../incident/services/incident.service';

@Injectable()
export class VehicleService {
  constructor(
    private readonly vehicleRepo: VehicleRepository,
    private readonly incidentService: IncidentService,
  ) {}

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

  async findByIncidentId(incidentId: string) {
    const incident = await this.incidentService.findById(incidentId);
    if (!incident.vehicleIds || incident.vehicleIds.length === 0) {
      return [];
    }

    const vehicleIds = incident.vehicleIds.map((id) => id.toString());
    return this.vehicleRepo.findByIds(vehicleIds);
  }
}
