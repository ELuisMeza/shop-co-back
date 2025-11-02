import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersEntity } from './users.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { GlobalStatus } from 'src/globals/enums/global-status.enum';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersEntity)
    private readonly usersRepository: Repository<UsersEntity>,
  ) {}


  async createUser(createUserDto: CreateUserDto): Promise<UsersEntity> {
    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }

  async getByEmail(email: string): Promise<UsersEntity | null> {
    return this.usersRepository.findOne({ where: { email, status: GlobalStatus.ACTIVE } });
  }

  async getByIdAndActive(id: string): Promise<UsersEntity> {
    const user = await this.usersRepository.findOne({ where: { id, status: GlobalStatus.ACTIVE } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado o inactivo');
    }
    return user;
  }

  async getById(id: string): Promise<UsersEntity> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return user;
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<UsersEntity> {
    const user = await this.getById(id);
    await this.usersRepository.update(id, updateUserDto);
    return this.getById(id);
  }

}
