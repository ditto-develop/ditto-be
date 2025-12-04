import { ICommand } from '@common/command/command.interface';

export class GetRoleByIdCommand implements ICommand {
  readonly commandId?: string;

  constructor(public readonly id: number) {
    this.commandId = `get-role-by-id-${id}-${Date.now()}`;
  }
}
