import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Usar process.cwd() para obtener la raíz del proyecto (funciona tanto en desarrollo como en producción)
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Registrar tsconfig-paths para resolver alias de rutas (src/...)
import { register } from 'tsconfig-paths';
import * as tsConfig from '../../tsconfig.json';

register({
  baseUrl: path.resolve(__dirname, '../..'),
  paths: (tsConfig as any).compilerOptions?.paths || {},
});

const dbHost = process.env.DB_HOST as string;
const dbPort = parseInt(process.env.DB_PORT || '5432', 10);
const dbUser = process.env.DB_USERNAME as string;
const dbPass = process.env.DB_PASSWORD as string;
const dbName = process.env.DB_NAME as string;
const dbSchema = process.env.DB_SCHEMA || 'public';

export default new DataSource({
  type: 'postgres',
  host: dbHost,
  port: dbPort,
  username: dbUser,
  password: dbPass,
  database: dbName,
  schema: dbSchema,
  entities: [path.resolve(__dirname, '../**/*.entity.{ts,js}')],
  migrations: [path.resolve(__dirname, '../migrations/*.{ts,js}')],
  synchronize: false,
  logging: process.env.DB_LOGGING === 'true',
});


