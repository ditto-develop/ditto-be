import { ICommand } from '@common/command/command.interface';
import { SocialLoginDto } from '@module/user/application/dto/user.dto';

export class SocialLoginCommand implements ICommand {
  readonly commandId?: string;

  constructor(public readonly dto: SocialLoginDto) {
    this.commandId = `social-login-${Date.now()}`;
  }
}
