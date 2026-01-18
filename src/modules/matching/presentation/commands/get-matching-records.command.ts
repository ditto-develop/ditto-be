import { ICommand } from '@common/command/command.interface';

export class GetMatchingRecordsCommand implements ICommand {
  readonly commandId?: string;

  constructor(
    public readonly userId: string,
    public readonly quizSetId?: string,
  ) {
    this.commandId = `get-matching-records-${userId}-${Date.now()}`;
  }
}