import { ICommand } from '@common/command/command.interface';

export class GetQuizSetWithProgressCommand implements ICommand {
  readonly commandId: string;

  constructor(
    public readonly userId: string,
    public readonly quizSetId: string,
  ) {
    this.commandId = `get-quiz-set-with-progress-${userId}-${quizSetId}-${Date.now()}`;
  }
}
