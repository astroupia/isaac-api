import {
  Controller,
  UseInterceptors,
  Post,
  Delete,
  Get,
  UploadedFile,
  Param,
  Query,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  CloudinaryService,
  UploadResult,
} from '../services/cloudinary.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('cloudinary')
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadResult> {
    try {
      return await this.cloudinaryService.uploadFile(file);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed';
      throw new BadRequestException(message);
    }
  }

  @Delete('delete/:publicId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteFile(
    @Param('publicId') publicId: string,
    @Query('resourceType') resourceType: string = 'auto',
  ): Promise<void> {
    try {
      await this.cloudinaryService.deleteFile(publicId, resourceType);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Delete failed';
      throw new BadRequestException(message);
    }
  }

  @Get('info/:publicId')
  async getFileInfo(
    @Param('publicId') publicId: string,
    @Query('resourceType') resourceType: string = 'auto',
  ): Promise<any> {
    try {
      return await this.cloudinaryService.getFileInfo(publicId, resourceType);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to get file info';
      throw new BadRequestException(message);
    }
  }

  @Get('supported-formats')
  getSupportedFormats(): {
    images: string[];
    videos: string[];
    audio: string[];
    documents: string[];
    maxFileSize: string;
  } {
    return {
      images: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff'],
      videos: ['mp4', 'mov', 'avi', 'wmv', 'flv', 'webm', 'mkv'],
      audio: ['mp3', 'wav', 'ogg', 'aac', 'flac'],
      documents: [
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
      maxFileSize: '100MB',
    };
  }
}
