import { ICommand } from '@common/command/command.interface';

export class RejectMatchRequestCommand implements ICommand {
    readonly commandId?: string;
    constructor(public readonly requestId: string, public readonly currentUserId: string) {
        this.commandId = `match-reject-${requestId}-${Date.now()}`;
    }
}
