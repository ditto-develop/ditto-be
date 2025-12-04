import { ICommand } from '@common/command/command.interface';

export class RemoveSocialAccountCommand implements ICommand {
  readonly commandId?: string;

  constructor(
    public readonly userId: string,
    public readonly provider: string,
    public readonly currentUserId: string,
  ) {
    this.commandId = `remove-social-account-${userId}-${provider}-${Date.now()}`;
  }
}
