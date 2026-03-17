import { ICommand } from '@common/command/command.interface';

export class ClearSystemOverrideCommand implements ICommand {
  readonly commandId: string;

  constructor() {
    this.commandId = `clear-system-override-${Date.now()}`;
  }
}
