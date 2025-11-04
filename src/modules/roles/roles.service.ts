import { Injectable, NotFoundException } from '@nestjs/common';
import { RolesEntity } from './roles.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(RolesEntity)
    private readonly rolesRepository: Repository<RolesEntity>,
  ) {}

  getAll(): Promise<RolesEntity[]> {
    return this.rolesRepository.find();
  }

  async getRoleByName(name: string): Promise<RolesEntity> {
    const role = await this.rolesRepository.findOne({ where: { name } });
    if (!role) {
      throw new NotFoundException('Rol no encontrado');
    }
    return role;
  }

}

