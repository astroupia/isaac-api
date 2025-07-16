import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  AiAnalysisResult,
  AiAnalysisResultDocument,
  AnalysisType,
  AnalysisStatus,
} from '../entities/ai-analysis-result.entity';
import { EvidenceType } from '../../types/evidence';
import { ObjectIdUtils } from '../../common/utils/objectid.utils';

@Injectable()
export class AiProcessingService {
  private readonly logger = new Logger(AiProcessingService.name);
  private readonly genAI: GoogleGenerativeAI;
  private readonly defaultModel = 'gemini-2.0-flash'; // Best free tier model for multimodal

  constructor(
    private configService: ConfigService,
    @InjectModel(AiAnalysisResult.name)
    private aiAnalysisResultModel: Model<AiAnalysisResultDocument>,
  ) {
    const apiKey = this.configService.get<string>('GOOGLE_AI_API_KEY');
    if (!apiKey) {
      throw new Error('GOOGLE_AI_API_KEY is required for AI processing');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  /**
   * Process evidence with AI analysis
   */
  async processEvidence(
    evidenceId: string,
    evidenceType: EvidenceType,
    fileUrl: string,
    customPrompt?: string,
    reportId?: string,
    incidentId?: string,
  ): Promise<AiAnalysisResult> {
    this.logger.log(`Starting AI processing for evidence: ${evidenceId}`);

    // Create analysis record
    const analysisResult = new this.aiAnalysisResultModel({
      evidenceId: ObjectIdUtils.convertToObjectId(evidenceId),
      reportId: reportId
        ? ObjectIdUtils.convertToObjectId(reportId)
        : undefined,
      incidentId: incidentId
        ? ObjectIdUtils.convertToObjectId(incidentId)
        : undefined,
      analysisType: this.getAnalysisType(evidenceType),
      status: AnalysisStatus.PROCESSING,
      prompt: customPrompt || this.getDefaultPrompt(evidenceType),
    });

    await analysisResult.save();

    try {
      const result = await this.analyzeMedia(
        fileUrl,
        evidenceType,
        customPrompt || this.getDefaultPrompt(evidenceType),
      );

      // Update analysis result
      analysisResult.status = AnalysisStatus.COMPLETED;
      analysisResult.analysisResult = result.analysis;
      analysisResult.confidenceScore = result.confidenceScore;
      analysisResult.detectedObjects = result.detectedObjects;
      analysisResult.sceneAnalysis = result.sceneAnalysis;
      analysisResult.damageAssessment = result.damageAssessment;
      analysisResult.recommendations = result.recommendations;
      analysisResult.tokensUsed = result.tokensUsed;
      analysisResult.processingTime = result.processingTime;

      await analysisResult.save();

      this.logger.log(`AI processing completed for evidence: ${evidenceId}`);
      return analysisResult;
    } catch (error) {
      this.logger.error(
        `AI processing failed for evidence: ${evidenceId}`,
        error,
      );

      analysisResult.status = AnalysisStatus.FAILED;
      analysisResult.errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      await analysisResult.save();

      throw error;
    }
  }

  /**
   * Analyze media using Google Gemini
   */
  private async analyzeMedia(
    fileUrl: string,
    evidenceType: EvidenceType,
    prompt: string,
  ): Promise<any> {
    const startTime = Date.now();

    try {
      const model = this.genAI.getGenerativeModel({ model: this.defaultModel });

      let parts: any[] = [{ text: prompt }];

      // Add media content based on type
      if (evidenceType === EvidenceType.PHOTO) {
        parts.push({
          inlineData: {
            mimeType: this.getMimeType(fileUrl),
            data: await this.fetchMediaAsBase64(fileUrl),
          },
        });
      } else if (evidenceType === EvidenceType.VIDEO) {
        parts.push({
          inlineData: {
            mimeType: this.getMimeType(fileUrl),
            data: await this.fetchMediaAsBase64(fileUrl),
          },
        });
      } else if (evidenceType === EvidenceType.AUDIO) {
        parts.push({
          inlineData: {
            mimeType: this.getMimeType(fileUrl),
            data: await this.fetchMediaAsBase64(fileUrl),
          },
        });
      } else if (evidenceType === EvidenceType.DOCUMENT) {
        // For documents, we can use URL context if supported
        parts.push({ text: `Please analyze the document at: ${fileUrl}` });
      }

      const result = await model.generateContent(parts);
      const response = await result.response;
      const text = response.text();

      // Parse structured response
      const analysis = this.parseAnalysisResponse(text, evidenceType);

      return {
        analysis,
        confidenceScore: analysis.confidenceScore || 0.8,
        detectedObjects: analysis.detectedObjects,
        sceneAnalysis: analysis.sceneAnalysis,
        damageAssessment: analysis.damageAssessment,
        recommendations: analysis.recommendations,
        tokensUsed: this.estimateTokens(prompt + text),
        processingTime: Date.now() - startTime,
      };
    } catch (error) {
      this.logger.error('Error in media analysis:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(`AI analysis failed: ${errorMessage}`);
    }
  }

  /**
   * Get appropriate analysis type based on evidence type
   */
  private getAnalysisType(evidenceType: EvidenceType): AnalysisType {
    switch (evidenceType) {
      case EvidenceType.PHOTO:
        return AnalysisType.IMAGE_ANALYSIS;
      case EvidenceType.VIDEO:
        return AnalysisType.VIDEO_ANALYSIS;
      case EvidenceType.AUDIO:
        return AnalysisType.AUDIO_ANALYSIS;
      case EvidenceType.DOCUMENT:
        return AnalysisType.DOCUMENT_ANALYSIS;
      default:
        return AnalysisType.IMAGE_ANALYSIS;
    }
  }

  /**
   * Get default prompt based on evidence type
   */
  private getDefaultPrompt(evidenceType: EvidenceType): string {
    const baseContext = `You are an expert traffic accident investigator analyzing evidence. 
    Please provide a detailed analysis in JSON format with the following structure:
    {
      "confidenceScore": 0.0-1.0,
      "detectedObjects": {...},
      "sceneAnalysis": {...},
      "damageAssessment": {...},
      "recommendations": {...}
    }`;

    switch (evidenceType) {
      case EvidenceType.PHOTO:
        return `${baseContext}
        
        For this traffic accident photo, analyze:
        1. Vehicles involved (type, damage, position)
        2. Road conditions and environment
        3. Traffic signs and signals
        4. Weather conditions
        5. Potential causes of the accident
        6. Safety concerns
        7. Evidence of impact patterns
        
        Focus on factual observations and avoid speculation.`;

      case EvidenceType.VIDEO:
        return `${baseContext}
        
        For this traffic accident video, analyze:
        1. Sequence of events leading to the accident
        2. Vehicle movements and speeds
        3. Driver behaviors
        4. Traffic flow patterns
        5. Environmental factors
        6. Impact dynamics
        7. Post-accident actions
        
        Provide timestamps for key events when possible.`;

      case EvidenceType.AUDIO:
        return `${baseContext}
        
        For this audio evidence, analyze:
        1. Sounds of impact or collision
        2. Vehicle engine sounds
        3. Braking or tire screeching
        4. Emergency vehicle sirens
        5. Witness statements or conversations
        6. Environmental sounds
        7. Timeline of events based on audio cues
        
        Note any relevant timestamps and sound characteristics.`;

      case EvidenceType.DOCUMENT:
        return `${baseContext}
        
        For this document evidence, analyze:
        1. Key information about the incident
        2. Official statements or reports
        3. Witness testimonies
        4. Legal or regulatory implications
        5. Factual inconsistencies
        6. Missing information
        7. Recommendations for further investigation
        
        Summarize the most important findings.`;

      default:
        return baseContext;
    }
  }

  /**
   * Parse AI response into structured format
   */
  private parseAnalysisResponse(text: string, evidenceType: EvidenceType): any {
    try {
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // Fallback to structured text parsing
      return {
        confidenceScore: 0.7,
        analysis: text,
        detectedObjects: this.extractDetectedObjects(text),
        sceneAnalysis: this.extractSceneAnalysis(text),
        damageAssessment: this.extractDamageAssessment(text),
        recommendations: this.extractRecommendations(text),
      };
    } catch (error) {
      this.logger.warn('Failed to parse structured response, using raw text');
      return {
        confidenceScore: 0.6,
        analysis: text,
        detectedObjects: {},
        sceneAnalysis: {},
        damageAssessment: {},
        recommendations: {},
      };
    }
  }

  /**
   * Extract detected objects from text response
   */
  private extractDetectedObjects(text: string): any {
    // Simple keyword extraction - can be enhanced with NLP
    const vehicles = text.match(/vehicle|car|truck|motorcycle|bus/gi) || [];
    const persons =
      text.match(/person|people|pedestrian|driver|passenger/gi) || [];
    const roadSigns = text.match(/sign|signal|traffic light|stop sign/gi) || [];

    return {
      vehicles: vehicles.map((v) => ({
        type: v.toLowerCase(),
        confidence: 0.8,
      })),
      persons: persons.map((p) => ({
        position: p.toLowerCase(),
        confidence: 0.7,
      })),
      roadSigns: roadSigns.map((s) => ({
        type: s.toLowerCase(),
        confidence: 0.6,
      })),
    };
  }

  /**
   * Extract scene analysis from text response
   */
  private extractSceneAnalysis(text: string): any {
    return {
      weatherConditions: this.extractWeatherConditions(text),
      lightingConditions: this.extractLightingConditions(text),
      roadType: this.extractRoadType(text),
      trafficFlow: this.extractTrafficFlow(text),
    };
  }

  /**
   * Extract damage assessment from text response
   */
  private extractDamageAssessment(text: string): any {
    return {
      vehicleDamage: this.extractVehicleDamage(text),
      propertyDamage: this.extractPropertyDamage(text),
    };
  }

  /**
   * Extract recommendations from text response
   */
  private extractRecommendations(text: string): any {
    return {
      investigationPriority: this.extractInvestigationPriority(text),
      additionalEvidenceNeeded: this.extractAdditionalEvidence(text),
      expertConsultation: this.extractExpertConsultation(text),
    };
  }

  // Helper methods for text extraction
  private extractWeatherConditions(text: string): string[] {
    const conditions =
      text.match(/rain|snow|fog|clear|cloudy|sunny|storm/gi) || [];
    return [...new Set(conditions.map((c) => c.toLowerCase()))];
  }

  private extractLightingConditions(text: string): string {
    const lighting = text.match(/daylight|night|dawn|dusk|artificial light/gi);
    return lighting ? lighting[0].toLowerCase() : 'unknown';
  }

  private extractRoadType(text: string): string {
    const roadTypes = text.match(
      /highway|street|intersection|parking lot|residential/gi,
    );
    return roadTypes ? roadTypes[0].toLowerCase() : 'unknown';
  }

  private extractTrafficFlow(text: string): string {
    const flow = text.match(
      /heavy traffic|light traffic|congested|free flowing/gi,
    );
    return flow ? flow[0].toLowerCase() : 'unknown';
  }

  private extractVehicleDamage(text: string): any[] {
    // Simple damage extraction - can be enhanced
    const damageKeywords =
      text.match(/damage|dent|scratch|broken|cracked/gi) || [];
    return damageKeywords.map((d) => ({
      severity: 'moderate',
      areas: [d.toLowerCase()],
      description: `${d} detected in analysis`,
    }));
  }

  private extractPropertyDamage(text: string): any[] {
    const propertyKeywords =
      text.match(/barrier|fence|sign|building|tree/gi) || [];
    return propertyKeywords.map((p) => ({
      type: p.toLowerCase(),
      severity: 'minor',
      description: `${p} damage detected`,
    }));
  }

  private extractInvestigationPriority(text: string): string {
    if (text.match(/urgent|critical|severe/gi)) return 'high';
    if (text.match(/moderate|standard/gi)) return 'medium';
    return 'low';
  }

  private extractAdditionalEvidence(text: string): string[] {
    const evidence =
      text.match(/witness|camera|photos|measurements|samples/gi) || [];
    return [...new Set(evidence.map((e) => e.toLowerCase()))];
  }

  private extractExpertConsultation(text: string): string[] {
    const experts = text.match(/engineer|medical|legal|forensic/gi) || [];
    return [...new Set(experts.map((e) => e.toLowerCase()))];
  }

  /**
   * Fetch media file as base64
   */
  private async fetchMediaAsBase64(url: string): Promise<string> {
    try {
      const response = await fetch(url);
      const buffer = await response.arrayBuffer();
      return Buffer.from(buffer).toString('base64');
    } catch (error) {
      throw new BadRequestException(`Failed to fetch media from URL: ${url}`);
    }
  }

  /**
   * Get MIME type from URL
   */
  private getMimeType(url: string): string {
    const extension = url.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
      mp4: 'video/mp4',
      mov: 'video/quicktime',
      avi: 'video/x-msvideo',
      wav: 'audio/wav',
      mp3: 'audio/mpeg',
      flac: 'audio/flac',
      pdf: 'application/pdf',
    };
    return mimeTypes[extension || ''] || 'application/octet-stream';
  }

  /**
   * Estimate tokens used (rough approximation)
   */
  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4); // Rough estimation: 4 characters per token
  }

  /**
   * Get analysis results for evidence
   */
  async getAnalysisResults(evidenceId: string): Promise<AiAnalysisResult[]> {
    return this.aiAnalysisResultModel
      .find({ evidenceId: ObjectIdUtils.convertToObjectId(evidenceId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Get analysis results for report
   */
  async getReportAnalysisResults(
    reportId: string,
  ): Promise<AiAnalysisResult[]> {
    return this.aiAnalysisResultModel
      .find({ reportId: ObjectIdUtils.convertToObjectId(reportId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Retry failed analysis
   */
  async retryAnalysis(analysisId: string): Promise<AiAnalysisResult> {
    ObjectIdUtils.validateObjectId(analysisId);

    const analysis = await this.aiAnalysisResultModel.findById(analysisId);
    if (!analysis) {
      throw new BadRequestException('Analysis not found');
    }

    if (analysis.status !== AnalysisStatus.FAILED) {
      throw new BadRequestException('Only failed analyses can be retried');
    }

    analysis.status = AnalysisStatus.RETRY;
    await analysis.save();

    // Re-process the evidence
    // This would typically trigger the original processing logic
    return analysis;
  }
}
