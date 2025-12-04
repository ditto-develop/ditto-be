import { ICommand } from '@common/command/command.interface';

export class GetMyProfileCommand implements ICommand {
  readonly commandId?: string;

  constructor(public readonly userId: string) {
    this.commandId = `get-my-profile-${userId}-${Date.now()}`;
  }
}
