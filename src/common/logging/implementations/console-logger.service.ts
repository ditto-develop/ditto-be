import { Injectable } from '@nestjs/common';
import * as winston from 'winston';
import { ILoggerService, LogLevel } from '../interfaces/logger.interface';
import { LoggerContextUtil } from '../utils/logger-context.util';

/**
 * 개발 환경용 콘솔 로거 서비스
 * Winston을 사용하여 JSON 포맷의 로그를 콘솔에 출력합니다.
 * Development 환경에서 debug 레벨까지 출력합니다.
 */
@Injectable()
export class ConsoleLoggerService implements ILoggerService {
  private readonly winstonLogger: winston.Logger;
  private contextName: string;

  constructor(context?: string) {
    this.contextName = context || 'ConsoleLogger';

    // Winston 로거 설정
    this.winstonLogger = winston.createLogger({
      level: 'debug', // Development 환경에서는 debug 레벨까지 출력
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss.SSS',
        }),
        winston.format.errors({ stack: true }),
        winston.format.json(),
        // 커스텀 포맷: 트레이스 ID와 컨텍스트 추가
        winston.format((info) => {
          info.traceId = LoggerContextUtil.getTraceId();
          info.context = this.contextName;
          return info;
        })(),
      ),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize({ all: true }),
            winston.format.printf(({ timestamp, level, message, context, traceId, ...meta }) => {
              const traceInfo = traceId ? `[${traceId}] ` : '';
              const contextInfo = context ? `[${context}] ` : '';
              const metaInfo = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
              return `${timestamp} ${level} ${traceInfo}${contextInfo}${message}${metaInfo}`;
            }),
          ),
        }),
      ],
    });
  }

  /**
   * Debug 레벨 로그 기록
   */
  debug(message: string, context?: string, metadata?: Record<string, any>): void {
    this.logWithLevel('debug', message, context, metadata);
  }

  /**
   * Info 레벨 로그 기록 (LoggerService 호환성)
   */
  log(message: string, context?: string, metadata?: Record<string, any>): void {
    this.logWithLevel('info', message, context, metadata);
  }

  /**
   * Warn 레벨 로그 기록
   */
  warn(message: string, context?: string, metadata?: Record<string, any>): void {
    this.logWithLevel('warn', message, context, metadata);
  }

  /**
   * Error 레벨 로그 기록 (LoggerService 호환성)
   */
  error(message: string, context?: string, metadata?: Record<string, any>): void {
    this.logWithLevel('error', message, context, metadata);
  }

  /**
   * Verbose 레벨 로그 기록 (LoggerService 호환성)
   */
  verbose?(message: string, context?: string, metadata?: Record<string, any>): void {
    this.logWithLevel('debug', message, context, metadata);
  }

  /**
   * 로거 인스턴스 생성 (컨텍스트 지정)
   */
  createChildLogger(context: string): ILoggerService {
    return new ConsoleLoggerService(context);
  }

  /**
   * 지정된 레벨로 로그 기록
   */
  private logWithLevel(
    level: LogLevel,
    message: string,
    context?: string,
    metadata?: Record<string, any>,
  ): void {
    const logContext = context || this.contextName;

    // Winston의 log 메서드 사용
    this.winstonLogger.log(level, message, {
      context: logContext,
      ...(metadata && { metadata }),
    });
  }
}
