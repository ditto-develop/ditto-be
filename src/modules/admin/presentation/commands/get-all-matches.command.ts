import { ICommand } from '@common/command/command.interface';
import { AdminMatchListQueryDto } from '@module/admin/application/dto/admin-match-list.dto';

export class GetAllMatchesCommand implements ICommand {
  readonly commandId: string;

  constructor(public readonly query: AdminMatchListQueryDto) {
    this.commandId = `get-all-matches-${Date.now()}`;
  }
}
