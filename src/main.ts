import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { writeFileSync } from 'node:fs';
import { version } from '../package.json';
import { GlobalExceptionFilter } from '@common/exceptions/exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.setGlobalPrefix('api');
  app.use(cookieParser());
  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.useGlobalFilters(new GlobalExceptionFilter());

  // DTO 유효성 검사 및 타입 자동 변환을 위한 글로벌 ValidationPipe 설정
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // 타입 변환 활성화 (string -> number 등)
      whitelist: true, // DTO에 정의되지 않은 속성 제거
      forbidNonWhitelisted: true, // DTO에 정의되지 않은 속성이 있으면 에러 발생
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Ditto API')
    .setDescription('Start Game -> Solve Quiz -> Match Results -> Save Email -> Share (MVP)')
    .setVersion(version)
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
  const isDevelopment = configService.get('nodeEnv') === 'development';

  if (isDevelopment) {
    SwaggerModule.setup('docs', app, document);
  }

  writeFileSync('./docs/ditto-api.json', JSON.stringify(document, null, 2));

  await app.listen(port);

  console.log(`[Bootstrap] 서버가 포트 ${port}에서 실행 중입니다.`);
  if (isDevelopment) {
    console.log(`[Bootstrap] Swagger 문서: http://localhost:${port}/docs`);
  }
}
void bootstrap();
