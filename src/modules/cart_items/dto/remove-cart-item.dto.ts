import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class RemoveCartItemDto {
  @ApiProperty({ description: 'ID del producto a quitar', format: 'uuid' })
  @IsUUID()
  product_id: string;
}

