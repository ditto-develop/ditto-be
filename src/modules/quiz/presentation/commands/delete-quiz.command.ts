import { ICommand } from '@common/command/command.interface';

export class DeleteQuizCommand implements ICommand {
  readonly commandId?: string;

  constructor(public readonly quizId: string) {
    this.commandId = `delete-quiz-${Date.now()}`;
  }
}
