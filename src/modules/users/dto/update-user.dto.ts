import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";

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

} 
