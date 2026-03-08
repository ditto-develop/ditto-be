import { Injectable } from '@nestjs/common';
import { CommandHandler } from '@common/command/command-handler.decorator';
import { ICommandHandler } from '@common/command/command-handler.interface';
import { ICommandResult } from '@common/command/command.interface';
import { SendMessageCommand } from '../send-message.command';
import { SendMessageUseCase } from '@module/chat/application/usecases/send-message.usecase';
import { ChatMessageDto } from '@module/chat/application/dto/chat-message.dto';

@Injectable()
@CommandHandler(SendMessageCommand)
export class SendMessageHandler implements ICommandHandler<SendMessageCommand, ChatMessageDto> {
    constructor(private readonly useCase: SendMessageUseCase) { }

    async execute(command: SendMessageCommand): Promise<ICommandResult<ChatMessageDto>> {
        try {
            const data = await this.useCase.execute(command.userId, command.roomId, command.dto.content);
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : '알 수 없는 오류' };
        }
    }
}
