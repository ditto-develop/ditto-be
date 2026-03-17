import { ICommand } from '@common/command/command.interface';

export class JoinGroupCommand implements ICommand {
    readonly commandId?: string;
    constructor(public readonly userId: string) {
        this.commandId = `join-group-${userId}-${Date.now()}`;
    }
}
