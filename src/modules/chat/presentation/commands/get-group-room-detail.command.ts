import { ICommand } from '@common/command/command.interface';

export class GetGroupRoomDetailCommand implements ICommand {
    readonly commandId?: string;
    constructor(
        public readonly userId: string,
        public readonly roomId: string,
    ) {
        this.commandId = `group-room-detail-${userId}-${roomId}-${Date.now()}`;
    }
}
