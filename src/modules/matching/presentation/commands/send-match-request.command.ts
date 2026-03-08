import { ICommand } from '@common/command/command.interface';
import { SendMatchRequestDto } from '@module/matching/application/dto/match-request.dto';

export class SendMatchRequestCommand implements ICommand {
    readonly commandId?: string;
    constructor(public readonly fromUserId: string, public readonly dto: SendMatchRequestDto) {
        this.commandId = `match-send-${fromUserId}-${Date.now()}`;
    }
}
