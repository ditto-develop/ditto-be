import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { LoggerContextUtil } from '../utils/logger-context.util';

/**
 * 트레이스 ID 헤더 이름
 */
const TRACE_ID_HEADER = 'x-trace-id';

/**
 * 트레이스 ID 미들웨어
 * HTTP 요청마다 트레이스 ID를 생성하거나 헤더에서 추출하여
 * AsyncLocalStorage 컨텍스트에 저장합니다.
 * 이를 통해 동일 요청 내에서 발생하는 모든 로그에 동일한 트레이스 ID가 포함됩니다.
 */
@Injectable()
export class TraceIdMiddleware implements NestMiddleware {
  /**
   * 미들웨어 실행
   * @param req Express Request 객체
   * @param res Express Response 객체
   * @param next 다음 미들웨어 호출 함수
   */
  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    // 요청 헤더에서 트레이스 ID 추출, 없으면 UUID 생성
    const traceId = req.headers[TRACE_ID_HEADER] as string || randomUUID();

    // 응답 헤더에 트레이스 ID 추가 (클라이언트가 확인할 수 있도록)
    res.setHeader(TRACE_ID_HEADER, traceId);

    // 트레이스 ID를 컨텍스트에 저장하고 다음 미들웨어 실행
    await LoggerContextUtil.runWithContext(traceId, () => {
      return new Promise<void>((resolve, reject) => {
        // Express의 next 함수를 Promise로 래핑
        try {
          next();
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  }
}
