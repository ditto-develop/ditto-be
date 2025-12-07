import { ICommand } from '@common/command/command.interface';

export class DeactivateQuizSetCommand implements ICommand {
  readonly commandId?: string;

  constructor(public readonly id: string) {
    this.commandId = `deactivate-quiz-set-${Date.now()}`;
  }
}
