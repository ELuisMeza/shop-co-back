import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInitialSchema1734968400000 implements MigrationInterface {
  name = 'CreateInitialSchema1734968400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear extensión para UUID si no existe
    await queryRunner.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    `);

    // Crear enum GlobalStatus
    await queryRunner.query(`
      CREATE TYPE "global_status_enum" AS ENUM ('active', 'inactive');
    `);

    // Crear tabla roles
    await queryRunner.query(`
      CREATE TABLE "roles" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(50) NOT NULL,
        "description" text,
        "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "UQ_roles_name" UNIQUE ("name"),
        CONSTRAINT "PK_roles" PRIMARY KEY ("id")
      );
    `);

    // Crear tabla users
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(100) NOT NULL,
        "last_name_father" character varying(100) NOT NULL,
        "last_name_mother" character varying(100) NOT NULL,
        "email" character varying(150) NOT NULL,
        "password" character varying(255) NOT NULL,
        "phone" character varying(20),
        "num_document" character varying(20),
        "type_document" character varying(50),
        "username" character varying(100),
        "status" "global_status_enum" NOT NULL DEFAULT 'active',
        "role_id" uuid NOT NULL,
        "last_login" timestamp,
        "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "modified_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "UQ_users_username" UNIQUE ("username"),
        CONSTRAINT "PK_users" PRIMARY KEY ("id"),
        CONSTRAINT "FK_users_role" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    // Crear tabla sellers
    await queryRunner.query(`
      CREATE TABLE "sellers" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "shop_name" character varying(150) NOT NULL,
        "description" text,
        "ruc" character varying(20),
        "business_address" character varying(255),
        "rating" numeric(2,1) NOT NULL DEFAULT 0.0,
        "total_sales" integer NOT NULL DEFAULT 0,
        "money_raised" numeric(10,2) NOT NULL DEFAULT 0.0,
        "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "modified_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "UQ_sellers_user_id" UNIQUE ("user_id"),
        CONSTRAINT "PK_sellers" PRIMARY KEY ("id"),
        CONSTRAINT "FK_sellers_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    // Crear tabla categories
    await queryRunner.query(`
      CREATE TABLE "categories" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(100) NOT NULL,
        "description" text,
        "status" "global_status_enum" NOT NULL DEFAULT 'active',
        "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "modified_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "UQ_categories_name" UNIQUE ("name"),
        CONSTRAINT "PK_categories" PRIMARY KEY ("id")
      );
    `);

    // Crear tabla products
    await queryRunner.query(`
      CREATE TABLE "products" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "seller_id" uuid NOT NULL,
        "name" character varying(150) NOT NULL,
        "description" text,
        "price" numeric(10,2) NOT NULL,
        "stock" integer NOT NULL DEFAULT 0,
        "status" "global_status_enum" NOT NULL DEFAULT 'active',
        "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "modified_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "PK_products" PRIMARY KEY ("id"),
        CONSTRAINT "FK_products_seller" FOREIGN KEY ("seller_id") REFERENCES "sellers"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    // Crear tabla files
    await queryRunner.query(`
      CREATE TABLE "files" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "filename" character varying(255) NOT NULL,
        "mimetype" character varying(100),
        "path_file" character varying(255) NOT NULL,
        "parent_id" uuid NOT NULL,
        "parent_type" character varying(100) NOT NULL,
        "is_main" boolean DEFAULT false,
        "status" "global_status_enum" NOT NULL DEFAULT 'active',
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "PK_files" PRIMARY KEY ("id")
      );
    `);

    // Crear tabla cart_items
    await queryRunner.query(`
      CREATE TABLE "cart_items" (
        "user_id" uuid NOT NULL,
        "product_id" uuid NOT NULL,
        "quantity" integer NOT NULL DEFAULT 1,
        "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "CHK_cart_items_quantity" CHECK ("quantity" > 0),
        CONSTRAINT "PK_cart_items" PRIMARY KEY ("user_id", "product_id"),
        CONSTRAINT "FK_cart_items_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "FK_cart_items_product" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    // Crear tabla orders
    await queryRunner.query(`
      CREATE TABLE "orders" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "buyer_id" uuid NOT NULL,
        "paypal_order_id" character varying(100),
        "payment_id" character varying(100),
        "status" character varying(20) NOT NULL,
        "payment_status" character varying(20) NOT NULL DEFAULT 'CREATED',
        "total_amount" numeric(10,2) NOT NULL,
        "currency" character varying(10) NOT NULL,
        "paid_at" timestamp,
        "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "PK_orders" PRIMARY KEY ("id"),
        CONSTRAINT "FK_orders_buyer" FOREIGN KEY ("buyer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    // Crear tabla order_items
    await queryRunner.query(`
      CREATE TABLE "order_items" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "order_id" uuid NOT NULL,
        "product_id" uuid NOT NULL,
        "quantity" integer NOT NULL,
        "unit_price" numeric(10,2) NOT NULL,
        "total_price" numeric(10,2) NOT NULL,
        CONSTRAINT "PK_order_items" PRIMARY KEY ("id"),
        CONSTRAINT "FK_order_items_order" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "FK_order_items_product" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    // Crear tabla product_categories
    await queryRunner.query(`
      CREATE TABLE "product_categories" (
        "product_id" uuid NOT NULL,
        "category_id" uuid NOT NULL,
        "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "PK_product_categories" PRIMARY KEY ("product_id", "category_id"),
        CONSTRAINT "FK_product_categories_product" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "FK_product_categories_category" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    // Crear índices para mejorar el rendimiento
    await queryRunner.query(`
      CREATE INDEX "IDX_users_role_id" ON "users" ("role_id");
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_sellers_user_id" ON "sellers" ("user_id");
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_products_seller_id" ON "products" ("seller_id");
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_products_status" ON "products" ("status");
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_files_parent" ON "files" ("parent_id", "parent_type");
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_cart_items_user_id" ON "cart_items" ("user_id");
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_cart_items_product_id" ON "cart_items" ("product_id");
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_orders_buyer_id" ON "orders" ("buyer_id");
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_orders_status" ON "orders" ("status", "payment_status");
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_order_items_order_id" ON "order_items" ("order_id");
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_order_items_product_id" ON "order_items" ("product_id");
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_product_categories_product_id" ON "product_categories" ("product_id");
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_product_categories_category_id" ON "product_categories" ("category_id");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar índices
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_product_categories_category_id";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_product_categories_product_id";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_order_items_product_id";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_order_items_order_id";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_orders_status";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_orders_buyer_id";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_cart_items_product_id";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_cart_items_user_id";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_files_parent";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_products_status";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_products_seller_id";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_sellers_user_id";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_users_role_id";`);

    // Eliminar tablas en orden inverso (respetando dependencias)
    await queryRunner.query(`DROP TABLE IF EXISTS "product_categories";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "order_items";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "orders";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "cart_items";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "files";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "products";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "categories";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "sellers";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "roles";`);

    // Eliminar enum
    await queryRunner.query(`DROP TYPE IF EXISTS "global_status_enum";`);
  }
}

