import { ICommand } from '@common/command/command.interface';
import { AddSocialAccountDto } from '@module/user/application/usecases/add-social-account.usecase';

export class AddSocialAccountCommand implements ICommand {
  readonly commandId?: string;

  constructor(
    public readonly userId: string,
    public readonly dto: AddSocialAccountDto,
    public readonly currentUserId: string,
  ) {
    this.commandId = `add-social-account-${userId}-${Date.now()}`;
  }
}
