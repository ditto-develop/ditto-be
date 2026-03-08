import { ICommand } from '@common/command/command.interface';

export class GetUserRatingsCommand implements ICommand {
    readonly commandId?: string;
    constructor(public readonly targetUserId: string) {
        this.commandId = `ratings-get-${targetUserId}-${Date.now()}`;
    }
}
