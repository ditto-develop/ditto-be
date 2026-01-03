import { Module, Global, DynamicModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ConsoleLoggerService } from './implementations/console-logger.service';
import { LokiLoggerService } from './implementations/loki-logger.service';
import { ILOGGER_SERVICE_TOKEN, ILoggerService } from './interfaces/logger.interface';
import { GlobalExceptionFilter } from '@common/exceptions/exception.filter';
import { HttpLoggingInterceptor } from './interceptors/http-logging.interceptor';
import { TraceIdMiddleware } from './middleware/trace-id.middleware';

/**
 * 로깅 모듈
 * 환경별로 적절한 로거 구현체를 ILoggerService 토큰에 주입합니다.
 */
@Global()
@Module({})
export class LoggingModule {
  /**
   * 로깅 모듈을 동적으로 생성합니다.
   * NODE_ENV에 따라 ConsoleLogger 또는 LokiLogger를 선택합니다.
   */
  static forRoot(): DynamicModule {
    return {
      module: LoggingModule,
      imports: [ConfigModule],
      providers: [
        {
          provide: ILOGGER_SERVICE_TOKEN,
          useFactory: (configService: ConfigService): ILoggerService => {
            const nodeEnv = configService.get<string>('nodeEnv', 'development');
            const isProduction = nodeEnv === 'production';

            if (isProduction) {
              // Production 환경: LokiLogger 사용
              const lokiHost = configService.get<string>('loki.host');
              if (!lokiHost) {
                throw new Error('LOKI_HOST 환경변수가 설정되지 않았습니다.');
              }

              const lokiConfig = {
                host: lokiHost,
                labels: {
                  app: configService.get<string>('loki.labels.app', 'ditto-be'),
                  environment: nodeEnv,
                  service: configService.get<string>('loki.labels.service', 'api'),
                },
              };

              return new LokiLoggerService(lokiConfig);
            } else {
              // Development 환경: ConsoleLogger 사용
              return new ConsoleLoggerService();
            }
          },
          inject: [ConfigService],
        },
        // LoggerService 토큰도 동일한 인스턴스로 제공 (NestJS 호환성)
        {
          provide: 'LoggerService',
          useFactory: (logger: ILoggerService) => logger,
          inject: [ILOGGER_SERVICE_TOKEN],
        },
        // GlobalExceptionFilter, HttpLoggingInterceptor, TraceIdMiddleware를 providers에 등록
        GlobalExceptionFilter,
        HttpLoggingInterceptor,
        TraceIdMiddleware,
      ],
      exports: [ILOGGER_SERVICE_TOKEN, 'LoggerService', GlobalExceptionFilter, HttpLoggingInterceptor, TraceIdMiddleware],
    };
  }
}
