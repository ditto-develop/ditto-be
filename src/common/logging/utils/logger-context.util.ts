import { AsyncLocalStorage } from 'async_hooks';

/**
 * 로깅 컨텍스트 데이터
 */
interface LoggingContext {
  traceId: string;
}

/**
 * 로깅 컨텍스트 유틸리티
 * AsyncLocalStorage를 사용하여 트레이스 ID를 관리합니다.
 * HTTP 요청별로 트레이스 ID를 유지하고 모든 로그에 포함시킵니다.
 */
export class LoggerContextUtil {
  private static readonly asyncLocalStorage = new AsyncLocalStorage<LoggingContext>();

  /**
   * 현재 컨텍스트의 트레이스 ID를 반환합니다.
   * 컨텍스트가 없거나 트레이스 ID가 설정되지 않은 경우 undefined를 반환합니다.
   */
  static getTraceId(): string | undefined {
    const context = this.asyncLocalStorage.getStore();
    return context?.traceId;
  }

  /**
   * 현재 컨텍스트에 트레이스 ID를 설정합니다.
   * @param traceId 설정할 트레이스 ID
   */
  static setTraceId(traceId: string): void {
    const context = this.asyncLocalStorage.getStore();
    if (context) {
      context.traceId = traceId;
    }
  }

  /**
   * 컨텍스트를 생성하고 트레이스 ID를 설정한 후 함수를 실행합니다.
   * @param traceId 트레이스 ID
   * @param fn 실행할 함수
   * @returns 함수의 실행 결과
   */
  static async runWithContext<T>(
    traceId: string,
    fn: () => T | Promise<T>,
  ): Promise<T> {
    const context: LoggingContext = { traceId };
    return this.asyncLocalStorage.run(context, async () => {
      return await fn();
    });
  }

  /**
   * 현재 컨텍스트가 존재하는지 확인합니다.
   */
  static hasContext(): boolean {
    return this.asyncLocalStorage.getStore() !== undefined;
  }

  /**
   * 현재 컨텍스트의 모든 데이터를 반환합니다.
   */
  static getContext(): LoggingContext | undefined {
    return this.asyncLocalStorage.getStore();
  }
}
