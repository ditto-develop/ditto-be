/**
 * 도메인 예외 기본 클래스
 */
export class DomainException extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly statusCode: number = 400,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 엔티티를 찾을 수 없을 때 발생하는 예외
 */
export class EntityNotFoundException extends DomainException {
  constructor(entityName: string, identifier?: string | number) {
    const message = identifier
      ? `${entityName}을(를) 찾을 수 없습니다. (ID: ${identifier})`
      : `${entityName}을(를) 찾을 수 없습니다.`;
    super(message, 'ENTITY_NOT_FOUND', 404);
  }
}

/**
 * 비즈니스 규칙 위반 시 발생하는 예외
 */
export class BusinessRuleException extends DomainException {
  constructor(message: string, code?: string) {
    super(message, code || 'BUSINESS_RULE_VIOLATION', 400);
  }
}

/**
 * 유효성 검증 실패 시 발생하는 예외
 */
export class ValidationException extends DomainException {
  constructor(
    message: string,
    public readonly errors?: Record<string, string[]>,
  ) {
    super(message, 'VALIDATION_ERROR', 400);
  }
}
