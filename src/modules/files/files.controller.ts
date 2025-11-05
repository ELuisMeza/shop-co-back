import { 
  Body, 
  Controller, 
  Get, 
  HttpStatus, 
  HttpCode, 
  Param, 
  Post, 
  Put, 
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Query,
  Res,
  Header,
  BadRequestException,
  Req,
} from '@nestjs/common';
import type { Response, Request } from 'express';
type MulterFile = Express.Multer.File;
import { FileInterceptor, FilesInterceptor, AnyFilesInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
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

@ApiTags('Archivos')
@Controller('files')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(AnyFilesInterceptor())
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Subir uno o múltiples archivos' })
  @ApiBody({ type: CreateFileDto })
  @ApiOkResponse({ description: 'Retorna un array con los archivos subidos' })
  async uploadFiles(
    @UploadedFiles() files: MulterFile[],
    @Body() createDto: CreateFileDto,
    @Req() req: Request,
  ): Promise<any> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No se proporcionaron archivos');
    }

    // Procesar archivos con sus metadatos
    const filesData: Array<{ file: MulterFile; is_main: boolean }> = [];
    
    // Buscar archivos por índice (files[0][file], files[1][file], etc.)
    const fileIndices = new Set<number>();
    
    // Extraer índices de los campos del body
    Object.keys(req.body || {}).forEach(key => {
      const match = key.match(/^files\[(\d+)\]\[is_main\]$/);
      if (match) {
        fileIndices.add(parseInt(match[1]));
      }
    });

    // Asociar archivos con sus índices
    // Los archivos pueden venir con nombres como "files[0][file]", "files[1][file]", etc.
    files.forEach((file, index) => {
      // Intentar extraer el índice del nombre del campo
      let fileIndex = index;
      if (file.fieldname) {
        const match = file.fieldname.match(/^files\[(\d+)\]\[file\]$/);
        if (match) {
          fileIndex = parseInt(match[1]);
        }
      }

      const isMainKey = `files[${fileIndex}][is_main]`;
      const isMainValue = req.body?.[isMainKey];
      const isMain = isMainValue === 'true' || 
                     isMainValue === true ||
                     isMainValue === '1';

      filesData.push({
        file,
        is_main: isMain
      });
    });

    return this.filesService.uploadFiles({
      parent_id: createDto.parent_id,
      parent_type: createDto.parent_type,
      files: filesData,
    });
  }

  @Get('parent/:parentId/:parentType')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener archivos por parent_id y parent_type' })
  @ApiParam({ name: 'parentId', description: 'ID del parent' })
  @ApiParam({ name: 'parentType', description: 'Tipo del parent' })
  @ApiOkResponse({ description: 'Retorna un array de archivos' })
  async getFilesByParent(
    @Param('parentId') parentId: string,
    @Param('parentType') parentType: string,
  ) {
    return this.filesService.getByParentIdAndActive(parentId, parentType);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener archivo por ID' })
  @ApiParam({ name: 'id', description: 'ID del archivo' })
  @ApiOkResponse({ description: 'Retorna el archivo' })
  @Header('Content-Type', 'image/jpeg')
  async getFileById(
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const file = await this.filesService.getById(id);
    const fileBuffer = await this.filesService.getFileBuffer(id);
    res.setHeader('Content-Type', file.mimetype || 'image/jpeg');
    res.send(fileBuffer);
  }

  @Put(':id/deactivate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Desactivar archivo por ID' })
  @ApiParam({ name: 'id', description: 'ID del archivo' })
  @ApiOkResponse({ description: 'Retorna el archivo desactivado' })
  async deactivateFile(@Param('id') id: string) {
    return this.filesService.deactivateFile(id);
  }

  @Put(':id/activate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activar archivo por ID' })
  @ApiParam({ name: 'id', description: 'ID del archivo' })
  @ApiOkResponse({ description: 'Retorna el archivo activado' })
  async activateFile(@Param('id') id: string) {
    return this.filesService.activateFile(id);
  }
}
