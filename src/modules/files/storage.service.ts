import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';

@Injectable()
export class StorageService {
  private readonly uploadsDir = path.join(process.cwd(), 'uploads');

  /**
   * Guarda un archivo en el sistema de archivos
   * @param file Archivo de Multer
   * @param parentId ID del parent para organizar en carpetas
   * @returns Ruta relativa del archivo guardado
   */
  async saveFile(file: Express.Multer.File, parentId: string): Promise<string> {
    // Crear directorio base si no existe
    await this.ensureDirectoryExists(this.uploadsDir);

    // Crear directorio del parent si no existe
    const parentDir = path.join(this.uploadsDir, parentId);
    await this.ensureDirectoryExists(parentDir);

    // Generar nombre único para el archivo
    const fileExtension = path.extname(file.originalname);
    const fileName = `${randomUUID()}${fileExtension}`;
    const filePath = path.join(parentDir, fileName);

    // Guardar archivo
    await fs.writeFile(filePath, file.buffer);

    // Devolver ruta relativa para guardar en BD (ej: uploads/{parentId}/{fileName})
    return path.join('uploads', parentId, fileName).replace(/\\/g, '/');
  }

  /**
   * Lee un archivo del sistema de archivos
   * @param filePath Ruta relativa del archivo
   * @returns Buffer del archivo
   */
  async getFile(filePath: string): Promise<Buffer> {
    const fullPath = path.join(process.cwd(), filePath);
    try {
      return await fs.readFile(fullPath);
    } catch (error) {
      throw new Error(`No se pudo leer el archivo: ${filePath}`);
    }
  }

  /**
   * Elimina un archivo del sistema de archivos
   * @param filePath Ruta relativa del archivo
   */
  async deleteFile(filePath: string): Promise<void> {
    const fullPath = path.join(process.cwd(), filePath);
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
   * @param filePath Ruta relativa del archivo
   * @returns Ruta absoluta del archivo
   */
  getFullPath(filePath: string): string {
    return path.join(process.cwd(), filePath);
  }
}
