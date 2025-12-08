import { ICommand } from '@common/command/command.interface';

export class RefreshAccessTokenCommand implements ICommand {
  readonly commandId?: string;

  constructor(public readonly refreshToken: string) {
    this.commandId = `refresh-access-${Date.now()}`;
  }
}
