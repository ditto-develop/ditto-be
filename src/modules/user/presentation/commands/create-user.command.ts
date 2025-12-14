import { ICommand } from '@common/command/command.interface';
import { CreateUserDto } from '@module/user/application/dto/user.dto';

export class CreateUserCommand implements ICommand {
  readonly commandId?: string;

  constructor(public readonly dto: CreateUserDto) {
    this.commandId = `create-user-${Date.now()}`;
  }
}
