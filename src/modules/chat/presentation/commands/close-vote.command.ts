import { ICommand } from '@common/command/command.interface';

export class CloseVoteCommand implements ICommand {
    readonly commandId?: string;
    constructor(
        public readonly userId: string,
        public readonly roomId: string,
        public readonly voteId: string,
    ) {
        this.commandId = `close-vote-${userId}-${voteId}-${Date.now()}`;
    }
}
