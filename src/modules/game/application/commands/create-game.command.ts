import { CreateGameDto } from '../../presentation/dto/create-game.dto';
import { Game } from '../../domain/game';
import { NanoId } from '../../../../common/value-objects/nanoid.vo';

export class CreateGameCommand {
  constructor(private readonly dto: CreateGameDto) {}

  public toDomain(): Game {
    const domainPayload = {
      id: this.dto.id,
      text: this.dto.text,
      round: this.dto.round,
      options: this.dto.options.map((o) => ({
        id: o.id ?? NanoId.create().toString(),
        index: o.index,
        label: o.label,
      })),
    };

    return Game.create(domainPayload);
  }
}
