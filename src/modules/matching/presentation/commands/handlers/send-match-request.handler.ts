import { Injectable } from '@nestjs/common';
import { CommandHandler } from '@common/command/command-handler.decorator';
import { ICommandHandler } from '@common/command/command-handler.interface';
import { ICommandResult } from '@common/command/command.interface';
import { SendMatchRequestCommand } from '../send-match-request.command';
import { SendMatchRequestUseCase } from '@module/matching/application/usecases/send-match-request.usecase';
import { MatchRequestDto } from '@module/matching/application/dto/match-request.dto';

@Injectable()
@CommandHandler(SendMatchRequestCommand)
export class SendMatchRequestHandler implements ICommandHandler<SendMatchRequestCommand, MatchRequestDto> {
    constructor(private readonly useCase: SendMatchRequestUseCase) { }

    async execute(command: SendMatchRequestCommand): Promise<ICommandResult<MatchRequestDto>> {
        try {
            const data = await this.useCase.execute(command.fromUserId, command.dto);
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : '알 수 없는 오류' };
        }
    }
}
