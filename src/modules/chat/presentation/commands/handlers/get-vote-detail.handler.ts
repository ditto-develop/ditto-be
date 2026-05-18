import { Injectable } from '@nestjs/common';
import { CommandHandler } from '@common/command/command-handler.decorator';
import { ICommandHandler } from '@common/command/command-handler.interface';
import { ICommandResult } from '@common/command/command.interface';
import { GetVoteDetailCommand } from '../get-vote-detail.command';
import { GetVoteDetailUseCase } from '@module/chat/application/usecases/get-vote-detail.usecase';
import { GroupVoteDto } from '@module/chat/application/dto/vote.dto';

@Injectable()
@CommandHandler(GetVoteDetailCommand)
export class GetVoteDetailHandler implements ICommandHandler<GetVoteDetailCommand, GroupVoteDto> {
    constructor(private readonly useCase: GetVoteDetailUseCase) { }

    async execute(command: GetVoteDetailCommand): Promise<ICommandResult<GroupVoteDto>> {
        try {
            const data = await this.useCase.execute(command.userId, command.roomId, command.voteId);
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : '알 수 없는 오류' };
        }
    }
}
