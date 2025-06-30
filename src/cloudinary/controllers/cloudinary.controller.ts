import {
  Controller,
  UseInterceptors,
  Post,
  UploadedFile,
} from '@nestjs/common';
import { CloudinaryService } from '../services/cloudinary.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('uploadMedia')
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.cloudinaryService.uploadFile(file);
  }
}
