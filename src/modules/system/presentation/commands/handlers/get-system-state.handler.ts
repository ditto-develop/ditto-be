import { Injectable } from '@nestjs/common';
import { CommandHandler } from '@common/command/command-handler.decorator';
import { ICommandHandler } from '@common/command/command-handler.interface';
import { ICommandResult } from '@common/command/command.interface';
import { GetSystemStateCommand } from '../get-system-state.command';
import { GetSystemStateUseCase } from '@module/system/application/usecases/get-system-state.usecase';
import { SystemStateDto } from '@module/system/application/dto/system-state.dto';

@Injectable()
@CommandHandler(GetSystemStateCommand)
export class GetSystemStateHandler implements ICommandHandler<GetSystemStateCommand, SystemStateDto> {
  constructor(private readonly getSystemStateUseCase: GetSystemStateUseCase) {}

  async execute(_: GetSystemStateCommand): Promise<ICommandResult<SystemStateDto>> {
    try {
      const data = await this.getSystemStateUseCase.execute();
      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
      };
    }
  }
}
