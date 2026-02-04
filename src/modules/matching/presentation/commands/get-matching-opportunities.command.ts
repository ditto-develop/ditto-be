import { ICommand } from '@common/command/command.interface';

export class GetMatchingOpportunitiesCommand implements ICommand {
  readonly commandId?: string;

  constructor(
    public readonly userId: string,
  ) {
    this.commandId = `get-matching-opportunities-${userId}-${Date.now()}`;
  }
}