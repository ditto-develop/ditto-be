import { ICommand } from '@common/command/command.interface';

export class GetAdminMatchCandidatesCommand implements ICommand {
  readonly commandId: string;

  constructor(public readonly userId: string) {
    this.commandId = `get-admin-match-candidates-${Date.now()}`;
  }
}
