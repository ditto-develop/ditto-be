import { ICommand } from 'src/common/command/command.interface';

export class DeleteQuizSetCommand implements ICommand {
  readonly commandId?: string;

  constructor(public readonly id: string) {
    this.commandId = `delete-quiz-set-${Date.now()}`;
  }
}
