import { Injectable } from '@nestjs/common';
import { CommandHandler } from '@common/command/command-handler.decorator';
import { ICommandHandler } from '@common/command/command-handler.interface';
import { ICommandResult } from '@common/command/command.interface';
import { LeaveGroupChatRoomCommand } from '../leave-group-chat-room.command';
import { LeaveGroupChatRoomUseCase } from '@module/chat/application/usecases/leave-group-chat-room.usecase';

@Injectable()
@CommandHandler(LeaveGroupChatRoomCommand)
export class LeaveGroupChatRoomHandler implements ICommandHandler<LeaveGroupChatRoomCommand, void> {
    constructor(private readonly useCase: LeaveGroupChatRoomUseCase) { }

    async execute(command: LeaveGroupChatRoomCommand): Promise<ICommandResult<void>> {
        try {
            await this.useCase.execute(command.userId, command.roomId);
            return { success: true, data: undefined };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : '알 수 없는 오류' };
        }
    }
}
