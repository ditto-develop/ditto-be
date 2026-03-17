import { Injectable } from '@nestjs/common';
import { CommandHandler } from '@common/command/command-handler.decorator';
import { ICommandHandler } from '@common/command/command-handler.interface';
import { ICommandResult } from '@common/command/command.interface';
import { GetAdminQuizProgressCommand } from '../get-admin-quiz-progress.command';
import { GetQuizProgressUseCase } from '@module/admin/application/usecases/get-quiz-progress.usecase';
import { AdminQuizProgressResponseDto } from '@module/admin/application/dto/admin-quiz-progress.dto';

@Injectable()
@CommandHandler(GetAdminQuizProgressCommand)
export class GetAdminQuizProgressHandler
  implements ICommandHandler<GetAdminQuizProgressCommand, AdminQuizProgressResponseDto>
{
  constructor(private readonly getQuizProgressUseCase: GetQuizProgressUseCase) {}

  async execute(_command: GetAdminQuizProgressCommand): Promise<ICommandResult<AdminQuizProgressResponseDto>> {
    try {
      const data = await this.getQuizProgressUseCase.execute();
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
      };
    }
  }
}
