import { ICommand } from '@common/command/command.interface';

export class LeaveGroupChatRoomCommand implements ICommand {
    readonly commandId?: string;
    constructor(
        public readonly userId: string,
        public readonly roomId: string,
    ) {
        this.commandId = `leave-group-room-${userId}-${roomId}-${Date.now()}`;
    }
}
