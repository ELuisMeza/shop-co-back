import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, ValidateIf } from "class-validator";

export class UpdateSellerDto {
  @ApiProperty({ example: 'Mi Tienda Online', description: 'Nombre de la tienda' })
  @IsString()
  @IsNotEmpty()
  shop_name: string;

  @ApiProperty({ example: 'Tu tienda de confianza', description: 'Descripción de la tienda' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'Av. Principal 123', description: 'Dirección del negocio' })
  @IsString()
  @IsOptional()
  business_address?: string;

  @ApiProperty({ type: 'string', format: 'binary', description: 'Logo de la tienda' })
  @IsOptional()
  logo_image?: Express.Multer.File;
}

