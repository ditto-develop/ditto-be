import { EntityNotFoundException, BusinessRuleException } from '@common/exceptions/domain.exception';

/**
 * 퀴즈를 찾을 수 없을 때 발생하는 예외
 */
export class QuizNotFoundException extends EntityNotFoundException {
  constructor(quizId?: string | number) {
    super('Quiz', quizId);
  }
}

/**
 * 퀴즈 세트에 이미 최대 개수의 퀴즈가 있을 때 발생하는 예외
 */
export class QuizSetLimitExceededException extends BusinessRuleException {
  constructor() {
    super('퀴즈 세트는 최대 12개의 퀴즈만 가질 수 있습니다.', 'QUIZ_SET_LIMIT_EXCEEDED');
  }
}

/**
 * 퀴즈 선택지가 유효하지 않을 때 발생하는 예외
 */
export class InvalidQuizChoicesException extends BusinessRuleException {
  constructor(message: string = '퀴즈 선택지가 유효하지 않습니다.') {
    super(message, 'INVALID_QUIZ_CHOICES');
  }
}

/**
 * 퀴즈 세트를 찾을 수 없을 때 발생하는 예외
 */
export class QuizSetNotFoundException extends EntityNotFoundException {
  constructor(quizSetId?: string | number) {
    super('QuizSet', quizSetId);
  }
}

/**
 * 퀴즈 선택지 순서가 유효하지 않을 때 발생하는 예외
 */
export class InvalidQuizOrderException extends BusinessRuleException {
  constructor(message: string = '선택지 순서는 1 또는 2여야 합니다.') {
    super(message, 'INVALID_QUIZ_ORDER');
  }
}

/**
 * 선택지 ID가 중복될 때 발생하는 예외
 */
export class DuplicateChoiceIdException extends BusinessRuleException {
  constructor(message: string = '선택지의 ID는 중복될 수 없습니다.') {
    super(message, 'DUPLICATE_CHOICE_ID');
  }
}

/**
 * 퀴즈 기간이 아닐 때 발생하는 예외
 */
export class QuizPeriodException extends BusinessRuleException {
  constructor(message: string = '현재는 퀴즈 풀기 기간이 아닙니다.') {
    super(message, 'QUIZ_PERIOD_ERROR');
  }
}

/**
 * 이미 완료된 퀴즈를 수정하려 할 때 발생하는 예외
 */
export class QuizCompletedException extends BusinessRuleException {
  constructor() {
    super('이미 퀴즈를 완료하여 수정할 수 없습니다.', 'QUIZ_COMPLETED_ERROR');
  }
}

/**
 * 이미 이번 주차에 다른 퀴즈 세트를 선택했을 때 발생하는 예외
 */
export class QuizSetAlreadySelectedException extends BusinessRuleException {
  constructor() {
    super('이번 주차에 이미 다른 퀴즈 세트를 선택했습니다.', 'QUIZ_SET_ALREADY_SELECTED');
  }
}

/**
 * 유효하지 않은 주차 접근 시 발생하는 예외
 */
export class InvalidWeekException extends BusinessRuleException {
  constructor() {
    super('유효하지 않은 주차 정보입니다.', 'INVALID_WEEK_ERROR');
  }
}
