import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { PersonService } from '../services/person.service';
import { CreatePersonDto } from '../dtos/create-person.dto';
import { UpdatePersonDto } from '../dtos/update-person.dto';

@Controller('persons')
export class PersonController {
  constructor(private readonly personService: PersonService) {}

  @Post()
  create(@Body() dto: CreatePersonDto) {
    return this.personService.create(dto);
  }

  @Get()
  findAll() {
    return this.personService.findAll();
  }

  @Get('incident/:incidentId')
  getByIncidentId(@Param('incidentId') incidentId: string) {
    return this.personService.findByIncidentId(incidentId);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.personService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePersonDto) {
    return this.personService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.personService.delete(id);
  }
}
