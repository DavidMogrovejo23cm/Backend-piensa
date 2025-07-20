// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // CORS configurado para desarrollo
  app.enableCors({
    origin: ['http://localhost:4200', 'http://localhost:4000'], // Angular dev y SSR
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // Prefijo global para todas las rutas
  app.setGlobalPrefix('api');

  await app.listen(3000);
  console.log('Servidor corriendo en http://localhost:3000');
}
bootstrap();