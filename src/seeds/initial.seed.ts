import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as bcrypt from 'bcrypt';
import { RolesEntity } from '../modules/roles/roles.entity';
import { UsersEntity } from '../modules/users/users.entity';
import { SellersEntity } from '../modules/sellers/sellers.entity';
import { CategoriesEntity } from '../modules/categories/categories.entity';
import { GlobalStatus } from '../globals/enums/global-status.enum';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function seedInitial() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST!,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
    schema: process.env.DB_SCHEMA || 'public',
    entities: [
      RolesEntity,
      UsersEntity,
      SellersEntity,
      CategoriesEntity,
    ],
    synchronize: false,
    logging: false,
  });

  try {
    await dataSource.initialize();
    console.log('✅ Conexión a la base de datos establecida\n');

    const rolesRepository = dataSource.getRepository(RolesEntity);
    const usersRepository = dataSource.getRepository(UsersEntity);
    const sellersRepository = dataSource.getRepository(SellersEntity);
    const categoriesRepository = dataSource.getRepository(CategoriesEntity);

    // ============================================
    // 1. CREAR ROLES
    // ============================================
    console.log('📋 Paso 1: Creando roles...');
    
    const rolesToCreate = [
      { name: 'buyer', description: 'Rol para compradores' },
      { name: 'seller', description: 'Rol para vendedores' },
      { name: 'admin', description: 'Rol para administradores' },
    ];

    const createdRoles: Map<string, RolesEntity> = new Map();

    for (const roleData of rolesToCreate) {
      // Verificar si el rol ya existe
      const existingRole = await rolesRepository.findOne({ where: { name: roleData.name } });
      
      if (existingRole) {
        console.log(`  ⚠️  Rol "${roleData.name}" ya existe, omitiendo...`);
        createdRoles.set(roleData.name, existingRole);
      } else {
        const role = rolesRepository.create({
          name: roleData.name,
          description: roleData.description,
        });
        const savedRole = await rolesRepository.save(role);
        console.log(`  ✅ Rol "${roleData.name}" creado`);
        createdRoles.set(roleData.name, savedRole);
      }
    }

    console.log('✅ Roles creados correctamente\n');

    // ============================================
    // 2. CREAR USUARIOS
    // ============================================
    console.log('👥 Paso 2: Creando usuarios...');

    const buyerRole = createdRoles.get('buyer');
    const sellerRole = createdRoles.get('seller');

    if (!buyerRole || !sellerRole) {
      throw new Error('No se pudieron obtener los roles necesarios');
    }

    // Contraseña por defecto para todos los usuarios de seed (se puede cambiar después)
    const defaultPassword = await bcrypt.hash('password123', 10);

    // Crear 1 usuario buyer
    const buyerData = {
      name: 'Juan',
      last_name_father: 'Pérez',
      last_name_mother: 'García',
      email: 'buyer@example.com',
      password: defaultPassword,
      phone: '123456789',
      num_document: '12345678',
      type_document: 'DNI',
      role_id: buyerRole.id,
      status: GlobalStatus.ACTIVE,
    };

    // Verificar si el buyer ya existe
    const existingBuyer = await usersRepository.findOne({ where: { email: buyerData.email } });
    let buyer: UsersEntity;

    if (existingBuyer) {
      console.log(`  ⚠️  Usuario buyer "${buyerData.email}" ya existe, omitiendo...`);
      buyer = existingBuyer;
    } else {
      buyer = usersRepository.create(buyerData);
      buyer = await usersRepository.save(buyer);
      console.log(`  ✅ Usuario buyer "${buyerData.email}" creado`);
    }

    // Crear 2 usuarios sellers
    const sellersData = [
      {
        user: {
          name: 'María',
          last_name_father: 'López',
          last_name_mother: 'Rodríguez',
          email: 'seller1@example.com',
          password: defaultPassword,
          phone: '987654321',
          num_document: '87654321',
          type_document: 'DNI',
          role_id: sellerRole.id,
          status: GlobalStatus.ACTIVE,
        },
        seller: {
          shop_name: 'Tienda Fashion',
          description: 'Tu tienda de moda y estilo',
          ruc: '20123456789',
          business_address: 'Av. Principal 123, Lima, Perú',
        },
      },
      {
        user: {
          name: 'Carlos',
          last_name_father: 'González',
          last_name_mother: 'Martínez',
          email: 'seller2@example.com',
          password: defaultPassword,
          phone: '555555555',
          num_document: '11223344',
          type_document: 'DNI',
          role_id: sellerRole.id,
          status: GlobalStatus.ACTIVE,
        },
        seller: {
          shop_name: 'Moda Elegante',
          description: 'Ropa elegante y de calidad',
          ruc: '20987654321',
          business_address: 'Calle Comercio 456, Lima, Perú',
        },
      },
    ];

    const createdSellers: SellersEntity[] = [];

    for (const sellerData of sellersData) {
      // Verificar si el usuario seller ya existe
      const existingUser = await usersRepository.findOne({ where: { email: sellerData.user.email } });
      let sellerUser: UsersEntity;

      if (existingUser) {
        console.log(`  ⚠️  Usuario seller "${sellerData.user.email}" ya existe, omitiendo...`);
        sellerUser = existingUser;
      } else {
        sellerUser = usersRepository.create(sellerData.user);
        sellerUser = await usersRepository.save(sellerUser);
        console.log(`  ✅ Usuario seller "${sellerData.user.email}" creado`);
      }

      // Verificar si el seller ya existe
      const existingSeller = await sellersRepository.findOne({ where: { user_id: sellerUser.id } });
      let seller: SellersEntity;

      if (existingSeller) {
        console.log(`  ⚠️  Seller para usuario "${sellerData.user.email}" ya existe, omitiendo...`);
        createdSellers.push(existingSeller);
      } else {
        seller = sellersRepository.create({
          ...sellerData.seller,
          user_id: sellerUser.id,
        });
        seller = await sellersRepository.save(seller);
        console.log(`  ✅ Seller "${sellerData.seller.shop_name}" creado`);
        createdSellers.push(seller);
      }
    }

    console.log('✅ Usuarios y sellers creados correctamente\n');

    // ============================================
    // 3. CREAR CATEGORÍAS
    // ============================================
    console.log('📂 Paso 3: Creando categorías...');

    const categoriesData = [
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

    let categoriesCreated = 0;
    let categoriesSkipped = 0;

    for (const categoryData of categoriesData) {
      // Verificar si la categoría ya existe
      const existingCategory = await categoriesRepository.findOne({ where: { name: categoryData.name } });

      if (existingCategory) {
        console.log(`  ⚠️  Categoría "${categoryData.name}" ya existe, omitiendo...`);
        categoriesSkipped++;
      } else {
        const category = categoriesRepository.create({
          ...categoryData,
          status: GlobalStatus.ACTIVE,
        });
        await categoriesRepository.save(category);
        console.log(`  ✅ Categoría "${categoryData.name}" creada`);
        categoriesCreated++;
      }
    }

    console.log(`✅ Categorías creadas correctamente (${categoriesCreated} nuevas, ${categoriesSkipped} existentes)\n`);

    // ============================================
    // RESUMEN
    // ============================================
    console.log('✨ Seed inicial completado!\n');
    console.log('📊 Resumen:');
    console.log(`  ✅ Roles: ${createdRoles.size}`);
    console.log(`  ✅ Usuarios buyer: 1`);
    console.log(`  ✅ Usuarios sellers: ${createdSellers.length}`);
    console.log(`  ✅ Categorías: ${await categoriesRepository.count()}\n`);
    console.log('🔐 Credenciales por defecto:');
    console.log('  Email: buyer@example.com | Password: password123');
    console.log('  Email: seller1@example.com | Password: password123');
    console.log('  Email: seller2@example.com | Password: password123\n');

    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Error en el seed inicial:', error);
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
    process.exit(1);
  }
}

// Ejecutar el seed
seedInitial();

