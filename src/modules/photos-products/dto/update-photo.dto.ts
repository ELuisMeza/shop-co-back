import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsBoolean, IsEnum } from "class-validator";
import { GlobalStatus } from "src/globals/enums/global-status.enum";

export class UpdatePhotoProductDto {
  @ApiProperty({ 
    example: false, 
    description: 'Indica si es la imagen principal',
    required: false 
  })
  @IsBoolean()
  @IsOptional()
  is_main?: boolean;

  @ApiProperty({ 
    example: 'active', 
    description: 'Estado de la foto',
    enum: GlobalStatus,
    required: false 
  })
  @IsEnum(GlobalStatus)
  @IsOptional()
  status?: GlobalStatus;
}

