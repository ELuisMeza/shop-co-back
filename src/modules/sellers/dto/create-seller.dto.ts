import { ApiProperty } from "@nestjs/swagger";
import { UpdateSellerDto } from "./update-seller.dto";
import { IsNotEmpty, IsUUID } from "class-validator";

export class CreateSellerDto extends UpdateSellerDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'ID del usuario' })
  @IsUUID()
  @IsNotEmpty()
  user_id: string;
}

