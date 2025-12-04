import { ICommand } from '@common/command/command.interface';

export class GetAllRolesCommand implements ICommand {
  readonly commandId?: string;

  constructor() {
    this.commandId = `get-all-roles-${Date.now()}`;
  }
}
