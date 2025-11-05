import { Body, Controller, Get, HttpStatus, HttpCode, Param, Post, Put, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { ApiOperation, ApiBody, ApiOkResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Categorías')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get('all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener todas las categorías' })
  @ApiOkResponse({ description: 'Retorna todas las categorías' })
  async getAllCategories() {
    return this.categoriesService.getAllCategories();
  } 
}

