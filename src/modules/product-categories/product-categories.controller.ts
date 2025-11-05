import { 
  Body, 
  Controller, 
  Delete, 
  Get, 
  HttpStatus, 
  HttpCode, 
  Param, 
  Post, 
  UseGuards 
} from '@nestjs/common';
import { ProductCategoriesService } from './product-categories.service';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { 
  ApiOperation, 
  ApiBody, 
  ApiOkResponse, 
  ApiParam, 
  ApiBearerAuth 
} from '@nestjs/swagger';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Producto-Categorías')
@Controller('product-categories')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProductCategoriesController {
  constructor(private readonly productCategoriesService: ProductCategoriesService) {}

}

