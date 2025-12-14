import { ICommand } from '@common/command/command.interface';

export class DeleteUserCommand implements ICommand {
  readonly commandId?: string;

  constructor(
    public readonly id: string,
    public readonly currentUserId: string,
  ) {
    this.commandId = `delete-user-${id}-${Date.now()}`;
  }
}
