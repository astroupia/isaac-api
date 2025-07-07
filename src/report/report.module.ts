import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportSchema } from './entities/report.entity';
import { ReportController } from './controllers/report.controller';
import { ReportService } from './services/report.service';
import { ReportRepository } from './repositories/report.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Report', schema: ReportSchema }]),
  ],
  controllers: [ReportController],
  providers: [ReportService, ReportRepository],
  exports: [ReportService, ReportRepository],
})
export class ReportModule {}
