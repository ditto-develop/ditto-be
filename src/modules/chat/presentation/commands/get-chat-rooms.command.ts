import { ICommand } from '@common/command/command.interface';

export class GetChatRoomsCommand implements ICommand {
    readonly commandId?: string;
    constructor(public readonly userId: string) {
        this.commandId = `chat-rooms-${userId}-${Date.now()}`;
    }
}
