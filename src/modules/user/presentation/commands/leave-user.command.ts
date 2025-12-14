import { ICommand } from '@common/command/command.interface';

export class LeaveUserCommand implements ICommand {
  readonly commandId?: string;

  constructor(
    public readonly id: string,
    public readonly currentUserId: string,
  ) {
    this.commandId = `leave-user-${id}-${Date.now()}`;
  }
}
