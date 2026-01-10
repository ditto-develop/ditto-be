import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { writeFileSync } from 'node:fs';
import { version } from '../package.json';
import { GlobalExceptionFilter } from '@common/exceptions/exception.filter';
import { TraceIdMiddleware } from '@common/logging/middleware/trace-id.middleware';
import { HttpLoggingInterceptor } from '@common/logging/interceptors/http-logging.interceptor';
import path from 'node:path';
import fs from 'node:fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = app.get('LoggerService');

  // 커스텀 로거를 NestJS 기본 로거로 설정
  app.useLogger(logger);

  app.setGlobalPrefix('api');

  // 트레이스 ID 미들웨어 적용 (로깅 전에 적용되어야 함)
  const traceIdMiddleware = app.get(TraceIdMiddleware);
  app.use(traceIdMiddleware.use.bind(traceIdMiddleware));

  app.use(cookieParser());
  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.useGlobalFilters(app.get(GlobalExceptionFilter));

  // HTTP 로깅 Interceptor 전역 적용
  app.useGlobalInterceptors(app.get(HttpLoggingInterceptor));

  // DTO 유효성 검사 및 타입 자동 변환을 위한 글로벌 ValidationPipe 설정
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // 타입 변환 활성화 (string -> number 등)
      whitelist: true, // DTO에 정의되지 않은 속성 제거
      forbidNonWhitelisted: true, // DTO에 정의되지 않은 속성이 있으면 에러 발생
    }),
  );

  const configBuilder = new DocumentBuilder()
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
    );
  
  const isDevelopment = configService.get('nodeEnv') === 'development';
  if (isDevelopment) {
    configBuilder.addServer('http://localhost:4000');
  } else {
    configBuilder.addServer('https://ditto.pics:10000');
  }
  const config = configBuilder.build();
  const document = SwaggerModule.createDocument(app, config);

  console.log('[Bootstrap] 서버 시작 중...');
  const port = configService.get<number>('port') || 4000;

  // if (isDevelopment) {
  SwaggerModule.setup('api/docs', app, document);
  // }

  const outputDir = path.join(process.cwd(), 'docs');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  writeFileSync(path.join(outputDir, 'ditto-api.json'), JSON.stringify(document, null, 2));

  await app.listen(port);

  console.log(`[Bootstrap] 서버가 포트 ${port}에서 실행 중입니다.`);
  if (isDevelopment) {
    console.log(`[Bootstrap] Swagger 문서: http://localhost:${port}/api/docs`);
  }
}
void bootstrap();
