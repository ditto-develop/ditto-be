import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { FailApiResponse, SuccessApiResponse } from '../dtos/api-response.dto';
import { applyDecorators, HttpStatus, Type } from '@nestjs/common';
import { ApiResponseOptions } from '@nestjs/swagger/dist/decorators/api-response.decorator';

export const SwaggerApiResponse = (config?: {
  status?: HttpStatus;
  type?: Type;
  isArray?: boolean;
  errorMessage?: string;
}) => {
  const fail = !!(config?.status && config.status >= HttpStatus.BAD_REQUEST);

  const CustomApiResponse = !fail ? SuccessApiResponse : FailApiResponse;
  const extraModels = [CustomApiResponse, ...(config?.type ? [config.type] : [])];

  const errorExample: Partial<FailApiResponse> = {};
  if (fail) {
    switch (config?.status) {
      case HttpStatus.UNAUTHORIZED:
        errorExample.errorCode = 'UNAUTHORIZED';
        errorExample.errMessage = '사용자 인증 실패';
        break;
      case HttpStatus.INTERNAL_SERVER_ERROR:
        errorExample.errorCode = 'INTERNAL_SERVER_ERROR';
        errorExample.errMessage = '서버 내부 오류';
        break;
      default:
        errorExample.errorCode = 'UNKNOWN ERROR';
        errorExample.errMessage = '알 수 없는 오류';
    }
    if (config.errorMessage) {
      errorExample.errMessage = config.errorMessage;
    }
  }

  const allOf: Array<Record<string, unknown>> = [{ $ref: getSchemaPath(CustomApiResponse) }];
  if (!fail) {
    allOf.push({
      properties: {
        data: !config?.type
          ? null
          : config?.isArray
            ? { type: 'array', items: { $ref: getSchemaPath(config.type) } }
            : { $ref: getSchemaPath(config.type) },
      },
    });
  } else {
    allOf.push({
      properties: Object.fromEntries(Object.entries(errorExample).map(([key, value]) => [key, { example: value }])),
    });
  }

  const options: ApiResponseOptions = {
    status: config?.status ?? HttpStatus.OK,
    schema: {
      type: 'object',
      allOf,
    },
  };

  return applyDecorators(ApiExtraModels(...extraModels), ApiResponse(options));
};
