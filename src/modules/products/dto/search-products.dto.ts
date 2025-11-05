import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, IsInt, Min, IsArray, IsUUID } from "class-validator";
import { Type } from "class-transformer";

export class SearchProductsDto {
  @ApiProperty({ 
    example: 1, 
    description: 'Número de página',
    default: 1,
    required: false
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ 
    example: 10, 
    description: 'Cantidad de resultados por página',
    default: 10,
    required: false
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiProperty({ 
    example: 'iPhone', 
    description: 'Búsqueda por nombre del producto',
    required: false
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ 
    example: ['550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440001'], 
    description: 'Array de IDs de categorías para filtrar',
    required: false,
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  category_ids?: string[];
}

