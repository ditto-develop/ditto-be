import { ICommand } from '@common/command/command.interface';

export class GetSystemStateCommand implements ICommand {
  readonly commandId: string;

  constructor() {
    this.commandId = `get-system-state-${Date.now()}`;
  }
}
