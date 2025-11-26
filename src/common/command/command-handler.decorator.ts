import { SetMetadata } from '@nestjs/common';
import { ICommand } from 'src/common/command/command.interface';

/**
 * CommandHandler 데코레이터 메타데이터 키
 */
export const COMMAND_HANDLER_METADATA = 'COMMAND_HANDLER_METADATA';

/**
 * CommandHandler 데코레이터
 * Command 핸들러 클래스에 사용하여 Command 타입을 지정합니다.
 * @param commandType Command 클래스 (생성자 함수)
 */
export const CommandHandler = (
  commandType: new (...args: any[]) => ICommand,
) => {
  return SetMetadata(COMMAND_HANDLER_METADATA, commandType);
};
