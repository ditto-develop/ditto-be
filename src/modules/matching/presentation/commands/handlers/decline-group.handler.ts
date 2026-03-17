import { Injectable } from '@nestjs/common';
import { CommandHandler } from '@common/command/command-handler.decorator';
import { ICommandHandler } from '@common/command/command-handler.interface';
import { ICommandResult } from '@common/command/command.interface';
import { DeclineGroupCommand } from '../decline-group.command';
import { DeclineGroupUseCase } from '@module/matching/application/usecases/decline-group.usecase';

@Injectable()
@CommandHandler(DeclineGroupCommand)
export class DeclineGroupHandler implements ICommandHandler<DeclineGroupCommand, void> {
    constructor(private readonly useCase: DeclineGroupUseCase) {}

    async execute(command: DeclineGroupCommand): Promise<ICommandResult<void>> {
        try {
            await this.useCase.execute(command.userId);
            return { success: true };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : '알 수 없는 오류' };
        }
    }
}
