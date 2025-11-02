import { 
  Body, 
  Controller, 
  Get, 
  HttpStatus, 
  HttpCode, 
  Param, 
  Post, 
  Put, 
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Query,
  Res,
  Header,
  BadRequestException,
  Req
} from '@nestjs/common';
import type { Response, Request } from 'express';
type MulterFile = Express.Multer.File;
import { FileInterceptor, FilesInterceptor, AnyFilesInterceptor } from '@nestjs/platform-express';
import { PhotosProductsService } from './photos-products.service';
import { CreateStructuredPhotosDto } from './dto/create-photos.dto';
import { UpdatePhotoProductDto } from './dto/update-photo.dto';
import { 
  ApiOperation, 
  ApiBody, 
  ApiOkResponse, 
  ApiParam, 
  ApiBearerAuth,
  ApiConsumes,
  ApiQuery,
  ApiTags
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Fotos de Productos')
@Controller('photos-products')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PhotosProductsController {
  constructor(private readonly photosProductsService: PhotosProductsService) {}

  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(AnyFilesInterceptor())
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Subir múltiples fotos de producto' })
  @ApiBody({ type: CreateStructuredPhotosDto })
  @ApiOkResponse({ description: 'Retorna un array con las fotos subidas' })
  async uploadStructuredPhotos(
    @UploadedFiles() files: MulterFile[],
    @Body() createDto: CreateStructuredPhotosDto,
    @Req() req: Request,
  ): Promise<any> {
    // Extraer product_id del body o del DTO
    const productId = createDto?.product_id || req.body?.product_id;

    // Procesar archivos con sus metadatos
    const photosData: Array<{ file: MulterFile; is_main: boolean }> = [];
    
    // Buscar archivos por índice (photos[0][file], photos[1][file], etc.)
    const photoIndices = new Set<number>();
    
    // Extraer índices de los campos del body
    Object.keys(req.body || {}).forEach(key => {
      const match = key.match(/^photos\[(\d+)\]\[is_main\]$/);
      if (match) {
        photoIndices.add(parseInt(match[1]));
      }
    });

    // Asociar archivos con sus índices
    // Los archivos pueden venir con nombres como "photos[0][file]", "photos[1][file]", etc.
    files.forEach((file, index) => {
      // Intentar extraer el índice del nombre del campo
      let photoIndex = index;
      if (file.fieldname) {
        const match = file.fieldname.match(/^photos\[(\d+)\]\[file\]$/);
        if (match) {
          photoIndex = parseInt(match[1]);
        }
      }

      const isMainKey = `photos[${photoIndex}][is_main]`;
      const isMainValue = req.body?.[isMainKey];
      const isMain = isMainValue === 'true' || 
                     isMainValue === true ||
                     isMainValue === '1';

      photosData.push({
        file,
        is_main: isMain
      });
    });

    if (photosData.length === 0) {
      throw new BadRequestException('No se proporcionaron archivos');
    }

    return this.photosProductsService.uploadStructuredPhotos(photosData, productId);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar foto por ID' })
  @ApiParam({ name: 'id', description: 'ID de la foto' })
  @ApiBody({ type: UpdatePhotoProductDto })
  @ApiOkResponse({ description: 'Retorna la foto actualizada' })
  async updatePhotoById(
    @Param('id') id: string, 
    @Body() updatePhotoDto: UpdatePhotoProductDto
  ) {
    return this.photosProductsService.updatePhoto(id, updatePhotoDto);
  }


  @Put(':id/deactivate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Desactivar foto por ID' })
  @ApiParam({ name: 'id', description: 'ID de la foto' })
  @ApiOkResponse({ description: 'Retorna la foto desactivada' })
  async deactivatePhoto(@Param('id') id: string) {
    return this.photosProductsService.deactivatePhoto(id);
  }

  @Put(':id/activate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activar foto por ID' })
  @ApiParam({ name: 'id', description: 'ID de la foto' })
  @ApiOkResponse({ description: 'Retorna la foto activada' })
  async activatePhoto(@Param('id') id: string) {
    return this.photosProductsService.activatePhoto(id);
  }
}

