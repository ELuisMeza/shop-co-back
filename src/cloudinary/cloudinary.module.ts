import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryUploadService } from './cloudinary-upload.service';
import { CloudinaryDeleteService } from './cloudinary-delete.service';

@Global()
@Module({
  providers: [
    {
      provide: 'CLOUDINARY_INIT',
      useFactory: (config: ConfigService) => {
        cloudinary.config({
          cloud_name: config.getOrThrow<string>('CLOUDINARY_CLOUD_NAME'),
          api_key: config.getOrThrow<string>('CLOUDINARY_API_KEY'),
          api_secret: config.getOrThrow<string>('CLOUDINARY_API_SECRET'),
        });
        return true;
      },
      inject: [ConfigService],
    },
    CloudinaryUploadService,
    CloudinaryDeleteService,
  ],
  exports: [CloudinaryUploadService, CloudinaryDeleteService],
})
export class CloudinaryModule {}
