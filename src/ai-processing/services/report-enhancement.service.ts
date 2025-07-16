import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  AiAnalysisResult,
  AiAnalysisResultDocument,
} from '../entities/ai-analysis-result.entity';
import { ReportService } from '../../report/services/report.service';
import { EvidenceService } from '../../evidence/services/evidence.service';
import { AiProcessingService } from './ai-processing.service';

@Injectable()
export class ReportEnhancementService {
  private readonly logger = new Logger(ReportEnhancementService.name);

  constructor(
    @InjectModel(AiAnalysisResult.name)
    private aiAnalysisResultModel: Model<AiAnalysisResultDocument>,
    private reportService: ReportService,
    private evidenceService: EvidenceService,
    private aiProcessingService: AiProcessingService,
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
    const summary = await this.generateAISummary(summaryPrompt);

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
  private async generateReportEnhancement(
    analysisResults: any[],
  ): Promise<any> {
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
  private async generateAISummary(prompt: string): Promise<string> {
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
}
