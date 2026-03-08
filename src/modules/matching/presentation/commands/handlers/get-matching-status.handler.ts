import { Injectable } from '@nestjs/common';
import { CommandHandler } from '@common/command/command-handler.decorator';
import { ICommandHandler } from '@common/command/command-handler.interface';
import { ICommandResult } from '@common/command/command.interface';
import { GetMatchingStatusCommand } from '../get-matching-status.command';
import { GetMatchingStatusUseCase } from '@module/matching/application/usecases/get-matching-status.usecase';
import { MatchingStatusDto } from '@module/matching/application/dto/match-request.dto';

@Injectable()
@CommandHandler(GetMatchingStatusCommand)
export class GetMatchingStatusHandler implements ICommandHandler<GetMatchingStatusCommand, MatchingStatusDto> {
    constructor(private readonly useCase: GetMatchingStatusUseCase) { }

    async execute(command: GetMatchingStatusCommand): Promise<ICommandResult<MatchingStatusDto>> {
        try {
            const data = await this.useCase.execute(command.userId, command.quizSetId);
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : '알 수 없는 오류' };
        }
    }
}
