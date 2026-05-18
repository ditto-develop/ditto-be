import { Injectable } from '@nestjs/common';
import { CommandHandler } from '@common/command/command-handler.decorator';
import { ICommandHandler } from '@common/command/command-handler.interface';
import { ICommandResult } from '@common/command/command.interface';
import { AnswerVoteCommand } from '../answer-vote.command';
import { AnswerVoteUseCase } from '@module/chat/application/usecases/answer-vote.usecase';
import { GroupVoteDto } from '@module/chat/application/dto/vote.dto';

@Injectable()
@CommandHandler(AnswerVoteCommand)
export class AnswerVoteHandler implements ICommandHandler<AnswerVoteCommand, GroupVoteDto> {
    constructor(private readonly useCase: AnswerVoteUseCase) { }

    async execute(command: AnswerVoteCommand): Promise<ICommandResult<GroupVoteDto>> {
        try {
            const data = await this.useCase.execute(command.userId, command.roomId, command.voteId, command.dto);
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : '알 수 없는 오류' };
        }
    }
}
