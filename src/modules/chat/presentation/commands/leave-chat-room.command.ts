import { ICommand } from '@common/command/command.interface';

export class LeaveChatRoomCommand implements ICommand {
    readonly commandId?: string;
    constructor(
        public readonly userId: string,
        public readonly roomId: string,
        public readonly reason?: string,
    ) {
        this.commandId = `leave-chat-room-${userId}-${roomId}-${Date.now()}`;
    }
}
