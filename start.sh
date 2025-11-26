#!/bin/sh

echo "Esperando a que PostgreSQL esté listo..."
sleep 5

echo "Ejecutando migraciones..."
node -r ts-node/register -r tsconfig-paths/register ./node_modules/typeorm/cli.js migration:run -d src/config/typeorm-datasource.ts || echo "Advertencia: Error al ejecutar migraciones (puede que ya estén aplicadas)"

echo "Iniciando aplicación..."
node dist/src/main.js

