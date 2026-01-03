import { DomainException } from '@common/exceptions/domain.exception';
import { BadRequestException } from '@common/exceptions/presentation.exception';
import {
  ArgumentsHost,
  BadRequestException as NestBadRequestException,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    console.log(`[GlobalExceptionFilter] 예외 발생: ${request.url}`);

    // NestJS ValidationPipe에서 던지는 BadRequestException을 도메인 예외로 변환
    if (exception instanceof NestBadRequestException) {
      const res = exception.getResponse() as any;
      const messages = Array.isArray(res?.message) ? res.message : [res?.message ?? exception.message];
      const message = messages.filter(Boolean).join(', ') || '잘못된 요청입니다.';
      exception = new BadRequestException(message);
    }

    if (exception instanceof DomainException) {
      const status = exception.statusCode || HttpStatus.BAD_REQUEST;
      console.error(`[GlobalExceptionFilter] 도메인 예외:`, {
        message: exception.message,
        code: exception.code,
        statusCode: status,
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

    this.logger.error('예상치 못한 예외 발생:', exception);
    console.error(`[GlobalExceptionFilter] 예상치 못한 예외:`, message);

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
