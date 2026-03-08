import { Injectable } from '@nestjs/common';
import { CommandHandler } from '@common/command/command-handler.decorator';
import { ICommandHandler } from '@common/command/command-handler.interface';
import { ICommandResult } from '@common/command/command.interface';
import { GetMessagesCommand } from '../get-messages.command';
import { GetMessagesUseCase } from '@module/chat/application/usecases/get-messages.usecase';
import { MessageListDto } from '@module/chat/application/dto/chat-message.dto';

@Injectable()
@CommandHandler(GetMessagesCommand)
export class GetMessagesHandler implements ICommandHandler<GetMessagesCommand, MessageListDto> {
    constructor(private readonly useCase: GetMessagesUseCase) { }

    async execute(command: GetMessagesCommand): Promise<ICommandResult<MessageListDto>> {
        try {
            const data = await this.useCase.execute(command.userId, command.roomId, command.cursor, command.limit);
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : '알 수 없는 오류' };
        }
    }
}
