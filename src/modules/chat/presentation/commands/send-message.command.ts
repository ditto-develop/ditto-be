import { ICommand } from '@common/command/command.interface';
import { SendMessageDto } from '@module/chat/application/dto/chat-message.dto';

export class SendMessageCommand implements ICommand {
    readonly commandId?: string;
    constructor(
        public readonly userId: string,
        public readonly roomId: string,
        public readonly dto: SendMessageDto,
    ) {
        this.commandId = `chat-send-${roomId}-${Date.now()}`;
    }
}
