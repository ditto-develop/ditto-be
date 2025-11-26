import { ICommand, ICommandResult } from 'src/common/command/command.interface';

/**
 * Command Handler 인터페이스
 * 각 Command에 대한 핸들러는 이 인터페이스를 구현해야 합니다.
 */
export interface ICommandHandler<TCommand extends ICommand, TResult = unknown> {
  /**
   * Command를 처리합니다.
   * @param command 처리할 Command
   * @returns Command 처리 결과
   */
  execute(command: TCommand): Promise<ICommandResult<TResult>>;
}
