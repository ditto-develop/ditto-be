import { ICommand } from '@common/command/command.interface';

export class GetUserProfileCommand implements ICommand {
    readonly commandId?: string;

    constructor(public readonly targetUserId: string) {
        this.commandId = `profile-get-user-${targetUserId}-${Date.now()}`;
    }
}
