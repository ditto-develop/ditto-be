import { ICommand } from '@common/command/command.interface';

export class GetMatchCandidatesCommand implements ICommand {
    readonly commandId?: string;
    constructor(public readonly userId: string) {
        this.commandId = `match-candidates-${userId}-${Date.now()}`;
    }
}
