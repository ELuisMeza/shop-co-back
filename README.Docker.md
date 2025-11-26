# Dockerización del Proyecto Shop Co

Este proyecto está dockerizado usando Docker y Docker Compose. Incluye el backend NestJS y la base de datos PostgreSQL.

## Requisitos Previos

- Docker Desktop instalado (o Docker Engine + Docker Compose)
- Git (opcional)

## Configuración Inicial

1. **Crear archivo `.env`** basado en `.env.example`:
```bash
cp .env.example .env
```

2. **Editar el archivo `.env`** con tus configuraciones:
```env
PORT=3000
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=tu_contraseña_segura
DB_NAME=shop_co
DB_SCHEMA=public
DB_LOGGING=false
JWT_SECRET=tu_secret_key_muy_segura
JWT_EXPIRES_IN=24h
```

## Uso

### Construir y ejecutar los contenedores

```bash
docker-compose up -d
```

Este comando:
- Construye la imagen del backend
- Inicia PostgreSQL
- Inicia el backend
- Ejecuta las migraciones automáticamente

### Ver los logs

```bash
# Ver todos los logs
docker-compose logs -f

# Ver solo logs del backend
docker-compose logs -f backend

# Ver solo logs de PostgreSQL
docker-compose logs -f postgres
```

### Detener los contenedores

```bash
docker-compose down
```

### Detener y eliminar volúmenes (⚠️ Esto elimina la base de datos)

```bash
docker-compose down -v
```

### Reconstruir la imagen

Si haces cambios en el código, necesitas reconstruir:

```bash
docker-compose up -d --build
```

## Acceso a los Servicios

- **Backend API**: http://localhost:3000
- **Swagger Documentation**: http://localhost:3000/api
- **PostgreSQL**: localhost:5432

## Comandos Útiles

### Ejecutar migraciones manualmente

```bash
docker-compose exec backend npm run migration:run
```

### Ejecutar seeds manualmente

```bash
# Seeds iniciales (usuarios, categorías, etc.)
docker exec -it shop_co_backend node -r ts-node/register -r tsconfig-paths/register src/seeds/initial.seed.ts

# Seeds de productos
docker exec -it shop_co_backend node -r ts-node/register -r tsconfig-paths/register src/seeds/products.seed.ts
```

### Acceder a la base de datos

```bash
docker-compose exec postgres psql -U postgres -d shop_co
```

### Acceder al shell del contenedor backend

```bash
docker-compose exec backend sh
```

### Ver el estado de los contenedores

```bash
docker-compose ps
```

## Estructura de Volúmenes

- `postgres_data`: Persiste los datos de PostgreSQL
- `./uploads`: Directorio de archivos subidos (mapeado desde el host)

## Desarrollo

Para desarrollo, puedes usar:

```bash
# Modo desarrollo (con hot-reload)
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

O ejecutar el backend localmente mientras usas la base de datos en Docker:

```bash
# Solo iniciar PostgreSQL
docker-compose up -d postgres

# Ejecutar backend localmente
npm run start:dev
```

## Solución de Problemas

### Docker Desktop no está corriendo

Si ves el error:
```
error during connect: Get "http://%2F%2F.%2Fpipe%2FdockerDesktopLinuxEngine/...": 
open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified.
```

**Solución**: Inicia Docker Desktop desde el menú de inicio de Windows. Espera a que el ícono de Docker en la bandeja del sistema muestre "Docker Desktop is running" antes de ejecutar `docker-compose up`.

### Variables de entorno con caracteres especiales

Si tu archivo `.env` contiene valores con caracteres especiales como `$` o `^` (por ejemplo, en `JWT_SECRET`), envuélvelos entre comillas dobles:

```env
# ❌ Incorrecto (causa problemas)
JWT_SECRET=x33HWFMA6eT5dHj$xjL6$GdXikjrateuJxCmxDGfYp59Y^y62n

# ✅ Correcto
JWT_SECRET="x33HWFMA6eT5dHj$xjL6$GdXikjrateuJxCmxDGfYp59Y^y62n"
```

### El backend no puede conectarse a PostgreSQL

1. Verifica que PostgreSQL esté saludable:
```bash
docker-compose ps
```

2. Verifica las variables de entorno en `.env`

3. Asegúrate de que `DB_HOST=postgres` (nombre del servicio en docker-compose)

### Las migraciones fallan

Las migraciones se ejecutan automáticamente al iniciar. Si fallan:

1. Verifica los logs:
```bash
docker-compose logs backend
```

2. Ejecuta las migraciones manualmente:
```bash
docker-compose exec backend npm run migration:run
```

### Puerto ya en uso

Si el puerto 3000 o 5432 ya está en uso, cambia los puertos en `.env`:

```env
PORT=3001
DB_PORT=5433
```

Y actualiza el mapeo en `docker-compose.yml` si es necesario.

