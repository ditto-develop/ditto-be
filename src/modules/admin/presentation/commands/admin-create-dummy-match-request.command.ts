import { ICommand } from '@common/command/command.interface';
import { AdminCreateDummyMatchRequestDto } from '@module/admin/application/dto/admin-create-dummy-match-request.dto';

export class AdminCreateDummyMatchRequestCommand implements ICommand {
  readonly commandId: string;

  constructor(public readonly dto: AdminCreateDummyMatchRequestDto) {
    this.commandId = `admin-create-dummy-match-request-${Date.now()}`;
  }
}
