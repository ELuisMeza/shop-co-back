import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseInterceptors, UploadedFile, } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBody, ApiConsumes, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { CreateSellerDto, CreateUserDto } from './dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { FileInterceptor } from '@nestjs/platform-express';
type MulterFile = Express.Multer.File;

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService, 
    private readonly usersService: UsersService
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Autenticación de usuario' })
  @ApiBody({
    type: LoginDto,
    description: 'Payload para login',
    examples: {
      ejemplo: {
        summary: 'Ejemplo básico',
        value: {
          email: 'juan.perez@example.com',
          password: 'SuperSegura123',
        },
      },
    },
  })
  @ApiOkResponse({ description: 'Retorna JWT como Bearer token' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @Post('register-seller')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('logo_image'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Crear vendedor' })
  @ApiBody({ type: CreateSellerDto })
  @ApiOkResponse({ description: 'Retorna el vendedor creado' })
  async createSeller(
    @Body() createSellerDto: CreateSellerDto,
    @UploadedFile() logoFile?: MulterFile,
  ) {
    return this.usersService.createSeller(createSellerDto, logoFile);
  }

  @Post('register-user')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear usuario' })
  @ApiBody({ type: CreateUserDto })
  @ApiOkResponse({ description: 'Retorna el usuario creado' })
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }
}


