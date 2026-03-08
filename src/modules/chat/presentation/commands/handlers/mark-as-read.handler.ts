import { Injectable } from '@nestjs/common';
import { CommandHandler } from '@common/command/command-handler.decorator';
import { ICommandHandler } from '@common/command/command-handler.interface';
import { ICommandResult } from '@common/command/command.interface';
import { MarkAsReadCommand } from '../mark-as-read.command';
import { MarkAsReadUseCase } from '@module/chat/application/usecases/mark-as-read.usecase';

@Injectable()
@CommandHandler(MarkAsReadCommand)
export class MarkAsReadHandler implements ICommandHandler<MarkAsReadCommand, void> {
    constructor(private readonly useCase: MarkAsReadUseCase) { }

    async execute(command: MarkAsReadCommand): Promise<ICommandResult<void>> {
        try {
            await this.useCase.execute(command.userId, command.roomId);
            return { success: true };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : '알 수 없는 오류' };
        }
    }
}
