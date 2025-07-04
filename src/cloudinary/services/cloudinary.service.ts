import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

export interface UploadResult {
  url: string;
  publicId: string;
  resourceType: string;
  format: string;
  size: number;
  width?: number;
  height?: number;
  duration?: number;
}

@Injectable()
export class CloudinaryService {
  private readonly maxFileSize = 100 * 1024 * 1024; // 100MB
  private readonly allowedMimeTypes = [
    // Images
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/bmp',
    'image/tiff',
    // Videos
    'video/mp4',
    'video/mov',
    'video/avi',
    'video/wmv',
    'video/flv',
    'video/webm',
    'video/mkv',
    // Audio
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'audio/mp3',
    'audio/aac',
    'audio/flac',
    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
  ];

  constructor(private readonly configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  private validateFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        `File size exceeds maximum limit of ${this.maxFileSize / (1024 * 1024)}MB`,
      );
    }

    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type ${file.mimetype} is not supported`,
      );
    }
  }

  async uploadFile(file: Express.Multer.File): Promise<UploadResult> {
    this.validateFile(file);

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder: 'isaac-platform',
          allowed_formats: [
            'jpg',
            'png',
            'gif',
            'webp',
            'mp4',
            'mov',
            'avi',
            'mp3',
            'wav',
            'pdf',
            'doc',
            'docx',
            'xls',
            'xlsx',
            'ppt',
            'pptx',
            'txt',
            'csv',
          ],
          transformation: [{ quality: 'auto' }, { fetch_format: 'auto' }],
        },
        (error, result) => {
          if (error) {
            return reject(
              new BadRequestException(error.message || 'Upload failed'),
            );
          }

          if (!result) {
            return reject(
              new BadRequestException('Upload failed - no result returned'),
            );
          }

          const uploadResult: UploadResult = {
            url: result.secure_url,
            publicId: result.public_id,
            resourceType: result.resource_type,
            format: result.format,
            size: result.bytes,
            width: result.width,
            height: result.height,
            duration: result.duration,
          };

          return resolve(uploadResult);
        },
      );

      uploadStream.end(file.buffer);
    });
  }

  async deleteFile(
    publicId: string,
    resourceType: string = 'auto',
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(
        publicId,
        { resource_type: resourceType },
        (error, result) => {
          if (error) {
            return reject(
              new BadRequestException(error.message || 'Delete failed'),
            );
          }
          return resolve();
        },
      );
    });
  }

  async getFileInfo(
    publicId: string,
    resourceType: string = 'auto',
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      cloudinary.api.resource(
        publicId,
        { resource_type: resourceType },
        (error, result) => {
          if (error) {
            return reject(
              new BadRequestException(
                error.message || 'Failed to get file info',
              ),
            );
          }
          return resolve(result);
        },
      );
    });
  }
}
