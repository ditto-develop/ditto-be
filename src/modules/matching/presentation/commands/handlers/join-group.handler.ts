import { Injectable } from '@nestjs/common';
import { CommandHandler } from '@common/command/command-handler.decorator';
import { ICommandHandler } from '@common/command/command-handler.interface';
import { ICommandResult } from '@common/command/command.interface';
import { JoinGroupCommand } from '../join-group.command';
import { JoinGroupUseCase, GroupJoinResultDto } from '@module/matching/application/usecases/join-group.usecase';

@Injectable()
@CommandHandler(JoinGroupCommand)
export class JoinGroupHandler implements ICommandHandler<JoinGroupCommand, GroupJoinResultDto> {
    constructor(private readonly useCase: JoinGroupUseCase) {}

    async execute(command: JoinGroupCommand): Promise<ICommandResult<GroupJoinResultDto>> {
        try {
            const data = await this.useCase.execute(command.userId);
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : '알 수 없는 오류' };
        }
    }
}
