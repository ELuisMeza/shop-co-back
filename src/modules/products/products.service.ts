import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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
    const { page = 1, limit = 10, search, category_ids, min_price, max_price } = searchDto;
    const skip = (page - 1) * limit;

    if (min_price !== undefined && max_price !== undefined && min_price > max_price) {
      throw new BadRequestException('El precio mínimo no puede ser mayor al precio máximo');
    }

    // Query principal para obtener productos
    const queryBuilder = this.productsRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.seller', 'seller')
      .where('product.status = :status', { status: GlobalStatus.ACTIVE });

    // Filtro por búsqueda de nombre
    if (search) {
      queryBuilder.andWhere('product.name ILIKE :search', { search: `%${search}%` });
    }

    if (min_price !== undefined) {
      queryBuilder.andWhere('product.price >= :min_price', { min_price });
    }

    if (max_price !== undefined) {
      queryBuilder.andWhere('product.price <= :max_price', { max_price });
    }

    // Filtro por categorías usando la tabla intermedia product_categories
    if (category_ids && category_ids.length > 0) {
      queryBuilder
        .innerJoin('product_categories', 'pc', 'pc.product_id = product.id')
        .andWhere('pc.category_id IN (:...categoryIds)', { categoryIds: category_ids });
    }

    // Usar distinct para evitar duplicados cuando hay múltiples categorías
    queryBuilder.distinct(true);

    // Ordenar por fecha de creación (más recientes primero)
    queryBuilder.orderBy('product.created_at', 'DESC');

    // Paginación
    queryBuilder.skip(skip).take(limit);

    const [products, total] = await queryBuilder.getManyAndCount();

    // Si no hay productos, retornar respuesta vacía
    if (products.length === 0) {
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

    // Obtener todos los IDs de productos
    const productIds = products.map(p => p.id);

    // Obtener todas las imágenes principales en una sola consulta
    const mainImagesQuery = this.filesRepository.createQueryBuilder('file')
      .where('file.parent_id IN (:...productIds)', { productIds })
      .andWhere('file.parent_type = :parentType', { parentType: 'product' })
      .andWhere('file.status = :status', { status: GlobalStatus.ACTIVE })
      .andWhere('file.is_main = :isMain', { isMain: true })
      .select('file.parent_id', 'parent_id')
      .addSelect('file.path_file', 'path_file')
      .orderBy('file.parent_id', 'ASC')
      .addOrderBy('file.created_at', 'ASC');

    let mainImages = await mainImagesQuery.getRawMany();

    // Si no hay imágenes principales, obtener las primeras imágenes disponibles
    const productsWithoutMainImage = productIds.filter(
      id => !mainImages.some((img: any) => img.parent_id === id)
    );

    if (productsWithoutMainImage.length > 0) {
      const firstImagesQuery = this.filesRepository.createQueryBuilder('file')
        .where('file.parent_id IN (:...productIds)', { productIds: productsWithoutMainImage })
        .andWhere('file.parent_type = :parentType', { parentType: 'product' })
        .andWhere('file.status = :status', { status: GlobalStatus.ACTIVE })
        .select('file.parent_id', 'parent_id')
        .addSelect('file.path_file', 'path_file')
        .orderBy('file.parent_id', 'ASC')
        .addOrderBy('file.created_at', 'ASC');

      const firstImages = await firstImagesQuery.getRawMany();
      mainImages = [...mainImages, ...firstImages];
    }

    // Crear un mapa de imágenes por product_id (usar Map para obtener solo una imagen por producto)
    // path_file ahora contiene la ruta completa (carpeta/id.extensión), construir URL del endpoint /files/{id}
    const imagesMap = new Map<string, string | null>();
    mainImages.forEach((img: any) => {
      const productId = img.parent_id;
      if (!imagesMap.has(productId)) {
        // path_file contiene la ruta completa (ej: "products/uuid.jpg")
        // Extraer el ID del archivo para construir la URL del endpoint
        if (img.path_file) {
          const pathParts = img.path_file.split('/');
          const fileNameWithExt = pathParts[pathParts.length - 1];
          const fileId = fileNameWithExt.split('.')[0];
          imagesMap.set(productId, `uploads/${img.path_file}`);
        } else {
          imagesMap.set(productId, null);
        }
      }
    });

    // Obtener todas las categorías de los productos en una sola consulta
    const categoriesQuery = this.productCategoriesRepository.createQueryBuilder('pc')
      .innerJoin('categories', 'category', 'category.id = pc.category_id')
      .where('pc.product_id IN (:...productIds)', { productIds })
      .select('pc.product_id', 'product_id')
      .addSelect('category.name', 'category_name')
      .orderBy('pc.product_id', 'ASC')
      .addOrderBy('category.name', 'ASC');

    const productCategories = await categoriesQuery.getRawMany();

    // Crear un mapa de categorías por product_id
    const categoriesMap = new Map<string, string[]>();
    productCategories.forEach((pc: any) => {
      const productId = pc.product_id;
      const categoryName = pc.category_name;
      
      if (!categoriesMap.has(productId)) {
        categoriesMap.set(productId, []);
      }
      categoriesMap.get(productId)!.push(categoryName);
    });

    // Formatear la respuesta
    const formattedProducts = products.map(product => ({
      id: product.id,
      seller_id: product.seller_id,
      seller_name: product.seller.shop_name,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      status: product.status,
      created_at: product.created_at,
      modified_at: product.modified_at,
      image_path: imagesMap.get(product.id) || null,
      categories: categoriesMap.get(product.id) || [],
    }));

    return {
      products: formattedProducts,
      meta: {
        total: total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
} 


