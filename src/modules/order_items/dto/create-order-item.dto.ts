import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsUUID } from "class-validator";

export class CreateOrderItemDto {
  @ApiProperty({ description: 'Cantidad de unidades del producto' })
  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @ApiProperty({ description: 'Precio unitario del producto' })
  @IsNumber()
  @IsNotEmpty()
  unit_price: number;

  @ApiProperty({ description: 'ID del producto' })
  @IsUUID()
  @IsNotEmpty()
  product_id: string;
} 