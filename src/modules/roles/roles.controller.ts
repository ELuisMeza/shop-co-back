import { Body, Controller, Get, HttpStatus, HttpCode, Param, Post, Put } from '@nestjs/common';
import { RolesService } from './roles.service';
import { ApiOperation, ApiOkResponse, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Roles')
@Controller('roles')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener todos los roles' })
  @ApiOkResponse({ description: 'Retorna todos los roles' })
  async getAllRoles() {
    return this.rolesService.getAll();
  }

}

