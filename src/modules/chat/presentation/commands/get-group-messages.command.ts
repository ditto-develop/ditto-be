import { ICommand } from '@common/command/command.interface';

export class GetGroupMessagesCommand implements ICommand {
    readonly commandId?: string;
    constructor(
        public readonly userId: string,
        public readonly roomId: string,
        public readonly cursor?: string,
        public readonly limit?: number,
    ) {
        this.commandId = `group-messages-${userId}-${roomId}-${Date.now()}`;
    }
}
