import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsUUID } from "class-validator";

export class CreateProductCategoryDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'ID del producto' })
  @IsUUID()
  @IsNotEmpty()
  product_id: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'ID de la categoría' })
  @IsUUID()
  @IsNotEmpty()
  category_id: string;
}

