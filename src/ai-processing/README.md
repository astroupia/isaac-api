# AI Processing Module

## Overview

The AI Processing module provides comprehensive AI-powered analysis capabilities for traffic accident investigation using Google's Gemini AI. It processes multiple media types, enhances reports with intelligent insights, and offers conversational AI for interactive analysis.

## 📁 Folder Structure

```
src/ai-processing/
├── entities/              # Database schemas and models
├── services/             # Core business logic and AI processing
├── controllers/          # REST API endpoints
├── types/               # TypeScript type definitions
├── ai-processing.module.ts  # NestJS module configuration
└── README.md            # This file
```

---

## 📊 `entities/` - Database Schemas

### Purpose

Contains MongoDB schemas for storing AI analysis results and conversation data.

### Files

#### `ai-analysis-result.entity.ts`

**What it does:**

- Stores AI analysis results for evidence items
- Tracks analysis status, confidence scores, and detected objects
- Links analysis to evidence, reports, and incidents

**Key Features:**

- Analysis type tracking (image, video, audio, document)
- Confidence scoring (0.0-1.0)
- Detected objects (vehicles, persons, road signs)
- Scene analysis (weather, lighting, road conditions)
- Damage assessment and recommendations

**Database Schema:**

```typescript
{
  evidenceId: ObjectId,           // Reference to evidence
  reportId?: ObjectId,            // Optional report reference
  incidentId?: ObjectId,          // Optional incident reference
  analysisType: AnalysisType,     // Type of analysis performed
  status: AnalysisStatus,         // pending|processing|completed|failed
  confidenceScore: number,        // AI confidence (0.0-1.0)
  detectedObjects: {              // Detected items
    vehicles: [...],
    persons: [...],
    roadSigns: [...],
    roadConditions: [...]
  },
  sceneAnalysis: {                // Scene information
    weatherConditions: [...],
    lightingConditions: string,
    roadType: string,
    trafficFlow: string
  },
  damageAssessment: {             // Damage analysis
    vehicleDamage: [...],
    propertyDamage: [...]
  },
  recommendations: {              // AI recommendations
    investigationPriority: string,
    additionalEvidenceNeeded: [...],
    expertConsultation: [...]
  }
}
```

#### `ai-conversation.entity.ts`

**What it does:**

- Manages conversational AI sessions about reports
- Stores message history and context
- Tracks token usage and conversation summaries

**Key Features:**

- Message role tracking (user, assistant, system)
- Context preservation across conversations
- Token usage monitoring
- Conversation status management

**Database Schema:**

```typescript
{
  reportId: ObjectId,             // Associated report
  userId: ObjectId,               // User conducting conversation
  title: string,                  // Conversation title
  status: ConversationStatus,     // active|completed|archived
  messages: [{                    // Message history
    role: MessageRole,            // user|assistant|system
    content: string,              // Message content
    timestamp: Date,              // When sent
    tokensUsed?: number,          // Token consumption
    attachments?: [...]           // File attachments
  }],
  context: {                      // Conversation context
    incidentId?: ObjectId,
    evidenceIds?: [ObjectId],
    focusAreas?: [string],
    analysisGoals?: [string]
  },
  summary?: {                     // AI-generated summary
    keyFindings: [string],
    recommendations: [string],
    confidenceLevel: number,
    areasOfConcern: [string]
  },
  totalTokensUsed: number         // Total tokens consumed
}
```

---

## 🔧 `services/` - Core Business Logic

### Purpose

Contains the main AI processing services that handle Google Gemini integration and business logic.

### Files

#### `ai-processing.service.ts`

**What it does:**

- Core Google Gemini AI integration
- Handles media analysis requests
- Manages analysis results and status tracking

**Key Methods:**

```typescript
// Process evidence with AI analysis
processEvidence(evidenceId, evidenceType, fileUrl, customPrompt?, reportId?, incidentId?)

// Analyze media using Google Gemini
analyzeMedia(fileUrl, evidenceType, prompt)

// Get analysis results for evidence
getAnalysisResults(evidenceId)

// Retry failed analysis
retryAnalysis(analysisId)
```

**Frontend Integration:**

```javascript
// Process single evidence item
const response = await fetch('/ai-processing/evidence/process', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    evidenceId: 'evidence_123',
    evidenceType: 'photo',
    fileUrl: 'https://cloudinary.com/accident-scene.jpg',
    customPrompt: 'Focus on vehicle damage assessment',
    reportId: 'report_456',
  }),
});
```

#### `media-analysis.service.ts`

**What it does:**

- Specialized analysis for different media types
- Batch processing capabilities
- Custom prompt templates for traffic accident analysis

**Key Methods:**

```typescript
// Analyze image evidence
analyzeImage(evidenceId, fileUrl, customPrompt?, reportId?, incidentId?)

// Analyze video evidence
analyzeVideo(evidenceId, fileUrl, customPrompt?, reportId?, incidentId?)

// Analyze audio evidence
analyzeAudio(evidenceId, fileUrl, customPrompt?, reportId?, incidentId?)

// Analyze document evidence
analyzeDocument(evidenceId, fileUrl, customPrompt?, reportId?, incidentId?)

// Batch analyze multiple evidence items
batchAnalyze(evidenceItems, reportId?, incidentId?)
```

**Frontend Integration:**

```javascript
// Batch process multiple evidence items
const batchResponse = await fetch('/ai-processing/evidence/batch-process', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    evidenceItems: [
      {
        evidenceId: 'evidence_1',
        type: 'photo',
        fileUrl: 'https://cloudinary.com/scene1.jpg',
      },
      {
        evidenceId: 'evidence_2',
        type: 'video',
        fileUrl: 'https://cloudinary.com/dashcam.mp4',
      },
    ],
    reportId: 'report_123',
    incidentId: 'incident_456',
  }),
});
```

#### `report-enhancement.service.ts`

**What it does:**

- Enhances reports with AI analysis from multiple evidence sources
- Generates comprehensive incident summaries
- Provides AI-powered recommendations

**Key Methods:**

```typescript
// Enhance report with AI analysis
enhanceReport(reportId);

// Generate incident summary
generateIncidentSummary(incidentId);

// Update report with new analysis
updateReportWithAnalysis(reportId, analysisId);

// Generate recommendations
generateRecommendations(reportId);
```

**Frontend Integration:**

```javascript
// Enhance report with AI analysis
const enhancedReport = await fetch(
  `/ai-processing/reports/${reportId}/enhance`,
  {
    method: 'POST',
  },
);

// Generate incident summary
const summary = await fetch(`/ai-processing/incidents/${incidentId}/summary`, {
  method: 'POST',
});

// Get recommendations
const recommendations = await fetch(
  `/ai-processing/reports/${reportId}/recommendations`,
  {
    method: 'POST',
  },
);
```

#### `conversation.service.ts`

**What it does:**

- Manages conversational AI sessions
- Provides context-aware responses about reports
- Handles conversation history and summaries

**Key Methods:**

```typescript
// Start new conversation
startConversation(reportId, userId, title, initialMessage?)

// Send message in conversation
sendMessage(conversationId, userId, message, attachments?)

// Get conversation history
getConversation(conversationId, userId)

// Generate conversation summary
generateConversationSummary(conversationId)
```

**Frontend Integration:**

```javascript
// Start AI conversation
const conversation = await fetch(
  '/ai-processing/conversations/start?userId=user_123',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      reportId: 'report_456',
      title: 'Accident Analysis Discussion',
      initialMessage: 'What are the key findings from the evidence analysis?',
    }),
  },
);

// Send message in conversation
const messageResponse = await fetch(
  `/ai-processing/conversations/${conversationId}/message?userId=user_123`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'Can you explain the damage patterns?',
      attachments: [
        {
          type: 'image',
          url: 'https://cloudinary.com/damage-photo.jpg',
          description: 'Vehicle damage close-up',
        },
      ],
    }),
  },
);
```

---

## 🌐 `controllers/` - REST API Endpoints

### Purpose

Provides REST API endpoints for frontend integration and external system access.

### Files

#### `ai-processing.controller.ts`

**What it does:**

- Exposes all AI processing functionality via REST API
- Handles request validation and response formatting
- Provides comprehensive error handling

**Available Endpoints:**

### Evidence Processing

```typescript
POST   /ai-processing/evidence/process           // Process single evidence
POST   /ai-processing/evidence/batch-process     // Batch process evidence
GET    /ai-processing/evidence/:id/results       // Get analysis results
POST   /ai-processing/analysis/:id/retry         // Retry failed analysis
```

### Media-Specific Analysis

```typescript
POST / ai - processing / media / image / analyze; // Analyze image
POST / ai - processing / media / video / analyze; // Analyze video
POST / ai - processing / media / audio / analyze; // Analyze audio
POST / ai - processing / media / document / analyze; // Analyze document
```

### Report Enhancement

```typescript
POST   /ai-processing/reports/:id/enhance        // Enhance report
GET    /ai-processing/reports/:id/results        // Get report results
PUT    /ai-processing/reports/:id/analysis/:aid  // Update with analysis
POST   /ai-processing/reports/:id/recommendations // Generate recommendations
```

### Incident Analysis

```typescript
POST   /ai-processing/incidents/:id/summary      // Generate incident summary
```

### Conversational AI

```typescript
POST   /ai-processing/conversations/start        // Start conversation
POST   /ai-processing/conversations/:id/message  // Send message
GET    /ai-processing/conversations/:id          // Get conversation
GET    /ai-processing/conversations/user/:uid    // Get user conversations
GET    /ai-processing/conversations/report/:rid  // Get report conversations
PUT    /ai-processing/conversations/:id/archive  // Archive conversation
POST   /ai-processing/conversations/:id/summary  // Generate summary
```

### System Endpoints

```typescript
GET / ai - processing / health; // Health check
GET / ai - processing / stats; // Service statistics
```

---

## 🔤 `types/` - TypeScript Definitions

### Purpose

Provides comprehensive TypeScript interfaces and types for the AI processing module.

### Key Types

#### Analysis Types

```typescript
enum AnalysisType {
  IMAGE_ANALYSIS = 'image_analysis',
  VIDEO_ANALYSIS = 'video_analysis',
  AUDIO_ANALYSIS = 'audio_analysis',
  DOCUMENT_ANALYSIS = 'document_analysis',
  SCENE_RECONSTRUCTION = 'scene_reconstruction',
  DAMAGE_ASSESSMENT = 'damage_assessment',
  TRAFFIC_FLOW_ANALYSIS = 'traffic_flow_analysis',
}

enum AnalysisStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  RETRY = 'retry',
}
```

#### Detection Interfaces

```typescript
interface IDetectedVehicle {
  type: string;
  confidence: number;
  position?: string;
  damage?: string[];
  damageSeverity?: string;
  licensePlate?: string;
  color?: string;
  estimatedSpeed?: string;
}

interface IDetectedPerson {
  position: string;
  confidence: number;
  apparentInjuries?: string[];
  location?: string;
}
```

#### Request/Response DTOs

```typescript
interface IProcessEvidenceDto {
  evidenceId: string;
  evidenceType: string;
  fileUrl: string;
  customPrompt?: string;
  reportId?: string;
  incidentId?: string;
}

interface IBatchAnalysisDto {
  evidenceItems: Array<{
    evidenceId: string;
    type: string;
    fileUrl: string;
    customPrompt?: string;
  }>;
  reportId?: string;
  incidentId?: string;
}
```

---

## 🚀 Frontend Integration Guide

### 1. React/Next.js Integration

#### Create AI Processing Hook

```typescript
// hooks/useAIProcessing.ts
import { useState, useCallback } from 'react';

export const useAIProcessing = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processEvidence = useCallback(async (evidenceData: any) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/ai-processing/evidence/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(evidenceData),
      });

      if (!response.ok) throw new Error('Processing failed');

      const result = await response.json();
      return result.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const enhanceReport = useCallback(async (reportId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/ai-processing/reports/${reportId}/enhance`,
        {
          method: 'POST',
        },
      );

      if (!response.ok) throw new Error('Enhancement failed');

      const result = await response.json();
      return result.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { processEvidence, enhanceReport, loading, error };
};
```

#### Evidence Analysis Component

```typescript
// components/EvidenceAnalysis.tsx
import React, { useState } from 'react';
import { useAIProcessing } from '../hooks/useAIProcessing';

interface EvidenceAnalysisProps {
  evidenceId: string;
  fileUrl: string;
  evidenceType: 'photo' | 'video' | 'audio' | 'document';
}

export const EvidenceAnalysis: React.FC<EvidenceAnalysisProps> = ({
  evidenceId,
  fileUrl,
  evidenceType
}) => {
  const { processEvidence, loading, error } = useAIProcessing();
  const [analysis, setAnalysis] = useState<any>(null);
  const [customPrompt, setCustomPrompt] = useState('');

  const handleAnalyze = async () => {
    try {
      const result = await processEvidence({
        evidenceId,
        evidenceType,
        fileUrl,
        customPrompt: customPrompt || undefined
      });
      setAnalysis(result);
    } catch (err) {
      console.error('Analysis failed:', err);
    }
  };

  return (
    <div className="evidence-analysis">
      <h3>AI Analysis for Evidence {evidenceId}</h3>

      <div className="custom-prompt">
        <label>Custom Analysis Prompt (optional):</label>
        <textarea
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder="Enter specific analysis requirements..."
        />
      </div>

      <button onClick={handleAnalyze} disabled={loading}>
        {loading ? 'Analyzing...' : 'Analyze Evidence'}
      </button>

      {error && <div className="error">Error: {error}</div>}

      {analysis && (
        <div className="analysis-results">
          <h4>Analysis Results</h4>
          <div className="confidence">
            Confidence: {(analysis.confidenceScore * 100).toFixed(1)}%
          </div>

          {analysis.detectedObjects?.vehicles && (
            <div className="detected-vehicles">
              <h5>Detected Vehicles:</h5>
              {analysis.detectedObjects.vehicles.map((vehicle, index) => (
                <div key={index} className="vehicle">
                  <strong>{vehicle.type}</strong> - {vehicle.color}
                  {vehicle.damage && (
                    <div>Damage: {vehicle.damage.join(', ')}</div>
                  )}
                  <div>Confidence: {(vehicle.confidence * 100).toFixed(1)}%</div>
                </div>
              ))}
            </div>
          )}

          {analysis.recommendations && (
            <div className="recommendations">
              <h5>Recommendations:</h5>
              <div>Priority: {analysis.recommendations.investigationPriority}</div>
              {analysis.recommendations.additionalEvidenceNeeded && (
                <div>
                  Additional Evidence Needed:
                  {analysis.recommendations.additionalEvidenceNeeded.join(', ')}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
```

#### AI Conversation Component

```typescript
// components/AIConversation.tsx
import React, { useState, useEffect } from 'react';

interface AIConversationProps {
  reportId: string;
  userId: string;
}

export const AIConversation: React.FC<AIConversationProps> = ({
  reportId,
  userId
}) => {
  const [conversation, setConversation] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const startConversation = async () => {
    try {
      const response = await fetch(`/ai-processing/conversations/start?userId=${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId,
          title: 'Report Analysis Discussion',
          initialMessage: 'What are the key findings from this incident?'
        })
      });

      const result = await response.json();
      setConversation(result.data);
    } catch (err) {
      console.error('Failed to start conversation:', err);
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !conversation) return;

    setLoading(true);
    try {
      const response = await fetch(`/ai-processing/conversations/${conversation._id}/message?userId=${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });

      const result = await response.json();

      // Update conversation with new messages
      setConversation(prev => ({
        ...prev,
        messages: [...prev.messages, result.data.userMessage, result.data.aiResponse]
      }));

      setMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    startConversation();
  }, [reportId, userId]);

  return (
    <div className="ai-conversation">
      <h3>AI Assistant - Report Analysis</h3>

      {conversation && (
        <div className="conversation-history">
          {conversation.messages
            .filter(msg => msg.role !== 'system')
            .map((msg, index) => (
              <div key={index} className={`message ${msg.role}`}>
                <strong>{msg.role === 'user' ? 'You' : 'AI Assistant'}:</strong>
                <p>{msg.content}</p>
                <small>{new Date(msg.timestamp).toLocaleTimeString()}</small>
              </div>
            ))}
        </div>
      )}

      <div className="message-input">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask about the incident analysis..."
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button onClick={sendMessage} disabled={loading || !message.trim()}>
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
};
```

### 2. Vue.js Integration

#### AI Processing Composable

```typescript
// composables/useAIProcessing.ts
import { ref, reactive } from 'vue';

export const useAIProcessing = () => {
  const loading = ref(false);
  const error = ref<string | null>(null);
  const analysisResults = reactive<Record<string, any>>({});

  const processEvidence = async (evidenceData: any) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await fetch('/ai-processing/evidence/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(evidenceData),
      });

      if (!response.ok) throw new Error('Processing failed');

      const result = await response.json();
      analysisResults[evidenceData.evidenceId] = result.data;
      return result.data;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const batchProcessEvidence = async (
    evidenceItems: any[],
    reportId?: string,
  ) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await fetch('/ai-processing/evidence/batch-process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ evidenceItems, reportId }),
      });

      if (!response.ok) throw new Error('Batch processing failed');

      const result = await response.json();
      return result.data;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    error,
    analysisResults,
    processEvidence,
    batchProcessEvidence,
  };
};
```

### 3. Angular Integration

#### AI Processing Service

```typescript
// services/ai-processing.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AIProcessingService {
  private baseUrl = '/ai-processing';
  private loadingSubject = new BehaviorSubject<boolean>(false);

  public loading$ = this.loadingSubject.asObservable();

  constructor(private http: HttpClient) {}

  processEvidence(evidenceData: any): Observable<any> {
    this.loadingSubject.next(true);
    return this.http
      .post(`${this.baseUrl}/evidence/process`, evidenceData)
      .pipe(finalize(() => this.loadingSubject.next(false)));
  }

  enhanceReport(reportId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/reports/${reportId}/enhance`, {});
  }

  startConversation(
    reportId: string,
    userId: string,
    title: string,
  ): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/conversations/start?userId=${userId}`,
      {
        reportId,
        title,
      },
    );
  }

  sendMessage(
    conversationId: string,
    userId: string,
    message: string,
  ): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/conversations/${conversationId}/message?userId=${userId}`,
      {
        message,
      },
    );
  }
}
```

---

## 🔧 Configuration

### Environment Variables

```env
# Required
GOOGLE_AI_API_KEY=your_gemini_api_key_here
MONGO_URI=mongodb://localhost:27017/isaac-api

# Optional
GEMINI_MODEL=gemini-2.0-flash
GEMINI_MAX_TOKENS=1000000
```

### Module Configuration

The module is automatically configured in `ai-processing.module.ts` and imported in the main `app.module.ts`.

---

## 🚀 Quick Start

1. **Set up environment variables**
2. **Install dependencies** (already included in package.json)
3. **Start the application**
4. **Test endpoints** using the provided examples
5. **Integrate with your frontend** using the provided components

---

## 📚 Additional Resources

- [Google AI Documentation](https://ai.google.dev/gemini-api/docs)
- [AI Processing Guide](../AI_PROCESSING_GUIDE.md)
- [API Reference](./controllers/ai-processing.controller.ts)
- [Type Definitions](./types/index.ts)

---

## 🔧 Troubleshooting

### Common Issues

1. **API Key Issues**: Ensure `GOOGLE_AI_API_KEY` is set correctly
2. **Rate Limiting**: Monitor usage and implement retry logic
3. **File Access**: Verify evidence URLs are publicly accessible
4. **Large Files**: Consider file size limits and compression

### Debug Mode

Set `NODE_ENV=development` for detailed logging and error messages.

---

## 🤝 Contributing

When extending the AI processing module:

1. Add new analysis types to `types/index.ts`
2. Implement new services in `services/`
3. Add corresponding endpoints in `controllers/`
4. Update this README with new functionality
5. Add comprehensive tests

---

## 📝 License

This module is part of the Isaac API project and follows the same licensing terms.
