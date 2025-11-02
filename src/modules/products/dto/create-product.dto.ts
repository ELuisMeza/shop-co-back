import { ApiProperty } from "@nestjs/swagger";
import { UpdateProductDto } from "./update-product.dto";
import { IsNotEmpty, IsUUID } from "class-validator";

export class CreateProductDto extends UpdateProductDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'ID del vendedor' })
  @IsUUID()
  @IsNotEmpty()
  seller_id: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'ID de la categoría' })
  @IsUUID()
  @IsNotEmpty()
  category_id: string;
}

