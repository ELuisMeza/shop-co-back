import { Body, Controller, Get, HttpStatus, HttpCode, Param, Post, Put } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { ApiOperation, ApiBody, ApiOkResponse, ApiParam } from '@nestjs/swagger';
import { UpdateRoleDto } from './dto/update-role.dto';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear rol' })
  @ApiBody({ type: CreateRoleDto })
  @ApiOkResponse({ description: 'Retorna el rol creado' })
  async createRole(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.createRole(createRoleDto);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener rol por ID' })
  @ApiParam({ name: 'id', description: 'ID del rol' })
  @ApiOkResponse({ description: 'Retorna el rol encontrado' })
  async getRoleById(@Param('id') id: string) {
    return this.rolesService.getById(id);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar rol por ID' })
  @ApiParam({ name: 'id', description: 'ID del rol' })
  @ApiBody({ type: UpdateRoleDto })
  @ApiOkResponse({ description: 'Retorna el rol actualizado' })
  async updateRoleById(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.updateRole(id, updateRoleDto);
  }
}

