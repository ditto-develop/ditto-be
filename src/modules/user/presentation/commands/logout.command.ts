import { ICommand } from '@common/command/command.interface';

export class LogoutCommand implements ICommand {
  readonly commandId?: string;

  constructor(public readonly refreshToken: string) {
    this.commandId = `logout-${Date.now()}`;
  }
}
