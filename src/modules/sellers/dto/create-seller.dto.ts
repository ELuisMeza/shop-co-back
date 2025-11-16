import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
import { UpdateSellerDto } from "./update-seller.dto";

export class CreateSellerDto extends UpdateSellerDto {

  @ApiProperty({ example: '20123456789', description: 'RUC de la empresa' })
  @IsString()
  @IsNotEmpty()
  ruc: string;
}