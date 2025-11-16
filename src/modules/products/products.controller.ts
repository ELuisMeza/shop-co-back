import { Body, Controller, Get, HttpStatus, HttpCode, Param, Post, Put, UseGuards, NotFoundException, Req, UseInterceptors, UploadedFiles, BadRequestException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ApiOperation, ApiBody, ApiOkResponse, ApiParam, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SearchProductsDto } from './dto/search-products.dto';
import type { RequestWithUser } from '../auth/dto/request-with-user.interface';
import { SellersService } from '../sellers/sellers.service';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { FileUploadInterceptor } from 'src/interceptors/file-upload.interceptor';
import type { Request } from 'express';
import { parsedImageData } from './utils/parsedImageData';
import { CreateOrUpdateProductDto } from './dto/update-product.dto';

@ApiTags('Productos')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService, private readonly sellersService: SellersService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(AnyFilesInterceptor(), FileUploadInterceptor)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Crear producto' })
  @ApiBody({ type: CreateOrUpdateProductDto })
  @ApiOkResponse({ description: 'Retorna el producto creado' })
  async createProduct(
    @Body() createProductDto: CreateOrUpdateProductDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: RequestWithUser,
  ) {

    const { images } = parsedImageData(req.body.metadata, files);
    const seller = await this.sellersService.getByUserId(req.user.userId);
    
    return this.productsService.createProduct({
      seller_id: seller.id,
      categories: createProductDto.categories,
      name: createProductDto.name,
      description: createProductDto.description,
      price: createProductDto.price,
      stock: createProductDto.stock,
      images,
    });
  }

  
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('my-products')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener mis productos' })
  @ApiOkResponse({ description: 'Retorna mis productos' })
  async getMyProducts(@Body() searchDto: SearchProductsDto, @Req() req: RequestWithUser) {
    const id = req.user.userId;
    const seller = await this.sellersService.getByUserId(id);
    return this.productsService.searchProducts(searchDto, seller.id);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener producto por ID' })
  @ApiParam({ name: 'id', description: 'ID del producto' })
  @ApiOkResponse({ description: 'Retorna el producto encontrado' })
  async getProductById(@Param('id') id: string) {
    return this.productsService.getById(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(AnyFilesInterceptor(), FileUploadInterceptor)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Actualizar producto por ID' })
  @ApiParam({ name: 'id', description: 'ID del producto' })
  @ApiBody({ type: CreateOrUpdateProductDto })
  @ApiOkResponse({ description: 'Retorna el producto actualizado' })
  async updateProductById(
    @Param('id') id: string,
    @Body() updateProductDto: CreateOrUpdateProductDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: RequestWithUser,
  ) {

    const { images, imageMainId } = parsedImageData(req.body.metadata, files);
    return this.productsService.updateProduct(id, updateProductDto, images, imageMainId, req.body.deleteImages);
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

