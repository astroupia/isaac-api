import { Injectable } from '@nestjs/common';
import { VehicleRepository } from '../repositories/vehicle.repository';
import { CreateVehicleDto } from '../dtos/create-vehicle.dto';
import { UpdateVehicleDto } from '../dtos/update-vehicle.dto';
import { IncidentService } from '../../incident/services/incident.service';
import { objectIdToString } from '../../common/objectid.utils';

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
    const incident = await this.incidentService.findById(incidentId);
    if (!incident.vehicleIds || incident.vehicleIds.length === 0) {
      return [];
    }

    const vehicleIds = incident.vehicleIds.map((id) => objectIdToString(id));
    return this.vehicleRepo.findByIds(vehicleIds);
  }
}
