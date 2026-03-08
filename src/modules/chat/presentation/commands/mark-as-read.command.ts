import { ICommand } from '@common/command/command.interface';

export class MarkAsReadCommand implements ICommand {
    readonly commandId?: string;
    constructor(
        public readonly userId: string,
        public readonly roomId: string,
    ) {
        this.commandId = `chat-read-${roomId}-${Date.now()}`;
    }
}
