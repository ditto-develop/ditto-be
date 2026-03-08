import { ICommand } from '@common/command/command.interface';
import { CreateRatingDto } from '@module/rating/application/dto/rating.dto';

export class CreateRatingCommand implements ICommand {
    readonly commandId?: string;
    constructor(
        public readonly fromUserId: string,
        public readonly toUserId: string,
        public readonly dto: CreateRatingDto,
    ) {
        this.commandId = `rating-create-${fromUserId}-${toUserId}-${Date.now()}`;
    }
}
