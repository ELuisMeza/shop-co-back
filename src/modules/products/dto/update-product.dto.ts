import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { GlobalStatus } from "src/globals/enums/global-status.enum";

export class UpdateProductDto {
  @ApiProperty({ example: 'Laptop HP 15', description: 'Nombre del producto' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Laptop ideal para trabajo y estudio', description: 'Descripción del producto' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 899.99, description: 'Precio del producto' })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  price: number;

  @ApiProperty({ example: 50, description: 'Cantidad en stock' })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  stock: number;

  @ApiProperty({ example: 'https://example.com/main.jpg', description: 'Imagen principal' })
  @IsString()
  @IsOptional()
  main_image?: string;

  @ApiProperty({ example: '["img1.jpg", "img2.jpg"]', description: 'Imágenes adicionales' })
  @IsString()
  @IsOptional()
  additional_images?: string;

  @ApiProperty({ example: GlobalStatus.ACTIVE, description: 'Estado del producto' })
  @IsEnum(GlobalStatus)
  @IsOptional()
  status?: GlobalStatus;
}

