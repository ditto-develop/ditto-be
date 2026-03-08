import { Injectable } from '@nestjs/common';
import { CommandHandler } from '@common/command/command-handler.decorator';
import { ICommandHandler } from '@common/command/command-handler.interface';
import { ICommandResult } from '@common/command/command.interface';
import { GetUserRatingsCommand } from '../get-user-ratings.command';
import { GetUserRatingsUseCase } from '@module/rating/application/usecases/get-user-ratings.usecase';
import { UserRatingSummaryDto } from '@module/rating/application/dto/rating.dto';

@Injectable()
@CommandHandler(GetUserRatingsCommand)
export class GetUserRatingsHandler implements ICommandHandler<GetUserRatingsCommand, UserRatingSummaryDto> {
    constructor(private readonly useCase: GetUserRatingsUseCase) { }

    async execute(command: GetUserRatingsCommand): Promise<ICommandResult<UserRatingSummaryDto>> {
        try {
            const data = await this.useCase.execute(command.targetUserId);
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : '알 수 없는 오류' };
        }
    }
}
