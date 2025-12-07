import { CommandBus } from '@common/command/command-bus';
import { COMMAND_HANDLER_METADATA } from '@common/command/command-handler.decorator';
import { ICommandHandler } from '@common/command/command-handler.interface';
import { ICommand } from '@common/command/command.interface';

/**
 * 핸들러 등록 정보 타입
 */
export interface HAndlerRegistration {
  handler: ICommandHandler<ICommand, unknown>;
  class: new (...args: any[]) => ICommandHandler<ICommand, unknown>;
}

/**
 * Command 핸들러들을 CommandBus에 등록합니다.
 * @param commandBus CommandBus 인스턴스
 * @param handlers 등록할 핸들러 정보 배열
 * @param moduleName 모듈 이름
 */
export const registerCommandHandlers = (
  commandBus: CommandBus,
  handlers: HAndlerRegistration[],
  moduleName: string,
) => {
  console.log(`[${moduleName}] 핸들러 등록 시작`);

  handlers.forEach(({ handler, class: handlerClass }) => {
    const commandType = Reflect.getMetadata(COMMAND_HANDLER_METADATA, handlerClass);
    if (commandType) {
      const commandName = commandType.name;
      commandBus.registerHandler(commandName, handler);
      console.log(`[${moduleName}] 핸들러 등록: ${handlerClass.name} -> ${commandName}`);
    }
  });
  console.log(`[${moduleName}] 핸들러 등록 완료`);
};
