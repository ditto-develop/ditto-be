import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';

export const createApp = async (
  forDocument: boolean = false,
): Promise<{ app: INestApplication; document: OpenAPIObject }> => {
  const app = await NestFactory.create(AppModule, forDocument ? { logger: false } : {});

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = new DocumentBuilder()
    .setTitle('Ditto API')
    .setDescription('Start Game -> Solve Quiz -> Match Results -> Save Email -> Share (MVP)')
    .setVersion('0.1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  return { app, document };
};
