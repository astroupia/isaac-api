import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  AiConversation,
  AiConversationDocument,
  MessageRole,
  ConversationStatus,
} from '../entities/ai-conversation.entity';
import {
  AiAnalysisResult,
  AiAnalysisResultDocument,
} from '../entities/ai-analysis-result.entity';
import { ReportService } from '../../report/services/report.service';
import { EvidenceService } from '../../evidence/services/evidence.service';

@Injectable()
export class ConversationService {
  private readonly logger = new Logger(ConversationService.name);
  private readonly genAI: GoogleGenerativeAI;
  private readonly defaultModel = 'gemini-2.0-flash';

  constructor(
    @InjectModel(AiConversation.name)
    private conversationModel: Model<AiConversationDocument>,
    @InjectModel(AiAnalysisResult.name)
    private aiAnalysisResultModel: Model<AiAnalysisResultDocument>,
    private configService: ConfigService,
    private reportService: ReportService,
    private evidenceService: EvidenceService,
  ) {
    const apiKey = this.configService.get<string>('GOOGLE_AI_API_KEY');
    if (!apiKey) {
      throw new Error('GOOGLE_AI_API_KEY is required for conversation service');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  /**
   * Start a new conversation about a report
   */
  async startConversation(
    reportId: string,
    userId: string,
    title: string,
    initialMessage?: string,
  ): Promise<AiConversation> {
    this.logger.log(`Starting conversation for report: ${reportId}`);

    // Verify report exists
    const report = await this.reportService.findById(reportId);
    if (!report) {
      throw new BadRequestException('Report not found');
    }

    // Get context for the conversation
    const context = await this.buildConversationContext(reportId);

    // Create conversation
    const conversation = new this.conversationModel({
      reportId,
      userId,
      title,
      context,
      messages: [],
    });

    // Add system message with context
    const systemMessage = {
      role: MessageRole.SYSTEM,
      content: this.buildSystemPrompt(context),
      timestamp: new Date(),
    };
    conversation.messages.push(systemMessage);

    // Add initial user message if provided
    if (initialMessage) {
      const userMessage = {
        role: MessageRole.USER,
        content: initialMessage,
        timestamp: new Date(),
      };
      conversation.messages.push(userMessage);

      // Generate AI response
      const aiResponse = await this.generateAIResponse(conversation);
      conversation.messages.push(aiResponse);
      conversation.totalTokensUsed += aiResponse.tokensUsed || 0;
    }

    await conversation.save();
    this.logger.log(`Conversation started: ${conversation._id}`);
    return conversation;
  }

  /**
   * Send a message in an existing conversation
   */
  async sendMessage(
    conversationId: string,
    userId: string,
    message: string,
    attachments?: Array<{ type: string; url: string; description?: string }>,
  ): Promise<any> {
    const conversation = await this.conversationModel.findById(conversationId);
    if (!conversation) {
      throw new BadRequestException('Conversation not found');
    }

    if (conversation.userId.toString() !== userId) {
      throw new BadRequestException('Unauthorized to access this conversation');
    }

    if (conversation.status !== ConversationStatus.ACTIVE) {
      throw new BadRequestException('Conversation is not active');
    }

    // Add user message
    const userMessage = {
      role: MessageRole.USER,
      content: message,
      timestamp: new Date(),
      attachments,
    };
    conversation.messages.push(userMessage);

    // Generate AI response
    const aiResponse = await this.generateAIResponse(conversation);
    conversation.messages.push(aiResponse);
    conversation.totalTokensUsed += aiResponse.tokensUsed || 0;

    await conversation.save();

    return {
      userMessage,
      aiResponse,
      conversationId: conversation._id,
      totalTokensUsed: conversation.totalTokensUsed,
    };
  }

  /**
   * Get conversation history
   */
  async getConversation(
    conversationId: string,
    userId: string,
  ): Promise<AiConversation> {
    const conversation = await this.conversationModel.findById(conversationId);
    if (!conversation) {
      throw new BadRequestException('Conversation not found');
    }

    if (conversation.userId.toString() !== userId) {
      throw new BadRequestException('Unauthorized to access this conversation');
    }

    return conversation;
  }

  /**
   * Get all conversations for a user
   */
  async getUserConversations(userId: string): Promise<AiConversation[]> {
    return this.conversationModel
      .find({ userId })
      .sort({ updatedAt: -1 })
      .exec();
  }

  /**
   * Get all conversations for a report
   */
  async getReportConversations(reportId: string): Promise<AiConversation[]> {
    return this.conversationModel
      .find({ reportId })
      .sort({ updatedAt: -1 })
      .exec();
  }

  /**
   * Archive a conversation
   */
  async archiveConversation(
    conversationId: string,
    userId: string,
  ): Promise<AiConversation> {
    const conversation = await this.conversationModel.findById(conversationId);
    if (!conversation) {
      throw new BadRequestException('Conversation not found');
    }

    if (conversation.userId.toString() !== userId) {
      throw new BadRequestException('Unauthorized to access this conversation');
    }

    conversation.status = ConversationStatus.ARCHIVED;
    await conversation.save();

    return conversation;
  }

  /**
   * Generate conversation summary
   */
  async generateConversationSummary(conversationId: string): Promise<any> {
    const conversation = await this.conversationModel.findById(conversationId);
    if (!conversation) {
      throw new BadRequestException('Conversation not found');
    }

    const userMessages = conversation.messages.filter(
      (m) => m.role === MessageRole.USER,
    );
    const aiMessages = conversation.messages.filter(
      (m) => m.role === MessageRole.ASSISTANT,
    );

    const summaryPrompt = `Please provide a summary of this conversation about a traffic accident report:

    User Messages:
    ${userMessages.map((m) => `- ${m.content}`).join('\n')}

    AI Responses:
    ${aiMessages.map((m) => `- ${m.content.substring(0, 200)}...`).join('\n')}

    Please provide a JSON summary with:
    {
      "keyFindings": ["list of key findings discussed"],
      "recommendations": ["list of recommendations made"],
      "confidenceLevel": 0.0-1.0,
      "areasOfConcern": ["areas that need attention"],
      "nextSteps": ["recommended next steps"]
    }`;

    try {
      const model = this.genAI.getGenerativeModel({ model: this.defaultModel });
      const result = await model.generateContent(summaryPrompt);
      const response = await result.response;
      const summaryText = response.text();

      // Try to parse JSON response
      let summary;
      try {
        const jsonMatch = summaryText.match(/\{[\s\S]*\}/);
        summary = jsonMatch
          ? JSON.parse(jsonMatch[0])
          : { summary: summaryText };
      } catch {
        summary = { summary: summaryText };
      }

      // Update conversation with summary
      conversation.summary = summary;
      conversation.status = ConversationStatus.COMPLETED;
      await conversation.save();

      return summary;
    } catch (error) {
      this.logger.error('Error generating conversation summary:', error);
      throw new BadRequestException('Failed to generate conversation summary');
    }
  }

  /**
   * Build conversation context from report and evidence
   */
  private async buildConversationContext(reportId: string): Promise<any> {
    const report = await this.reportService.findById(reportId);
    if (!report) {
      throw new BadRequestException('Report not found');
    }

    // Get AI analysis results for this report
    const analysisResults = await this.aiAnalysisResultModel
      .find({ reportId })
      .populate('evidenceId')
      .exec();

    // Get evidence items
    const evidenceIds = analysisResults.map((r) => r.evidenceId);
    const evidenceItems = await Promise.all(
      evidenceIds.map((id) => this.evidenceService.findById(id.toString())),
    );

    return {
      incidentId: report.incidentId,
      evidenceIds: evidenceIds,
      focusAreas: this.extractFocusAreas(analysisResults),
      analysisGoals: this.extractAnalysisGoals(report),
      reportSummary: this.buildReportSummary(report, analysisResults),
      evidenceSummary: this.buildEvidenceSummary(evidenceItems),
    };
  }

  /**
   * Build system prompt for AI conversation
   */
  private buildSystemPrompt(context: any): string {
    return `You are an expert traffic accident investigator AI assistant helping analyze a traffic accident report. 

    CONTEXT:
    - Report ID: ${context.reportId}
    - Incident ID: ${context.incidentId}
    - Evidence Items: ${context.evidenceIds?.length || 0}
    - Focus Areas: ${context.focusAreas?.join(', ') || 'General analysis'}

    REPORT SUMMARY:
    ${context.reportSummary}

    EVIDENCE SUMMARY:
    ${context.evidenceSummary}

    INSTRUCTIONS:
    1. Provide expert analysis based on the available evidence
    2. Answer questions about the incident, vehicles, persons, and circumstances
    3. Suggest additional investigation steps when appropriate
    4. Maintain objectivity and note confidence levels in your assessments
    5. Identify inconsistencies or gaps in the evidence
    6. Provide recommendations for report improvement
    7. Use technical accident investigation terminology appropriately
    8. Always cite specific evidence when making claims

    CAPABILITIES:
    - Analyze photos, videos, audio, and documents
    - Reconstruct accident sequences
    - Assess vehicle damage and causation
    - Evaluate environmental factors
    - Identify legal and safety implications
    - Suggest expert consultations needed

    LIMITATIONS:
    - Cannot access real-time data or external systems
    - Cannot provide legal advice
    - Cannot make definitive fault determinations
    - Analysis is based only on provided evidence

    Respond professionally and provide detailed, evidence-based analysis.`;
  }

  /**
   * Generate AI response to user message
   */
  private async generateAIResponse(conversation: AiConversation): Promise<any> {
    const startTime = Date.now();

    try {
      // Get recent conversation history (last 10 messages)
      const recentMessages = conversation.messages.slice(-10);

      // Build conversation prompt
      const conversationHistory = recentMessages
        .filter((m) => m.role !== MessageRole.SYSTEM)
        .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
        .join('\n\n');

      const prompt = `${recentMessages.find((m) => m.role === MessageRole.SYSTEM)?.content}

CONVERSATION HISTORY:
${conversationHistory}

Please provide a helpful, detailed response based on the evidence and context provided. 
If you need clarification or additional information, ask specific questions.
Always maintain professional tone and cite evidence when making claims.`;

      const model = this.genAI.getGenerativeModel({ model: this.defaultModel });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const processingTime = Date.now() - startTime;
      const tokensUsed = this.estimateTokens(prompt + text);

      return {
        role: MessageRole.ASSISTANT,
        content: text,
        timestamp: new Date(),
        tokensUsed,
        processingTime,
      };
    } catch (error) {
      this.logger.error('Error generating AI response:', error);
      return {
        role: MessageRole.ASSISTANT,
        content:
          'I apologize, but I encountered an error while processing your request. Please try again or rephrase your question.',
        timestamp: new Date(),
        tokensUsed: 0,
      };
    }
  }

  /**
   * Extract focus areas from analysis results
   */
  private extractFocusAreas(analysisResults: any[]): string[] {
    const focusAreas = new Set<string>();

    for (const result of analysisResults) {
      focusAreas.add(result.analysisType);

      if (result.detectedObjects) {
        if (result.detectedObjects.vehicles?.length > 0)
          focusAreas.add('vehicle_analysis');
        if (result.detectedObjects.persons?.length > 0)
          focusAreas.add('person_analysis');
        if (result.detectedObjects.roadSigns?.length > 0)
          focusAreas.add('traffic_control');
      }

      if (result.sceneAnalysis) {
        focusAreas.add('scene_reconstruction');
      }

      if (result.damageAssessment) {
        focusAreas.add('damage_assessment');
      }
    }

    return Array.from(focusAreas);
  }

  /**
   * Extract analysis goals from report
   */
  private extractAnalysisGoals(report: any): string[] {
    const goals = ['incident_analysis', 'cause_determination'];

    if (report.type === 'Investigation') {
      goals.push('detailed_investigation', 'evidence_correlation');
    }

    if (report.priority === 'High Priority') {
      goals.push('urgent_analysis', 'immediate_recommendations');
    }

    return goals;
  }

  /**
   * Build report summary for context
   */
  private buildReportSummary(report: any, analysisResults: any[]): string {
    const analysisCount = analysisResults.length;
    const avgConfidence =
      analysisResults
        .filter((r) => r.confidenceScore)
        .reduce((sum, r) => sum + r.confidenceScore, 0) /
        analysisResults.length || 0;

    return `Report: ${report.title}
Type: ${report.type}
Status: ${report.status}
Priority: ${report.priority}
AI Analyses: ${analysisCount}
Average Confidence: ${(avgConfidence * 100).toFixed(1)}%
Created: ${report.createdAt}
Last Updated: ${report.updatedAt}`;
  }

  /**
   * Build evidence summary for context
   */
  private buildEvidenceSummary(evidenceItems: any[]): string {
    const evidenceByType = evidenceItems.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {});

    const summary = Object.entries(evidenceByType)
      .map(([type, count]) => `${type}: ${count}`)
      .join(', ');

    return `Evidence Summary (${evidenceItems.length} total): ${summary}`;
  }

  /**
   * Estimate token usage
   */
  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }
}
