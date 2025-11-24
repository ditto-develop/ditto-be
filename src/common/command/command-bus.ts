import { ICommand, ICommandResult } from './command.interface';
import { ICommandHandler } from './command-handler.interface';
import { Injectable, Logger } from '@nestjs/common';

/**
 * CommandBus
 * Command를 적절한 핸들러로 라우팅하고 실행합니다.
 */
@Injectable()
export class CommandBus {
  private readonly logger = new Logger(CommandBus.name);
  private readonly handlers = new Map<
    string,
    ICommandHandler<ICommand, unknown>
  >();

  /**
   * Command 핸들러를 등록합니다.
   * @param commandType Command 클래스 이름
   * @param handler Command 핸들러 인스턴스
   */
  registerHandler(
    commandType: string,
    handler: ICommandHandler<ICommand, unknown>,
  ): void {
    console.log(`[CommandBus] 핸들러 등록: ${commandType}`);
    this.handlers.set(commandType, handler);
  }

  /**
   * Command를 실행합니다.
   * @param command 실행할 Command
   * @returns Command 처리 결과
   */
  async execute<TResult = unknown>(
    command: ICommand,
  ): Promise<ICommandResult<TResult>> {
    const commandType = command.constructor.name;
    console.log(`[CommandBus] Command 실행 시작: ${commandType}`);

    const handler = this.handlers.get(commandType);

    if (!handler) {
      const error = `핸들러를 찾을 수 없습니다. ${commandType}`;
      this.logger.error(error);
      console.error(`[CommandBus] ${error}`);
      return {
        success: false,
        error,
      };
    }

    try {
      const result = await handler.execute(command);
      console.log(`[CommandBus] Command 실행 완료: ${commandType}`, {
        success: result.success,
      });
      return result as ICommandResult<TResult>;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : '알 수 없는 오류가 발생했습니다.';
      this.logger.error(`Command 실행 중 오류 발생: ${commandType}`, error);
      console.error(
        `[CommandBus] Command 실행 중 오류 발생: ${commandType}`,
        errorMessage,
      );
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * 등록된 핸들러 목록을 반환
   */
  getRegisteredHandlers(): string[] {
    return Array.from(this.handlers.keys());
  }
}
