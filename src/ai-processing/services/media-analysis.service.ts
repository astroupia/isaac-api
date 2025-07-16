import { Injectable, Logger } from '@nestjs/common';
import { AiProcessingService } from './ai-processing.service';
import { EvidenceType } from '../../types/evidence';

@Injectable()
export class MediaAnalysisService {
  private readonly logger = new Logger(MediaAnalysisService.name);

  constructor(private aiProcessingService: AiProcessingService) {}

  /**
   * Analyze image evidence for traffic accidents
   */
  async analyzeImage(
    evidenceId: string,
    fileUrl: string,
    customPrompt?: string,
    reportId?: string,
    incidentId?: string,
  ) {
    const imagePrompt = customPrompt || this.getImageAnalysisPrompt();

    return this.aiProcessingService.processEvidence(
      evidenceId,
      EvidenceType.PHOTO,
      fileUrl,
      imagePrompt,
      reportId,
      incidentId,
    );
  }

  /**
   * Analyze video evidence for traffic accidents
   */
  async analyzeVideo(
    evidenceId: string,
    fileUrl: string,
    customPrompt?: string,
    reportId?: string,
    incidentId?: string,
  ) {
    const videoPrompt = customPrompt || this.getVideoAnalysisPrompt();

    return this.aiProcessingService.processEvidence(
      evidenceId,
      EvidenceType.VIDEO,
      fileUrl,
      videoPrompt,
      reportId,
      incidentId,
    );
  }

  /**
   * Analyze audio evidence for traffic accidents
   */
  async analyzeAudio(
    evidenceId: string,
    fileUrl: string,
    customPrompt?: string,
    reportId?: string,
    incidentId?: string,
  ) {
    const audioPrompt = customPrompt || this.getAudioAnalysisPrompt();

    return this.aiProcessingService.processEvidence(
      evidenceId,
      EvidenceType.AUDIO,
      fileUrl,
      audioPrompt,
      reportId,
      incidentId,
    );
  }

  /**
   * Analyze document evidence for traffic accidents
   */
  async analyzeDocument(
    evidenceId: string,
    fileUrl: string,
    customPrompt?: string,
    reportId?: string,
    incidentId?: string,
  ) {
    const documentPrompt = customPrompt || this.getDocumentAnalysisPrompt();

    return this.aiProcessingService.processEvidence(
      evidenceId,
      EvidenceType.DOCUMENT,
      fileUrl,
      documentPrompt,
      reportId,
      incidentId,
    );
  }

  /**
   * Batch analyze multiple evidence items
   */
  async batchAnalyze(
    evidenceItems: Array<{
      evidenceId: string;
      type: EvidenceType;
      fileUrl: string;
      customPrompt?: string;
    }>,
    reportId?: string,
    incidentId?: string,
  ) {
    this.logger.log(
      `Starting batch analysis for ${evidenceItems.length} items`,
    );

    const analysisPromises = evidenceItems.map((item) => {
      switch (item.type) {
        case EvidenceType.PHOTO:
          return this.analyzeImage(
            item.evidenceId,
            item.fileUrl,
            item.customPrompt,
            reportId,
            incidentId,
          );
        case EvidenceType.VIDEO:
          return this.analyzeVideo(
            item.evidenceId,
            item.fileUrl,
            item.customPrompt,
            reportId,
            incidentId,
          );
        case EvidenceType.AUDIO:
          return this.analyzeAudio(
            item.evidenceId,
            item.fileUrl,
            item.customPrompt,
            reportId,
            incidentId,
          );
        case EvidenceType.DOCUMENT:
          return this.analyzeDocument(
            item.evidenceId,
            item.fileUrl,
            item.customPrompt,
            reportId,
            incidentId,
          );
        default:
          throw new Error(`Unsupported evidence type: ${item.type}`);
      }
    });

    const results = await Promise.allSettled(analysisPromises);

    const successful = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    this.logger.log(
      `Batch analysis completed: ${successful} successful, ${failed} failed`,
    );

    return results;
  }

  /**
   * Specialized image analysis prompt for traffic accidents
   */
  private getImageAnalysisPrompt(): string {
    return `You are an expert traffic accident investigator analyzing a photo from a traffic incident. 
    Please provide a comprehensive analysis in JSON format with the following structure:

    {
      "confidenceScore": 0.0-1.0,
      "detectedObjects": {
        "vehicles": [
          {
            "type": "car|truck|motorcycle|bus|van|suv|other",
            "confidence": 0.0-1.0,
            "position": "description of position",
            "damage": ["front", "rear", "side", "roof", "none"],
            "damageSeverity": "none|minor|moderate|severe|totaled",
            "licensePlate": "visible plate number or null",
            "color": "vehicle color",
            "estimatedSpeed": "low|medium|high|unknown"
          }
        ],
        "persons": [
          {
            "position": "driver|passenger|pedestrian|bystander",
            "confidence": 0.0-1.0,
            "apparentInjuries": ["none", "minor", "serious", "unknown"],
            "location": "inside vehicle|outside vehicle|on road|sidewalk"
          }
        ],
        "roadSigns": [
          {
            "type": "stop|yield|speed_limit|traffic_light|warning|other",
            "text": "sign text if readable",
            "confidence": 0.0-1.0,
            "relevance": "high|medium|low"
          }
        ],
        "roadConditions": [
          {
            "type": "wet|dry|icy|construction|debris|potholes|normal",
            "severity": "minor|moderate|severe",
            "confidence": 0.0-1.0
          }
        ]
      },
      "sceneAnalysis": {
        "weatherConditions": ["clear", "rain", "snow", "fog", "storm"],
        "lightingConditions": "daylight|dawn|dusk|night|artificial",
        "roadType": "highway|city_street|residential|intersection|parking_lot|rural",
        "trafficFlow": "heavy|moderate|light|stopped|unknown",
        "visibility": "excellent|good|poor|very_poor",
        "timeOfDay": "morning|afternoon|evening|night|unknown",
        "skidMarks": "present|absent|unclear",
        "impactPoint": "description of main impact location",
        "postImpactMovement": "description of vehicle movements after impact"
      },
      "damageAssessment": {
        "vehicleDamage": [
          {
            "vehicleId": "reference to vehicle",
            "severity": "minor|moderate|severe|totaled",
            "areas": ["front", "rear", "left_side", "right_side", "roof", "undercarriage"],
            "estimatedCost": "low|medium|high|total_loss",
            "airbagDeployment": "deployed|not_deployed|unknown",
            "structuralDamage": "yes|no|unknown"
          }
        ],
        "propertyDamage": [
          {
            "type": "barrier|fence|sign|building|tree|other",
            "severity": "minor|moderate|severe",
            "description": "detailed description"
          }
        ]
      },
      "recommendations": {
        "investigationPriority": "low|medium|high|critical",
        "additionalEvidenceNeeded": ["witness_statements", "vehicle_inspection", "road_measurements", "medical_records", "security_footage"],
        "expertConsultation": ["accident_reconstruction", "medical", "engineering", "legal"],
        "legalImplications": ["traffic_violation", "negligence", "equipment_failure", "environmental_factors"],
        "safetyRecommendations": ["traffic_control", "road_improvements", "signage", "lighting"]
      }
    }

    Focus on factual observations only. Avoid speculation. Rate your confidence for each observation.
    If information is not clearly visible, mark as "unknown" rather than guessing.`;
  }

  /**
   * Specialized video analysis prompt for traffic accidents
   */
  private getVideoAnalysisPrompt(): string {
    return `You are an expert traffic accident investigator analyzing a video from a traffic incident.
    Please provide a comprehensive analysis in JSON format with temporal information:

    {
      "confidenceScore": 0.0-1.0,
      "videoAnalysis": {
        "duration": "video duration in seconds",
        "quality": "excellent|good|fair|poor",
        "viewpoint": "overhead|street_level|vehicle_mounted|witness|security_camera",
        "timeline": [
          {
            "timestamp": "time in seconds",
            "event": "description of what happens",
            "significance": "high|medium|low"
          }
        ]
      },
      "vehicleMovements": [
        {
          "vehicleId": "reference identifier",
          "preImpactBehavior": "normal|aggressive|erratic|distracted|impaired",
          "speed": "estimated speed category",
          "direction": "north|south|east|west|turning|reversing",
          "lanePosition": "proper|improper|changing|unknown",
          "brakingEvidence": "yes|no|late|excessive",
          "signalUsage": "proper|improper|none|unknown"
        }
      ],
      "impactAnalysis": {
        "impactType": "head_on|rear_end|side_impact|rollover|sideswipe|multiple",
        "impactForce": "low|medium|high|severe",
        "impactAngle": "description of angle",
        "primaryImpactPoint": "specific location",
        "secondaryImpacts": ["description of subsequent impacts"]
      },
      "postImpactEvents": [
        {
          "timestamp": "time in seconds",
          "event": "vehicle movements, emergency response, witness actions",
          "relevance": "high|medium|low"
        }
      ],
      "trafficEnvironment": {
        "trafficDensity": "heavy|moderate|light|none",
        "trafficFlow": "smooth|congested|stop_and_go|chaotic",
        "otherVehicleBehavior": "normal|reactive|evasive|unaware",
        "pedestrianActivity": "present|absent|relevant|irrelevant"
      },
      "recommendations": {
        "keyTimestamps": ["list of critical moments to review"],
        "additionalAnalysis": ["frame_by_frame", "speed_calculation", "trajectory_analysis"],
        "witnessInterviews": ["specific witnesses visible in video"],
        "technicalAnalysis": ["vehicle_dynamics", "road_surface", "lighting_conditions"]
      }
    }

    Provide timestamps for all significant events. Focus on the sequence of events leading to and following the incident.
    Note any evidence of driver behavior, vehicle malfunctions, or environmental factors.`;
  }

  /**
   * Specialized audio analysis prompt for traffic accidents
   */
  private getAudioAnalysisPrompt(): string {
    return `You are an expert traffic accident investigator analyzing audio evidence from a traffic incident.
    Please provide a comprehensive analysis in JSON format:

    {
      "confidenceScore": 0.0-1.0,
      "audioAnalysis": {
        "duration": "audio duration in seconds",
        "quality": "excellent|good|fair|poor",
        "source": "vehicle_interior|roadside|witness|emergency_services|security_system",
        "backgroundNoise": "heavy|moderate|light|minimal"
      },
      "soundEvents": [
        {
          "timestamp": "time in seconds",
          "soundType": "engine|braking|impact|crash|voices|sirens|other",
          "description": "detailed description of sound",
          "intensity": "low|medium|high|very_high",
          "relevance": "high|medium|low"
        }
      ],
      "vehicleSounds": {
        "engineSounds": [
          {
            "timestamp": "time in seconds",
            "type": "acceleration|deceleration|idle|rev|strain",
            "intensity": "low|medium|high",
            "abnormal": "yes|no|unknown"
          }
        ],
        "brakingSounds": [
          {
            "timestamp": "time in seconds",
            "type": "normal|squealing|grinding|abs_activation",
            "duration": "duration in seconds",
            "effectiveness": "effective|ineffective|unknown"
          }
        ],
        "impactSounds": [
          {
            "timestamp": "time in seconds",
            "type": "metal_impact|glass_breaking|scraping|multiple_impacts",
            "intensity": "low|medium|high|severe",
            "sequence": "primary|secondary|tertiary"
          }
        ]
      },
      "humanSounds": {
        "conversations": [
          {
            "timestamp": "time in seconds",
            "speakers": "number of speakers",
            "content": "summary of conversation if audible",
            "emotional_state": "calm|distressed|angry|confused|panicked",
            "relevance": "high|medium|low"
          }
        ],
        "emergencyResponses": [
          {
            "timestamp": "time in seconds",
            "type": "911_call|first_aid|crowd_control|witness_statements",
            "content": "summary of emergency response"
          }
        ]
      },
      "environmentalSounds": {
        "weather": ["rain", "wind", "thunder", "none"],
        "traffic": "heavy|moderate|light|none",
        "emergencyVehicles": [
          {
            "timestamp": "time in seconds",
            "type": "police|ambulance|fire|tow_truck",
            "proximity": "distant|approaching|on_scene|departing"
          }
        ]
      },
      "recommendations": {
        "keyTimestamps": ["list of critical audio moments"],
        "additionalAnalysis": ["voice_analysis", "sound_enhancement", "frequency_analysis"],
        "correlateWith": ["video_evidence", "witness_statements", "vehicle_data"],
        "expertConsultation": ["audio_forensics", "accident_reconstruction", "medical"]
      }
    }

    Focus on the temporal sequence of sounds and their relationship to the incident.
    Note any sounds that might indicate mechanical failure, driver behavior, or environmental factors.`;
  }

  /**
   * Specialized document analysis prompt for traffic accidents
   */
  private getDocumentAnalysisPrompt(): string {
    return `You are an expert traffic accident investigator analyzing document evidence from a traffic incident.
    Please provide a comprehensive analysis in JSON format:

    {
      "confidenceScore": 0.0-1.0,
      "documentAnalysis": {
        "documentType": "police_report|witness_statement|insurance_claim|medical_report|vehicle_inspection|citation|other",
        "dateCreated": "document date if available",
        "author": "document author/agency",
        "completeness": "complete|partial|fragmentary",
        "legibility": "excellent|good|fair|poor"
      },
      "keyInformation": {
        "incidentDetails": {
          "date": "incident date",
          "time": "incident time",
          "location": "incident location",
          "weather": "weather conditions",
          "roadConditions": "road conditions"
        },
        "partiesInvolved": [
          {
            "type": "driver|passenger|pedestrian|witness",
            "name": "name if available",
            "age": "age if available",
            "injuries": "injury description",
            "statement": "summary of statement"
          }
        ],
        "vehicleInformation": [
          {
            "make": "vehicle make",
            "model": "vehicle model",
            "year": "vehicle year",
            "licensePlate": "license plate",
            "damage": "damage description",
            "owner": "owner information"
          }
        ]
      },
      "factualFindings": {
        "primaryCause": "stated primary cause",
        "contributingFactors": ["list of contributing factors"],
        "trafficViolations": ["list of violations cited"],
        "faultDetermination": "fault assignment if stated",
        "recommendations": ["safety recommendations from document"]
      },
      "inconsistencies": [
        {
          "type": "factual|temporal|logical|measurement",
          "description": "description of inconsistency",
          "severity": "minor|moderate|significant",
          "requiresFollowup": "yes|no"
        }
      ],
      "missingInformation": [
        {
          "category": "witness_info|vehicle_data|medical_info|scene_measurements|photos",
          "description": "description of missing information",
          "importance": "critical|important|helpful"
        }
      ],
      "recommendations": {
        "verificationNeeded": ["items requiring verification"],
        "additionalDocuments": ["documents that should be obtained"],
        "followupActions": ["recommended follow-up actions"],
        "legalImplications": ["potential legal issues"],
        "investigationPriority": "low|medium|high|critical"
      }
    }

    Focus on extracting factual information and identifying any inconsistencies or gaps.
    Note any information that contradicts other evidence or requires further investigation.`;
  }
}
