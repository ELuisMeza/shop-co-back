import { Injectable, NotFoundException } from '@nestjs/common';
import { RolesEntity } from './roles.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(RolesEntity)
    private readonly rolesRepository: Repository<RolesEntity>,
  ) {}

  async createRole(createRoleDto: CreateRoleDto): Promise<RolesEntity> {
    const role = this.rolesRepository.create(createRoleDto);
    return this.rolesRepository.save(role);
  }

  async getById(id: string): Promise<RolesEntity> {
    const role = await this.rolesRepository.findOne({ where: { id } });
    if (!role) {
      throw new NotFoundException('Rol no encontrado');
    }
    return role;
  }

  async updateRole(id: string, updateRoleDto: UpdateRoleDto): Promise<RolesEntity> {
    const role = await this.getById(id);
    await this.rolesRepository.update(id, updateRoleDto);
    return this.getById(id);
  }

}

