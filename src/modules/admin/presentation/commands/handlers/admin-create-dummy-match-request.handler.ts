import { Injectable } from '@nestjs/common';
import { CommandHandler } from '@common/command/command-handler.decorator';
import { ICommandHandler } from '@common/command/command-handler.interface';
import { ICommandResult } from '@common/command/command.interface';
import { AdminCreateDummyMatchRequestCommand } from '../admin-create-dummy-match-request.command';
import { AdminCreateDummyMatchRequestUseCase } from '@module/admin/application/usecases/admin-create-dummy-match-request.usecase';
import { AdminCreateDummyMatchResultDto } from '@module/admin/application/dto/admin-create-dummy-match-request.dto';

@Injectable()
@CommandHandler(AdminCreateDummyMatchRequestCommand)
export class AdminCreateDummyMatchRequestHandler
  implements ICommandHandler<AdminCreateDummyMatchRequestCommand, AdminCreateDummyMatchResultDto>
{
  constructor(private readonly useCase: AdminCreateDummyMatchRequestUseCase) {}

  async execute(
    command: AdminCreateDummyMatchRequestCommand,
  ): Promise<ICommandResult<AdminCreateDummyMatchResultDto>> {
    try {
      const data = await this.useCase.execute(command.dto);
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
      };
    }
  }
}
