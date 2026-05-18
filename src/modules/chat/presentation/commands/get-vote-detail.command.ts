import { ICommand } from '@common/command/command.interface';

export class GetVoteDetailCommand implements ICommand {
    readonly commandId?: string;
    constructor(
        public readonly userId: string,
        public readonly roomId: string,
        public readonly voteId: string,
    ) {
        this.commandId = `get-vote-detail-${userId}-${voteId}-${Date.now()}`;
    }
}
