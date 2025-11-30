import { ICommand } from 'src/common/command/command.interface';

export class GetQuizSetCommand implements ICommand {
  readonly commandId?: string;

  constructor(public readonly id: string) {
    this.commandId = `get-quiz-set-${Date.now()}`;
  }
}
