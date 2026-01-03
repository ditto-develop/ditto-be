import { DomainException } from './domain.exception';

/**
 * 잘못된 요청 (400)
 */
export class BadRequestException extends DomainException {
  constructor(message: string, code?: string) {
    super(message, code || 'BAD_REQUEST', 400);
  }
}

