import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  AiAnalysisResult,
  AiAnalysisResultDocument,
} from '../entities/ai-analysis-result.entity';
import {
  GeneratedCasualtyReport,
  GeneratedCasualtyReportDocument,
} from '../entities/generated-casualty-report.entity';
import { ReportService } from '../../report/services/report.service';
import { EvidenceService } from '../../evidence/services/evidence.service';
import { AiProcessingService } from './ai-processing.service';
import { MediaAnalysisService } from './media-analysis.service';
import { ObjectIdUtils } from '../../common/utils/objectid.utils';

@Injectable()
export class ReportEnhancementService {
  private readonly logger = new Logger(ReportEnhancementService.name);

  constructor(
    @InjectModel(AiAnalysisResult.name)
    private aiAnalysisResultModel: Model<AiAnalysisResultDocument>,
    @InjectModel(GeneratedCasualtyReport.name)
    private generatedCasualtyReportModel: Model<GeneratedCasualtyReportDocument>,
    private reportService: ReportService,
    private evidenceService: EvidenceService,
    private aiProcessingService: AiProcessingService,
    private mediaAnalysisService: MediaAnalysisService,
  ) {}

  /**
   * Enhance a report with AI analysis from all related evidence
   */
  async enhanceReport(reportId: string): Promise<any> {
    this.logger.log(`Enhancing report: ${reportId}`);

    // Get the report
    const report = await this.reportService.findById(reportId);
    if (!report) {
      throw new Error('Report not found');
    }

    // Get all AI analysis results for this report
    const analysisResults = await this.aiAnalysisResultModel
      .find({ reportId })
      .populate('evidenceId')
      .exec();

    // Generate comprehensive analysis
    const enhancement = await this.generateReportEnhancement(analysisResults);

    // Update report with AI enhancement
    const updatedReport = await this.reportService.update(reportId, {
      content: {
        ...report.content,
        aiEnhancement: enhancement,
      },
      aiContribution: enhancement.aiContribution,
      aiOverallConfidence: enhancement.overallConfidence,
      aiObjectDetection: enhancement.objectDetectionScore,
      aiSceneReconstruction: enhancement.sceneReconstructionScore,
      updatedAt: new Date(),
    });

    this.logger.log(`Report enhanced successfully: ${reportId}`);
    return updatedReport;
  }

  /**
   * Generate AI-powered incident summary
   */
  async generateIncidentSummary(incidentId: string): Promise<any> {
    this.logger.log(`Generating incident summary: ${incidentId}`);

    // Get all analysis results for this incident
    const analysisResults = await this.aiAnalysisResultModel
      .find({ incidentId })
      .populate('evidenceId')
      .exec();

    if (analysisResults.length === 0) {
      throw new Error('No AI analysis results found for incident');
    }

    // Aggregate findings from all evidence
    const aggregatedFindings = this.aggregateFindings(analysisResults);

    // Generate comprehensive summary using AI
    const summaryPrompt = this.generateSummaryPrompt(aggregatedFindings);

    // Use AI to create a coherent summary
    const summary = this.generateAISummary(summaryPrompt);

    return {
      incidentId,
      summary,
      analysisCount: analysisResults.length,
      overallConfidence: aggregatedFindings.overallConfidence,
      keyFindings: aggregatedFindings.keyFindings,
      recommendations: aggregatedFindings.recommendations,
      generatedAt: new Date(),
    };
  }

  /**
   * Generate comprehensive casualty report from report ID
   * This method:
   * 1. Gets the report by ID
   * 2. Extracts the incident ID from the report
   * 3. Fetches all evidence for that incident
   * 4. Processes all evidence in batch
   * 5. Generates a comprehensive casualty report
   */
  async generateCasualtyReport(reportId: string): Promise<any> {
    this.logger.log(
      `Generating comprehensive casualty report for report: ${reportId}`,
    );

    // Step 1: Get the report
    const report = await this.reportService.findById(reportId);
    if (!report) {
      throw new Error('Report not found');
    }

    // Step 2: Extract incident ID from the report and convert to ObjectId
    // Handle case where incidentId might be populated as full object or just the ID
    this.logger.log(`Report incidentId type: ${typeof report.incidentId}`);
    this.logger.log(
      `Report incidentId value: ${JSON.stringify(report.incidentId)}`,
    );

    let incidentIdValue: string | Types.ObjectId;

    if (
      typeof report.incidentId === 'object' &&
      report.incidentId !== null &&
      (report.incidentId as any)._id
    ) {
      // If it's an object (populated), extract the _id
      incidentIdValue = (report.incidentId as any)._id;
      this.logger.log(
        `Extracted _id from populated object: ${incidentIdValue?.toString() || 'undefined'}`,
      );
    } else {
      // If it's already a string or ObjectId
      incidentIdValue = report.incidentId;
      this.logger.log(
        `Using incidentId directly: ${incidentIdValue?.toString() || 'undefined'}`,
      );
    }

    const incidentId = ObjectIdUtils.convertToObjectId(incidentIdValue);
    this.logger.log(`Final converted incident ID: ${incidentId.toString()}`);

    // Step 3: Fetch all evidence for that incident
    const evidence = await this.evidenceService.findByIncidentId(
      incidentId.toString(),
    );
    this.logger.log(`Found ${evidence.length} evidence items for incident`);

    if (evidence.length === 0) {
      throw new Error('No evidence found for this incident');
    }

    // Step 4: Process all evidence in batch
    const evidenceItems = evidence.map((ev: any) => ({
      evidenceId: ev._id?.toString() || ev.id,
      type: ev.type,
      fileUrl: ev.fileUrl,
      customPrompt:
        'Analyze this evidence for casualty assessment, vehicle damage, and incident reconstruction',
    }));

    // Process evidence in batch using media analysis service
    const batchResults = await this.mediaAnalysisService.batchAnalyze(
      evidenceItems,
      reportId,
      incidentId.toString(),
    );

    // Step 5: Generate comprehensive casualty report
    const casualtyReport = await this.generateComprehensiveCasualtyReport(
      report,
      evidence,
      batchResults,
    );

    // Step 6: Save the casualty report to the database
    const savedCasualtyReport = new this.generatedCasualtyReportModel({
      reportId: ObjectIdUtils.convertToObjectId(
        report._id?.toString() || reportId,
      ),
      incidentId: incidentId, // Already converted to ObjectId above
      generatedAt: new Date(),
      processingSummary: casualtyReport.processingSummary,
      casualtyAssessment: casualtyReport.casualtyAssessment,
      vehicleAnalysis: casualtyReport.vehicleAnalysis,
      environmentalAnalysis: casualtyReport.environmentalAnalysis,
      incidentTimeline: casualtyReport.incidentTimeline,
      recommendations: casualtyReport.recommendations,
      aiConfidence: casualtyReport.aiConfidence,
    });

    await savedCasualtyReport.save();

    // Update the report with a reference to the casualty report
    const updatedReport = await this.reportService.update(reportId, {
      content: {
        ...report.content,
        casualtyReportId: savedCasualtyReport._id,
      },
      updatedAt: new Date(),
    });

    this.logger.log(
      `Casualty report generated and saved successfully for report: ${reportId}`,
    );

    return {
      reportId,
      incidentId,
      casualtyReport: savedCasualtyReport,
      evidenceProcessed: evidence.length,
      batchResults,
      updatedReport,
      generatedAt: new Date(),
    };
  }

  /**
   * Update report with new AI analysis
   */
  async updateReportWithAnalysis(
    reportId: string,
    analysisId: string,
  ): Promise<any> {
    const analysis = await this.aiAnalysisResultModel.findById(analysisId);
    if (!analysis) {
      throw new Error('Analysis not found');
    }

    // Get current report
    const report = await this.reportService.findById(reportId);
    if (!report) {
      throw new Error('Report not found');
    }

    // Update specific sections based on analysis type
    const updatedContent = this.integrateAnalysisIntoReport(
      report.content,
      analysis,
    );

    // Recalculate AI confidence scores
    const allAnalyses = await this.aiAnalysisResultModel.find({ reportId });
    const confidenceScores = this.calculateConfidenceScores(allAnalyses);

    return this.reportService.update(reportId, {
      content: updatedContent,
      aiContribution: confidenceScores.aiContribution,
      aiOverallConfidence: confidenceScores.overallConfidence,
      aiObjectDetection: confidenceScores.objectDetection,
      aiSceneReconstruction: confidenceScores.sceneReconstruction,
      updatedAt: new Date(),
    });
  }

  /**
   * Get generated casualty report by report ID
   */
  async getGeneratedCasualtyReport(reportId: string): Promise<any> {
    this.logger.log(
      `Retrieving generated casualty report for report: ${reportId}`,
    );

    // Convert reportId to ObjectId
    const reportObjectId = ObjectIdUtils.convertToObjectId(reportId);

    const casualtyReport = await this.generatedCasualtyReportModel
      .findOne({ reportId: reportObjectId })
      .exec();

    if (!casualtyReport) {
      throw new Error('No generated casualty report found for this report');
    }

    return casualtyReport;
  }

  /**
   * Get all generated casualty reports with filtering and pagination
   */
  async getAllGeneratedCasualtyReports(options: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    incidentId?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }): Promise<any> {
    this.logger.log('Retrieving all generated casualty reports with filters');

    const {
      page = 1,
      limit = 10,
      sortBy = 'generatedAt',
      sortOrder = 'desc',
      incidentId,
      dateFrom,
      dateTo,
    } = options;

    // Build query filter
    const filter: any = {};

    if (incidentId) {
      filter.incidentId = ObjectIdUtils.convertToObjectId(incidentId);
    }

    if (dateFrom || dateTo) {
      filter.generatedAt = {};
      if (dateFrom) {
        filter.generatedAt.$gte = dateFrom;
      }
      if (dateTo) {
        filter.generatedAt.$lte = dateTo;
      }
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Execute query with pagination
    const [casualtyReports, totalCount] = await Promise.all([
      this.generatedCasualtyReportModel
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('reportId', 'title type status')
        .populate(
          'incidentId',
          'incidentLocation incidentType incidentSeverity dateTime',
        )
        .exec(),
      this.generatedCasualtyReportModel.countDocuments(filter).exec(),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      reports: casualtyReports,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNextPage,
        hasPrevPage,
        nextPage: hasNextPage ? page + 1 : null,
        prevPage: hasPrevPage ? page - 1 : null,
      },
      filters: {
        incidentId,
        dateFrom,
        dateTo,
        sortBy,
        sortOrder,
      },
    };
  }

  /**
   * Generate recommendations based on AI analysis
   */
  async generateRecommendations(reportId: string): Promise<any> {
    const analysisResults = await this.aiAnalysisResultModel
      .find({ reportId })
      .exec();

    const recommendations = {
      investigation: [] as any[],
      safety: [] as any[],
      legal: [] as any[],
      technical: [] as any[],
      priority: 'medium',
    };

    // Aggregate recommendations from all analyses
    for (const analysis of analysisResults) {
      if (analysis.recommendations) {
        if (analysis.recommendations.investigationPriority) {
          recommendations.priority = this.getHighestPriority(
            recommendations.priority,
            analysis.recommendations.investigationPriority,
          );
        }

        if (analysis.recommendations.additionalEvidenceNeeded) {
          recommendations.investigation.push(
            ...analysis.recommendations.additionalEvidenceNeeded,
          );
        }

        if (analysis.recommendations.expertConsultation) {
          recommendations.technical.push(
            ...analysis.recommendations.expertConsultation,
          );
        }

        if (analysis.recommendations.legalImplications) {
          recommendations.legal.push(
            ...analysis.recommendations.legalImplications,
          );
        }
      }
    }

    // Remove duplicates
    recommendations.investigation = [...new Set(recommendations.investigation)];
    recommendations.technical = [...new Set(recommendations.technical)];
    recommendations.legal = [...new Set(recommendations.legal)];

    return recommendations;
  }

  /**
   * Generate comprehensive report enhancement
   */
  private generateReportEnhancement(analysisResults: any[]): any {
    const enhancement = {
      aiContribution: 0,
      overallConfidence: 0,
      objectDetectionScore: 0,
      sceneReconstructionScore: 0,
      sections: {
        executiveSummary: '',
        vehicleAnalysis: [] as any[],
        sceneAnalysis: {},
        damageAssessment: {},
        recommendations: {},
        confidenceAnalysis: {},
      },
    };

    if (analysisResults.length === 0) {
      return enhancement;
    }

    // Calculate AI contribution percentage
    enhancement.aiContribution = Math.min(analysisResults.length * 15, 100);

    // Aggregate confidence scores
    const confidenceScores = analysisResults
      .filter((r) => r.confidenceScore)
      .map((r) => r.confidenceScore);

    enhancement.overallConfidence =
      confidenceScores.length > 0
        ? confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length
        : 0;

    // Aggregate object detection scores
    const objectDetectionScores = analysisResults
      .filter(
        (r) => r.detectedObjects && Object.keys(r.detectedObjects).length > 0,
      )
      .map((r) => this.calculateObjectDetectionScore(r.detectedObjects));

    enhancement.objectDetectionScore =
      objectDetectionScores.length > 0
        ? objectDetectionScores.reduce((a, b) => a + b, 0) /
          objectDetectionScores.length
        : 0;

    // Aggregate scene reconstruction scores
    const sceneScores = analysisResults
      .filter((r) => r.sceneAnalysis && Object.keys(r.sceneAnalysis).length > 0)
      .map((r) => this.calculateSceneReconstructionScore(r.sceneAnalysis));

    enhancement.sceneReconstructionScore =
      sceneScores.length > 0
        ? sceneScores.reduce((a, b) => a + b, 0) / sceneScores.length
        : 0;

    // Generate sections
    enhancement.sections.executiveSummary =
      this.generateExecutiveSummary(analysisResults);
    enhancement.sections.vehicleAnalysis =
      this.aggregateVehicleAnalysis(analysisResults);
    enhancement.sections.sceneAnalysis =
      this.aggregateSceneAnalysis(analysisResults);
    enhancement.sections.damageAssessment =
      this.aggregateDamageAssessment(analysisResults);
    enhancement.sections.recommendations =
      this.aggregateRecommendations(analysisResults);
    enhancement.sections.confidenceAnalysis =
      this.generateConfidenceAnalysis(analysisResults);

    return enhancement;
  }

  /**
   * Aggregate findings from multiple analyses
   */
  private aggregateFindings(analysisResults: any[]): any {
    const findings = {
      overallConfidence: 0,
      keyFindings: [] as any[],
      recommendations: [] as any[],
      vehicleCount: 0,
      personCount: 0,
      evidenceTypes: [] as any[],
      weatherConditions: [] as any[],
      roadConditions: [] as any[],
      primaryCause: 'unknown',
      severity: 'unknown',
    };

    // Calculate overall confidence
    const confidenceScores = analysisResults
      .filter((r) => r.confidenceScore)
      .map((r) => r.confidenceScore);

    findings.overallConfidence =
      confidenceScores.length > 0
        ? confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length
        : 0;

    // Aggregate detected objects
    for (const result of analysisResults) {
      if (result.detectedObjects) {
        if (result.detectedObjects.vehicles) {
          findings.vehicleCount = Math.max(
            findings.vehicleCount,
            result.detectedObjects.vehicles.length,
          );
        }
        if (result.detectedObjects.persons) {
          findings.personCount = Math.max(
            findings.personCount,
            result.detectedObjects.persons.length,
          );
        }
      }

      if (result.sceneAnalysis) {
        if (result.sceneAnalysis.weatherConditions) {
          findings.weatherConditions.push(
            ...result.sceneAnalysis.weatherConditions,
          );
        }
        if (result.sceneAnalysis.roadConditions) {
          findings.roadConditions.push(...result.sceneAnalysis.roadConditions);
        }
      }

      if (result.recommendations) {
        if (result.recommendations.additionalEvidenceNeeded) {
          findings.recommendations.push(
            ...result.recommendations.additionalEvidenceNeeded,
          );
        }
      }
    }

    // Remove duplicates
    findings.weatherConditions = [...new Set(findings.weatherConditions)];
    findings.roadConditions = [...new Set(findings.roadConditions)];
    findings.recommendations = [...new Set(findings.recommendations)];

    return findings;
  }

  /**
   * Generate AI summary using processed findings
   */
  private generateAISummary(prompt: string): string {
    // This would use the AI processing service to generate a summary
    // For now, return a placeholder
    return `AI-generated summary based on analysis of multiple evidence sources. 
    The incident appears to involve multiple vehicles with varying degrees of damage. 
    Environmental factors and road conditions have been analyzed. 
    Recommendations for further investigation have been identified.`;
  }

  /**
   * Generate summary prompt for AI
   */
  private generateSummaryPrompt(findings: any): string {
    return `Please generate a comprehensive traffic accident summary based on the following aggregated findings:

    Overall Confidence: ${findings.overallConfidence}
    Vehicle Count: ${findings.vehicleCount}
    Person Count: ${findings.personCount}
    Weather Conditions: ${findings.weatherConditions.join(', ')}
    Road Conditions: ${findings.roadConditions.join(', ')}
    Recommendations: ${findings.recommendations.join(', ')}

    Please provide a clear, factual summary that integrates all available evidence and highlights key findings.`;
  }

  /**
   * Calculate object detection score
   */
  private calculateObjectDetectionScore(detectedObjects: any): number {
    let score = 0;
    let count = 0;

    if (detectedObjects.vehicles) {
      const vehicleConfidence =
        detectedObjects.vehicles
          .map((v) => v.confidence || 0)
          .reduce((a, b) => a + b, 0) / detectedObjects.vehicles.length;
      score += vehicleConfidence;
      count++;
    }

    if (detectedObjects.persons) {
      const personConfidence =
        detectedObjects.persons
          .map((p) => p.confidence || 0)
          .reduce((a, b) => a + b, 0) / detectedObjects.persons.length;
      score += personConfidence;
      count++;
    }

    if (detectedObjects.roadSigns) {
      const signConfidence =
        detectedObjects.roadSigns
          .map((s) => s.confidence || 0)
          .reduce((a, b) => a + b, 0) / detectedObjects.roadSigns.length;
      score += signConfidence;
      count++;
    }

    return count > 0 ? score / count : 0;
  }

  /**
   * Calculate scene reconstruction score
   */
  private calculateSceneReconstructionScore(sceneAnalysis: any): number {
    let score = 0;
    let factors = 0;

    const completenessFactors = [
      'weatherConditions',
      'lightingConditions',
      'roadType',
      'trafficFlow',
      'visibility',
      'timeOfDay',
    ];

    for (const factor of completenessFactors) {
      if (sceneAnalysis[factor] && sceneAnalysis[factor] !== 'unknown') {
        score += 1;
      }
      factors++;
    }

    return factors > 0 ? score / factors : 0;
  }

  /**
   * Generate executive summary
   */
  private generateExecutiveSummary(analysisResults: any[]): string {
    const vehicleCount = this.countUniqueVehicles(analysisResults);
    const personCount = this.countUniquePersons(analysisResults);
    const evidenceCount = analysisResults.length;

    return `AI analysis of ${evidenceCount} evidence items reveals an incident involving ${vehicleCount} vehicle(s) and ${personCount} person(s). 
    Analysis confidence varies by evidence type, with comprehensive scene reconstruction and damage assessment completed.`;
  }

  /**
   * Aggregate vehicle analysis
   */
  private aggregateVehicleAnalysis(analysisResults: any[]): any[] {
    const vehicles: any[] = [];

    for (const result of analysisResults) {
      if (result.detectedObjects && result.detectedObjects.vehicles) {
        vehicles.push(...result.detectedObjects.vehicles);
      }
    }

    return vehicles;
  }

  /**
   * Aggregate scene analysis
   */
  private aggregateSceneAnalysis(analysisResults: any[]): any {
    const sceneData = {
      weatherConditions: [] as any[],
      lightingConditions: [] as any[],
      roadType: [] as any[],
      trafficFlow: [] as any[],
      visibility: [] as any[],
    };

    for (const result of analysisResults) {
      if (result.sceneAnalysis) {
        Object.keys(sceneData).forEach((key) => {
          if (result.sceneAnalysis[key]) {
            if (Array.isArray(result.sceneAnalysis[key])) {
              sceneData[key].push(...result.sceneAnalysis[key]);
            } else {
              sceneData[key].push(result.sceneAnalysis[key]);
            }
          }
        });
      }
    }

    // Remove duplicates and get most common values
    Object.keys(sceneData).forEach((key) => {
      sceneData[key] = [...new Set(sceneData[key])];
    });

    return sceneData;
  }

  /**
   * Aggregate damage assessment
   */
  private aggregateDamageAssessment(analysisResults: any[]): any {
    const damage = {
      vehicleDamage: [] as any[],
      propertyDamage: [] as any[],
      totalEstimatedCost: 'unknown',
    };

    for (const result of analysisResults) {
      if (result.damageAssessment) {
        if (result.damageAssessment.vehicleDamage) {
          damage.vehicleDamage.push(...result.damageAssessment.vehicleDamage);
        }
        if (result.damageAssessment.propertyDamage) {
          damage.propertyDamage.push(...result.damageAssessment.propertyDamage);
        }
      }
    }

    return damage;
  }

  /**
   * Aggregate recommendations
   */
  private aggregateRecommendations(analysisResults: any[]): any {
    const recommendations = {
      investigation: [] as any[],
      safety: [] as any[],
      legal: [] as any[],
      technical: [] as any[],
      priority: 'medium',
    };

    for (const result of analysisResults) {
      if (result.recommendations) {
        if (result.recommendations.additionalEvidenceNeeded) {
          recommendations.investigation.push(
            ...result.recommendations.additionalEvidenceNeeded,
          );
        }
        if (result.recommendations.expertConsultation) {
          recommendations.technical.push(
            ...result.recommendations.expertConsultation,
          );
        }
        if (result.recommendations.legalImplications) {
          recommendations.legal.push(
            ...result.recommendations.legalImplications,
          );
        }
      }
    }

    return recommendations;
  }

  /**
   * Generate confidence analysis
   */
  private generateConfidenceAnalysis(analysisResults: any[]): any {
    const confidenceScores = analysisResults
      .filter((r) => r.confidenceScore)
      .map((r) => r.confidenceScore);

    return {
      averageConfidence:
        confidenceScores.length > 0
          ? confidenceScores.reduce((a, b) => a + b, 0) /
            confidenceScores.length
          : 0,
      highConfidenceCount: confidenceScores.filter((s) => s >= 0.8).length,
      mediumConfidenceCount: confidenceScores.filter((s) => s >= 0.6 && s < 0.8)
        .length,
      lowConfidenceCount: confidenceScores.filter((s) => s < 0.6).length,
      totalAnalyses: analysisResults.length,
    };
  }

  /**
   * Helper methods
   */
  private countUniqueVehicles(analysisResults: any[]): number {
    const vehicles = new Set();
    for (const result of analysisResults) {
      if (result.detectedObjects && result.detectedObjects.vehicles) {
        result.detectedObjects.vehicles.forEach((v) =>
          vehicles.add(v.type + v.color),
        );
      }
    }
    return vehicles.size;
  }

  private countUniquePersons(analysisResults: any[]): number {
    const persons = new Set();
    for (const result of analysisResults) {
      if (result.detectedObjects && result.detectedObjects.persons) {
        result.detectedObjects.persons.forEach((p) => persons.add(p.position));
      }
    }
    return persons.size;
  }

  private integrateAnalysisIntoReport(currentContent: any, analysis: any): any {
    // Integrate new analysis into existing report content
    return {
      ...currentContent,
      lastUpdated: new Date(),
      analyses: {
        ...currentContent.analyses,
        [analysis._id]: {
          type: analysis.analysisType,
          confidence: analysis.confidenceScore,
          results: analysis.analysisResult,
          timestamp: analysis.createdAt,
        },
      },
    };
  }

  private calculateConfidenceScores(analyses: any[]): any {
    const confidenceScores = analyses
      .filter((a) => a.confidenceScore)
      .map((a) => a.confidenceScore);

    return {
      aiContribution: Math.min(analyses.length * 15, 100),
      overallConfidence:
        confidenceScores.length > 0
          ? confidenceScores.reduce((a, b) => a + b, 0) /
            confidenceScores.length
          : 0,
      objectDetection: this.calculateAverageObjectDetection(analyses),
      sceneReconstruction: this.calculateAverageSceneReconstruction(analyses),
    };
  }

  private calculateAverageObjectDetection(analyses: any[]): number {
    const scores = analyses
      .filter((a) => a.detectedObjects)
      .map((a) => this.calculateObjectDetectionScore(a.detectedObjects));

    return scores.length > 0
      ? scores.reduce((a, b) => a + b, 0) / scores.length
      : 0;
  }

  private calculateAverageSceneReconstruction(analyses: any[]): number {
    const scores = analyses
      .filter((a) => a.sceneAnalysis)
      .map((a) => this.calculateSceneReconstructionScore(a.sceneAnalysis));

    return scores.length > 0
      ? scores.reduce((a, b) => a + b, 0) / scores.length
      : 0;
  }

  private getHighestPriority(current: string, new_priority: string): string {
    const priorities = { low: 1, medium: 2, high: 3, critical: 4 };
    return priorities[new_priority] > priorities[current]
      ? new_priority
      : current;
  }

  /**
   * Generate comprehensive casualty report from processed evidence
   */
  private generateComprehensiveCasualtyReport(
    report: any,
    evidence: any[],
    batchResults: any[],
  ): any {
    this.logger.log(
      'Generating comprehensive casualty report from evidence analysis',
    );

    // Extract successful analysis results
    const successfulResults = batchResults.filter(
      (result) => result.status === 'fulfilled',
    );
    const failedResults = batchResults.filter(
      (result) => result.status === 'rejected',
    );

    // Aggregate casualty information from all evidence
    const casualtyData = {
      totalCasualties: 0,
      fatalities: 0,
      seriousInjuries: 0,
      minorInjuries: 0,
      casualties: [] as any[],
      vehicles: [] as any[],
      environmentalFactors: [] as string[],
      timeline: [] as any[],
      recommendations: [] as string[],
      overallConfidence: 0,
    };

    // Process each successful analysis result
    for (const result of successfulResults) {
      if (result.value && result.value.analysisResult) {
        const analysis = result.value.analysisResult;

        // Extract casualty information
        if (analysis.detectedObjects && analysis.detectedObjects.persons) {
          casualtyData.casualties.push(...analysis.detectedObjects.persons);
          casualtyData.totalCasualties +=
            analysis.detectedObjects.persons.length;
        }

        // Extract vehicle information
        if (analysis.detectedObjects && analysis.detectedObjects.vehicles) {
          casualtyData.vehicles.push(...analysis.detectedObjects.vehicles);
        }

        // Extract environmental factors
        if (analysis.sceneAnalysis) {
          if (analysis.sceneAnalysis.weatherConditions) {
            casualtyData.environmentalFactors.push(
              ...analysis.sceneAnalysis.weatherConditions,
            );
          }
        }

        // Extract recommendations
        if (analysis.recommendations) {
          if (analysis.recommendations.additionalEvidenceNeeded) {
            casualtyData.recommendations.push(
              ...analysis.recommendations.additionalEvidenceNeeded,
            );
          }
        }

        // Calculate overall confidence
        if (analysis.confidenceScore) {
          casualtyData.overallConfidence += analysis.confidenceScore;
        }
      }
    }

    // Calculate average confidence
    if (successfulResults.length > 0) {
      casualtyData.overallConfidence =
        casualtyData.overallConfidence / successfulResults.length;
    }

    // Remove duplicates
    casualtyData.environmentalFactors = [
      ...new Set(casualtyData.environmentalFactors),
    ];
    casualtyData.recommendations = [...new Set(casualtyData.recommendations)];

    // Generate timeline from evidence timestamps
    casualtyData.timeline = evidence
      .filter((ev) => ev.createdAt)
      .map((ev) => ({
        time: ev.createdAt,
        description: `Evidence collected: ${ev.type}`,
        source: ev.fileUrl,
      }))
      .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

    // Generate comprehensive report
    const comprehensiveReport = {
      reportId: report._id,
      incidentId: report.incidentId,
      generatedAt: new Date(),
      processingSummary: {
        totalEvidence: evidence.length,
        successfullyProcessed: successfulResults.length,
        failedProcessing: failedResults.length,
        overallConfidence: casualtyData.overallConfidence,
      },
      casualtyAssessment: {
        totalCasualties: casualtyData.totalCasualties,
        casualties: casualtyData.casualties,
        injuryBreakdown: {
          fatalities: casualtyData.fatalities,
          seriousInjuries: casualtyData.seriousInjuries,
          minorInjuries: casualtyData.minorInjuries,
        },
      },
      vehicleAnalysis: {
        totalVehicles: casualtyData.vehicles.length,
        vehicles: casualtyData.vehicles,
        damageAssessment: this.aggregateDamageAssessment(
          successfulResults.map((r) => r.value),
        ),
      },
      environmentalAnalysis: {
        factors: casualtyData.environmentalFactors,
        weatherConditions: this.extractWeatherConditions(successfulResults),
        roadConditions: this.extractRoadConditions(successfulResults),
      },
      incidentTimeline: casualtyData.timeline,
      recommendations: casualtyData.recommendations,
      aiConfidence: {
        overall: casualtyData.overallConfidence,
        vehicleDetection:
          this.calculateVehicleDetectionConfidence(successfulResults),
        casualtyAssessment:
          this.calculateCasualtyAssessmentConfidence(successfulResults),
        sceneReconstruction:
          this.calculateSceneReconstructionConfidence(successfulResults),
      },
    };

    return comprehensiveReport;
  }

  private extractWeatherConditions(results: any[]): string[] {
    const weatherConditions: string[] = [];
    for (const result of results) {
      if (result.value?.analysisResult?.sceneAnalysis?.weatherConditions) {
        weatherConditions.push(
          ...result.value.analysisResult.sceneAnalysis.weatherConditions,
        );
      }
    }
    return [...new Set(weatherConditions)];
  }

  private extractRoadConditions(results: any[]): string[] {
    const roadConditions: string[] = [];
    for (const result of results) {
      if (result.value?.analysisResult?.sceneAnalysis?.roadConditions) {
        roadConditions.push(
          ...result.value.analysisResult.sceneAnalysis.roadConditions,
        );
      }
    }
    return [...new Set(roadConditions)];
  }

  private calculateVehicleDetectionConfidence(results: any[]): number {
    const confidences = results
      .filter((r) => r.value?.analysisResult?.detectedObjects?.vehicles)
      .map((r) => r.value.analysisResult.confidenceScore || 0);

    return confidences.length > 0
      ? confidences.reduce((a, b) => a + b, 0) / confidences.length
      : 0;
  }

  private calculateCasualtyAssessmentConfidence(results: any[]): number {
    const confidences = results
      .filter((r) => r.value?.analysisResult?.detectedObjects?.persons)
      .map((r) => r.value.analysisResult.confidenceScore || 0);

    return confidences.length > 0
      ? confidences.reduce((a, b) => a + b, 0) / confidences.length
      : 0;
  }

  private calculateSceneReconstructionConfidence(results: any[]): number {
    const confidences = results
      .filter((r) => r.value?.analysisResult?.sceneAnalysis)
      .map((r) => r.value.analysisResult.confidenceScore || 0);

    return confidences.length > 0
      ? confidences.reduce((a, b) => a + b, 0) / confidences.length
      : 0;
  }
}
