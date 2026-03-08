import { ICommand } from '@common/command/command.interface';

export class GetUserAnswersCommand implements ICommand {
    readonly commandId?: string;
    constructor(public readonly currentUserId: string, public readonly targetUserId: string) {
        this.commandId = `answers-${currentUserId}-${targetUserId}-${Date.now()}`;
    }
}
