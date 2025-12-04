import { ICommand } from '@common/command/command.interface';
import { CreateAdminUserDto } from '@module/user/application/dto/user.dto';

export class CreateAdminUserCommand implements ICommand {
  readonly commandId?: string;

  constructor(public readonly dto: CreateAdminUserDto) {
    this.commandId = `create-admin-user-${Date.now()}`;
  }
}
