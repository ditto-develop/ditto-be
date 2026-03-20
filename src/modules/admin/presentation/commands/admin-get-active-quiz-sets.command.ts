import { ICommand } from '@common/command/command.interface';

export class AdminGetActiveQuizSetsCommand implements ICommand {
  readonly commandId: string;

  constructor() {
    this.commandId = `admin-get-active-quiz-sets-${Date.now()}`;
  }
}
