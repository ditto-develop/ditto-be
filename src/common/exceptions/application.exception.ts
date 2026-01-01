import { DomainException } from './domain.exception';

/**
 * 인증 실패 (401)
 */
export class UnauthorizedException extends DomainException {
  constructor(message: string, code?: string) {
    super(message, code || 'UNAUTHORIZED', 401);
  }
}

/**
 * 인가 실패 (403)
 */
export class ForbiddenException extends DomainException {
  constructor(message: string, code?: string) {
    super(message, code || 'FORBIDDEN', 403);
  }
}

