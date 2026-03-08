import { ICommand } from '@common/command/command.interface';
import { UpdateProfileDto } from '@module/profile/application/dto/update-profile.dto';

export class UpdateMyProfileCommand implements ICommand {
    readonly commandId?: string;

    constructor(
        public readonly userId: string,
        public readonly dto: UpdateProfileDto,
    ) {
        this.commandId = `profile-update-my-${userId}-${Date.now()}`;
    }
}
