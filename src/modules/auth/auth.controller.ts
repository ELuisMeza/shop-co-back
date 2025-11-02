import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
}


