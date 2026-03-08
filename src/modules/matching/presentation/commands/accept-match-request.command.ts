import { ICommand } from '@common/command/command.interface';

export class AcceptMatchRequestCommand implements ICommand {
    readonly commandId?: string;
    constructor(public readonly requestId: string, public readonly currentUserId: string) {
        this.commandId = `match-accept-${requestId}-${Date.now()}`;
    }
}
