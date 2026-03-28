import { Inject, Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryDeleteService {
  constructor(@Inject('CLOUDINARY_INIT') _initialized: boolean) {}

  /**
   * Elimina una imagen por public_id de Cloudinary o, si se pasa una URL completa,
   * intenta extraer el public_id.
   */
  async deleteImage(storedPathOrUrl: string): Promise<void> {
    const raw = storedPathOrUrl?.trim();
    if (!raw) {
      return;
    }

    const publicId = this.toPublicId(raw);
    const { result } = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'image',
    });

    if (result !== 'ok' && result !== 'not found') {
      throw new Error(`Cloudinary destroy: ${result}`);
    }
  }

  private toPublicId(value: string): string {
    if (!/^https?:\/\//i.test(value)) {
      return value;
    }

    const marker = '/upload/';
    const idx = value.indexOf(marker);
    if (idx === -1) {
      return value;
    }

    let rest = value.slice(idx + marker.length);
    rest = rest.replace(/^v\d+\//, '');
    const lastSlash = rest.lastIndexOf('/');
    const lastDot = rest.lastIndexOf('.');
    if (lastDot > lastSlash) {
      return rest.slice(0, lastDot);
    }
    return rest;
  }
}
