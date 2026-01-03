import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

/**
 * 401 Unauthorized 에러 응답을 위한 Swagger 데코레이터
 */
export function ApiUnauthorizedResponse(description: string = '인증이 필요합니다.') {
  return ApiResponse({
    status: 401,
    description,
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        error: {
          type: 'object',
          properties: {
            message: { type: 'string', example: description },
            code: { type: 'string', example: 'UNAUTHORIZED' },
            statusCode: { type: 'number', example: 401 },
          },
        },
        timestamp: { type: 'string', format: 'date-time' },
        path: { type: 'string', example: '/api/endpoint' },
      },
    },
  });
}

/**
 * 404 Not Found 에러 응답을 위한 Swagger 데코레이터
 */
export function ApiNotFoundResponse(description: string = '리소스를 찾을 수 없습니다.') {
  return ApiResponse({
    status: 404,
    description,
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        error: {
          type: 'object',
          properties: {
            message: { type: 'string', example: description },
            code: { type: 'string', example: 'ENTITY_NOT_FOUND' },
            statusCode: { type: 'number', example: 404 },
          },
        },
        timestamp: { type: 'string', format: 'date-time' },
        path: { type: 'string', example: '/api/endpoint' },
      },
    },
  });
}

/**
 * 204 No Content 응답을 위한 Swagger 데코레이터
 */
export function ApiNoContentResponse(description: string = '성공적으로 처리되었습니다.') {
  return ApiResponse({
    status: 204,
    description,
  });
}

/**
 * 공통 에러 응답을 위한 Swagger 데코레이터
 * 모든 컨트롤러에서 발생할 수 있는 일반적인 에러 응답들을 정의합니다.
 */
export function ApiCommonErrorResponses() {
  return applyDecorators(
    // 400 Bad Request - 유효성 검증 실패, 비즈니스 규칙 위반
    ApiResponse({
      status: 400,
      description: '잘못된 요청입니다.',
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: {
            type: 'object',
            properties: {
              message: { type: 'string', example: '잘못된 요청입니다.' },
              code: { type: 'string', example: 'BAD_REQUEST' },
              statusCode: { type: 'number', example: 400 },
            },
          },
          timestamp: { type: 'string', format: 'date-time' },
          path: { type: 'string', example: '/api/endpoint' },
        },
      },
    }),

    // 401 Unauthorized - 인증 실패
    ApiResponse({
      status: 401,
      description: '인증이 필요합니다.',
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: {
            type: 'object',
            properties: {
              message: { type: 'string', example: '토큰이 제공되지 않았습니다.' },
              code: { type: 'string', example: 'UNAUTHORIZED' },
              statusCode: { type: 'number', example: 401 },
            },
          },
          timestamp: { type: 'string', format: 'date-time' },
          path: { type: 'string', example: '/api/endpoint' },
        },
      },
    }),

    // 403 Forbidden - 권한 부족
    ApiResponse({
      status: 403,
      description: '접근 권한이 없습니다.',
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: {
            type: 'object',
            properties: {
              message: { type: 'string', example: '접근 권한이 없습니다.' },
              code: { type: 'string', example: 'FORBIDDEN' },
              statusCode: { type: 'number', example: 403 },
            },
          },
          timestamp: { type: 'string', format: 'date-time' },
          path: { type: 'string', example: '/api/endpoint' },
        },
      },
    }),

    // 500 Internal Server Error - 서버 내부 오류
    ApiResponse({
      status: 500,
      description: '서버 내부 오류가 발생했습니다.',
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: {
            type: 'object',
            properties: {
              message: { type: 'string', example: '알 수 없는 오류가 발생했습니다.' },
              code: { type: 'string', example: 'INTERNAL_SERVER_ERROR' },
              statusCode: { type: 'number', example: 500 },
            },
          },
          timestamp: { type: 'string', format: 'date-time' },
          path: { type: 'string', example: '/api/endpoint' },
        },
      },
    }),
  );
}
