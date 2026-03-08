import { ICommand } from '@common/command/command.interface';

export class GetMatchingStatusCommand implements ICommand {
    readonly commandId?: string;
    constructor(public readonly userId: string, public readonly quizSetId: string) {
        this.commandId = `match-status-${userId}-${Date.now()}`;
    }
}
