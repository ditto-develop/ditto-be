import { Injectable } from '@nestjs/common';
import { CommandHandler } from '@common/command/command-handler.decorator';
import { ICommandHandler } from '@common/command/command-handler.interface';
import { ICommandResult } from '@common/command/command.interface';
import { SetSystemOverrideCommand } from '../set-system-override.command';
import { SetSystemOverrideUseCase } from '@module/admin/application/usecases/set-system-override.usecase';

@Injectable()
@CommandHandler(SetSystemOverrideCommand)
export class SetSystemOverrideHandler
  implements ICommandHandler<SetSystemOverrideCommand, void>
{
  constructor(private readonly setSystemOverrideUseCase: SetSystemOverrideUseCase) {}

  async execute(command: SetSystemOverrideCommand): Promise<ICommandResult<void>> {
    try {
      await this.setSystemOverrideUseCase.execute(command.period);
      return { success: true, data: undefined };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
      };
    }
  }
}
