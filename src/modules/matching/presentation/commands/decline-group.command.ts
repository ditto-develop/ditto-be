import { ICommand } from '@common/command/command.interface';

export class DeclineGroupCommand implements ICommand {
    readonly commandId?: string;
    constructor(public readonly userId: string) {
        this.commandId = `decline-group-${userId}-${Date.now()}`;
    }
}
