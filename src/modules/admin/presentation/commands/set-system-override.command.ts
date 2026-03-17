import { ICommand } from '@common/command/command.interface';
import { SystemPeriod } from '@module/quiz/domain/value-objects/system-period.vo';

export class SetSystemOverrideCommand implements ICommand {
  readonly commandId: string;

  constructor(public readonly period: SystemPeriod) {
    this.commandId = `set-system-override-${Date.now()}`;
  }
}
