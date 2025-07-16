# AI Processing Module for Isaac API

## Overview

The AI Processing module integrates Google's Gemini AI to provide advanced analysis capabilities for traffic accident investigation. It processes multiple media types (images, videos, audio, documents) and provides intelligent insights for report generation and investigation assistance.

## Features

### 🔍 **Media Analysis**

- **Image Analysis**: Vehicle detection, damage assessment, scene reconstruction
- **Video Analysis**: Timeline analysis, vehicle movement tracking, impact sequence
- **Audio Analysis**: Sound event detection, emergency response analysis
- **Document Analysis**: Information extraction, inconsistency detection

### 📊 **Report Enhancement**

- AI-powered report generation
- Confidence scoring and analysis
- Damage assessment aggregation
- Recommendation generation

### 💬 **Conversational AI**

- Interactive report discussion
- Natural language queries about incidents
- Context-aware responses
- Conversation history and summaries

## Setup

### 1. Environment Configuration

Add to your `.env` file:

```env
# Google AI API Key (Get from https://ai.google.dev/)
GOOGLE_AI_API_KEY=your_gemini_api_key_here

# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/isaac-api

# Optional: Model Configuration
GEMINI_MODEL=gemini-2.0-flash  # Default model
GEMINI_MAX_TOKENS=1000000     # Context window
```

### 2. Google AI API Key Setup

1. Visit [Google AI Studio](https://ai.google.dev/)
2. Create a new project or select existing
3. Generate an API key
4. Add the key to your environment variables

### 3. Free Tier Limitations

According to the [Google AI pricing](https://ai.google.dev/pricing):

- **Gemini 2.0 Flash**: Free tier available
- **Rate Limits**: Generous for development
- **Context Window**: 1M tokens
- **Multimodal Support**: Images, videos, audio, text

## API Endpoints

### Evidence Processing

#### Process Single Evidence

```http
POST /ai-processing/evidence/process
Content-Type: application/json

{
  "evidenceId": "evidence_id_here",
  "evidenceType": "photo|video|audio|document",
  "fileUrl": "https://your-cloudinary-url.com/evidence.jpg",
  "customPrompt": "Optional custom analysis prompt",
  "reportId": "optional_report_id",
  "incidentId": "optional_incident_id"
}
```

#### Batch Process Evidence

```http
POST /ai-processing/evidence/batch-process
Content-Type: application/json

{
  "evidenceItems": [
    {
      "evidenceId": "evidence_1",
      "type": "photo",
      "fileUrl": "https://url1.com/image.jpg"
    },
    {
      "evidenceId": "evidence_2",
      "type": "video",
      "fileUrl": "https://url2.com/video.mp4"
    }
  ],
  "reportId": "report_id_here",
  "incidentId": "incident_id_here"
}
```

### Media-Specific Analysis

#### Image Analysis

```http
POST /ai-processing/media/image/analyze
Content-Type: application/json

{
  "evidenceId": "evidence_id",
  "fileUrl": "https://cloudinary-url.com/accident-scene.jpg",
  "customPrompt": "Focus on vehicle damage assessment",
  "reportId": "report_id",
  "incidentId": "incident_id"
}
```

#### Video Analysis

```http
POST /ai-processing/media/video/analyze
Content-Type: application/json

{
  "evidenceId": "evidence_id",
  "fileUrl": "https://cloudinary-url.com/accident-video.mp4",
  "customPrompt": "Analyze the sequence of events leading to impact"
}
```

### Report Enhancement

#### Enhance Report with AI

```http
POST /ai-processing/reports/{reportId}/enhance
```

#### Generate Recommendations

```http
POST /ai-processing/reports/{reportId}/recommendations
```

#### Generate Incident Summary

```http
POST /ai-processing/incidents/{incidentId}/summary
```

### Conversational AI

#### Start Conversation

```http
POST /ai-processing/conversations/start?userId=user_id
Content-Type: application/json

{
  "reportId": "report_id_here",
  "title": "Discussion about accident analysis",
  "initialMessage": "What can you tell me about the vehicle damage in this incident?"
}
```

#### Send Message

```http
POST /ai-processing/conversations/{conversationId}/message?userId=user_id
Content-Type: application/json

{
  "message": "Can you analyze the impact patterns in the photos?",
  "attachments": [
    {
      "type": "image",
      "url": "https://cloudinary-url.com/damage-photo.jpg",
      "description": "Front-end damage"
    }
  ]
}
```

## Usage Examples

### 1. Complete Evidence Analysis Workflow

```typescript
// 1. Process all evidence for an incident
const batchAnalysis = await fetch('/ai-processing/evidence/batch-process', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    evidenceItems: [
      {
        evidenceId: 'evidence_1',
        type: 'photo',
        fileUrl: 'https://cloudinary.com/scene-overview.jpg',
      },
      {
        evidenceId: 'evidence_2',
        type: 'video',
        fileUrl: 'https://cloudinary.com/dash-cam.mp4',
      },
    ],
    reportId: 'report_123',
    incidentId: 'incident_456',
  }),
});

// 2. Enhance report with AI analysis
const enhancedReport = await fetch(
  '/ai-processing/reports/report_123/enhance',
  {
    method: 'POST',
  },
);

// 3. Generate recommendations
const recommendations = await fetch(
  '/ai-processing/reports/report_123/recommendations',
  {
    method: 'POST',
  },
);
```

### 2. Interactive Analysis Session

```typescript
// Start conversation about a report
const conversation = await fetch(
  '/ai-processing/conversations/start?userId=user_123',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      reportId: 'report_123',
      title: 'Accident Analysis Discussion',
      initialMessage: 'What are the key findings from the evidence analysis?',
    }),
  },
);

// Continue conversation
const response = await fetch(
  `/ai-processing/conversations/${conversationId}/message?userId=user_123`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message:
        'Can you explain the damage patterns and what they indicate about the impact?',
    }),
  },
);
```

### 3. Custom Analysis Prompts

```typescript
// Custom image analysis for specific focus
const customAnalysis = await fetch('/ai-processing/media/image/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    evidenceId: 'evidence_123',
    fileUrl: 'https://cloudinary.com/intersection-view.jpg',
    customPrompt: `Analyze this intersection accident photo focusing on:
    1. Traffic signal states and visibility
    2. Road markings and signage
    3. Vehicle positions relative to lanes
    4. Skid marks and debris patterns
    5. Weather and lighting conditions
    
    Provide specific measurements and observations where possible.`,
  }),
});
```

## Response Examples

### Analysis Result Response

```json
{
  "success": true,
  "data": {
    "evidenceId": "evidence_123",
    "analysisType": "image_analysis",
    "status": "completed",
    "confidenceScore": 0.87,
    "detectedObjects": {
      "vehicles": [
        {
          "type": "car",
          "confidence": 0.95,
          "damage": ["front", "side"],
          "damageSeverity": "moderate",
          "color": "blue",
          "position": "left lane"
        }
      ],
      "persons": [
        {
          "position": "driver",
          "confidence": 0.82,
          "location": "inside vehicle"
        }
      ]
    },
    "sceneAnalysis": {
      "weatherConditions": ["clear"],
      "lightingConditions": "daylight",
      "roadType": "city_street",
      "trafficFlow": "moderate"
    },
    "recommendations": {
      "investigationPriority": "medium",
      "additionalEvidenceNeeded": ["witness_statements", "vehicle_inspection"],
      "expertConsultation": ["accident_reconstruction"]
    }
  }
}
```

### Conversation Response

```json
{
  "success": true,
  "data": {
    "userMessage": {
      "role": "user",
      "content": "What caused this accident?",
      "timestamp": "2024-01-15T10:30:00Z"
    },
    "aiResponse": {
      "role": "assistant",
      "content": "Based on the evidence analysis, the accident appears to be caused by a failure to yield at the intersection. The video shows Vehicle A approaching the intersection at moderate speed without slowing for the stop sign. The damage patterns on both vehicles are consistent with a T-bone collision, with Vehicle A striking Vehicle B on the driver's side. The confidence level for this assessment is 85% based on the available evidence.",
      "timestamp": "2024-01-15T10:30:02Z"
    }
  }
}
```

## Best Practices

### 1. Evidence Quality

- Use high-resolution images (minimum 1024x768)
- Ensure good lighting and clear visibility
- Capture multiple angles and perspectives
- Include close-up and wide shots

### 2. Prompt Engineering

- Be specific about what you want analyzed
- Include context about the incident type
- Specify the level of detail needed
- Ask for confidence levels and uncertainty

### 3. Batch Processing

- Group related evidence together
- Process evidence in logical order
- Monitor rate limits and quotas
- Handle failures gracefully

### 4. Conversation Management

- Keep conversations focused on specific aspects
- Provide context in initial messages
- Ask follow-up questions for clarity
- Archive completed conversations

## Error Handling

### Common Error Responses

```json
{
  "success": false,
  "error": "INVALID_FILE_URL",
  "message": "Unable to access the provided file URL",
  "details": {
    "url": "https://invalid-url.com/file.jpg",
    "status": 404
  }
}
```

### Retry Logic

```typescript
async function processWithRetry(evidenceData, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await processEvidence(evidenceData);
      return result;
    } catch (error) {
      if (attempt === maxRetries) throw error;
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }
}
```

## Monitoring and Analytics

### Health Check

```http
GET /ai-processing/health
```

### Service Statistics

```http
GET /ai-processing/stats
```

### Analysis History

```http
GET /ai-processing/evidence/{evidenceId}/results
GET /ai-processing/reports/{reportId}/results
```

## Security Considerations

1. **API Key Security**: Never expose your Google AI API key in client-side code
2. **File Access**: Ensure evidence URLs are properly secured
3. **Rate Limiting**: Implement proper rate limiting to avoid quota exhaustion
4. **Data Privacy**: Be mindful of sensitive information in evidence files
5. **User Authentication**: Implement proper authentication for conversation endpoints

## Performance Optimization

1. **Batch Processing**: Use batch endpoints for multiple evidence items
2. **Caching**: Cache analysis results to avoid reprocessing
3. **Async Processing**: Use background jobs for large files
4. **Context Caching**: Leverage Gemini's context caching for conversations
5. **Token Management**: Monitor token usage and optimize prompts

## Troubleshooting

### Common Issues

1. **Rate Limit Exceeded**: Wait and retry with exponential backoff
2. **File Too Large**: Compress or resize media files
3. **Invalid File Format**: Ensure supported formats (JPEG, PNG, MP4, etc.)
4. **Low Confidence Scores**: Improve image quality or provide more context
5. **API Key Issues**: Verify key is valid and has proper permissions

### Debug Mode

Set `NODE_ENV=development` to enable detailed logging and error messages.

## Future Enhancements

- **Real-time Analysis**: Stream processing for live video feeds
- **Custom Models**: Fine-tuned models for specific accident types
- **3D Reconstruction**: Advanced scene reconstruction capabilities
- **Integration**: Connect with external forensic tools
- **Mobile Support**: Optimized mobile analysis workflows

## Support

For issues and questions:

- Check the [Google AI documentation](https://ai.google.dev/gemini-api/docs)
- Review API response error messages
- Monitor application logs
- Contact development team for custom requirements
