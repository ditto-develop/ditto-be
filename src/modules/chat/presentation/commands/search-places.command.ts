import { ICommand } from '@common/command/command.interface';

export class SearchPlacesCommand implements ICommand {
  readonly commandId?: string;

  constructor(
    public readonly query: string,
    public readonly requesterId: string,
    public readonly size?: number,
  ) {
    this.commandId = `search-places-${requesterId}-${Date.now()}`;
  }
}
