import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { GlobalStatus } from "src/globals/enums/global-status.enum";

export class UpdateCategoryDto {
  @ApiProperty({ example: 'Electrónica', description: 'Nombre de la categoría' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Dispositivos y accesorios electrónicos', description: 'Descripción de la categoría' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: GlobalStatus.ACTIVE, description: 'Estado de la categoría' })
  @IsEnum(GlobalStatus)
  @IsOptional()
  status?: GlobalStatus;
}

