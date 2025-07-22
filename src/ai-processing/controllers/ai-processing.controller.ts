import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { AiProcessingService } from '../services/ai-processing.service';
import { MediaAnalysisService } from '../services/media-analysis.service';
import { ReportEnhancementService } from '../services/report-enhancement.service';
import { ConversationService } from '../services/conversation.service';
import { EvidenceType } from '../../types/evidence';

// DTOs for request/response
interface ProcessEvidenceDto {
  evidenceId: string;
  evidenceType: EvidenceType;
  fileUrl: string;
  customPrompt?: string;
  reportId?: string;
  incidentId?: string;
}

interface BatchAnalysisDto {
  evidenceItems: Array<{
    evidenceId: string;
    type: EvidenceType;
    fileUrl: string;
    customPrompt?: string;
  }>;
  reportId?: string;
  incidentId?: string;
}

interface StartConversationDto {
  reportId: string;
  title: string;
  initialMessage?: string;
}

interface SendMessageDto {
  message: string;
  attachments?: Array<{
    type: string;
    url: string;
    description?: string;
  }>;
}

@Controller('ai-processing')
export class AiProcessingController {
  constructor(
    private aiProcessingService: AiProcessingService,
    private mediaAnalysisService: MediaAnalysisService,
    private reportEnhancementService: ReportEnhancementService,
    private conversationService: ConversationService,
  ) {}

  /**
   * Process single evidence item with AI
   */
  @Post('evidence/process')
  @HttpCode(HttpStatus.ACCEPTED)
  async processEvidence(@Body() dto: ProcessEvidenceDto) {
    const result = await this.aiProcessingService.processEvidence(
      dto.evidenceId,
      dto.evidenceType,
      dto.fileUrl,
      dto.customPrompt,
      dto.reportId,
      dto.incidentId,
    );

    return {
      success: true,
      data: result,
      message: 'Evidence processing started successfully',
    };
  }

  /**
   * Process multiple evidence items in batch
   */
  @Post('evidence/batch-process')
  @HttpCode(HttpStatus.ACCEPTED)
  async batchProcessEvidence(@Body() dto: BatchAnalysisDto) {
    const results = await this.mediaAnalysisService.batchAnalyze(
      dto.evidenceItems,
      dto.reportId,
      dto.incidentId,
    );

    const successful = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    return {
      success: true,
      data: {
        results,
        summary: {
          total: results.length,
          successful,
          failed,
        },
      },
      message: `Batch processing completed: ${successful} successful, ${failed} failed`,
    };
  }

  /**
   * Get analysis results for evidence
   */
  @Get('evidence/:evidenceId/results')
  async getEvidenceAnalysisResults(@Param('evidenceId') evidenceId: string) {
    const results =
      await this.aiProcessingService.getAnalysisResults(evidenceId);

    return {
      success: true,
      data: results,
      message: 'Analysis results retrieved successfully',
    };
  }

  /**
   * Retry failed analysis
   */
  @Post('analysis/:analysisId/retry')
  async retryAnalysis(@Param('analysisId') analysisId: string) {
    const result = await this.aiProcessingService.retryAnalysis(analysisId);

    return {
      success: true,
      data: result,
      message: 'Analysis retry initiated successfully',
    };
  }

  /**
   * Analyze image evidence
   */
  @Post('media/image/analyze')
  async analyzeImage(@Body() dto: ProcessEvidenceDto) {
    const result = await this.mediaAnalysisService.analyzeImage(
      dto.evidenceId,
      dto.fileUrl,
      dto.customPrompt,
      dto.reportId,
      dto.incidentId,
    );

    return {
      success: true,
      data: result,
      message: 'Image analysis completed successfully',
    };
  }

  /**
   * Analyze video evidence
   */
  @Post('media/video/analyze')
  async analyzeVideo(@Body() dto: ProcessEvidenceDto) {
    const result = await this.mediaAnalysisService.analyzeVideo(
      dto.evidenceId,
      dto.fileUrl,
      dto.customPrompt,
      dto.reportId,
      dto.incidentId,
    );

    return {
      success: true,
      data: result,
      message: 'Video analysis completed successfully',
    };
  }

  /**
   * Analyze audio evidence
   */
  @Post('media/audio/analyze')
  async analyzeAudio(@Body() dto: ProcessEvidenceDto) {
    const result = await this.mediaAnalysisService.analyzeAudio(
      dto.evidenceId,
      dto.fileUrl,
      dto.customPrompt,
      dto.reportId,
      dto.incidentId,
    );

    return {
      success: true,
      data: result,
      message: 'Audio analysis completed successfully',
    };
  }

  /**
   * Analyze document evidence
   */
  @Post('media/document/analyze')
  async analyzeDocument(@Body() dto: ProcessEvidenceDto) {
    const result = await this.mediaAnalysisService.analyzeDocument(
      dto.evidenceId,
      dto.fileUrl,
      dto.customPrompt,
      dto.reportId,
      dto.incidentId,
    );

    return {
      success: true,
      data: result,
      message: 'Document analysis completed successfully',
    };
  }

  /**
   * Enhance report with AI analysis
   */
  @Post('reports/:reportId/enhance')
  async enhanceReport(@Param('reportId') reportId: string) {
    const result = await this.reportEnhancementService.enhanceReport(reportId);

    return {
      success: true,
      data: result,
      message: 'Report enhanced successfully with AI analysis',
    };
  }

  /**
   * Get analysis results for report
   */
  @Get('reports/:reportId/results')
  async getReportAnalysisResults(@Param('reportId') reportId: string) {
    const results =
      await this.aiProcessingService.getReportAnalysisResults(reportId);

    return {
      success: true,
      data: results,
      message: 'Report analysis results retrieved successfully',
    };
  }

  /**
   * Update report with new analysis
   */
  @Put('reports/:reportId/analysis/:analysisId')
  async updateReportWithAnalysis(
    @Param('reportId') reportId: string,
    @Param('analysisId') analysisId: string,
  ) {
    const result = await this.reportEnhancementService.updateReportWithAnalysis(
      reportId,
      analysisId,
    );

    return {
      success: true,
      data: result,
      message: 'Report updated with analysis successfully',
    };
  }

  /**
   * Generate recommendations for report
   */
  @Post('reports/:reportId/recommendations')
  async generateRecommendations(@Param('reportId') reportId: string) {
    const recommendations =
      await this.reportEnhancementService.generateRecommendations(reportId);

    return {
      success: true,
      data: recommendations,
      message: 'Recommendations generated successfully',
    };
  }

  /**
   * Generate incident summary
   */
  @Post('incidents/:incidentId/summary')
  async generateIncidentSummary(@Param('incidentId') incidentId: string) {
    const summary =
      await this.reportEnhancementService.generateIncidentSummary(incidentId);

    return {
      success: true,
      data: summary,
      message: 'Incident summary generated successfully',
    };
  }

  /**
   * Generate comprehensive casualty report from report ID
   * This endpoint:
   * 1. Gets the report by ID
   * 2. Extracts the incident ID from the report
   * 3. Fetches all evidence for that incident
   * 4. Processes all evidence in batch
   * 5. Generates a comprehensive casualty report
   */
  @Post('reports/:reportId/generate-casualty-report')
  async generateCasualtyReport(@Param('reportId') reportId: string) {
    const result =
      await this.reportEnhancementService.generateCasualtyReport(reportId);

    return {
      success: true,
      data: result,
      message: 'Comprehensive casualty report generated successfully',
    };
  }

  /**
   * Get generated casualty report by report ID
   * This endpoint retrieves a previously generated casualty report from the database
   */
  @Get('reports/:reportId/casualty-report')
  async getGeneratedCasualtyReport(@Param('reportId') reportId: string) {
    const result =
      await this.reportEnhancementService.getGeneratedCasualtyReport(reportId);

    return {
      success: true,
      data: result,
      message: 'Generated casualty report retrieved successfully',
    };
  }

  /**
   * Get all generated casualty reports
   * This endpoint retrieves all generated casualty reports with optional filtering
   */
  @Get('casualty-reports')
  async getAllGeneratedCasualtyReports(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Query('incidentId') incidentId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    const result =
      await this.reportEnhancementService.getAllGeneratedCasualtyReports({
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 10,
        sortBy: sortBy || 'generatedAt',
        sortOrder: sortOrder || 'desc',
        incidentId,
        dateFrom: dateFrom ? new Date(dateFrom) : undefined,
        dateTo: dateTo ? new Date(dateTo) : undefined,
      });

    return {
      success: true,
      data: result,
      message: 'All generated casualty reports retrieved successfully',
    };
  }

  /**
   * Start a new conversation about a report
   */
  @Post('conversations/start')
  async startConversation(
    @Body() dto: StartConversationDto,
    @Query('userId') userId: string,
  ) {
    const conversation = await this.conversationService.startConversation(
      dto.reportId,
      userId,
      dto.title,
      dto.initialMessage,
    );

    return {
      success: true,
      data: conversation,
      message: 'Conversation started successfully',
    };
  }

  /**
   * Send message in conversation
   */
  @Post('conversations/:conversationId/message')
  async sendMessage(
    @Param('conversationId') conversationId: string,
    @Body() dto: SendMessageDto,
    @Query('userId') userId: string,
  ) {
    const result = await this.conversationService.sendMessage(
      conversationId,
      userId,
      dto.message,
      dto.attachments,
    );

    return {
      success: true,
      data: result,
      message: 'Message sent successfully',
    };
  }

  /**
   * Get conversation history
   */
  @Get('conversations/:conversationId')
  async getConversation(
    @Param('conversationId') conversationId: string,
    @Query('userId') userId: string,
  ) {
    const conversation = await this.conversationService.getConversation(
      conversationId,
      userId,
    );

    return {
      success: true,
      data: conversation,
      message: 'Conversation retrieved successfully',
    };
  }

  /**
   * Get user's conversations
   */
  @Get('conversations/user/:userId')
  async getUserConversations(@Param('userId') userId: string) {
    const conversations =
      await this.conversationService.getUserConversations(userId);

    return {
      success: true,
      data: conversations,
      message: 'User conversations retrieved successfully',
    };
  }

  /**
   * Get conversations for a report
   */
  @Get('conversations/report/:reportId')
  async getReportConversations(@Param('reportId') reportId: string) {
    const conversations =
      await this.conversationService.getReportConversations(reportId);

    return {
      success: true,
      data: conversations,
      message: 'Report conversations retrieved successfully',
    };
  }

  /**
   * Archive conversation
   */
  @Put('conversations/:conversationId/archive')
  async archiveConversation(
    @Param('conversationId') conversationId: string,
    @Query('userId') userId: string,
  ) {
    const conversation = await this.conversationService.archiveConversation(
      conversationId,
      userId,
    );

    return {
      success: true,
      data: conversation,
      message: 'Conversation archived successfully',
    };
  }

  /**
   * Generate conversation summary
   */
  @Post('conversations/:conversationId/summary')
  async generateConversationSummary(
    @Param('conversationId') conversationId: string,
  ) {
    const summary =
      await this.conversationService.generateConversationSummary(
        conversationId,
      );

    return {
      success: true,
      data: summary,
      message: 'Conversation summary generated successfully',
    };
  }

  /**
   * Health check endpoint
   */
  @Get('health')
  async healthCheck() {
    return {
      success: true,
      data: {
        service: 'AI Processing Service',
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
      message: 'AI Processing Service is healthy',
    };
  }

  /**
   * Get service statistics
   */
  @Get('stats')
  async getStats() {
    // This would typically aggregate statistics from the database
    return {
      success: true,
      data: {
        totalAnalyses: 0, // Would be calculated from database
        totalConversations: 0,
        averageConfidence: 0,
        processingTime: 0,
        popularAnalysisTypes: [],
      },
      message: 'Statistics retrieved successfully',
    };
  }
}
