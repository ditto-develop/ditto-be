import { ICommand } from '@common/command/command.interface';

export class GetAllUsersCommand implements ICommand {
  readonly commandId?: string;

  constructor(public readonly requestUserId: string) {
    this.commandId = `get-all-users-${requestUserId}-${Date.now()}`;
  }
}
