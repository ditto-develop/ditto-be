import { Injectable } from '@nestjs/common';
import { CommandHandler } from '@common/command/command-handler.decorator';
import { ICommandHandler } from '@common/command/command-handler.interface';
import { ICommandResult } from '@common/command/command.interface';
import { AddVoteOptionCommand } from '../add-vote-option.command';
import { AddVoteOptionUseCase } from '@module/chat/application/usecases/add-vote-option.usecase';
import { GroupVoteDto } from '@module/chat/application/dto/vote.dto';

@Injectable()
@CommandHandler(AddVoteOptionCommand)
export class AddVoteOptionHandler implements ICommandHandler<AddVoteOptionCommand, GroupVoteDto> {
    constructor(private readonly useCase: AddVoteOptionUseCase) { }

    async execute(command: AddVoteOptionCommand): Promise<ICommandResult<GroupVoteDto>> {
        try {
            const data = await this.useCase.execute(command.userId, command.roomId, command.voteId, command.dto);
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : '알 수 없는 오류' };
        }
    }
}
