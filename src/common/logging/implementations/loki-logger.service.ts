import { Injectable, Inject } from '@nestjs/common';
import * as winston from 'winston';
import LokiTransport from 'winston-loki';
import { ILoggerService, LogLevel } from '../interfaces/logger.interface';
import { LoggerContextUtil } from '../utils/logger-context.util';

/**
 * Loki 설정 인터페이스
 */
interface LokiConfig {
  host: string;
  labels: {
    app: string;
    environment: string;
    service: string;
  };
}

/**
 * 프로덕션 환경용 Loki 로거 서비스
 * winston-loki를 사용하여 Loki로 로그를 전송합니다.
 * Production 환경에서 info 레벨부터 출력합니다.
 */
@Injectable()
export class LokiLoggerService implements ILoggerService {
  private readonly winstonLogger: winston.Logger;
  private contextName: string;

  constructor(
    @Inject('LokiConfig') private readonly lokiConfig: LokiConfig,
    context?: string,
  ) {
    this.contextName = context || 'LokiLogger';

    // Loki Transport 설정
    const lokiTransport = new LokiTransport({
      host: this.lokiConfig.host,
      labels: {
        app: this.lokiConfig.labels.app,
        environment: this.lokiConfig.labels.environment,
        service: this.lokiConfig.labels.service,
      },
      json: true,
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
      // Loki 전송 실패 시 콘솔에도 출력 (fallback)
      onConnectionError: (error) => {
        console.error('[LokiLogger] Connection error:', error);
      },
    });

    // Winston 로거 설정
    this.winstonLogger = winston.createLogger({
      level: 'info', // Production 환경에서는 info 레벨부터 출력
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
        lokiTransport,
        // 개발 중 디버깅을 위해 콘솔에도 출력 (필요시 제거 가능)
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
   * Debug 레벨 로그 기록 (Production에서는 출력되지 않음)
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
    return new LokiLoggerService(this.lokiConfig, context);
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
