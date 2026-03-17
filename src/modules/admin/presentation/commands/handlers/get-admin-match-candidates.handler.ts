import { Injectable } from '@nestjs/common';
import { CommandHandler } from '@common/command/command-handler.decorator';
import { ICommandHandler } from '@common/command/command-handler.interface';
import { ICommandResult } from '@common/command/command.interface';
import { GetAdminMatchCandidatesCommand } from '../get-admin-match-candidates.command';
import { GetMatchCandidatesUseCase } from '@module/matching/application/usecases/get-match-candidates.usecase';
import { MatchCandidateListDto } from '@module/matching/application/dto/match-candidate.dto';

@Injectable()
@CommandHandler(GetAdminMatchCandidatesCommand)
export class GetAdminMatchCandidatesHandler
  implements ICommandHandler<GetAdminMatchCandidatesCommand, MatchCandidateListDto>
{
  constructor(private readonly getMatchCandidatesUseCase: GetMatchCandidatesUseCase) {}

  async execute(command: GetAdminMatchCandidatesCommand): Promise<ICommandResult<MatchCandidateListDto>> {
    try {
      const data = await this.getMatchCandidatesUseCase.execute(command.userId);
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
      };
    }
  }
}
