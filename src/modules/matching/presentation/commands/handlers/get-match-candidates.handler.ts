import { Injectable } from '@nestjs/common';
import { CommandHandler } from '@common/command/command-handler.decorator';
import { ICommandHandler } from '@common/command/command-handler.interface';
import { ICommandResult } from '@common/command/command.interface';
import { GetMatchCandidatesCommand } from '../get-match-candidates.command';
import { GetMatchCandidatesUseCase } from '@module/matching/application/usecases/get-match-candidates.usecase';
import { MatchCandidateListDto } from '@module/matching/application/dto/match-candidate.dto';

@Injectable()
@CommandHandler(GetMatchCandidatesCommand)
export class GetMatchCandidatesHandler implements ICommandHandler<GetMatchCandidatesCommand, MatchCandidateListDto> {
    constructor(private readonly useCase: GetMatchCandidatesUseCase) { }

    async execute(command: GetMatchCandidatesCommand): Promise<ICommandResult<MatchCandidateListDto>> {
        try {
            const data = await this.useCase.execute(command.userId);
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : '알 수 없는 오류' };
        }
    }
}
