import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './infrastructure/database/database.module';
import { PersonModule } from './person/person.module';
import { VehicleModule } from './vehicle/vehicle.module';
import { EvidenceModule } from './evidence/evidence.module';
import { ReportModule } from './report/report.module';
import { IncidentModule } from './incident/incident.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { UserModule } from './user/user.module';
import { AiProcessingModule } from './ai-processing/ai-processing.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    DatabaseModule,
    PersonModule,
    VehicleModule,
    EvidenceModule,
    ReportModule,
    IncidentModule,
    CloudinaryModule,
    UserModule,
    AiProcessingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
