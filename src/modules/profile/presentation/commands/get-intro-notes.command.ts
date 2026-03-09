import { ICommand } from '@common/command/command.interface';

export class GetIntroNotesCommand implements ICommand {
    readonly commandId?: string;

    constructor(public readonly userId: string) {
        this.commandId = `profile-get-intro-notes-${userId}-${Date.now()}`;
    }
}
