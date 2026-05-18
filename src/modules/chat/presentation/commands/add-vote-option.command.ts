import { ICommand } from '@common/command/command.interface';
import { AddVoteOptionDto } from '@module/chat/application/dto/vote.dto';

export class AddVoteOptionCommand implements ICommand {
    readonly commandId?: string;
    constructor(
        public readonly userId: string,
        public readonly roomId: string,
        public readonly voteId: string,
        public readonly dto: AddVoteOptionDto,
    ) {
        this.commandId = `add-vote-option-${userId}-${voteId}-${Date.now()}`;
    }
}
