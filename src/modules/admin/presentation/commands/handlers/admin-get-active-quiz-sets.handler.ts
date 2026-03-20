import { Injectable } from '@nestjs/common';
import { CommandHandler } from '@common/command/command-handler.decorator';
import { ICommandHandler } from '@common/command/command-handler.interface';
import { ICommandResult } from '@common/command/command.interface';
import { AdminGetActiveQuizSetsCommand } from '../admin-get-active-quiz-sets.command';
import { AdminGetActiveQuizSetsUseCase } from '@module/admin/application/usecases/admin-get-active-quiz-sets.usecase';
import { AdminActiveQuizSetDto } from '@module/admin/application/dto/admin-create-dummy-match-request.dto';

@Injectable()
@CommandHandler(AdminGetActiveQuizSetsCommand)
export class AdminGetActiveQuizSetsHandler
  implements ICommandHandler<AdminGetActiveQuizSetsCommand, AdminActiveQuizSetDto[]>
{
  constructor(private readonly useCase: AdminGetActiveQuizSetsUseCase) {}

  async execute(
    _command: AdminGetActiveQuizSetsCommand,
  ): Promise<ICommandResult<AdminActiveQuizSetDto[]>> {
    try {
      const data = await this.useCase.execute();
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
      };
    }
  }
}
