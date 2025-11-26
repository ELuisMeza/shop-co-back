# Etapa 1: Construcción
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY src ./src

# Construir la aplicación
RUN npm run build

# Etapa 2: Producción
FROM node:20-alpine AS production

WORKDIR /app

# Crear usuario no root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar todas las dependencias (necesarias para migraciones con ts-node)
RUN npm ci && npm cache clean --force

# Copiar el código compilado desde la etapa de construcción
COPY --from=builder /app/dist ./dist

# Copiar tsconfig y código fuente necesario para migraciones
COPY --from=builder /app/tsconfig*.json ./
COPY --from=builder /app/src ./src

# Copiar script de inicio
COPY start.sh ./
RUN chmod +x start.sh && chown nestjs:nodejs start.sh

# Crear directorio para uploads
RUN mkdir -p uploads && chown -R nestjs:nodejs uploads

# Cambiar al usuario no root
USER nestjs

# Exponer el puerto
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["./start.sh"]

