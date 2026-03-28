import { Inject, Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryUploadService {
  constructor(@Inject('CLOUDINARY_INIT') _initialized: boolean) {}

  /**
   * Sube una imagen a Cloudinary (buffer Multer).
   * @param folder Carpeta lógica en Cloudinary (ej. product, seller)
   * @param publicId Identificador público sin carpeta (ej. UUID del registro file)
   */
  async uploadImage(
    file: Express.Multer.File,
    folder: string,
    publicId: string,
  ): Promise<{ publicId: string; secureUrl: string }> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: publicId,
          resource_type: 'image',
          overwrite: true,
        },
        (error, result) => {
          if (error || !result) {
            reject(error ?? new Error('Fallo al subir imagen a Cloudinary'));
            return;
          }
          resolve({
            publicId: result.public_id,
            secureUrl: result.secure_url,
          });
        },
      );
      Readable.from(file.buffer).pipe(stream);
    });
  }
}
