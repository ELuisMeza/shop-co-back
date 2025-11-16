import { BadRequestException, Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { ProductsEntity } from './products.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GlobalStatus } from 'src/globals/enums/global-status.enum';
import { CreateOrUpdateProductDto } from './dto/update-product.dto';
import { CategoriesService } from '../categories/categories.service';
import { SellersService } from '../sellers/sellers.service';
import { SearchProductsDto } from './dto/search-products.dto';
import { FilesEntity } from '../files/files.entity';
import { FilesService } from '../files/files.service';
import { ProductCategoriesService } from '../product-categories/product-categories.service';
import { GlobalTypesFiles } from 'src/globals/enums/global-types-files';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductsEntity)
    private readonly productsRepository: Repository<ProductsEntity>,
    @InjectRepository(FilesEntity)
    private readonly filesRepository: Repository<FilesEntity>,
    @Inject(forwardRef(() => ProductCategoriesService))
    private readonly productCategoriesService: ProductCategoriesService,
    private readonly sellersService: SellersService,
    private readonly categoriesService: CategoriesService,
    private readonly filesService: FilesService,
  ) {}

  async createProduct(data: {
    seller_id: string;
    categories: string[];
    name: string;
    description: string;
    price: number;
    stock: number;
    images: Array<{ file: Express.Multer.File; is_main: boolean }>;
  }): Promise<ProductsEntity> {
    await this.sellersService.getById(data.seller_id);

    for (const categoryId of data.categories) {
      await this.categoriesService.getByIdAndActive(categoryId);
    }

    const product = this.productsRepository.create({
      seller_id: data.seller_id,
      name: data.name,
      description: data.description,
      price: data.price,
      stock: data.stock,
    });

    const savedProduct = await this.productsRepository.save(product);

    if (data.categories && data.categories.length > 0) {
      await this.productCategoriesService.createProductCategories(savedProduct.id, data.categories);
    }

    if (data.images && data.images.length > 0) {
      await this.filesService.uploadFiles({
        parent_id: savedProduct.id,
        parent_type: GlobalTypesFiles.PRODUCT,
        files: data.images,
      });
    }

    return this.getById(savedProduct.id);
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

  async getById(id: string) {
    const product = await this.productsRepository.findOne({ 
      where: { id },
      relations: ['seller']
    });
    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    const categories = await this.productCategoriesService.getCategoriesByProductId(product.id);
    const images = await this.filesService.getByParentIdAndActive(product.id);
    return {...product, categories, images};
  }
  async updateProduct(
    id: string, 
    updateProductDto: CreateOrUpdateProductDto,
    imagesData: Array<{ file: Express.Multer.File; is_main: boolean }>,
    imageMainId: string | null,
    deleteImages: string[],
  ): Promise<ProductsEntity> {
  
    await this.getById(id);
    try {
    
      const payload = {
        name: updateProductDto.name,
        description: updateProductDto.description,
        price: updateProductDto.price,
        stock: updateProductDto.stock,
      }
      await this.productsRepository.update(id, payload);

      if (deleteImages.length > 0) {
        if(typeof deleteImages === 'string') {
          deleteImages = JSON.parse(deleteImages);
        }
        await this.filesService.deleteFiles(deleteImages);
      }
  
      if (imagesData && imagesData.length > 0) {
        await this.filesService.uploadFiles({
          parent_id: id,
          parent_type: GlobalTypesFiles.PRODUCT,
          files: imagesData,
        });
      }

      if (imageMainId) {
        await this.filesService.updateFileIsMain(imageMainId, id);
      }
  
      await this.productCategoriesService.manageProductCategories(id, updateProductDto.categories);
      return this.getById(id);
  
    } catch (error) {
      throw new BadRequestException("Error updating product");
    }
  }
  

  async searchProducts(searchDto: SearchProductsDto, sellerId?: string) {
    const { page = 1, limit = 10, search, category_ids, min_price, max_price } = searchDto;
    const skip = (page - 1) * limit;

    if (min_price !== undefined && max_price !== undefined && min_price > max_price) {
      throw new BadRequestException('El precio mínimo no puede ser mayor al precio máximo');
    }

    const baseQueryBuilder = this.productsRepository.createQueryBuilder('product')
      .where('product.status = :status', { status: GlobalStatus.ACTIVE });

    if (search) {
      baseQueryBuilder.andWhere('product.name ILIKE :search', { search: `%${search}%` });
    }

    if (min_price !== undefined) {
      baseQueryBuilder.andWhere('product.price >= :min_price', { min_price });
    }

    if (max_price !== undefined) {
      baseQueryBuilder.andWhere('product.price <= :max_price', { max_price });
    }

    if (category_ids && category_ids.length > 0) {
       baseQueryBuilder.andWhere(
        'product.id IN (SELECT DISTINCT pc.product_id FROM product_categories pc WHERE pc.category_id IN (:...categoryIds))',
        { categoryIds: category_ids }
      );
    }

    if (sellerId) {
      baseQueryBuilder.andWhere('product.seller_id = :sellerId', { sellerId });
    }

    const total = await baseQueryBuilder.getCount();

    const idsQueryBuilder = this.productsRepository.createQueryBuilder('product')
      .select('product.id as id')
      .where('product.status = :status', { status: GlobalStatus.ACTIVE });

    if (search) {
      idsQueryBuilder.andWhere('product.name ILIKE :search', { search: `%${search}%` });
    }

    if (min_price !== undefined) {
      idsQueryBuilder.andWhere('product.price >= :min_price', { min_price });
    }

    if (max_price !== undefined) {
      idsQueryBuilder.andWhere('product.price <= :max_price', { max_price });
    }

    if (category_ids && category_ids.length > 0) {
      idsQueryBuilder.andWhere(
        'product.id IN (SELECT DISTINCT pc.product_id FROM product_categories pc WHERE pc.category_id IN (:...categoryIds))',
        { categoryIds: category_ids }
      );
    }

    if (sellerId) {
      idsQueryBuilder.andWhere('product.seller_id = :sellerId', { sellerId });
    }

    idsQueryBuilder.skip(skip).take(limit);

    const productIds = await idsQueryBuilder.getRawMany();
    const ids = productIds.map(p => p.id);

    // Si no hay IDs, retornar respuesta vacía
    if (ids.length === 0) {
      return {
        products: [],
        meta: {
          total: 0,
          page,
          limit,
          totalPages: 0,
        },
      };
    }

    // Ahora obtener los datos completos solo para esos IDs
    const queryBuilder = this.productsRepository.createQueryBuilder('product')
      .leftJoin('product.seller', 'seller')
      .leftJoin(FilesEntity, 'files', 'files.parent_id = product.id AND files.parent_type = :parentType AND files.is_main = true', { parentType: 'product' })
      .select([
        'product.id as id',
        'product.seller_id as seller_id',
        'seller.shop_name as seller_name',
        'product.name as name',
        'product.description as description',
        'product.price as price',
        'product.stock as stock',
        'product.status as status',
        'files.path_file as image_path',
      ])
      .where('product.id IN (:...ids)', { ids })
      .orderBy('product.id', 'ASC');

    const products = await queryBuilder.getRawMany();

    const productWithCategories = await Promise.all(
      products.map(async (product) => {
        const categories = await this.productCategoriesService.getCategoriesByProductId(product.id);
        return { ...product, categories: categories.map(category => category.name) };
      })
    );

    return {
      products: productWithCategories,
      meta: {
        total: total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getProductToAddCart(id: string): Promise<ProductsEntity> {
    const product = await this.getByIdAndActive(id);
    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    if (product.stock === 0) {
      throw new BadRequestException('El producto no tiene stock');
    }

    return product;
  }
} 


