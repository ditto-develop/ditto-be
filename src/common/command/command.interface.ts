/**
 * Command 인터페이스
 * 모든 Command는 이 인터페이스를 구현해야 함
 */
export interface ICommand {
  /**
   * Command의 고유 식별자
   */
  readonly commandId?: string;
}

/**
 * Command 결과 인터페이스
 */
export interface ICommandResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
