## Descripción

Backend de **Shop Co**, una aplicación de comercio electrónico desarrollada con [NestJS](https://nestjs.com/) y TypeScript. Este proyecto proporciona una API RESTful completa para gestionar usuarios, productos, categorías, vendedores, carritos de compra, órdenes y pagos a través de PayPal.

## Características

- 🔐 Autenticación JWT
- 👥 Gestión de usuarios con roles (buyer, seller, admin)
- 🏪 Gestión de vendedores y tiendas
- 📦 Gestión de productos y categorías
- 🛒 Carrito de compras
- 💳 Procesamiento de pagos con PayPal
- 📄 Gestión de archivos e imágenes
- 📊 Migraciones de base de datos con TypeORM
- 🌱 Seeds para datos iniciales
- 📚 Documentación Swagger/OpenAPI

## 🐳 Docker

Si prefieres ejecutar el proyecto con Docker, consulta la documentación específica en [README.Docker.md](./README.Docker.md).

## Requisitos Previos

- Node.js (v18 o superior)
- PostgreSQL (v12 o superior)
- npm o yarn

## Configuración del Proyecto

### 1. Instalación de Dependencias

```bash
npm install
```

### 2. Variables de Entorno

Copia el archivo `.env.example` y crea un archivo `.env` en la raíz del proyecto:

```bash
cp .env.example .env
```

Luego, configura las siguientes variables de entorno en el archivo `.env`:

```env
# JWT
JWT_SECRET=tu_llave_secreta

# Servidor
PORT=3000

# Base de Datos PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=contraseña_bd
DB_NAME=nombre_de_tu_bd
DB_SCHEMA=public
DB_LOGGING=false

# PayPal
PAYPAL_CLIENT_ID=cliente_paypal
PAYPAL_CLIENT_SECRET=secreto_paypal
PAYPAL_MODE=sandbox

# Frontend
FRONTEND_URL=la_ruta_de_tu_front
```

#### Descripción de Variables de Entorno

| Variable | Descripción | Requerida | Valor por Defecto |
|----------|-------------|-----------|-------------------|
| `JWT_SECRET` | Clave secreta para firmar tokens JWT | ✅ | - |
| `PORT` | Puerto en el que se ejecutará el servidor | ❌ | 3000 |
| `DB_HOST` | Host de la base de datos PostgreSQL | ✅ | - |
| `DB_PORT` | Puerto de la base de datos PostgreSQL | ❌ | 5432 |
| `DB_USERNAME` | Usuario de la base de datos | ✅ | - |
| `DB_PASSWORD` | Contraseña de la base de datos | ✅ | - |
| `DB_NAME` | Nombre de la base de datos | ✅ | - |
| `DB_SCHEMA` | Esquema de la base de datos | ❌ | public |
| `DB_LOGGING` | Habilitar logging de consultas SQL | ❌ | false |
| `PAYPAL_CLIENT_ID` | ID de cliente de PayPal | ✅ | - |
| `PAYPAL_CLIENT_SECRET` | Secreto de cliente de PayPal | ✅ | - |
| `PAYPAL_MODE` | Modo de PayPal (sandbox/live) | ❌ | sandbox |
| `FRONTEND_URL` | URL del frontend para CORS y redirecciones | ❌ | http://localhost:3000 |

### 3. Crear la Base de Datos

Crea una base de datos PostgreSQL:

```sql
CREATE DATABASE nombre_de_tu_bd;
```

## Estructura del Proyecto

```
back/
├── src/
│   ├── config/              # Configuración de base de datos
│   │   ├── database.config.ts
│   │   └── typeorm-datasource.ts
│   ├── globals/             # Enums y tipos globales
│   │   └── enums/
│   ├── interceptors/        # Interceptores
│   │   └── file-upload.interceptor.ts
│   ├── migrations/          # Migraciones de base de datos
│   │   └── 1734968400000-CreateInitialSchema.ts
│   ├── modules/             # Módulos de la aplicación
│   │   ├── auth/           # Autenticación y autorización
│   │   ├── users/          # Gestión de usuarios
│   │   ├── roles/         # Roles de usuario
│   │   ├── sellers/       # Vendedores y tiendas
│   │   ├── products/      # Productos
│   │   ├── categories/    # Categorías
│   │   ├── product-categories/  # Relación productos-categorías
│   │   ├── cart_items/    # Items del carrito
│   │   ├── orders/        # Órdenes
│   │   ├── order_items/   # Items de órdenes
│   │   ├── files/         # Gestión de archivos
│   │   └── paypal/        # Integración con PayPal
│   ├── seeds/              # Seeds para datos iniciales
│   │   ├── initial.seed.ts
│   │   └── products.seed.ts
│   ├── storage/           # Servicio de almacenamiento
│   ├── app.module.ts      # Módulo principal
│   └── main.ts            # Punto de entrada
├── uploads/               # Archivos subidos (imágenes, etc.)
├── test/                 # Tests e2e
├── .env.example          # Ejemplo de variables de entorno
├── package.json
└── README.md
```

## Migraciones

El proyecto utiliza TypeORM para gestionar las migraciones de base de datos. Las migraciones están deshabilitadas automáticamente (`synchronize: false`) para mayor control.

### Ejecutar Migraciones

```bash
# Ejecutar todas las migraciones pendientes
npm run migration:run

# Revertir la última migración
npm run migration:revert

# Ver el estado de las migraciones
npm run migration:show
```

### Crear una Nueva Migración

```bash
# Generar migración automáticamente basada en cambios en entidades
npm run migration:generate src/migrations/NombreDeLaMigracion

# Crear un archivo de migración vacío
npm run migration:create src/migrations/NombreDeLaMigracion
```

**Nota:** Las migraciones se generan automáticamente basándose en los cambios detectados en las entidades. Asegúrate de revisar el código generado antes de ejecutarlo.

## Seeds

Los seeds permiten poblar la base de datos con datos iniciales para desarrollo y testing.

### Seed Inicial

Crea roles, usuarios de prueba, vendedores y categorías:

```bash
npm run seed:initial
```

Este seed crea:
- **Roles:** buyer, seller, admin
- **Usuarios de prueba:**
  - `buyer@example.com` (password: `password123`)
  - `seller1@example.com` (password: `password123`)
  - `seller2@example.com` (password: `password123`)
- **Vendedores:** 2 tiendas de ejemplo
- **Categorías:** 9 categorías predefinidas

### Seed de Productos

Crea productos de ejemplo con imágenes (requiere que existan sellers):

```bash
npm run seed:products
```

Este seed crea:
- Más de 100 productos de ejemplo
- Imágenes asociadas a cada producto
- Asignación automática de categorías basada en el nombre del producto

**Importante:** Ejecuta primero `seed:initial` para crear los sellers necesarios.

## Compilar y Ejecutar el Proyecto

```bash
# Modo desarrollo (con hot-reload)
npm run start:dev

# Modo desarrollo estándar
npm run start

# Modo producción
npm run build
npm run start:prod

# Modo debug
npm run start:debug
```

## Documentación de la API

Una vez que el servidor esté ejecutándose, puedes acceder a la documentación Swagger en:

```
http://localhost:3000/api
```

La documentación incluye:
- Todos los endpoints disponibles
- Esquemas de request/response
- Autenticación Bearer Token
- Ejemplos de uso

## Ejecutar Tests

```bash
# Tests unitarios
npm run test

# Tests en modo watch
npm run test:watch

# Tests e2e
npm run test:e2e

# Cobertura de código
npm run test:cov

# Debug de tests
npm run test:debug
```

## Despliegue

### Preparación para Producción

1. **Configurar variables de entorno de producción:**
   - Asegúrate de tener todas las variables de entorno configuradas
   - Usa valores seguros para `JWT_SECRET`
   - Configura `PAYPAL_MODE=live` para pagos reales
   - Establece `DB_LOGGING=false` en producción

2. **Compilar el proyecto:**
   ```bash
   npm run build
   ```

3. **Ejecutar migraciones:**
   ```bash
   npm run migration:run
   ```

4. **Ejecutar seeds (opcional):**
   ```bash
   npm run seed:initial
   ```

## Comandos Útiles

```bash
# Formatear código
npm run format

# Linter
npm run lint

# Ver estado de migraciones
npm run migration:show

# Revertir última migración
npm run migration:revert
```

## Recursos

- [Documentación de NestJS](https://docs.nestjs.com)
- [Documentación de TypeORM](https://typeorm.io)
- [Documentación de Swagger](https://swagger.io/docs)

## Licencia

Este proyecto es privado y no está licenciado para uso público.
