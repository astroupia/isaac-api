import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Incident, IncidentSchema } from './entities/incident.entity';
import { IncidentController } from './controllers/incident.controller';
import { IncidentService } from './services/incident.service';
import { IncidentRepository } from './repositories/incident.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Incident.name, schema: IncidentSchema },
    ]),
  ],
  controllers: [IncidentController],
  providers: [IncidentService, IncidentRepository],
  exports: [IncidentService, IncidentRepository],
})
export class IncidentModule {}
