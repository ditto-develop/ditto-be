import { ICommand } from '@common/command/command.interface';

export class GetQuizCommand implements ICommand {
  readonly commandId?: string;

  constructor(public readonly quizId: string) {
    this.commandId = `get-quiz-${Date.now()}`;
  }
}
