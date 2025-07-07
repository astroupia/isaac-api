import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { VehicleService } from '../services/vehicle.service';
import { CreateVehicleDto } from '../dtos/create-vehicle.dto';
import { UpdateVehicleDto } from '../dtos/update-vehicle.dto';

@Controller('vehicles')
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Post()
  create(@Body() dto: CreateVehicleDto) {
    return this.vehicleService.create(dto);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.vehicleService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateVehicleDto) {
    return this.vehicleService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.vehicleService.delete(id);
  }

  @Get()
  findAll() {
    return this.vehicleService.findAll();
  }

  @Get('incident/:incidentId')
  getByIncidentId(@Param('incidentId') incidentId: string) {
    return this.vehicleService.findByIncidentId(incidentId);
  }
}
