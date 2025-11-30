import { ICommand } from 'src/common/command/command.interface';

export class ActivateQuizSetCommand implements ICommand {
  readonly commandId?: string;

  constructor(public readonly id: string) {
    this.commandId = `activate-quiz-set-${Date.now()}`;
  }
}
