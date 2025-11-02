import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoriesEntity } from './categories.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GlobalStatus } from 'src/globals/enums/global-status.enum';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(CategoriesEntity)
    private readonly categoriesRepository: Repository<CategoriesEntity>,
  ) {}

  async getAllCategories(): Promise<CategoriesEntity[]> {
    return this.categoriesRepository.find({ where: { status: GlobalStatus.ACTIVE } });
  }

  async getByIdAndActive(id: string): Promise<CategoriesEntity> {
    const category = await this.categoriesRepository.findOne({ where: { id, status: GlobalStatus.ACTIVE } });
    if (!category) {
      throw new NotFoundException('Categoría no encontrada o inactiva');
    }
    return category;
  }

}

