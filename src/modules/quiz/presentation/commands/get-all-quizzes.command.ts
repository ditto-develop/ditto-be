import { ICommand } from '@common/command/command.interface';

export class GetAllQuizzesCommand implements ICommand {
  readonly commandId?: string;

  constructor() {
    this.commandId = `get-all-quizzes-${Date.now()}`;
  }
}

