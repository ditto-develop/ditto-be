import { Injectable } from '@nestjs/common';
import { CommandHandler } from '@common/command/command-handler.decorator';
import { ICommandHandler } from '@common/command/command-handler.interface';
import { ICommandResult } from '@common/command/command.interface';
import { CreateRatingCommand } from '../create-rating.command';
import { CreateRatingUseCase } from '@module/rating/application/usecases/create-rating.usecase';
import { RatingItemDto } from '@module/rating/application/dto/rating.dto';

@Injectable()
@CommandHandler(CreateRatingCommand)
export class CreateRatingHandler implements ICommandHandler<CreateRatingCommand, RatingItemDto> {
    constructor(private readonly useCase: CreateRatingUseCase) { }

    async execute(command: CreateRatingCommand): Promise<ICommandResult<RatingItemDto>> {
        try {
            const data = await this.useCase.execute(command.fromUserId, command.toUserId, command.dto);
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : '알 수 없는 오류' };
        }
    }
}
