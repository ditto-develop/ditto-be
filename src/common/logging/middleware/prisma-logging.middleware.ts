import { PrismaClient, Prisma } from '@prisma/client';
import { ILoggerService } from '../interfaces/logger.interface';

/**
 * 느린 쿼리 임계값 (밀리초)
 */
const SLOW_QUERY_THRESHOLD = 1000;

/**
 * Prisma 쿼리 로깅 Middleware
 * 모든 데이터베이스 쿼리를 로깅하고 성능을 모니터링합니다.
 */
export function createPrismaLoggingMiddleware(
  logger: ILoggerService,
): Prisma.Middleware {
  return async (params: Prisma.MiddlewareParams, next: (params: Prisma.MiddlewareParams) => Promise<any>) => {
    const startTime = Date.now();

    try {
      // 쿼리 실행
      const result = await next(params);
      const duration = Date.now() - startTime;

      // 쿼리 정보 추출
      const { model, action, args } = params;

      // 민감한 정보 마스킹
      const maskedArgs = maskPrismaArgs(args);

      // 로깅 정보 생성
      const queryInfo = {
        model: model || 'Unknown',
        action,
        duration,
        args: maskedArgs,
        resultCount: Array.isArray(result) ? result.length : (result ? 1 : 0),
      };

      // 느린 쿼리 감지 및 warn 레벨 로깅
      if (duration >= SLOW_QUERY_THRESHOLD) {
        logger.warn('Slow Database Query Detected', 'PrismaLoggingMiddleware', queryInfo);
      } else {
        // 일반 쿼리는 info 레벨로 로깅 (개발 환경에서만 상세 로깅)
        logger.log('Database Query Executed', 'PrismaLoggingMiddleware', queryInfo);
      }

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      // 쿼리 에러 로깅
      const errorInfo = {
        model: params.model || 'Unknown',
        action: params.action,
        duration,
        error: error instanceof Error ? error.message : String(error),
        args: maskPrismaArgs(params.args),
      };

      logger.error('Database Query Failed', 'PrismaLoggingMiddleware', errorInfo);

      throw error;
    }
  };
}

/**
 * Prisma 쿼리 인자에서 민감한 정보 마스킹
 * @param args Prisma 쿼리 인자
 * @returns 마스킹된 인자
 */
function maskPrismaArgs(args: any): any {
  if (!args || typeof args !== 'object') return args;

  const masked = { ...args };

  // 민감한 필드들 마스킹
  const sensitiveFields = [
    'password',
    'passwordHash',
    'token',
    'secret',
    'privateKey',
    'apiKey',
  ];

  // data 객체 마스킹
  if (masked.data) {
    masked.data = maskObject(masked.data, sensitiveFields);
  }

  // where 조건에서 민감한 값 마스킹
  if (masked.where) {
    masked.where = maskObject(masked.where, sensitiveFields);
  }

  return masked;
}

/**
 * 객체에서 민감한 필드 마스킹
 * @param obj 대상 객체
 * @param sensitiveFields 민감한 필드 목록
 * @returns 마스킹된 객체
 */
function maskObject(obj: any, sensitiveFields: string[]): any {
  if (!obj || typeof obj !== 'object') return obj;

  const masked = { ...obj };

  for (const field of sensitiveFields) {
    if (field in masked) {
      masked[field] = '***';
    }
  }

  // 중첩 객체도 재귀적으로 처리
  for (const key in masked) {
    if (typeof masked[key] === 'object' && masked[key] !== null) {
      masked[key] = maskObject(masked[key], sensitiveFields);
    }
  }

  return masked;
}

/**
 * Prisma 클라이언트에 로깅 미들웨어 적용
 * @param prismaClient Prisma 클라이언트 인스턴스
 * @param logger 로거 서비스
 */
export function applyPrismaLoggingMiddleware(
  prismaClient: PrismaClient,
  logger: ILoggerService,
): void {
  prismaClient.$use(createPrismaLoggingMiddleware(logger));
}
