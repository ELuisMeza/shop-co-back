import { ApiProperty } from "@nestjs/swagger";
import { IsUUID, IsOptional } from "class-validator";

/**
 * DTO para la estructura de subida de múltiples fotos.
 * Nota: Con form-data, los archivos se envían como:
 * - photos[0][file]: archivo
 * - photos[0][is_main]: boolean
 * - photos[1][file]: archivo
 * - photos[1][is_main]: boolean
 * - product_id: string (opcional)
 */
export class CreateStructuredPhotosDto {
  @ApiProperty({ 
    type: 'string',
    format: 'uuid',
    description: 'ID del producto',
    required: false,
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @IsUUID()
  @IsOptional()
  product_id?: string;

  // Nota: Los archivos y sus metadatos vienen en form-data como:
  // photos[0][file], photos[0][is_main], photos[1][file], photos[1][is_main], etc.
  // Estos se procesan manualmente en el controlador desde req.body y @UploadedFiles()
}

