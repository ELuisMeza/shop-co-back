import { ApiProperty } from "@nestjs/swagger";
import { UpdateUserDto } from "./update-user.dto";
import { IsEmail, IsString } from "class-validator";
import { IsNotEmpty } from "class-validator";

export class CreateUserDto extends UpdateUserDto {
  @ApiProperty({ example: 'juan.perez@example.com', description: 'Email del usuario' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
  
  @ApiProperty({ example: 'SuperSegura123', description: 'Contraseña del usuario' })
  @IsString()
  @IsNotEmpty()
  password: string;
}