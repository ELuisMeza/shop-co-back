import { Body, Controller, Get, HttpStatus, HttpCode, Param, Post, Put, UseInterceptors, UploadedFile, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SellersService } from './sellers.service';
import { ApiOperation, ApiBody, ApiOkResponse, ApiParam, ApiConsumes } from '@nestjs/swagger';
import { UpdateSellerDto } from './dto/update-seller.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { RequestWithUser } from '../auth/dto/request-with-user.interface';
import { FileUploadInterceptor } from 'src/interceptors/file-upload.interceptor';
type MulterFile = Express.Multer.File;

@ApiTags('Vendedores')
@Controller('sellers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()  
export class SellersController {
  constructor(private readonly sellersService: SellersService) {}

  @Get('my-profile')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener mi perfil de vendedor' })
  @ApiOkResponse({ description: 'Retorna mi perfil' })
  async getMyProfile(@Req() req: RequestWithUser) {
    const id = req.user.userId;
    return this.sellersService.getByUserId(id);
  }

  @Put('my-profile')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar mi perfil de vendedor' })
  @UseInterceptors(FileInterceptor('logo_image'), FileUploadInterceptor)
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateSellerDto })
  @ApiOkResponse({ description: 'Retorna el vendedor actualizado' })
  async updateSellerById(
    @Req() req: RequestWithUser,
    @Body() updateSellerDto: UpdateSellerDto,
    @UploadedFile() logoFile?: MulterFile,
  ) {
    const seller = await this.sellersService.userIsSeller(req.user.userId);
    return this.sellersService.updateSeller(seller.id, updateSellerDto, logoFile);
  }
}

