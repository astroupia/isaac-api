import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { EvidenceService } from '../services/evidence.service';
import { CreateEvidenceDto } from '../dtos/create-evidence.dto';
import { UpdateEvidenceDto } from '../dtos/update-evidence.dto';

@Controller('evidence')
export class EvidenceController {
  constructor(private readonly evidenceService: EvidenceService) {}

  @Post()
  create(@Body() dto: CreateEvidenceDto) {
    return this.evidenceService.create(dto);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.evidenceService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEvidenceDto) {
    return this.evidenceService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.evidenceService.delete(id);
  }
}
