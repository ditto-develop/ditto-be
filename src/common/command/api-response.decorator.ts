import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';

/**
 * Command 응답을 위한 Swagger 데코레이터
 * 자동으로 CommandResult 스키마를 생성합니다.
 */
export function ApiCommandResponse<T>(
  status: number,
  description: string,
  dataType?: Type<T>,
  isArray: boolean = false,
) {
  const decorators = [];

  // 데이터 타입이 있으면 명시적으로 스키마 등록
  if (dataType) {
    decorators.push(ApiExtraModels(dataType));
  }

  decorators.push(
    ApiResponse({
      status,
      description,
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          ...(dataType && {
            data: isArray
              ? { type: 'array', items: { $ref: getSchemaPath(dataType) } }
              : { $ref: getSchemaPath(dataType) },
          }),
          error: { type: 'string', example: '에러 메시지' },
        },
      },
    }),
  );

  return applyDecorators(...decorators);
}
