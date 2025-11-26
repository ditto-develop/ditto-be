import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { DomainException } from 'src/common/exceptions/domain.exception';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    console.log(`[GlobalExceptionFilter] 예외 발생: ${request.url}`);

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
    const message =
      exception instanceof Error
        ? exception.message
        : '알 수 없는 오류가 발생했습니다.';

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
