import { ICommand } from '@common/command/command.interface';

export class GetAdminQuizProgressCommand implements ICommand {
  readonly commandId: string;

  constructor() {
    this.commandId = `get-admin-quiz-progress-${Date.now()}`;
  }
}
