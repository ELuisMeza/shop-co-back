import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsPositive, IsUUID } from 'class-validator';

export class AddCartItemDto {
  @ApiProperty({ description: 'ID del producto a agregar', format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  product_id: string;

  @ApiPropertyOptional({ description: 'Cantidad a agregar', example: 1 })
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  quantity: number;
}

