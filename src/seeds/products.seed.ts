import { DataSource } from 'typeorm';
import * as https from 'https';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { promises as fs } from 'fs';
import { randomUUID } from 'crypto';
import { ProductsEntity } from '../modules/products/products.entity';
import { FilesEntity } from '../modules/files/files.entity';
import { SellersEntity } from '../modules/sellers/sellers.entity';
import { CategoriesEntity } from '../modules/categories/categories.entity';
import { ProductCategoriesEntity } from '../modules/product-categories/product-categories.entity';
import { UsersEntity } from '../modules/users/users.entity';
import { RolesEntity } from '../modules/roles/roles.entity';
import { GlobalStatus } from '../globals/enums/global-status.enum';
import { GlobalTypesFiles } from 'src/globals/enums/global-types-files';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Tipo para los datos de producto
type ProductData = {
  name: string;
  description: string;
  price: number;
  stock: number;
};

// Datos de productos predefinidos - SOLO PRENDAS DE VESTIR/ROPA
const PRODUCTS_DATA: ProductData[] = [
  // Ropa para Hombres
  { name: 'Camisa Polo Hombre', description: 'Camisa polo de algodón 100%, varios colores disponibles', price: 34.99, stock: 75 },
  { name: 'Jeans Clásicos', description: 'Jeans de corte clásico, talle regular', price: 49.99, stock: 90 },
  { name: 'Zapatillas Deportivas Nike', description: 'Zapatillas deportivas para running, talla 38-45', price: 89.99, stock: 120 },
  { name: 'Chaqueta Impermeable', description: 'Chaqueta impermeable con capucha, resistente al viento', price: 79.99, stock: 55 },
  { name: 'Vestido Casual', description: 'Vestido casual de verano, varios diseños', price: 39.99, stock: 65 },
  { name: 'Gorra Snapback', description: 'Gorra snapback ajustable, logo bordado', price: 24.99, stock: 100 },
  { name: 'Sudadera con Capucha', description: 'Sudadera de algodón con capucha y bolsillo canguro', price: 44.99, stock: 70 },
  { name: 'Bufanda de Lana', description: 'Bufanda de lana merino, suave y cálida', price: 19.99, stock: 85 },
  { name: 'Cinturón de Cuero', description: 'Cinturón de cuero genuino, hebilla metálica', price: 29.99, stock: 60 },
  { name: 'Gafas de Sol', description: 'Gafas de sol con protección UV 400', price: 39.99, stock: 95 },
  
  { name: 'Camisa de Vestir Clásica', description: 'Camisa de vestir clásica, cuello italiano, manga larga, varios colores', price: 49.99, stock: 80 },
  { name: 'Pantalón de Vestir Clásico', description: 'Pantalón de vestir de corte clásico, talle regular, varios colores', price: 59.99, stock: 75 },
  { name: 'Traje de Dos Piezas', description: 'Traje de dos piezas, chaqueta y pantalón, corte moderno', price: 199.99, stock: 40 },
  { name: 'Chaqueta Deportiva', description: 'Chaqueta deportiva con cierre frontal y capucha', price: 69.99, stock: 60 },
  { name: 'Pantalón Chino', description: 'Pantalón chino de algodón, corte slim fit, varios colores', price: 54.99, stock: 85 },
  
  // Ropa para Mujeres
  { name: 'Blusa Elegante', description: 'Blusa elegante de manga larga, varios diseños y colores', price: 44.99, stock: 90 },
  { name: 'Pantalón de Mezclilla', description: 'Pantalón de mezclilla corte regular, varios talles', price: 49.99, stock: 100 },
  { name: 'Falda Lápiz', description: 'Falda lápiz elegante para oficina, varios colores', price: 39.99, stock: 70 },
  { name: 'Vestido Casual', description: 'Vestido casual de verano, varios diseños', price: 39.99, stock: 65 },
  { name: 'Vestido de Fiesta', description: 'Vestido de fiesta elegante, largo hasta el suelo', price: 89.99, stock: 50 },
  { name: 'Top Deportivo', description: 'Top deportivo con soporte, ideal para gimnasio', price: 29.99, stock: 110 },
  { name: 'Leggings Deportivos', description: 'Leggings deportivos de alta compresión, varios colores', price: 34.99, stock: 95 },
  { name: 'Cardigan de Lana', description: 'Cardigan de lana suave, ideal para temporada fría', price: 64.99, stock: 60 },
  
  // Ropa Unisex
  { name: 'Hoodie Básico', description: 'Sudadera con capucha, algodón 100%, varios colores', price: 49.99, stock: 120 },
  { name: 'Chamarra de Mezclilla', description: 'Chamarra de mezclilla clásica, varios talles', price: 79.99, stock: 55 },
  
  // Calzado
  { name: 'Zapatos de Vestir Oxford', description: 'Zapatos de vestir estilo Oxford, cuero genuino', price: 89.99, stock: 70 },
  { name: 'Botas de Cuero', description: 'Botas de cuero genuino, varios estilos', price: 99.99, stock: 65 },
  { name: 'Zapatillas Deportivas', description: 'Zapatillas deportivas para running, talla 38-45', price: 89.99, stock: 120 },
  { name: 'Sandalias Casuales', description: 'Sandalias casuales de cuero, varios colores', price: 39.99, stock: 90 },
  { name: 'Zapatos Deportivos Running', description: 'Zapatos deportivos especializados para running', price: 119.99, stock: 80 },
  
  // Accesorios de Ropa
  { name: 'Gorra de Béisbol', description: 'Gorra de béisbol ajustable, varios colores y diseños', price: 24.99, stock: 100 },
  { name: 'Sombrero de Paja', description: 'Sombrero de paja para verano, protección UV', price: 34.99, stock: 75 },
  { name: 'Guantes de Cuero', description: 'Guantes de cuero genuino, varios talles', price: 29.99, stock: 85 },
  { name: 'Gafas de Sol', description: 'Gafas de sol con protección UV 400, varios modelos', price: 39.99, stock: 95 },
  { name: 'Cinturón de Cuero', description: 'Cinturón de cuero genuino, hebilla metálica', price: 29.99, stock: 110 },
  { name: 'Bufanda de Lana', description: 'Bufanda de lana merino, suave y cálida', price: 19.99, stock: 130 },
  { name: 'Mochila Deportiva', description: 'Mochila deportiva con múltiples compartimentos', price: 49.99, stock: 90 },
  { name: 'Bolso de Mano', description: 'Bolso de mano elegante, varios diseños', price: 59.99, stock: 70 },
  
  // Ropa Interior
  { name: 'Pack de Calzoncillos', description: 'Pack de 3 calzoncillos de algodón, varios talles', price: 24.99, stock: 150 },
  { name: 'Pack de Medias', description: 'Pack de 5 pares de medias, varios colores', price: 19.99, stock: 160 },
  { name: 'Sujetador Deportivo', description: 'Sujetador deportivo con soporte, varios talles', price: 34.99, stock: 100 },
  { name: 'Pack de Bragas', description: 'Pack de 5 bragas de algodón, varios talles', price: 29.99, stock: 140 },
  
  // Ropa Deportiva
  { name: 'Chándal Completo', description: 'Chándal completo, pantalón y sudadera, varios colores', price: 79.99, stock: 85 },
  { name: 'Shorts Deportivos', description: 'Shorts deportivos de secado rápido, varios colores', price: 24.99, stock: 125 },
  { name: 'Camiseta Deportiva', description: 'Camiseta deportiva de secado rápido, varios colores', price: 19.99, stock: 180 },
  { name: 'Mallas Deportivas', description: 'Mallas deportivas de alta compresión, varios colores', price: 39.99, stock: 100 },
  
  // Ropa Formal
  { name: 'Camisa Formal Blanca', description: 'Camisa formal blanca, cuello italiano, manga larga', price: 54.99, stock: 95 },
  { name: 'Corbata de Seda', description: 'Corbata de seda elegante, varios diseños', price: 34.99, stock: 110 },
  { name: 'Chaleco de Vestir', description: 'Chaleco de vestir clásico, varios colores', price: 44.99, stock: 75 },
  
  // Ropa de Baño
  { name: 'Bikini Completo', description: 'Bikini completo, top y bottom, varios diseños', price: 39.99, stock: 90 },
  { name: 'Bañador Hombre', description: 'Bañador para hombre, varios diseños y talles', price: 29.99, stock: 100 },
  { name: 'Traje de Baño Entero', description: 'Traje de baño entero para mujer, varios diseños', price: 44.99, stock: 80 },
  
  // Más productos para llegar a 100+
  { name: 'Camisa Manga Corta Casual', description: 'Camisa de manga corta casual, varios colores', price: 34.99, stock: 115 },
  { name: 'Pantalón Corto Deportivo', description: 'Pantalón corto deportivo, varios colores', price: 24.99, stock: 140 },
  { name: 'Jersey de Lana', description: 'Jersey de lana cálido, varios colores', price: 59.99, stock: 85 },
  { name: 'Camiseta Básica', description: 'Camiseta básica de algodón, varios colores', price: 14.99, stock: 200 },
  { name: 'Pantalón Cargo', description: 'Pantalón cargo con bolsillos, varios colores', price: 49.99, stock: 95 },
  { name: 'Blazer Elegante', description: 'Blazer elegante para oficina, varios colores', price: 89.99, stock: 65 },
  { name: 'Camisa de Lino', description: 'Camisa de lino fresca para verano, varios colores', price: 44.99, stock: 90 },
  { name: 'Pantalón de Yoga', description: 'Pantalón de yoga elástico, varios colores', price: 34.99, stock: 105 },
  { name: 'Vestido de Verano', description: 'Vestido de verano ligero, varios diseños', price: 39.99, stock: 110 },
  { name: 'Camiseta Polo', description: 'Camiseta polo de algodón, varios colores', price: 34.99, stock: 130 },
  { name: 'Pantalón de Mezclilla Negra', description: 'Pantalón de mezclilla negra, corte regular', price: 49.99, stock: 100 },
  { name: 'Falda Midi', description: 'Falda midi elegante, varios colores', price: 44.99, stock: 85 },
  { name: 'Top de Encaje', description: 'Top de encaje elegante, varios colores', price: 39.99, stock: 95 },
  { name: 'Pantalón Palazzo', description: 'Pantalón palazzo amplio, varios colores', price: 54.99, stock: 75 },
  { name: 'Blusa con Volantes', description: 'Blusa con volantes romántica, varios colores', price: 49.99, stock: 80 },
  { name: 'Joggers Deportivos', description: 'Joggers deportivos cómodos, varios colores', price: 39.99, stock: 120 },
  { name: 'Camisa Oversized', description: 'Camisa oversized de moda, varios colores', price: 44.99, stock: 100 },
  { name: 'Falda Plisada', description: 'Falda plisada escolar, varios colores', price: 34.99, stock: 90 },
  { name: 'Pantalón Wide Leg', description: 'Pantalón wide leg de moda, varios colores', price: 59.99, stock: 70 },
  { name: 'Camiseta Cuello V', description: 'Camiseta de cuello V, varios colores', price: 19.99, stock: 180 },
  { name: 'Chaqueta Bomber', description: 'Chaqueta bomber moderna, varios colores', price: 69.99, stock: 85 },
  { name: 'Pantalón de Pana', description: 'Pantalón de pana cálido, varios colores', price: 54.99, stock: 80 },
  { name: 'Vestido Midi', description: 'Vestido midi elegante, varios diseños', price: 59.99, stock: 75 },
  { name: 'Camisa de Seda', description: 'Camisa de seda elegante, varios colores', price: 74.99, stock: 60 },
  { name: 'Pantalón de Cuero Falso', description: 'Pantalón de cuero falso, corte ajustado', price: 64.99, stock: 70 },
  { name: 'Blusa de Seda', description: 'Blusa de seda elegante, varios colores', price: 69.99, stock: 65 },
  { name: 'Falda Asimétrica', description: 'Falda asimétrica moderna, varios colores', price: 44.99, stock: 85 },
  { name: 'Camiseta de Rayas', description: 'Camiseta de rayas marineras, varios colores', price: 24.99, stock: 150 },
  { name: 'Pantalón de Vestir Slim', description: 'Pantalón de vestir corte slim, varios colores', price: 59.99, stock: 90 },
  { name: 'Vestido Casual Midi', description: 'Vestido casual midi, varios diseños', price: 49.99, stock: 95 },
  { name: 'Chaqueta de Mezclilla Oversized', description: 'Chaqueta de mezclilla oversized, varios talles', price: 79.99, stock: 75 },
  { name: 'Pantalón de Mezclilla Roto', description: 'Pantalón de mezclilla con rotos, varios talles', price: 59.99, stock: 85 },
  { name: 'Camisa Floral', description: 'Camisa con estampado floral, varios diseños', price: 39.99, stock: 100 },
  { name: 'Falda Lápiz Larga', description: 'Falda lápiz larga elegante, varios colores', price: 49.99, stock: 80 },
  { name: 'Top Deportivo sin Mangas', description: 'Top deportivo sin mangas, varios colores', price: 24.99, stock: 130 },
  { name: 'Pantalón de Chándal', description: 'Pantalón de chándal cómodo, varios colores', price: 34.99, stock: 115 },
  { name: 'Camisa de Cuadros', description: 'Camisa de cuadros casual, varios diseños', price: 44.99, stock: 105 },
  { name: 'Vestido de Enagua', description: 'Vestido con enagua elegante, varios diseños', price: 69.99, stock: 70 },
  { name: 'Blazer Oversized', description: 'Blazer oversized de moda, varios colores', price: 89.99, stock: 65 },
  { name: 'Pantalón de Mezclilla Slim', description: 'Pantalón de mezclilla corte slim, varios colores', price: 49.99, stock: 110 },
  { name: 'Camiseta con Estampado', description: 'Camiseta con estampado moderno, varios diseños', price: 29.99, stock: 145 },
  { name: 'Falda A-line', description: 'Falda A-line clásica, varios colores', price: 39.99, stock: 95 },
  { name: 'Top de Manga Larga', description: 'Top de manga larga básico, varios colores', price: 24.99, stock: 160 },
  { name: 'Pantalón de Mezclilla Wide', description: 'Pantalón de mezclilla corte wide, varios colores', price: 54.99, stock: 85 },
  { name: 'Camisa de Vestir Rayada', description: 'Camisa de vestir con rayas, varios colores', price: 49.99, stock: 95 },
  { name: 'Vestido de Verano Floral', description: 'Vestido de verano con estampado floral', price: 44.99, stock: 100 },
  { name: 'Chaqueta de Cuero Falso', description: 'Chaqueta de cuero falso, varios estilos', price: 79.99, stock: 70 },
  { name: 'Pantalón de Vestir Plisado', description: 'Pantalón de vestir con plisado, varios colores', price: 64.99, stock: 75 },
  { name: 'Blusa de Encaje Elegante', description: 'Blusa de encaje elegante, varios colores', price: 54.99, stock: 80 },
  { name: 'Falda Tubo', description: 'Falda tubo ajustada, varios colores', price: 34.99, stock: 105 },
  { name: 'Camiseta Básica de Algodón Orgánico', description: 'Camiseta básica de algodón orgánico, varios colores', price: 19.99, stock: 175 },
  { name: 'Pantalón de Mezclilla Clásico', description: 'Pantalón de mezclilla clásico, corte regular', price: 49.99, stock: 120 },
  { name: 'Vestido de Noche', description: 'Vestido de noche elegante, varios diseños', price: 119.99, stock: 50 },
];

// Función para descargar una imagen desde una URL con timeout y reintentos
function downloadImage(urlToDownload: string, timeout: number = 30000, retries: number = 3): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    let currentUrl = urlToDownload;

    const attemptDownload = () => {
      attempts++;
      const request = https.get(currentUrl, (response) => {
        // Seguir redirecciones
        if (response.statusCode === 301 || response.statusCode === 302 || response.statusCode === 307 || response.statusCode === 308) {
          const redirectUrl = response.headers.location;
          if (redirectUrl) {
            request.destroy();
            // Si es relativa, hacer absoluta
            if (redirectUrl.startsWith('http')) {
              currentUrl = redirectUrl;
            } else {
              currentUrl = new URL(redirectUrl, currentUrl).toString();
            }
            // Reintentar con la nueva URL
            setTimeout(() => attemptDownload(), 500);
            return;
          }
        }

        if (response.statusCode !== 200) {
          request.destroy();
          if (attempts < retries) {
            // Reintentar después de un delay
            setTimeout(() => attemptDownload(), 1000 * attempts);
            return;
          }
          reject(new Error(`Error al descargar imagen: ${response.statusCode}`));
          return;
        }

        const chunks: Buffer[] = [];
        response.on('data', (chunk) => chunks.push(chunk));
        response.on('end', () => resolve(Buffer.concat(chunks)));
        response.on('error', (err) => {
          request.destroy();
          if (attempts < retries) {
            setTimeout(() => attemptDownload(), 1000 * attempts);
            return;
          }
          reject(err);
        });
      });

      request.on('error', (err) => {
        if (attempts < retries) {
          setTimeout(() => attemptDownload(), 1000 * attempts);
          return;
        }
        reject(err);
      });

      // Timeout después de 30 segundos
      request.setTimeout(timeout, () => {
        request.destroy();
        if (attempts < retries) {
          setTimeout(() => attemptDownload(), 1000 * attempts);
          return;
        }
        reject(new Error(`Timeout al descargar imagen desde ${currentUrl}`));
      });
    };

    attemptDownload();
  });
}

// Función para determinar las categorías de un producto basándose en su nombre y descripción
function getProductCategories(productName: string, description: string, categoryMap: Map<string, CategoriesEntity>): CategoriesEntity[] {
  const productText = `${productName} ${description}`.toLowerCase();
  const assignedCategories: CategoriesEntity[] = [];
  const categoryKeywords: { [key: string]: string[] } = {
    'Ropa Hombre': ['hombre', 'hombre', 'camisa', 'pantalón', 'jeans', 'traje', 'chaqueta', 'blazer', 'corbata', 'chaleco', 'calzoncillos', 'bañador hombre'],
    'Ropa Mujer': ['mujer', 'mujer', 'blusa', 'vestido', 'falda', 'top', 'bragas', 'sujetador', 'traje de baño entero', 'bikini'],
    'Calzado': ['zapatos', 'zapatillas', 'botas', 'sandalias', 'calzado', 'running', 'oxford'],
    'Accesorios': ['gorra', 'sombrero', 'gafas', 'cinturón', 'bufanda', 'guantes', 'mochila', 'bolso', 'corbata'],
    'Ropa Deportiva': ['deportivo', 'deportiva', 'gimnasio', 'running', 'fitness', 'chándal', 'shorts deportivos', 'camiseta deportiva', 'mallas deportivas', 'leggings deportivos', 'top deportivo', 'joggers'],
    'Ropa Interior': ['calzoncillos', 'medias', 'sujetador', 'bragas', 'ropa interior'],
    'Ropa Formal': ['formal', 'vestir', 'traje', 'camisa formal', 'pantalón de vestir', 'blazer', 'corbata', 'chaleco'],
    'Ropa de Baño': ['baño', 'bikini', 'bañador', 'traje de baño'],
    'Unisex': ['unisex', 'hoodie', 'chamarra', 'sudadera'],
  };

  // Asignar categorías basándose en palabras clave
  for (const [categoryName, keywords] of Object.entries(categoryKeywords)) {
    const category = categoryMap.get(categoryName);
    if (category && keywords.some(keyword => productText.includes(keyword))) {
      assignedCategories.push(category);
    }
  }

  // Si no se asignó ninguna categoría, asignar "Unisex" por defecto
  if (assignedCategories.length === 0) {
    const unisexCategory = categoryMap.get('Unisex');
    if (unisexCategory) {
      assignedCategories.push(unisexCategory);
    }
  }

  return assignedCategories;
}

// Función para guardar archivo en el sistema de archivos (similar a StorageService)
// Guarda en uploads/products/ y retorna solo el ID del archivo
async function saveFileToDisk(fileBuffer: Buffer, fileId: string, originalFilename: string): Promise<string> {
  const uploadsDir = path.join(process.cwd(), 'uploads');
  const productsDir = path.join(uploadsDir, 'products');
  
  // Crear directorio base si no existe
  try {
    await fs.access(uploadsDir);
  } catch {
    await fs.mkdir(uploadsDir, { recursive: true });
  }

  // Crear directorio products si no existe
  try {
    await fs.access(productsDir);
  } catch {
    await fs.mkdir(productsDir, { recursive: true });
  }

  // Obtener extensión del archivo original
  const fileExtension = path.extname(originalFilename) || '.jpg';
  
  // Nombre del archivo será el ID con su extensión
  const fileName = `${fileId}${fileExtension}`;
  const filePath = path.join(productsDir, fileName);

  // Guardar archivo en uploads/products/
  await fs.writeFile(filePath, fileBuffer);

  // Devolver solo el ID (que es el nombre del archivo sin extensión para guardar en BD)
  return fileId;
}

// Función para generar una URL de imagen usando Picsum Photos con categorías
// Picsum es más confiable que Unsplash Source (deprecado)
function getProductImageUrl(productName: string, index: number, width: number = 800, height: number = 600): string {
  // Usar Picsum Photos que es más confiable y no requiere API key
  // Usamos el índice como seed para mantener consistencia en las imágenes
  // Agregamos variación para que diferentes productos obtengan diferentes imágenes
  const seed = index + Math.floor(Math.random() * 1000);
  
  // Picsum Photos con seed para imágenes consistentes
  // Formato: https://picsum.photos/seed/{seed}/{width}/{height}
  return `https://picsum.photos/seed/${seed}/${width}/${height}`;
}

// Función alternativa usando placeholder.com con texto descriptivo (fallback)
function getPlaceholderImageUrl(productName: string, width: number = 800, height: number = 600): string {
  // Placeholder.com permite texto en la imagen
  const text = encodeURIComponent(productName.substring(0, 20));
  return `https://via.placeholder.com/${width}x${height}/E5E5E5/666666?text=${text}`;
}

async function seedProducts() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST!,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
    schema: process.env.DB_SCHEMA || 'public',
    entities: [
      ProductsEntity,
      FilesEntity,
      SellersEntity,
      CategoriesEntity,
      ProductCategoriesEntity,
      UsersEntity,
      RolesEntity,
    ],
    synchronize: false,
    logging: false,
  });

  try {
    await dataSource.initialize();
    console.log('✅ Conexión a la base de datos establecida');

    const productsRepository = dataSource.getRepository(ProductsEntity);
    const filesRepository = dataSource.getRepository(FilesEntity);
    const sellersRepository = dataSource.getRepository(SellersEntity);
    const categoriesRepository = dataSource.getRepository(CategoriesEntity);
    const productCategoriesRepository = dataSource.getRepository(ProductCategoriesEntity);

    // Obtener o crear sellers
    let sellers = await sellersRepository.find();
    if (sellers.length === 0) {
      console.log('⚠️  No se encontraron sellers. Por favor, crea al menos un seller antes de ejecutar el seed.');
      await dataSource.destroy();
      return;
    }
    console.log(`✅ Encontrados ${sellers.length} sellers`);

    // Obtener o crear categorías
    let categories = await categoriesRepository.find();
    if (categories.length === 0) {
      // Crear categorías por defecto
      const defaultCategories = [
        { name: 'Ropa Hombre', description: 'Ropa y prendas para hombres' },
        { name: 'Ropa Mujer', description: 'Ropa y prendas para mujeres' },
        { name: 'Calzado', description: 'Zapatos y calzado para todos' },
        { name: 'Accesorios', description: 'Accesorios de moda y complementos' },
        { name: 'Ropa Deportiva', description: 'Ropa deportiva y fitness' },
        { name: 'Ropa Interior', description: 'Ropa interior para hombres y mujeres' },
        { name: 'Ropa Formal', description: 'Ropa formal y de vestir' },
        { name: 'Ropa de Baño', description: 'Trajes de baño y bikinis' },
        { name: 'Unisex', description: 'Ropa unisex para todos' },
      ];

      for (const catData of defaultCategories) {
        const category = categoriesRepository.create({
          ...catData,
          status: GlobalStatus.ACTIVE,
        });
        await categoriesRepository.save(category);
        categories.push(category);
      }
      console.log(`✅ Creadas ${defaultCategories.length} categorías`);
    } else {
      console.log(`✅ Encontradas ${categories.length} categorías`);
    }

    // Crear un mapa de categorías por nombre para acceso rápido
    const categoryMap = new Map<string, CategoriesEntity>();
    categories.forEach(cat => {
      categoryMap.set(cat.name, cat);
    });

    // Verificar si ya existen productos
    const existingProducts = await productsRepository.count();
    if (existingProducts > 0) {
      console.log(`⚠️  Ya existen ${existingProducts} productos en la base de datos.`);
      console.log('¿Deseas continuar de todas formas? Esto agregará más productos.');
    }

    console.log('\n🚀 Iniciando seed de productos...\n');

    const totalProducts = Math.max(100, PRODUCTS_DATA.length);
    let created = 0;
    let failed = 0;

    // Repetir los productos si es necesario para llegar a 100
    const productsToCreate: ProductData[] = [];
    for (let i = 0; i < totalProducts; i++) {
      const productData = PRODUCTS_DATA[i % PRODUCTS_DATA.length];
      productsToCreate.push({
        ...productData,
        // Agregar variación al nombre si es una repetición
        name: i < PRODUCTS_DATA.length 
          ? productData.name 
          : `${productData.name} - Variante ${Math.floor(i / PRODUCTS_DATA.length) + 1}`,
      });
    }

    for (let i = 0; i < productsToCreate.length; i++) {
      const productData = productsToCreate[i];
      
      try {
        // Seleccionar seller aleatorio
        const randomSeller = sellers[Math.floor(Math.random() * sellers.length)];

        // Crear producto
        const product = productsRepository.create({
          seller_id: randomSeller.id,
          name: productData.name,
          description: productData.description,
          price: productData.price,
          stock: productData.stock,
          status: GlobalStatus.ACTIVE,
        });

        const savedProduct = await productsRepository.save(product);
        created++;

        // Asignar categorías al producto usando la tabla intermedia
        try {
          const productCategories = getProductCategories(productData.name, productData.description, categoryMap);
          
          for (const category of productCategories) {
            // Verificar si la asociación ya existe
            const existing = await productCategoriesRepository.findOne({
              where: {
                product_id: savedProduct.id,
                category_id: category.id,
              },
            });

            if (!existing) {
              const productCategory = productCategoriesRepository.create({
                product_id: savedProduct.id,
                category_id: category.id,
              });
              await productCategoriesRepository.save(productCategory);
            }
          }

          if ((i + 1) % 10 === 0) {
            console.log(`✅ Producto ${i + 1} asociado con ${productCategories.length} categoría(s)`);
          }
        } catch (categoryError) {
          console.warn(`⚠️  Error al asociar categorías para producto ${savedProduct.id}: ${categoryError}`);
        }

        // Descargar y guardar imagen principal
         try {
           let imageUrl = getProductImageUrl(productData.name, i);
           console.log(`📥 Descargando imagen para: ${productData.name}...`);
           
           let imageBuffer: Buffer;
           try {
             imageBuffer = await downloadImage(imageUrl);
           } catch (primaryError) {
             // Si falla Picsum, usar placeholder como fallback
             console.warn(`⚠️  Falló descarga principal, usando placeholder para: ${productData.name}`);
             imageUrl = getPlaceholderImageUrl(productData.name);
             imageBuffer = await downloadImage(imageUrl);
           }

           // Generar ID único para el archivo
           const mainImageId = randomUUID();
           
           // Guardar archivo en el sistema de archivos
           await saveFileToDisk(
             imageBuffer,
             mainImageId,
             `product-${savedProduct.id}-main.jpg`
           );

           // Construir la ruta completa: products/id.jpg
           const mainImagePath = `products/${mainImageId}.jpg`;

           const imageFile = filesRepository.create({
             id: mainImageId,
             filename: `product-${savedProduct.id}-main.jpg`,
             mimetype: 'image/jpeg',
             path_file: mainImagePath, // Guardamos la ruta completa: carpeta/id.extensión
             parent_id: savedProduct.id,
             parent_type: GlobalTypesFiles.PRODUCT,
             is_main: true,
             status: GlobalStatus.ACTIVE,
           });

           await filesRepository.save(imageFile);

           // Agregar 1-3 imágenes adicionales aleatoriamente
           const numAdditionalImages = Math.floor(Math.random() * 3) + 1;
           for (let j = 0; j < numAdditionalImages; j++) {
             try {
               let additionalImageUrl = getProductImageUrl(productData.name, i * 100 + j + 1);
               let additionalImageBuffer: Buffer;
               
               try {
                 additionalImageBuffer = await downloadImage(additionalImageUrl);
               } catch (additionalError) {
                 // Fallback a placeholder si falla
                 additionalImageUrl = getPlaceholderImageUrl(`${productData.name} ${j + 1}`);
                 additionalImageBuffer = await downloadImage(additionalImageUrl);
               }

               // Generar ID único para el archivo adicional
               const additionalImageId = randomUUID();
               
               // Guardar archivo adicional en el sistema de archivos
               await saveFileToDisk(
                 additionalImageBuffer,
                 additionalImageId,
                 `product-${savedProduct.id}-${j + 1}.jpg`
               );

               // Construir la ruta completa: products/id.jpg
               const additionalImagePath = `products/${additionalImageId}.jpg`;

               const additionalImageFile = filesRepository.create({
                 id: additionalImageId,
                 filename: `product-${savedProduct.id}-${j + 1}.jpg`,
                 mimetype: 'image/jpeg',
                 path_file: additionalImagePath, // Guardamos la ruta completa: carpeta/id.extensión
                 parent_id: savedProduct.id,
                 parent_type: GlobalTypesFiles.PRODUCT,
                 is_main: false,
                 status: GlobalStatus.ACTIVE,
               });

               await filesRepository.save(additionalImageFile);
             } catch (additionalImageError) {
               // Continuar aunque falle una imagen adicional
               console.warn(`⚠️  Error al descargar imagen adicional ${j + 1} para ${productData.name}`);
             }
           }

           if ((i + 1) % 10 === 0) {
             console.log(`✅ Procesados ${i + 1}/${totalProducts} productos...`);
           }
         } catch (imageError) {
           console.warn(`⚠️  Error al descargar imagen para producto ${savedProduct.id}: ${imageError}`);
           // Continuar aunque falle la imagen - el producto se crea sin imagen
         }
      } catch (error) {
        failed++;
        console.error(`❌ Error al crear producto ${i + 1}:`, error);
      }
    }

    console.log('\n✨ Seed completado!');
    console.log(`✅ Productos creados: ${created}`);
    console.log(`❌ Errores: ${failed}`);
    console.log(`📦 Total de productos en BD: ${await productsRepository.count()}`);

    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Error en el seed:', error);
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
    process.exit(1);
  }
}

// Ejecutar el seed
seedProducts();
