import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { IncidentService } from '../services/incident.service';
import { CreateIncidentDto } from '../dtos/create-incident.dto';
import { UpdateIncidentDto } from '../dtos/update-incident.dto';

@Controller('incidents')
export class IncidentController {
  constructor(private readonly incidentService: IncidentService) {}

  @Post()
  create(@Body() dto: CreateIncidentDto) {
    return this.incidentService.create(dto);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.incidentService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateIncidentDto) {
    return this.incidentService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.incidentService.delete(id);
  }
}
