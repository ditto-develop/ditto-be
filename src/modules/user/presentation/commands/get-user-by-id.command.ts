import { ICommand } from '@common/command/command.interface';

export class GetUserByIdCommand implements ICommand {
  readonly commandId?: string;

  constructor(public readonly id: string) {
    this.commandId = `get-user-by-id-${id}-${Date.now()}`;
  }
}
