import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class UpdateSellerDto {
  @ApiProperty({ example: 'Mi Tienda Online', description: 'Nombre de la tienda' })
  @IsString()
  @IsNotEmpty()
  shop_name: string;

  @ApiProperty({ example: 'Tu tienda de confianza', description: 'Descripción de la tienda' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'https://example.com/logo.jpg', description: 'URL del logo' })
  @IsString()
  @IsOptional()
  logo_image?: string;

  @ApiProperty({ example: '20123456789', description: 'RUC de la empresa' })
  @IsString()
  @IsOptional()
  ruc?: string;

  @ApiProperty({ example: 'Av. Principal 123', description: 'Dirección del negocio' })
  @IsString()
  @IsOptional()
  business_address?: string;

  @ApiProperty({ example: 4.5, description: 'Calificación promedio' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  rating?: number;

  @ApiProperty({ example: 150, description: 'Total de ventas' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  total_sales?: number;
}

