import { ICommand } from '@common/command/command.interface';

export class RetryMatchingAlgorithmCommand implements ICommand {
  readonly commandId?: string;

  constructor(
    public readonly quizSetId: string,
  ) {
    this.commandId = `retry-matching-algorithm-${quizSetId}-${Date.now()}`;
  }
}