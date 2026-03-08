import { Injectable } from '@nestjs/common';
import { CommandHandler } from '@common/command/command-handler.decorator';
import { ICommandHandler } from '@common/command/command-handler.interface';
import { ICommandResult } from '@common/command/command.interface';
import { GetChatRoomsCommand } from '../get-chat-rooms.command';
import { GetChatRoomsUseCase } from '@module/chat/application/usecases/get-chat-rooms.usecase';
import { ChatRoomItemDto } from '@module/chat/application/dto/chat-room.dto';

@Injectable()
@CommandHandler(GetChatRoomsCommand)
export class GetChatRoomsHandler implements ICommandHandler<GetChatRoomsCommand, ChatRoomItemDto[]> {
    constructor(private readonly useCase: GetChatRoomsUseCase) { }

    async execute(command: GetChatRoomsCommand): Promise<ICommandResult<ChatRoomItemDto[]>> {
        try {
            const data = await this.useCase.execute(command.userId);
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : '알 수 없는 오류' };
        }
    }
}
