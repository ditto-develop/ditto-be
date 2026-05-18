import { Injectable } from '@nestjs/common';
import { CommandHandler } from '@common/command/command-handler.decorator';
import { ICommandHandler } from '@common/command/command-handler.interface';
import { ICommandResult } from '@common/command/command.interface';
import { GetGroupMessagesCommand } from '../get-group-messages.command';
import { GetGroupMessagesUseCase } from '@module/chat/application/usecases/get-group-messages.usecase';
import { GroupMessageListDto } from '@module/chat/application/dto/group-chat.dto';

@Injectable()
@CommandHandler(GetGroupMessagesCommand)
export class GetGroupMessagesHandler implements ICommandHandler<GetGroupMessagesCommand, GroupMessageListDto> {
    constructor(private readonly useCase: GetGroupMessagesUseCase) { }

    async execute(command: GetGroupMessagesCommand): Promise<ICommandResult<GroupMessageListDto>> {
        try {
            const data = await this.useCase.execute(command.userId, command.roomId, command.cursor, command.limit);
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : '알 수 없는 오류' };
        }
    }
}
