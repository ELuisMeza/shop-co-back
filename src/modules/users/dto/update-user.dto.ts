import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { GlobalStatus } from "src/globals/enums/global-status.enum";

export class UpdateUserDto {
  @ApiProperty({ example: 'Juan', description: 'Nombre del usuario' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Perez', description: 'Apellido paterno del usuario' })
  @IsString()
  @IsNotEmpty()
  last_name_father: string;

  @ApiProperty({ example: 'Gomez', description: 'Apellido materno del usuario' })
  @IsString()
  @IsNotEmpty()
  last_name_mother: string;

  @ApiProperty({ example: '9999999999', description: 'Teléfono del usuario' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: '9999999999', description: 'Número de documento del usuario' })
  @IsString()
  @IsNotEmpty()
  num_document: string;

  @ApiProperty({ example: 'DNI', description: 'Tipo de documento del usuario' })
  @IsString()
  @IsNotEmpty()
  type_document: string;

  @ApiProperty({ example: 'https://example.com/avatar.jpg', description: 'Imagen de perfil del usuario' })
  @IsString()
  @IsOptional()
  avatar_image?: string;

  @ApiProperty({ example: GlobalStatus.ACTIVE, description: 'Estado del usuario' })
  @IsEnum(GlobalStatus)
  @IsOptional()
  status?: GlobalStatus;
} 
