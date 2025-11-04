import { ApiProperty } from "@nestjs/swagger";
import { IsUUID, IsString, IsNotEmpty } from "class-validator";


export class CreateFileDto {
  @ApiProperty({ 
    type: 'string',
    format: 'uuid',
    description: 'ID del parent (producto, usuario, etc.)',
    required: true,
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @IsUUID()
  @IsNotEmpty()
  parent_id: string;

  @ApiProperty({ 
    type: 'string',
    description: 'Tipo de parent (product, user, seller, etc.)',
    required: true,
    example: 'product'
  })
  @IsString()
  @IsNotEmpty()
  parent_type: string;

}

