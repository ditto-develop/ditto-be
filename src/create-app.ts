import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';

export const createApp = async (
  forDocument: boolean = false,
): Promise<{ app: INestApplication; document: OpenAPIObject }> => {
  const app = await NestFactory.create(AppModule, forDocument ? { logger: false } : {});

  app.enableCors({
    origin: [
      'https://ditto-develop.github.io',
      /^http:\/\/localhost:\d+$/,
      /^http:\/\/127.0.0.1:\d+$/,
      'https://ditto-dev.duckdns.org',
    ],
    credentials: true,
  });

  app.use(cookieParser());
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = new DocumentBuilder()
    .setTitle('Ditto API')
    .setDescription('Start Game -> Solve Quiz -> Match Results -> Save Email -> Share (MVP)')
    .setVersion('0.1.4')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'access-token',
    )
    .addServer('http://localhost:3000')
    .addServer('http://localhost:4000')
    .addServer('https://ditto-dev.duckdns.org')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  return { app, document };
};
