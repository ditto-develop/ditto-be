import { Injectable } from '@nestjs/common';
import { CommandHandler } from '@common/command/command-handler.decorator';
import { ICommandHandler } from '@common/command/command-handler.interface';
import { ICommandResult } from '@common/command/command.interface';
import { ClearSystemOverrideCommand } from '../clear-system-override.command';
import { ClearSystemOverrideUseCase } from '@module/admin/application/usecases/clear-system-override.usecase';

@Injectable()
@CommandHandler(ClearSystemOverrideCommand)
export class ClearSystemOverrideHandler
  implements ICommandHandler<ClearSystemOverrideCommand, void>
{
  constructor(private readonly clearSystemOverrideUseCase: ClearSystemOverrideUseCase) {}

  async execute(_: ClearSystemOverrideCommand): Promise<ICommandResult<void>> {
    try {
      await this.clearSystemOverrideUseCase.execute();
      return { success: true, data: undefined };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
      };
    }
  }
}
