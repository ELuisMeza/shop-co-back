import { Body, Controller, Get, HttpStatus, HttpCode, Param, Post, Put, UseGuards, NotFoundException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ApiOperation, ApiBody, ApiOkResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { UpdateProductDto } from './dto/update-product.dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SearchProductsDto } from './dto/search-products.dto';

@ApiTags('Productos')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear producto' })
  @ApiBody({ type: CreateProductDto })
  @ApiOkResponse({ description: 'Retorna el producto creado' })
  async createProduct(@Body() createProductDto: CreateProductDto) {
    return this.productsService.createProduct(createProductDto);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener producto por ID' })
  @ApiParam({ name: 'id', description: 'ID del producto' })
  @ApiOkResponse({ description: 'Retorna el producto encontrado' })
  async getProductById(@Param('id') id: string) {
    // Validar que el ID sea un UUID válido (sin extensiones de archivo)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new NotFoundException('Producto no encontrado');
    }
    return this.productsService.getById(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar producto por ID' })
  @ApiParam({ name: 'id', description: 'ID del producto' })
  @ApiBody({ type: UpdateProductDto })
  @ApiOkResponse({ description: 'Retorna el producto actualizado' })
  async updateProductById(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.updateProduct(id, updateProductDto);
  }

  @Post('search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Buscar productos con paginación, filtros por nombre y categorías' })
  @ApiBody({ type: SearchProductsDto })
  @ApiOkResponse({ description: 'Retorna la lista de productos paginada con metadata' })
  async searchProducts(@Body() searchDto: SearchProductsDto) {
    return this.productsService.searchProducts(searchDto);
  }
}

