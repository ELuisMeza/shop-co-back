import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsString, IsUUID, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { CreateOrderItemDto } from "../../order_items/dto/create-order-item.dto";

export class CreateOrderDto {

  @ApiProperty({ description: 'Moneda de la orden' })
  @IsString()
  @IsNotEmpty()
  currency: string;

  @ApiProperty({ 
    description: 'Items de la orden',
    type: () => CreateOrderItemDto,
    isArray: true
  })
  @Type(() => CreateOrderItemDto)
  @IsArray()
  @ValidateNested({ each: true })
  @IsNotEmpty()
  items: CreateOrderItemDto[];
}