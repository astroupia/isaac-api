import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VehicleSchema } from './entities/vehicle.entity';
import { VehicleController } from './controllers/vehicle.controller';
import { VehicleService } from './services/vehicle.service';
import { VehicleRepository } from './repositories/vehicle.repository';
import { IncidentModule } from '../incident/incident.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Vehicle', schema: VehicleSchema }]),
    IncidentModule,
  ],
  controllers: [VehicleController],
  providers: [VehicleService, VehicleRepository],
  exports: [VehicleService, VehicleRepository],
})
export class VehicleModule {}
