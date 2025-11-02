import { Body, Controller, Get, HttpStatus, HttpCode, Param, Post, Put } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { ApiOperation, ApiBody, ApiOkResponse, ApiParam } from '@nestjs/swagger';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear categoría' })
  @ApiBody({ type: CreateCategoryDto })
  @ApiOkResponse({ description: 'Retorna la categoría creada' })
  async createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.createCategory(createCategoryDto);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener categoría por ID' })
  @ApiParam({ name: 'id', description: 'ID de la categoría' })
  @ApiOkResponse({ description: 'Retorna la categoría encontrada' })
  async getCategoryById(@Param('id') id: string) {
    return this.categoriesService.getById(id);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar categoría por ID' })
  @ApiParam({ name: 'id', description: 'ID de la categoría' })
  @ApiBody({ type: UpdateCategoryDto })
  @ApiOkResponse({ description: 'Retorna la categoría actualizada' })
  async updateCategoryById(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoriesService.updateCategory(id, updateCategoryDto);
  }
}

