import { ICommand } from '@common/command/command.interface';

export class GetQuizProgressCommand implements ICommand {
  readonly commandId: string;

  constructor(public readonly userId: string) {
    this.commandId = `get-quiz-progress-${userId}-${Date.now()}`;
  }
}
