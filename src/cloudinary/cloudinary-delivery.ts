import { v2 as cloudinary } from 'cloudinary';

/**
 * Convierte un public_id almacenado en BD a URL HTTPS.
 * Si ya es una URL absoluta (p. ej. datos legacy), se devuelve igual.
 */
export function toDeliveryUrl(pathFile: string | null | undefined): string | null | undefined {
  if (pathFile == null || pathFile === '') {
    return pathFile;
  }
  if (/^https?:\/\//i.test(pathFile)) {
    return pathFile;
  }
  return cloudinary.url(pathFile, { secure: true });
}
