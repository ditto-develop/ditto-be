import { Injectable } from '@nestjs/common';
import { CommandHandler } from '@common/command/command-handler.decorator';
import { ICommandHandler } from '@common/command/command-handler.interface';
import { ICommandResult } from '@common/command/command.interface';
import { GetGroupRoomDetailCommand } from '../get-group-room-detail.command';
import { GetGroupRoomDetailUseCase } from '@module/chat/application/usecases/get-group-room-detail.usecase';
import { GroupChatRoomDetailDto } from '@module/chat/application/dto/group-chat.dto';

@Injectable()
@CommandHandler(GetGroupRoomDetailCommand)
export class GetGroupRoomDetailHandler implements ICommandHandler<GetGroupRoomDetailCommand, GroupChatRoomDetailDto> {
    constructor(private readonly useCase: GetGroupRoomDetailUseCase) { }

    async execute(command: GetGroupRoomDetailCommand): Promise<ICommandResult<GroupChatRoomDetailDto>> {
        try {
            const data = await this.useCase.execute(command.userId, command.roomId);
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : '알 수 없는 오류' };
        }
    }
}
