import { ICommand } from '@common/command/command.interface';

export class RunMatchingAlgorithmCommand implements ICommand {
  readonly commandId?: string;

  constructor(
    public readonly quizSetId: string,
  ) {
    this.commandId = `run-matching-algorithm-${quizSetId}-${Date.now()}`;
  }
}