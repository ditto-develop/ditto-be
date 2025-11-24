import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { writeFileSync } from 'node:fs';
import { version } from '../package.json';
import { GlobalExceptionFilter } from 'src/exceptions/exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.setGlobalPrefix('api');
  app.enableCors();

  app.useGlobalFilters(new GlobalExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('Ditto API')
    .setDescription(
      'Start Game -> Solve Quiz -> Match Results -> Save Email -> Share (MVP)',
    )
    .setVersion(version as string)
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'access-token',
    )
    .addServer('http://localhost:4000')
    .addServer('https://www.ditto.pics')
    .build();
  const document = SwaggerModule.createDocument(app, config);

  console.log('[Bootstrap] 서버 시작 중...');
  const port = configService.get<number>('port') || 4000;
  await app.listen(process.env.PORT);

  if (configService.get('nodeEnv') === 'development') {
    SwaggerModule.setup('docs', app, document);
  }

  writeFileSync('./docs/ditto-api.json', JSON.stringify(document, null, 2));
  console.log(`[Bootstrap] 서버가 포트 ${port}에서 실행 중입니다.`);
  console.log(`[Bootstrap] Swagger 문서: http://localhost:${port}/api/docs`);
}
void bootstrap();
