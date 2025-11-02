import { Body, Controller, Get, HttpStatus, HttpCode, Param, Post, Put } from '@nestjs/common';
import { SellersService } from './sellers.service';
import { CreateSellerDto } from './dto/create-seller.dto';
import { ApiOperation, ApiBody, ApiOkResponse, ApiParam } from '@nestjs/swagger';
import { UpdateSellerDto } from './dto/update-seller.dto';

@Controller('sellers')
export class SellersController {
  constructor(private readonly sellersService: SellersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear vendedor' })
  @ApiBody({ type: CreateSellerDto })
  @ApiOkResponse({ description: 'Retorna el vendedor creado' })
  async createSeller(@Body() createSellerDto: CreateSellerDto) {
    return this.sellersService.createSeller(createSellerDto);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener vendedor por ID' })
  @ApiParam({ name: 'id', description: 'ID del vendedor' })
  @ApiOkResponse({ description: 'Retorna el vendedor encontrado' })
  async getSellerById(@Param('id') id: string) {
    return this.sellersService.getById(id);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar vendedor por ID' })
  @ApiParam({ name: 'id', description: 'ID del vendedor' })
  @ApiBody({ type: UpdateSellerDto })
  @ApiOkResponse({ description: 'Retorna el vendedor actualizado' })
  async updateSellerById(@Param('id') id: string, @Body() updateSellerDto: UpdateSellerDto) {
    return this.sellersService.updateSeller(id, updateSellerDto);
  }
}

