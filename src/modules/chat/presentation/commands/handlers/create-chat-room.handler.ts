import { Injectable } from '@nestjs/common';
import { CommandHandler } from '@common/command/command-handler.decorator';
import { ICommandHandler } from '@common/command/command-handler.interface';
import { ICommandResult } from '@common/command/command.interface';
import { CreateChatRoomCommand } from '../create-chat-room.command';
import { CreateChatRoomUseCase } from '@module/chat/application/usecases/create-chat-room.usecase';
import { ChatRoomItemDto } from '@module/chat/application/dto/chat-room.dto';

@Injectable()
@CommandHandler(CreateChatRoomCommand)
export class CreateChatRoomHandler implements ICommandHandler<CreateChatRoomCommand, ChatRoomItemDto> {
    constructor(private readonly useCase: CreateChatRoomUseCase) { }

    async execute(command: CreateChatRoomCommand): Promise<ICommandResult<ChatRoomItemDto>> {
        try {
            const data = await this.useCase.execute(command.userId, command.dto.matchRequestId);
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : '알 수 없는 오류' };
        }
    }
}
