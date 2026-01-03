import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Request, Response } from 'express';
import { ILOGGER_SERVICE_TOKEN, ILoggerService } from '../interfaces/logger.interface';

/**
 * 민감한 정보 마스킹 함수
 * @param obj 마스킹할 객체
 * @param sensitiveKeys 민감한 키 목록
 * @returns 마스킹된 객체
 */
function maskSensitiveData(obj: any, sensitiveKeys: string[] = []): any {
  if (!obj || typeof obj !== 'object') return obj;

  const masked = { ...obj };

  // 기본 민감 키들
  const defaultSensitiveKeys = [
    'password',
    'passwordHash',
    'token',
    'authorization',
    'accessToken',
    'refreshToken',
    'apiKey',
    'secret',
    'privateKey',
  ];

  const allSensitiveKeys = [...defaultSensitiveKeys, ...sensitiveKeys];

  for (const key of allSensitiveKeys) {
    if (key in masked) {
      masked[key] = '***';
    }
  }

  return masked;
}

/**
 * HTTP 요청/응답 로깅 Interceptor
 * 모든 HTTP 요청의 시작과 끝을 기록합니다.
 */
@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  constructor(
    @Inject(ILOGGER_SERVICE_TOKEN) private readonly logger: ILoggerService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const startTime = Date.now();
    const { method, url, ip, headers } = request;

    // 요청 정보 기록 (민감 정보 마스킹)
    const requestBody = maskSensitiveData(request.body);
    const requestInfo = {
      method,
      url,
      ip: ip || headers['x-forwarded-for'] || headers['x-real-ip'] || 'unknown',
      userAgent: headers['user-agent'] || 'unknown',
      body: requestBody,
    };

    this.logger.log('HTTP Request Started', 'HttpLoggingInterceptor', requestInfo);

    return next.handle().pipe(
      tap({
        next: (data) => {
          const duration = Date.now() - startTime;
          const statusCode = response.statusCode;

          // 응답 정보 기록
          const responseInfo = {
            method,
            url,
            statusCode,
            duration,
            responseSize: this.getResponseSize(data),
          };

          this.logger.log('HTTP Request Completed', 'HttpLoggingInterceptor', responseInfo);
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          const statusCode = error.status || 500;

          // 에러 응답 정보 기록
          const errorInfo = {
            method,
            url,
            statusCode,
            duration,
            error: error.message || 'Unknown error',
          };

          this.logger.warn('HTTP Request Failed', 'HttpLoggingInterceptor', errorInfo);
        },
      }),
    );
  }

  /**
   * 응답 데이터 크기 계산
   * @param data 응답 데이터
   * @returns 크기 (bytes)
   */
  private getResponseSize(data: any): number {
    try {
      if (typeof data === 'string') {
        return Buffer.byteLength(data, 'utf8');
      }
      if (data && typeof data === 'object') {
        const jsonString = JSON.stringify(data);
        return Buffer.byteLength(jsonString, 'utf8');
      }
      return 0;
    } catch {
      return 0;
    }
  }
}
