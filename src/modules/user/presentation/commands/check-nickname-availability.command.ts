import { ICommand } from '@common/command/command.interface';

export class CheckNicknameAvailabilityCommand implements ICommand {
  readonly commandId?: string;

  constructor(public readonly nickname: string) {
    this.commandId = `check-nickname-availability-${Date.now()}`;
  }
}