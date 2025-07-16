import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AiProcessingService } from './services/ai-processing.service';
import { MediaAnalysisService } from './services/media-analysis.service';
import { ReportEnhancementService } from './services/report-enhancement.service';
import { ConversationService } from './services/conversation.service';
import { AiProcessingController } from './controllers/ai-processing.controller';
import { EvidenceModule } from '../evidence/evidence.module';
import { ReportModule } from '../report/report.module';
import { AiAnalysisResultSchema } from './entities/ai-analysis-result.entity';
import { AiConversationSchema } from './entities/ai-conversation.entity';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: 'AiAnalysisResult', schema: AiAnalysisResultSchema },
      { name: 'AiConversation', schema: AiConversationSchema },
    ]),
    EvidenceModule,
    ReportModule,
  ],
  controllers: [AiProcessingController],
  providers: [
    AiProcessingService,
    MediaAnalysisService,
    ReportEnhancementService,
    ConversationService,
  ],
  exports: [
    AiProcessingService,
    MediaAnalysisService,
    ReportEnhancementService,
    ConversationService,
  ],
})
export class AiProcessingModule {}
