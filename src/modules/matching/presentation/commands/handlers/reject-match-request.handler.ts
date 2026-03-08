import { Injectable } from '@nestjs/common';
import { CommandHandler } from '@common/command/command-handler.decorator';
import { ICommandHandler } from '@common/command/command-handler.interface';
import { ICommandResult } from '@common/command/command.interface';
import { RejectMatchRequestCommand } from '../reject-match-request.command';
import { RejectMatchRequestUseCase } from '@module/matching/application/usecases/reject-match-request.usecase';
import { MatchRequestDto } from '@module/matching/application/dto/match-request.dto';

@Injectable()
@CommandHandler(RejectMatchRequestCommand)
export class RejectMatchRequestHandler implements ICommandHandler<RejectMatchRequestCommand, MatchRequestDto> {
    constructor(private readonly useCase: RejectMatchRequestUseCase) { }

    async execute(command: RejectMatchRequestCommand): Promise<ICommandResult<MatchRequestDto>> {
        try {
            const data = await this.useCase.execute(command.requestId, command.currentUserId);
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : '알 수 없는 오류' };
        }
    }
}
