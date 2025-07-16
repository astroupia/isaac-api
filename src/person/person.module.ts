import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PersonSchema } from './entities/person.entity';
import { IncidentSchema } from '../incident/entities/incident.entity';
import { PersonController } from './controllers/person.controller';
import { PersonService } from './services/person.service';
import { PersonRepository } from './repositories/person.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Person', schema: PersonSchema },
      { name: 'Incident', schema: IncidentSchema },
    ]),
  ],
  controllers: [PersonController],
  providers: [PersonService, PersonRepository],
  exports: [PersonService, PersonRepository],
})
export class PersonModule {}
