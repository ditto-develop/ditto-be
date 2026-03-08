import { ICommand } from '@common/command/command.interface';
import { CreateChatRoomDto } from '@module/chat/application/dto/chat-room.dto';

export class CreateChatRoomCommand implements ICommand {
    readonly commandId?: string;
    constructor(
        public readonly userId: string,
        public readonly dto: CreateChatRoomDto,
    ) {
        this.commandId = `chat-room-create-${userId}-${Date.now()}`;
    }
}
