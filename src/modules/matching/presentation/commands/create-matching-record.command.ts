import { ICommand } from '@common/command/command.interface';

export class CreateMatchingRecordCommand implements ICommand {
  readonly commandId?: string;

  constructor(
    public readonly userId: string,
    public readonly matchedUserId: string,
    public readonly quizSetId: string,
  ) {
    this.commandId = `create-matching-record-${userId}-${matchedUserId}-${Date.now()}`;
  }
}