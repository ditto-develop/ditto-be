import { ICommand } from '@common/command/command.interface';
import { UpdateUserDto } from '@module/user/application/dto/user.dto';

export class UpdateUserCommand implements ICommand {
  readonly commandId?: string;

  constructor(
    public readonly id: string,
    public readonly dto: UpdateUserDto,
    public readonly currentUserId: string,
  ) {
    this.commandId = `update-user-${id}-${Date.now()}`;
  }
}
