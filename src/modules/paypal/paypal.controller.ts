import { Controller, Post, Get, Body, Param, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiOkResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { PaypalService } from './paypal.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('paypal')
@Controller('paypal')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PaypalController {
  constructor(private readonly paypalService: PaypalService) {}

}
