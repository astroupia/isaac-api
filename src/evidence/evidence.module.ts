import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EvidenceSchema } from './entities/evidence.entity';
import { EvidenceController } from './controllers/evidence.controller';
import { EvidenceService } from './services/evidence.service';
import { EvidenceRepository } from './repositories/evidence.repository';
import { IncidentModule } from '../incident/incident.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Evidence', schema: EvidenceSchema }]),
    IncidentModule,
  ],
  controllers: [EvidenceController],
  providers: [EvidenceService, EvidenceRepository],
  exports: [EvidenceService, EvidenceRepository],
})
export class EvidenceModule {}
