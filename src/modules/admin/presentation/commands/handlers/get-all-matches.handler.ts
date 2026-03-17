import { Injectable } from '@nestjs/common';
import { CommandHandler } from '@common/command/command-handler.decorator';
import { ICommandHandler } from '@common/command/command-handler.interface';
import { ICommandResult } from '@common/command/command.interface';
import { GetAllMatchesCommand } from '../get-all-matches.command';
import { GetAllMatchesUseCase } from '@module/admin/application/usecases/get-all-matches.usecase';
import { AdminMatchListResponseDto } from '@module/admin/application/dto/admin-match-list.dto';

@Injectable()
@CommandHandler(GetAllMatchesCommand)
export class GetAllMatchesHandler
  implements ICommandHandler<GetAllMatchesCommand, AdminMatchListResponseDto>
{
  constructor(private readonly getAllMatchesUseCase: GetAllMatchesUseCase) {}

  async execute(command: GetAllMatchesCommand): Promise<ICommandResult<AdminMatchListResponseDto>> {
    try {
      const data = await this.getAllMatchesUseCase.execute(command.query);
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
      };
    }
  }
}
