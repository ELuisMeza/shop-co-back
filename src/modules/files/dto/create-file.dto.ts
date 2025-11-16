import { ApiProperty } from "@nestjs/swagger";
import { IsUUID, IsString, IsNotEmpty, IsEnum } from "class-validator";
import { GlobalTypesFiles } from "src/globals/enums/global-types-files";


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
    description: 'Tipo de parent (product, seller)',
    required: true,
    example: GlobalTypesFiles.PRODUCT
  })
  @IsEnum(GlobalTypesFiles, { message: 'El tipo de parent debe ser product o seller' })
  @IsNotEmpty({ message: 'El tipo de parent es requerido' })
  parent_type: GlobalTypesFiles;
}
