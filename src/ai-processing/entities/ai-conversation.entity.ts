import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
}

export enum ConversationStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
}

@Schema({ timestamps: true })
export class AiConversation {
  @Prop({ type: Types.ObjectId, ref: 'Report', required: true })
  reportId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ enum: ConversationStatus, default: ConversationStatus.ACTIVE })
  status: ConversationStatus;

  @Prop({ type: [Object], default: [] })
  messages: Array<{
    role: MessageRole;
    content: string;
    timestamp: Date;
    tokensUsed?: number;
    attachments?: Array<{
      type: string;
      url: string;
      description?: string;
    }>;
  }>;

  @Prop({ type: Object })
  context: {
    incidentId?: Types.ObjectId;
    evidenceIds?: Types.ObjectId[];
    focusAreas?: string[];
    analysisGoals?: string[];
  };

  @Prop({ type: Object })
  summary?: {
    keyFindings?: string[];
    recommendations?: string[];
    confidenceLevel?: number;
    areasOfConcern?: string[];
  };

  @Prop({ default: 0 })
  totalTokensUsed: number;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const AiConversationSchema =
  SchemaFactory.createForClass(AiConversation);
export type AiConversationDocument = AiConversation & Document;
