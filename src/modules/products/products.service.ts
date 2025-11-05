import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductsEntity } from './products.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { GlobalStatus } from 'src/globals/enums/global-status.enum';
import { UpdateProductDto } from './dto/update-product.dto';
import { CategoriesService } from '../categories/categories.service';
import { SellersService } from '../sellers/sellers.service';
import { SearchProductsDto } from './dto/search-products.dto';
import { FilesEntity } from '../files/files.entity';
import { ProductCategoriesEntity } from '../product-categories/product-categories.entity';
import { CategoriesEntity } from '../categories/categories.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductsEntity)
    private readonly productsRepository: Repository<ProductsEntity>,
    @InjectRepository(FilesEntity)
    private readonly filesRepository: Repository<FilesEntity>,
    @InjectRepository(ProductCategoriesEntity)
    private readonly productCategoriesRepository: Repository<ProductCategoriesEntity>,
    private readonly sellersService: SellersService,
    private readonly categoriesService: CategoriesService,
  ) {}

  async createProduct(createProductDto: CreateProductDto): Promise<ProductsEntity> {
    await this.sellersService.userIsSeller(createProductDto.seller_id);

    await this.categoriesService.getByIdAndActive(createProductDto.category_id);

    const product = this.productsRepository.create(createProductDto);
    return this.productsRepository.save(product);
  }

  async getByIdAndActive(id: string): Promise<ProductsEntity> {
    const product = await this.productsRepository.findOne({ 
      where: { id, status: GlobalStatus.ACTIVE },
      relations: ['seller']
    });
    if (!product) {
      throw new NotFoundException('Producto no encontrado o inactivo');
    }
    return product;
  }

  async getById(id: string): Promise<ProductsEntity> {
    const product = await this.productsRepository.findOne({ 
      where: { id },
      relations: ['seller']
    });
    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }
    return product;
  }

  async updateProduct(id: string, updateProductDto: UpdateProductDto): Promise<ProductsEntity> {
    const product = await this.getById(id);
    await this.productsRepository.update(id, updateProductDto);
    return this.getById(id);
  }
  
  async activateProduct(id: string): Promise<ProductsEntity> {
    const product = await this.getById(id);
    await this.productsRepository.update(id, { status: GlobalStatus.ACTIVE });
    return this.getById(id);
  }

  async deactivateProduct(id: string): Promise<ProductsEntity> {
    const product = await this.getById(id);
    await this.productsRepository.update(id, { status: GlobalStatus.INACTIVE });
    return this.getById(id);
  }

  async searchProducts(searchDto: SearchProductsDto) {
    const { page = 1, limit = 10, search, category_ids } = searchDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.productsRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.seller', 'seller')
      .where('product.status = :status', { status: GlobalStatus.ACTIVE });

    // Filtro por búsqueda de nombre
    if (search) {
      queryBuilder.andWhere('product.name ILIKE :search', { search: `%${search}%` });
    }

    // Filtro por categorías usando la tabla intermedia product_categories
    if (category_ids && category_ids.length > 0) {
      queryBuilder
        .innerJoin('product_categories', 'pc', 'pc.product_id = product.id')
        .andWhere('pc.category_id IN (:...categoryIds)', { categoryIds: category_ids });
    }

    // Ordenar por fecha de creación (más recientes primero)
    queryBuilder.orderBy('product.created_at', 'DESC');

    // Paginación
    queryBuilder.skip(skip).take(limit);

    const [products, total] = await queryBuilder.getManyAndCount();

    // Obtener imágenes y categorías para cada producto
    const productsWithDetails = await Promise.all(
      products.map(async (product) => {
        // Obtener imagen principal o primera imagen
        const mainImages = await this.filesRepository.find({
          where: {
            parent_id: product.id,
            parent_type: 'product',
            status: GlobalStatus.ACTIVE,
            is_main: true,
          },
          order: { created_at: 'ASC' },
          take: 1,
        });

        // Si no hay imagen principal, obtener la primera imagen
        let image = mainImages[0] || null;
        if (!image) {
          const firstImages = await this.filesRepository.find({
            where: {
              parent_id: product.id,
              parent_type: 'product',
              status: GlobalStatus.ACTIVE,
            },
            order: { created_at: 'ASC' },
            take: 1,
          });
          image = firstImages[0] || null;
        }

        // Obtener la categoría del producto
        const productCategory = await this.productCategoriesRepository.findOne({
          where: { product_id: product.id },
          relations: ['category'],
        });

        // Formatear la imagen si existe
        const imageData = image ? {
          id: image.id,
          filename: image.filename,
          mimetype: image.mimetype,
          is_main: image.is_main,
        } : null;

        // Formatear la categoría si existe
        const categoryData = productCategory?.category ? {
          id: productCategory.category.id,
          name: productCategory.category.name,
          description: productCategory.category.description,
        } : null;

        return {
          ...product,
          image: imageData,
          category: categoryData,
        };
      })
    );

    return {
      data: productsWithDetails,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
} 


