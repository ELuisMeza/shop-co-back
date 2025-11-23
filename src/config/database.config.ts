import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Usar process.cwd() para obtener la raíz del proyecto (funciona tanto en desarrollo como en producción)
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Validar que las variables de entorno requeridas estén definidas
const requiredEnvVars = ['DB_HOST', 'DB_USERNAME', 'DB_PASSWORD', 'DB_NAME'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  throw new Error(`Variables de entorno faltantes: ${missingVars.join(', ')}`);
}

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST!,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,
  schema: process.env.DB_SCHEMA || 'public',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: false, // Desactivado: usar migraciones en lugar de synchronize
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  migrationsRun: false, // Las migraciones se ejecutan manualmente con npm run migration:run
  logging: process.env.DB_LOGGING === 'true',
  extra: {
    // Configuración específica para PostgreSQL
    timezone: 'UTC',
    // Forzar que las fechas se interpreten como UTC
    parseInputDatesAsUTC: true,
  },
};
