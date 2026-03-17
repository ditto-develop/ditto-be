import { Injectable } from '@nestjs/common';
import { CommandHandler } from '@common/command/command-handler.decorator';
import { ICommandHandler } from '@common/command/command-handler.interface';
import { ICommandResult } from '@common/command/command.interface';
import { LeaveChatRoomCommand } from '../leave-chat-room.command';
import { LeaveChatRoomUseCase } from '@module/chat/application/usecases/leave-chat-room.usecase';

@Injectable()
@CommandHandler(LeaveChatRoomCommand)
export class LeaveChatRoomHandler implements ICommandHandler<LeaveChatRoomCommand, void> {
    constructor(private readonly useCase: LeaveChatRoomUseCase) { }

    async execute(command: LeaveChatRoomCommand): Promise<ICommandResult<void>> {
        try {
            await this.useCase.execute(command.userId, command.roomId, command.reason);
            return { success: true };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : '알 수 없는 오류' };
        }
    }
}
