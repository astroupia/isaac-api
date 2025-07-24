# Enhanced Casualty Report Generation Service

## Overview

The `generateCasualtyReport` service has been enhanced to intelligently check for existing AI analysis results before generating new ones. This optimization reduces redundant AI processing and improves performance.

## Changes Made

### 1. Modified `generateCasualtyReport` Method

**Location**: `src/ai-processing/services/report-enhancement.service.ts`

**New Logic Flow**:

1. **Check for existing analysis**: Query the `AiAnalysisResult` collection for existing analysis results related to the reportId
2. **Use existing analysis if available**: If analysis results exist, use them directly for casualty report generation
3. **Trigger new analysis if needed**: If no analysis exists, trigger new evidence processing
4. **Generate casualty report**: Use the analysis results (existing or new) to generate the comprehensive casualty report

### 2. Added `triggerNewAnalysis` Method

**Purpose**: Handles the creation of new AI analysis when none exists

**Functionality**:

- Fetches all evidence for the incident
- Processes evidence in batch using the media analysis service
- Waits for analysis to be saved to the database
- Returns the newly generated analysis results

### 3. Added `generateComprehensiveCasualtyReportFromAnalysis` Method

**Purpose**: Generates casualty reports from existing analysis results

**Key Features**:

- Works with both existing analysis results and newly generated ones
- Aggregates casualty information from all analysis results
- Calculates confidence scores and processing summaries
- Handles both batch results format and direct analysis format

### 4. Updated Helper Methods

**Updated Methods**:

- `extractWeatherConditions()`: Now handles both batch results and direct analysis formats
- `extractRoadConditions()`: Now handles both batch results and direct analysis formats
- `calculateVehicleDetectionConfidence()`: Enhanced to work with new analysis format
- `calculateCasualtyAssessmentConfidence()`: Enhanced to work with new analysis format
- `calculateSceneReconstructionConfidence()`: Enhanced to work with new analysis format

### 5. Report Status Update

**New Feature**: When a casualty report is successfully generated, the associated report status is automatically updated to `'Needs Review'`.

**What Gets Updated**:

- **Report Status**: Changed to `ReportStatus.NEEDS_REVIEW`
- **Updated At**: Set to current timestamp
- **Comments**: Adds a system comment documenting the casualty report generation
- **Content**: Links the casualty report ID to the report

**System Comment Example**:

```
"Casualty report generated successfully on 2025-01-22T10:30:00.000Z. Report status updated to 'Needs Review' for further analysis."
```

## API Response Changes

### Enhanced Response Structure

The casualty report generation now returns additional metadata:

```json
{
  "reportId": "string",
  "incidentId": "string",
  "casualtyReport": {
    /* casualty report data */
  },
  "evidenceProcessed": 5,
  "analysisResultsUsed": 3,
  "usedExistingAnalysis": true, // or false
  "updatedReport": {
    /* updated report data */
  },
  "generatedAt": "2025-01-22T10:30:00.000Z"
}
```

### New Fields Explained

- **`analysisResultsUsed`**: Number of analysis results used to generate the report
- **`usedExistingAnalysis`**: Boolean indicating whether existing analysis was reused
- **`evidenceProcessed`**: Number of evidence items processed

### Report Status Update

When a casualty report is successfully generated, the associated report is automatically updated with:

- **Status**: Changed to `'Needs Review'`
- **Updated At**: Current timestamp
- **System Comment**: Documentation of the casualty report generation
- **Casualty Report ID**: Linked to the report content

This ensures that reports with casualty analysis are properly flagged for review and follow-up.

## Benefits

### 1. Performance Optimization

- **Reduces redundant AI processing**: Reuses existing analysis when available
- **Faster response times**: No need to reprocess evidence that has already been analyzed
- **Cost efficiency**: Reduces AI API calls and processing costs

### 2. Data Consistency

- **Maintains analysis consistency**: Uses the same analysis results for related operations
- **Prevents duplicate analysis**: Ensures each evidence item is only processed once

### 3. Better User Experience

- **Faster report generation**: Users get results quicker when analysis already exists
- **Transparent processing**: Users can see whether existing or new analysis was used

## Usage Examples

### Frontend Integration

```typescript
// Generate casualty report (will check for existing analysis first)
const casualtyReport = await fetch(
  `/ai-processing/reports/${reportId}/generate-casualty-report`,
  {
    method: 'POST',
  },
);

const result = await casualtyReport.json();

if (result.data.usedExistingAnalysis) {
  console.log('Used existing analysis for faster processing');
} else {
  console.log('Generated new analysis for this report');
}
```

### Enhanced Report with Custom Prompt

```typescript
// Enhance existing analysis with custom prompt
const enhancedReport = await fetch(
  `/ai-processing/reports/${reportId}/enhance`,
  {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      customPrompt:
        'Focus specifically on vehicle damage assessment and provide detailed cost estimates for repairs.',
    }),
  },
);

const result = await enhancedReport.json();
console.log(
  'Analysis updated with custom prompt:',
  result.data.updatedAnalysisResults.length,
);
```

### Get AI Analysis Results

```typescript
// Get AI analysis results for a report
const aiAnalysisResults = await fetch(
  `/ai-processing/reports/${reportId}/ai-analysis`,
  {
    method: 'GET',
  },
);

const results = await aiAnalysisResults.json();
console.log('AI analysis results:', results.data);
```

### Testing

Use the provided test scripts to verify the enhanced functionality:

```bash
# Test casualty report generation with status updates
node test-casualty-report-enhanced.js

# Test report status updates
node test-report-status-update.js

# Test enhance with custom prompt
node test-enhance-with-prompt.js
```

## Migration Notes

### Backward Compatibility

- ✅ **Fully backward compatible**: Existing API endpoints remain unchanged
- ✅ **No breaking changes**: All existing functionality preserved
- ✅ **Enhanced functionality**: New features are additive

### Database Impact

- ✅ **No schema changes**: Existing database structure remains the same
- ✅ **Improved efficiency**: Better utilization of existing analysis data

## Error Handling

The enhanced service includes robust error handling:

1. **Report not found**: Returns appropriate error message
2. **No evidence found**: Handles cases where incident has no evidence
3. **Analysis processing failures**: Gracefully handles AI processing errors
4. **Database connection issues**: Proper error propagation

## Monitoring and Logging

Enhanced logging provides visibility into the decision-making process:

```typescript
// Example log output
logger.log(
  `Found ${existingAnalysisResults.length} existing analysis results for report: ${reportId}`,
);
logger.log('Using existing AI analysis results for casualty report generation');
// or
logger.log('No existing analysis found. Triggering new evidence processing');
```

## Future Enhancements

Potential improvements for future versions:

1. **Analysis freshness checking**: Consider analysis age when deciding to reuse
2. **Selective reprocessing**: Only reprocess evidence that has been updated
3. **Analysis versioning**: Track different versions of analysis results
4. **Caching layer**: Implement Redis caching for frequently accessed analysis results

### Report Enhancement

#### Enhance Report with AI

```http
POST /ai-processing/reports/{reportId}/enhance
```

#### Enhance Report with Custom Prompt (Updated)

```http
PUT /ai-processing/reports/{reportId}/enhance
Content-Type: application/json

{
  "customPrompt": "Focus specifically on vehicle damage assessment and provide detailed cost estimates for repairs."
}
```

#### Get AI Analysis Results

```http
GET /ai-processing/reports/{reportId}/ai-analysis
```

#### Generate Recommendations

```http
POST /ai-processing/reports/{reportId}/recommendations
```
