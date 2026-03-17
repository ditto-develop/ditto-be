import { ICommand } from '@common/command/command.interface';

export class GetDbStatsCommand implements ICommand {
  readonly commandId: string;

  constructor() {
    this.commandId = `get-db-stats-${Date.now()}`;
  }
}
