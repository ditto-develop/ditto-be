import { LoggerService } from '@nestjs/common';

/**
 * 로그 레벨 타입
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * 로그 엔트리 인터페이스
 */
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  context: string;
  traceId?: string;
  message: string;
  metadata?: Record<string, any>;
}

/**
 * 커스텀 로거 서비스 인터페이스
 * DIP 원칙을 적용하여 비즈니스 로직이 로깅 구현체에 직접 의존하지 않도록 함
 */
export interface ILoggerService extends LoggerService {
  /**
   * Debug 레벨 로그 기록
   * @param message 로그 메시지
   * @param context 컨텍스트 (클래스명 등)
   * @param metadata 추가 메타데이터
   */
  debug(message: string, context?: string, metadata?: Record<string, any>): void;

  /**
   * Info 레벨 로그 기록
   * @param message 로그 메시지
   * @param context 컨텍스트 (클래스명 등)
   * @param metadata 추가 메타데이터
   */
  log(message: string, context?: string, metadata?: Record<string, any>): void;

  /**
   * Warn 레벨 로그 기록
   * @param message 로그 메시지
   * @param context 컨텍스트 (클래스명 등)
   * @param metadata 추가 메타데이터
   */
  warn(message: string, context?: string, metadata?: Record<string, any>): void;

  /**
   * Error 레벨 로그 기록
   * @param message 로그 메시지
   * @param context 컨텍스트 (클래스명 등)
   * @param metadata 추가 메타데이터
   */
  error(message: string, context?: string, metadata?: Record<string, any>): void;

  /**
   * 로거 인스턴스 생성 (컨텍스트 지정)
   * @param context 컨텍스트 (클래스명 등)
   * @returns 컨텍스트가 지정된 로거 인스턴스
   */
  createChildLogger(context: string): ILoggerService;
}

/**
 * 로거 서비스 토큰
 */
export const ILOGGER_SERVICE_TOKEN = Symbol('ILoggerService');
