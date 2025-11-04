import { Body, Controller, Get, HttpStatus, HttpCode, Param, Post, Put } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiOperation, ApiBody, ApiOkResponse, ApiParam } from '@nestjs/swagger';
import { UpdateUserDto } from './dto/update-user.dto';
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener usuario por ID' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiOkResponse({ description: 'Retorna el usuario encontrado' })
  async getUserById(@Param('id') id: string) {
    return this.usersService.getById(id);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar usuario por ID' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiBody({ type: UpdateUserDto })
  @ApiOkResponse({ description: 'Retorna el usuario actualizado' })
  async updateUserById(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateUser(id, updateUserDto);
  }
}
