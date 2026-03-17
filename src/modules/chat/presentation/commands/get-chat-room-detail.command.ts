import { ICommand } from '@common/command/command.interface';

export class GetChatRoomDetailCommand implements ICommand {
    readonly commandId?: string;
    constructor(
        public readonly userId: string,
        public readonly roomId: string,
    ) {
        this.commandId = `chat-room-detail-${userId}-${roomId}-${Date.now()}`;
    }
}
