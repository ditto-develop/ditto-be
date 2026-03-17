import { ICommand } from '@common/command/command.interface';

export class ResetAllQuizProgressCommand implements ICommand {
  readonly commandId: string;

  constructor() {
    this.commandId = `reset-all-quiz-progress-${Date.now()}`;
  }
}
