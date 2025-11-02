import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

// Cargar variables de entorno
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Shop Co API')
    .setDescription('Documentación de la API de Shop Co')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      // Colocar el tag 'auth' primero y el resto en orden alfabético
      tagsSorter: (a: string, b: string) => {
        if (a === 'auth') return -1;
        if (b === 'auth') return 1;
        return a.localeCompare(b);
      },
      operationsSorter: 'alpha',
    },
  });
  
  app.enableCors({
    origin: '*', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, 
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true, 
    transform: true,
  }));

  // Interceptor global para excluir campos marcados con @Exclude()
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  const appUrl = await app.getUrl();
  // Mostrar URLs útiles en consola
  console.log(`Servidor escuchando en: ${appUrl}`);
  console.log(`Documentación Swagger: ${appUrl}/api`);
}
bootstrap();
