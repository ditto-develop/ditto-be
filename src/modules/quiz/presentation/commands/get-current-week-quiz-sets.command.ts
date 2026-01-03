import { ICommand } from '@common/command/command.interface';

export class GetCurrentWeekQuizSetsCommand implements ICommand {
  readonly commandId?: string;

  constructor() {
    this.commandId = `get-current-week-quiz-sets-${Date.now()}`;
  }
}

