import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UpdateRoleDto {
  @ApiProperty({ example: 'Admin', description: 'Nombre del rol' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Administrador del sistema', description: 'Descripción del rol' })
  @IsString()
  @IsOptional()
  description?: string;
}

