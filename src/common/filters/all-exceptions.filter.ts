import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Response, Request } from 'express';
import { isApiResponse, isHttpErrorBody } from '../typeguards/http.type-guard';
import { isArray, isString } from '../typeguards/common.type-guard';
import { ApiResponse } from '../dtos/api-response.dto';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const excResponse = exception.getResponse();

      if (isApiResponse(excResponse)) {
        res.status(status).jsonp(excResponse);
        return;
      }

      let message: string | undefined;
      let errorCode: string | undefined;

      if (isHttpErrorBody(excResponse)) {
        if (isArray(excResponse.message)) {
          message = excResponse.message.join('; ');
        } else {
          message = excResponse.message;
        }
        errorCode = excResponse.code;
      } else if (isString(excResponse)) {
        message = excResponse;
      } else {
        message = exception.message;
      }

      res.status(status).json(
        new ApiResponse({
          success: false,
          message: message ?? 'Bad Request',
          errorCode,
          data: null,
        }),
      );

      return;
    }

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      new ApiResponse({
        success: false,
        message: 'Internal server error',
        errorCode: 'INTERNAL_SERVER_ERROR',
        data: null,
      }),
    );
  }
}
