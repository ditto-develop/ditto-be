import { Injectable } from '@nestjs/common';
import { CommandHandler } from '@common/command/command-handler.decorator';
import { ICommandHandler } from '@common/command/command-handler.interface';
import { ICommandResult } from '@common/command/command.interface';
import { CreateVoteCommand } from '../create-vote.command';
import { CreateVoteUseCase } from '@module/chat/application/usecases/create-vote.usecase';
import { GroupVoteDto } from '@module/chat/application/dto/vote.dto';

@Injectable()
@CommandHandler(CreateVoteCommand)
export class CreateVoteHandler implements ICommandHandler<CreateVoteCommand, GroupVoteDto> {
    constructor(private readonly useCase: CreateVoteUseCase) { }

    async execute(command: CreateVoteCommand): Promise<ICommandResult<GroupVoteDto>> {
        try {
            const data = await this.useCase.execute(command.userId, command.roomId, command.dto);
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : '알 수 없는 오류' };
        }
    }
}
