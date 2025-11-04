import { ApiProperty } from "@nestjs/swagger";
import { Allow, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";
type MulterFile = Express.Multer.File;

export class UpdateSellerDto {
  @ApiProperty({ example: 'Mi Tienda Online', description: 'Nombre de la tienda' })
  @IsString()
  @IsNotEmpty()
  shop_name: string;

  @ApiProperty({ example: 'Tu tienda de confianza', description: 'Descripción de la tienda' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ 
    type: 'string',
    format: 'binary',
    description: 'Logo de la tienda (archivo de imagen)',
  })
  @Allow()
  logo_image?: MulterFile;

  @ApiProperty({ example: '20123456789', description: 'RUC de la empresa' })
  @IsString()
  @IsOptional()
  ruc?: string;

  @ApiProperty({ example: 'Av. Principal 123', description: 'Dirección del negocio' })
  @IsString()
  @IsOptional()
  business_address?: string;
}

