import { Injectable } from '@nestjs/common';
import { CommandHandler } from '@common/command/command-handler.decorator';
import { ICommandHandler } from '@common/command/command-handler.interface';
import { ICommandResult } from '@common/command/command.interface';
import { GetUserAnswersCommand } from '../get-user-answers.command';
import { GetUserAnswersUseCase } from '@module/rating/application/usecases/get-user-answers.usecase';
import { UserAnswersComparisonDto } from '@module/rating/application/dto/answer-comparison.dto';

@Injectable()
@CommandHandler(GetUserAnswersCommand)
export class GetUserAnswersHandler implements ICommandHandler<GetUserAnswersCommand, UserAnswersComparisonDto> {
    constructor(private readonly useCase: GetUserAnswersUseCase) { }

    async execute(command: GetUserAnswersCommand): Promise<ICommandResult<UserAnswersComparisonDto>> {
        try {
            const data = await this.useCase.execute(command.currentUserId, command.targetUserId);
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : '알 수 없는 오류' };
        }
    }
}
