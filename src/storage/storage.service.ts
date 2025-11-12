import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';

@Injectable()
export class StorageService {
  private readonly uploadsDir = path.join(process.cwd(), 'uploads');

  /**
   * Guarda un archivo en el sistema de archivos
   * @param file Archivo de Multer
   * @param fileId ID del archivo (UUID) que será el nombre del archivo
   * @param folderName Nombre de la carpeta donde se guardará (ej: 'products', 'sellers', etc.)
   * @returns Ruta relativa del archivo guardado (solo el ID)
   */
  async saveFile(file: Express.Multer.File, fileId: string, folderName: string): Promise<string> {
    // Crear directorio base si no existe
    await this.ensureDirectoryExists(this.uploadsDir);

    // Crear carpeta específica si no existe
    const targetDir = path.join(this.uploadsDir, folderName);
    await this.ensureDirectoryExists(targetDir);

    // Obtener extensión del archivo original
    const fileExtension = path.extname(file.originalname);
    
    // Nombre del archivo será el ID con su extensión
    const fileName = `${fileId}${fileExtension}`;
    const filePath = path.join(targetDir, fileName);

    // Guardar archivo en la carpeta correspondiente
    await fs.writeFile(filePath, file.buffer);

    // Devolver solo el ID (no la ruta completa)
    return fileId;
  }

  /**
   * Lee un archivo del sistema de archivos
   * @param fileId ID del archivo (que es el nombre del archivo)
   * @param mimetype Tipo MIME para determinar la extensión
   * @param folderName Nombre de la carpeta donde está el archivo (ej: 'products', 'sellers', etc.)
   * @returns Buffer del archivo
   */
  async getFile(fileId: string, mimetype: string, folderName: string): Promise<Buffer> {
    // Determinar extensión basándose en el mimetype
    const extensionMap: { [key: string]: string } = {
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/webp': '.webp',
    };
    
    const extension = extensionMap[mimetype] || '.jpg';
    const fileName = `${fileId}${extension}`;
    
    // Buscar en la carpeta especificada
    const targetDir = path.join(this.uploadsDir, folderName);
    const fullPath = path.join(targetDir, fileName);
    
    try {
      return await fs.readFile(fullPath);
    } catch (error) {
      throw new Error(`No se pudo leer el archivo: ${fileId}`);
    }
  }

  /**
   * Elimina un archivo del sistema de archivos
   * @param fileId ID del archivo (que es el nombre del archivo)
   * @param mimetype Tipo MIME para determinar la extensión
   * @param folderName Nombre de la carpeta donde está el archivo (ej: 'products', 'sellers', etc.)
   */
  async deleteFile(fileId: string, mimetype: string, folderName: string): Promise<void> {
    // Determinar extensión basándose en el mimetype
    const extensionMap: { [key: string]: string } = {
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/webp': '.webp',
    };
    
    const extension = extensionMap[mimetype] || '.jpg';
    const fileName = `${fileId}${extension}`;
    
    // Buscar en la carpeta especificada
    const targetDir = path.join(this.uploadsDir, folderName);
    const fullPath = path.join(targetDir, fileName);
    
    try {
      await fs.unlink(fullPath);
    } catch (error) {
      // Si el archivo no existe, no es un error crítico
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  }

  /**
   * Verifica si existe un directorio y lo crea si no existe
   * @param dirPath Ruta del directorio
   */
  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  /**
   * Obtiene la ruta completa del archivo
   * @param fileId ID del archivo (que es el nombre del archivo)
   * @param mimetype Tipo MIME para determinar la extensión
   * @param folderName Nombre de la carpeta donde está el archivo (ej: 'products', 'sellers', etc.)
   * @returns Ruta absoluta del archivo
   */
  getFullPath(fileId: string, mimetype: string, folderName: string): string {
    // Determinar extensión basándose en el mimetype
    const extensionMap: { [key: string]: string } = {
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/webp': '.webp',
    };
    
    const extension = extensionMap[mimetype] || '.jpg';
    const fileName = `${fileId}${extension}`;
    
    // Buscar en la carpeta especificada
    const targetDir = path.join(this.uploadsDir, folderName);
    
    return path.join(targetDir, fileName);
  }
}

