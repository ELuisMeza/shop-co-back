import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoriesEntity } from './categories.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { GlobalStatus } from 'src/globals/enums/global-status.enum';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(CategoriesEntity)
    private readonly categoriesRepository: Repository<CategoriesEntity>,
  ) {}

  async createCategory(createCategoryDto: CreateCategoryDto): Promise<CategoriesEntity> {
    const category = this.categoriesRepository.create(createCategoryDto);
    return this.categoriesRepository.save(category);
  }

  async getByIdAndActive(id: string): Promise<CategoriesEntity> {
    const category = await this.categoriesRepository.findOne({ where: { id, status: GlobalStatus.ACTIVE } });
    if (!category) {
      throw new NotFoundException('Categoría no encontrada o inactiva');
    }
    return category;
  }

  async getById(id: string): Promise<CategoriesEntity> {
    const category = await this.categoriesRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }
    return category;
  }

  async updateCategory(id: string, updateCategoryDto: UpdateCategoryDto): Promise<CategoriesEntity> {
    const category = await this.getById(id);
    await this.categoriesRepository.update(id, updateCategoryDto);
    return this.getById(id);
  }

}

