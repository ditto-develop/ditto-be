export class LoadAllGamesCommand {
  constructor(private readonly _round: number) {}

  public get round() {
    return this._round;
  }
}
