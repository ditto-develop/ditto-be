import { ICommand } from '@common/command/command.interface';
import { CreateVoteDto } from '@module/chat/application/dto/vote.dto';

export class CreateVoteCommand implements ICommand {
    readonly commandId?: string;
    constructor(
        public readonly userId: string,
        public readonly roomId: string,
        public readonly dto: CreateVoteDto,
    ) {
        this.commandId = `create-vote-${userId}-${roomId}-${Date.now()}`;
    }
}
