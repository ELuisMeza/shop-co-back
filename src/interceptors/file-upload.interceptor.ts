import { Injectable, NestInterceptor, ExecutionContext, CallHandler, BadRequestException } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class FileUploadInterceptor implements NestInterceptor {
  private readonly allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  private readonly maxSize = 10 * 1024 * 1024; // 10MB

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    
    // Manejar archivo único (request.file)
    const file = request.file;
    if (file) {
      this.validateFile(file, file.originalname);
    }

    // Manejar múltiples archivos (request.files)
    const files = request.files;
    if (files && Array.isArray(files) && files.length > 0) {
      files.forEach((f: Express.Multer.File) => {
        this.validateFile(f, f.originalname);
      });
    }

    // Si hay archivos, validarlos; si no hay, permitir continuar (archivo opcional)
    // La validación de que se requiere un archivo se hace en el controlador o servicio

    return next.handle();
  }

  /**
   * Valida un archivo individual
   * @param file Archivo a validar
   * @param filename Nombre del archivo para mensajes de error
   */
  private validateFile(file: Express.Multer.File, filename: string): void {
    if (!file) {
      throw new BadRequestException(`El archivo ${filename || 'desconocido'} no es válido`);
    }

    // Validar tipo de archivo
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `El archivo ${filename} debe ser una imagen (JPEG, PNG, GIF, WEBP)`
      );
    }

    // Validar tamaño (máximo 10MB)
    if (file.size > this.maxSize) {
      throw new BadRequestException(
        `El archivo ${filename} no puede ser mayor a 10MB`
      );
    }
  }
}

