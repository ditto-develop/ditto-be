import { ICommand } from '@common/command/command.interface';
import { LoginDto } from '@module/user/application/dto/user.dto';

export class LoginCommand implements ICommand {
  readonly commandId?: string;

  constructor(public readonly dto: LoginDto) {
    this.commandId = `login-${Date.now()}`;
  }
}
