import { ApiProperty, IntersectionType } from "@nestjs/swagger";
import { UpdateUserDto } from "../../users/dto/update-user.dto";
import { IsEmail, IsString, IsUUID } from "class-validator";
import { IsNotEmpty } from "class-validator";
import { UpdateSellerDto } from "src/modules/sellers/dto/update-seller.dto";
import { CreateSellerDto } from "src/modules/sellers/dto/create-seller.dto";

export class CreateUserDto extends UpdateUserDto {
  @ApiProperty({ example: 'juan.perez@example.com', description: 'Email del usuario' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
  
  @ApiProperty({ example: 'SuperSegura123', description: 'Contraseña del usuario' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: '9999999999', description: 'Número de documento del usuario' })
  @IsString()
  @IsNotEmpty()
  num_document: string;

  @ApiProperty({ example: 'DNI', description: 'Tipo de documento del usuario' })
  @IsString()
  @IsNotEmpty()
  type_document: string;
}

export class CreateUserSellerDto extends IntersectionType(
  CreateUserDto,
  CreateSellerDto,
) {}