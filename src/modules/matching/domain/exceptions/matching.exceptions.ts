import { EntityNotFoundException, BusinessRuleException } from '@common/exceptions/domain.exception';

/**
 * 매칭 기회를 찾을 수 없을 때 발생하는 예외
 */
export class MatchingOpportunityNotFoundException extends EntityNotFoundException {
  constructor(identifier?: string | number) {
    super('매칭 기회', identifier);
  }
}

/**
 * 매칭 기록을 찾을 수 없을 때 발생하는 예외
 */
export class MatchingRecordNotFoundException extends EntityNotFoundException {
  constructor(identifier?: string | number) {
    super('매칭 기록', identifier);
  }
}

/**
 * 한 주차에 이미 매칭을 선택한 경우 발생하는 예외
 */
export class MatchingAlreadySelectedException extends BusinessRuleException {
  constructor() {
    super('이번 주차에 이미 매칭을 선택했습니다. 한 주차에 한 명만 선택할 수 있습니다.', 'MATCHING_ALREADY_SELECTED');
  }
}

/**
 * 매칭 알고리즘이 이미 실행된 경우 발생하는 예외
 */
export class MatchingAlgorithmAlreadyExecutedException extends BusinessRuleException {
  constructor(quizSetId: string) {
    super(`퀴즈 세트 ${quizSetId}에 대한 매칭 알고리즘이 이미 실행되었습니다.`, 'MATCHING_ALGORITHM_ALREADY_EXECUTED');
  }
}

/**
 * 이성 매칭 제약 위반 시 발생하는 예외
 */
export class OppositeGenderRequiredException extends BusinessRuleException {
  constructor() {
    super('매칭은 이성 간에만 가능합니다.', 'OPPOSITE_GENDER_REQUIRED');
  }
}

/**
 * 매칭 알고리즘 실행 중일 때 발생하는 예외
 */
export class MatchingAlgorithmInProgressException extends BusinessRuleException {
  constructor(quizSetId: string) {
    super(`퀴즈 세트 ${quizSetId}에 대한 매칭 알고리즘이 현재 실행 중입니다.`, 'MATCHING_ALGORITHM_IN_PROGRESS');
  }
}

/**
 * 매칭 알고리즘 재실행 불가 상태 예외
 */
export class MatchingAlgorithmRetryException extends BusinessRuleException {
  constructor(currentStatus: string | null) {
    let message: string;

    if (currentStatus === null) {
      message = '재실행할 수 없습니다. 아직 실행한 적이 없습니다.';
    } else if (currentStatus === 'processing') {
      message = '재실행할 수 없습니다. 현재 실행 중입니다.';
    } else if (currentStatus === 'completed') {
      message = '재실행할 수 없습니다. 이미 완료되었습니다.';
    } else {
      message = `재실행할 수 없습니다. 현재 상태: ${currentStatus}`;
    }

    super(message, 'MATCHING_ALGORITHM_RETRY_INVALID_STATUS');
  }
}