import { ICommand } from '@common/command/command.interface';
import { UpdateIntroNotesDto } from '@module/profile/application/dto/intro-notes.dto';

export class UpdateIntroNotesCommand implements ICommand {
    readonly commandId?: string;

    constructor(
        public readonly userId: string,
        public readonly dto: UpdateIntroNotesDto,
    ) {
        this.commandId = `profile-update-intro-notes-${userId}-${Date.now()}`;
    }
}
