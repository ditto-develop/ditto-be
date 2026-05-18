import { Injectable } from '@nestjs/common';
import { CommandHandler } from '@common/command/command-handler.decorator';
import { ICommandHandler } from '@common/command/command-handler.interface';
import { ICommandResult } from '@common/command/command.interface';
import { CloseVoteCommand } from '../close-vote.command';
import { CloseVoteUseCase } from '@module/chat/application/usecases/close-vote.usecase';

@Injectable()
@CommandHandler(CloseVoteCommand)
export class CloseVoteHandler implements ICommandHandler<CloseVoteCommand, void> {
    constructor(private readonly useCase: CloseVoteUseCase) { }

    async execute(command: CloseVoteCommand): Promise<ICommandResult<void>> {
        try {
            await this.useCase.execute(command.userId, command.roomId, command.voteId);
            return { success: true, data: undefined };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : '알 수 없는 오류' };
        }
    }
}
