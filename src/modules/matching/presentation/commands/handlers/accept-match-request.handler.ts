import { Injectable } from '@nestjs/common';
import { CommandHandler } from '@common/command/command-handler.decorator';
import { ICommandHandler } from '@common/command/command-handler.interface';
import { ICommandResult } from '@common/command/command.interface';
import { AcceptMatchRequestCommand } from '../accept-match-request.command';
import { AcceptMatchRequestUseCase } from '@module/matching/application/usecases/accept-match-request.usecase';
import { MatchRequestDto } from '@module/matching/application/dto/match-request.dto';

@Injectable()
@CommandHandler(AcceptMatchRequestCommand)
export class AcceptMatchRequestHandler implements ICommandHandler<AcceptMatchRequestCommand, MatchRequestDto> {
    constructor(private readonly useCase: AcceptMatchRequestUseCase) { }

    async execute(command: AcceptMatchRequestCommand): Promise<ICommandResult<MatchRequestDto>> {
        try {
            const data = await this.useCase.execute(command.requestId, command.currentUserId);
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : '알 수 없는 오류' };
        }
    }
}
