import { ICommand } from '@common/command/command.interface';

export class GetAllUsersCommand implements ICommand {
  readonly commandId?: string;

  constructor() {
    this.commandId = `get-all-users-${Date.now()}`;
  }
}
