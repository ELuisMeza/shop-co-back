import { Injectable, Inject, forwardRef, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './dto/jwt-payload.dto';
import { UsersService } from 'src/modules/users/users.service';
import { UsersEntity } from '../users/users.entity';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.getByEmail(email);
    if (!user || !user.password) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    return user;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    return this.generateTokenResponse(user);
  }

  async generateTokenResponse(user: UsersEntity) {
    const payload: JwtPayload = { sub: user.id, email: user.email, roleId: user.role_id };
    const access_token = await this.jwtService.signAsync(payload);
    return { access_token, user };
  }

  async hashPassword(password: string) {
    return await bcrypt.hash(password, 10);
  }
}


