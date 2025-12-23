import { ICommand } from '@common/command/command.interface';

export class ResetWeekProgressCommand implements ICommand {
  readonly commandId: string;

  constructor(public readonly userId: string) {
    this.commandId = `reset-week-progress-${userId}-${Date.now()}`;
  }
}
