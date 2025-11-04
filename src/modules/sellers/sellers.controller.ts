import { Body, Controller, Get, HttpStatus, HttpCode, Param, Post, Put, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SellersService } from './sellers.service';
import { ApiOperation, ApiBody, ApiOkResponse, ApiParam, ApiConsumes } from '@nestjs/swagger';
import { UpdateSellerDto } from './dto/update-seller.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
type MulterFile = Express.Multer.File;

@ApiTags('Vendedores')
@Controller('sellers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()  
export class SellersController {
  constructor(private readonly sellersService: SellersService) {}

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
  @UseInterceptors(FileInterceptor('logo_image'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Actualizar vendedor por ID' })
  @ApiParam({ name: 'id', description: 'ID del vendedor' })
  @ApiBody({ type: UpdateSellerDto })
  @ApiOkResponse({ description: 'Retorna el vendedor actualizado' })
  async updateSellerById(
    @Param('id') id: string,
    @Body() updateSellerDto: UpdateSellerDto,
    @UploadedFile() logoFile?: MulterFile,
  ) {
    return this.sellersService.updateSeller(id, updateSellerDto, logoFile);
  }
}

