import { Injectable } from '@nestjs/common';
import { CommandHandler } from '@common/command/command-handler.decorator';
import { ICommandHandler } from '@common/command/command-handler.interface';
import { ICommandResult } from '@common/command/command.interface';
import { GetChatRoomDetailCommand } from '../get-chat-room-detail.command';
import { GetChatRoomDetailUseCase } from '@module/chat/application/usecases/get-chat-room-detail.usecase';
import { ChatRoomDetailDto } from '@module/chat/application/dto/chat-room.dto';

@Injectable()
@CommandHandler(GetChatRoomDetailCommand)
export class GetChatRoomDetailHandler implements ICommandHandler<GetChatRoomDetailCommand, ChatRoomDetailDto> {
    constructor(private readonly useCase: GetChatRoomDetailUseCase) { }

    async execute(command: GetChatRoomDetailCommand): Promise<ICommandResult<ChatRoomDetailDto>> {
        try {
            const data = await this.useCase.execute(command.userId, command.roomId);
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : '알 수 없는 오류' };
        }
    }
}
