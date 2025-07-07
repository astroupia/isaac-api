import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { CloudinaryController } from './cloudinary/controllers/cloudinary.controller';
import { CloudinaryService } from './cloudinary/services/cloudinary.service';
import { IncidentModule } from './incident/incident.module';
import { ReportModule } from './report/report.module';
import { EvidenceModule } from './evidence/evidence.module';
import { VehicleModule } from './vehicle/vehicle.module';
import { PersonModule } from './person/person.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      }),
      inject: [ConfigService],
    }),
    IncidentModule,
    ReportModule,
    EvidenceModule,
    VehicleModule,
    PersonModule,
    UserModule,
    CloudinaryModule,
  ],
  controllers: [CloudinaryController],
  providers: [CloudinaryService],
})
export class AppModule {}
