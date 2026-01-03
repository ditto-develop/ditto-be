import { ICommand } from '@common/command/command.interface';

export class GetQuizzesBySetCommand implements ICommand {
  readonly commandId?: string;

  constructor(public readonly quizSetId: string) {
    this.commandId = `get-quizzes-by-set-${Date.now()}`;
  }
}
