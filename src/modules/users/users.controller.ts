import { Body, Controller, Get, HttpStatus, HttpCode, Param, Post, Put, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiOperation, ApiBody, ApiOkResponse, ApiParam } from '@nestjs/swagger';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import type { RequestWithUser } from '../auth/dto/request-with-user.interface';

@ApiTags('Usuarios')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  
  @Get('my-profile')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener mi perfil' })
  @ApiOkResponse({ description: 'Retorna mi perfil' })
  async getMyProfile(
    @Req() req: RequestWithUser
    ) {
    const id = req.user.userId;
    return this.usersService.getById(id);
  }

  @Put('my-profile')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar mi perfil' })
  @ApiBody({ type: UpdateUserDto })
  @ApiOkResponse({ description: 'Retorna el usuario actualizado' })
  async updateMyProfile(@Body() updateUserDto: UpdateUserDto, @Req() req: RequestWithUser) {
    const id = req.user.userId;
    return this.usersService.updateUser(id, updateUserDto);
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
  
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener usuario por ID' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiOkResponse({ description: 'Retorna el usuario encontrado' })
  async getUserById(@Param('id') id: string) {
    return this.usersService.getById(id);
  }
  
}
