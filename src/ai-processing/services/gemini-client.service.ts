import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  GoogleGenerativeAI,
  GenerativeModel,
  Part,
} from '@google/generative-ai';
import { AIProcessingConfig } from '../types/ai-processing.types';

@Injectable()
export class GeminiClientService {
  private readonly logger = new Logger(GeminiClientService.name);
  private readonly genAI: GoogleGenerativeAI;
  private readonly model: GenerativeModel;
  private readonly config: AIProcessingConfig;

  constructor(private readonly configService: ConfigService) {
    this.config = {
      geminiApiKey: this.configService.get<string>('GEMINI_API_KEY') || '',
      model:
        this.configService.get<string>('GEMINI_MODEL') ||
        'gemini-2.0-flash-exp',
      maxRetries: this.configService.get<number>('GEMINI_MAX_RETRIES') || 3,
      timeoutMs: this.configService.get<number>('GEMINI_TIMEOUT_MS') || 30000,
      defaultTemperature:
        this.configService.get<number>('GEMINI_TEMPERATURE') || 0.7,
      defaultTopP: this.configService.get<number>('GEMINI_TOP_P') || 0.9,
      maxTokens: this.configService.get<number>('GEMINI_MAX_TOKENS') || 8192,
    };

    if (!this.config.geminiApiKey) {
      throw new Error('GEMINI_API_KEY is required');
    }

    this.genAI = new GoogleGenerativeAI(this.config.geminiApiKey);
    this.model = this.genAI.getGenerativeModel({
      model: this.config.model,
      generationConfig: {
        temperature: this.config.defaultTemperature,
        topP: this.config.defaultTopP,
        maxOutputTokens: this.config.maxTokens,
      },
    });
  }

  async processImageWithPrompt(imageUrl: string, prompt: string): Promise<any> {
    try {
      this.logger.log(`Processing image: ${imageUrl}`);

      const imagePart = await this.createImagePart(imageUrl);
      const result = await this.model.generateContent([prompt, imagePart]);
      const response = await result.response;

      return {
        text: response.text(),
        candidates: response.candidates,
        usageMetadata: response.usageMetadata,
      };
    } catch (error: any) {
      this.logger.error(`Error processing image: ${error.message}`);
      throw error;
    }
  }

  async processVideoWithPrompt(videoUrl: string, prompt: string): Promise<any> {
    try {
      this.logger.log(`Processing video: ${videoUrl}`);

      const videoPart = await this.createVideoPart(videoUrl);
      const result = await this.model.generateContent([prompt, videoPart]);
      const response = await result.response;

      return {
        text: response.text(),
        candidates: response.candidates,
        usageMetadata: response.usageMetadata,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error processing video: ${errorMessage}`);
      throw error;
    }
  }

  async processAudioWithPrompt(audioUrl: string, prompt: string): Promise<any> {
    try {
      this.logger.log(`Processing audio: ${audioUrl}`);

      const audioPart = await this.createAudioPart(audioUrl);
      const result = await this.model.generateContent([prompt, audioPart]);
      const response = await result.response;

      return {
        text: response.text(),
        candidates: response.candidates,
        usageMetadata: response.usageMetadata,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error processing audio: ${errorMessage}`);
      throw error;
    }
  }

  async processDocumentWithPrompt(
    documentUrl: string,
    prompt: string,
  ): Promise<any> {
    try {
      this.logger.log(`Processing document: ${documentUrl}`);

      const documentPart = await this.createDocumentPart(documentUrl);
      const result = await this.model.generateContent([prompt, documentPart]);
      const response = await result.response;

      return {
        text: response.text(),
        candidates: response.candidates,
        usageMetadata: response.usageMetadata,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error processing document: ${errorMessage}`);
      throw error;
    }
  }

  async processTextWithPrompt(text: string, prompt: string): Promise<any> {
    try {
      this.logger.log(`Processing text prompt`);

      const fullPrompt = `${prompt}\n\nContent to analyze:\n${text}`;
      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;

      return {
        text: response.text(),
        candidates: response.candidates,
        usageMetadata: response.usageMetadata,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error processing text: ${errorMessage}`);
      throw error;
    }
  }

  async processMultimodalContent(parts: Part[], prompt: string): Promise<any> {
    try {
      this.logger.log(`Processing multimodal content`);

      const content = [prompt, ...parts];
      const result = await this.model.generateContent(content);
      const response = await result.response;

      return {
        text: response.text(),
        candidates: response.candidates,
        usageMetadata: response.usageMetadata,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error processing multimodal content: ${errorMessage}`);
      throw error;
    }
  }

  private async createImagePart(imageUrl: string): Promise<Part> {
    const response = await fetch(imageUrl);
    const buffer = await response.arrayBuffer();
    const mimeType = response.headers.get('content-type') || 'image/jpeg';

    return {
      inlineData: {
        data: Buffer.from(buffer).toString('base64'),
        mimeType,
      },
    };
  }

  private async createVideoPart(videoUrl: string): Promise<Part> {
    const response = await fetch(videoUrl);
    const buffer = await response.arrayBuffer();
    const mimeType = response.headers.get('content-type') || 'video/mp4';

    return {
      inlineData: {
        data: Buffer.from(buffer).toString('base64'),
        mimeType,
      },
    };
  }

  private async createAudioPart(audioUrl: string): Promise<Part> {
    const response = await fetch(audioUrl);
    const buffer = await response.arrayBuffer();
    const mimeType = response.headers.get('content-type') || 'audio/mpeg';

    return {
      inlineData: {
        data: Buffer.from(buffer).toString('base64'),
        mimeType,
      },
    };
  }

  private async createDocumentPart(documentUrl: string): Promise<Part> {
    const response = await fetch(documentUrl);
    const buffer = await response.arrayBuffer();
    const mimeType = response.headers.get('content-type') || 'application/pdf';

    return {
      inlineData: {
        data: Buffer.from(buffer).toString('base64'),
        mimeType,
      },
    };
  }

  getConfig(): AIProcessingConfig {
    return { ...this.config };
  }
}
