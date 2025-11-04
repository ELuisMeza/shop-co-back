import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsBoolean, IsEnum } from "class-validator";
import { GlobalStatus } from "src/globals/enums/global-status.enum";

export class UpdateFileDto {
  @ApiProperty({ 
    example: false, 
    description: 'Indica si es el archivo principal',
    required: false 
  })
  @IsBoolean()
  @IsOptional()
  is_main?: boolean;

  @ApiProperty({ 
    example: 'active', 
    description: 'Estado del archivo',
    enum: GlobalStatus,
    required: false 
  })
  @IsEnum(GlobalStatus)
  @IsOptional()
  status?: GlobalStatus;
}

