import { DomainException } from '@common/exceptions/domain.exception';
import { BadRequestException } from '@common/exceptions/presentation.exception';
import {
  ArgumentsHost,
  BadRequestException as NestBadRequestException,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { ILOGGER_SERVICE_TOKEN, ILoggerService } from '@common/logging/interfaces/logger.interface';

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
 * 에러 로깅 정보 생성
 * @param exception 발생한 예외
 * @param request HTTP 요청 객체
 * @returns 로깅에 사용할 정보 객체
 */
function createErrorLogInfo(exception: unknown, request: Request) {
  const error = exception instanceof Error ? exception : new Error(String(exception));

  // 요청 정보 (민감 정보 마스킹)
  const requestInfo = {
    method: request.method,
    url: request.url,
    headers: maskSensitiveData(request.headers),
    query: request.query,
    params: request.params,
    body: maskSensitiveData(request.body),
    ip: request.ip || request.headers['x-forwarded-for'] || request.headers['x-real-ip'] || 'unknown',
  };

  // 에러 타입 판별
  let errorType = 'UnknownError';
  let errorCode = 'UNKNOWN_ERROR';
  let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;

  if (exception instanceof DomainException) {
    errorType = exception.constructor.name;
    errorCode = exception.code;
    statusCode = exception.statusCode || HttpStatus.BAD_REQUEST;
  } else if (exception instanceof NestBadRequestException) {
    errorType = 'ValidationError';
    errorCode = 'VALIDATION_ERROR';
    statusCode = HttpStatus.BAD_REQUEST;
  } else if (error.name) {
    errorType = error.name;
  }

  return {
    errorType,
    errorCode,
    statusCode,
    message: error.message,
    stack: error.stack,
    request: requestInfo,
  };
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(
    @Inject(ILOGGER_SERVICE_TOKEN) private readonly logger: ILoggerService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // 에러 로깅 정보 생성
    const errorLogInfo = createErrorLogInfo(exception, request);

    // NestJS ValidationPipe에서 던지는 BadRequestException을 도메인 예외로 변환
    if (exception instanceof NestBadRequestException) {
      const res = exception.getResponse() as any;
      const messages = Array.isArray(res?.message) ? res.message : [res?.message ?? exception.message];
      const message = messages.filter(Boolean).join(', ') || '잘못된 요청입니다.';
      exception = new BadRequestException(message);
    }

    if (exception instanceof DomainException) {
      const status = exception.statusCode || HttpStatus.BAD_REQUEST;

      // 도메인 예외 상세 로깅
      this.logger.warn('도메인 예외 발생', GlobalExceptionFilter.name, {
        errorType: errorLogInfo.errorType,
        errorCode: errorLogInfo.errorCode,
        message: errorLogInfo.message,
        statusCode: status,
        request: {
          method: errorLogInfo.request.method,
          url: errorLogInfo.request.url,
          ip: errorLogInfo.request.ip,
        },
      });

      response.status(status).json({
        success: false,
        error: {
          message: exception.message,
          code: exception.code,
          statusCode: status,
        },
        timestamp: new Date().toISOString(),
        path: request.url,
      });
      return;
    }

    const status = HttpStatus.INTERNAL_SERVER_ERROR;
    const message = exception instanceof Error ? exception.message : '알 수 없는 오류가 발생했습니다.';

    // 시스템 에러 상세 로깅 (Stack Trace 포함)
    this.logger.error('시스템 예외 발생', GlobalExceptionFilter.name, {
      errorType: errorLogInfo.errorType,
      errorCode: errorLogInfo.errorCode,
      message: errorLogInfo.message,
      stack: errorLogInfo.stack,
      request: errorLogInfo.request,
    });

    response.status(status).json({
      success: false,
      error: {
        message,
        code: 'INTERNAL_SERVER_ERROR',
        statusCode: status,
      },
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
