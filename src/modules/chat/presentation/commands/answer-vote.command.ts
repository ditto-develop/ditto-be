import { ICommand } from '@common/command/command.interface';
import { CastVoteDto } from '@module/chat/application/dto/vote.dto';

export class AnswerVoteCommand implements ICommand {
    readonly commandId?: string;
    constructor(
        public readonly userId: string,
        public readonly roomId: string,
        public readonly voteId: string,
        public readonly dto: CastVoteDto,
    ) {
        this.commandId = `answer-vote-${userId}-${voteId}-${Date.now()}`;
    }
}
