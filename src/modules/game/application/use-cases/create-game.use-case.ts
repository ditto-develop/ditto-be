import { Inject, Injectable } from '@nestjs/common';
import { type IGameRepository, IGameRepositoryToken } from '../../ports/game.repository';
import { CreateGameCommand } from '../commands/create-game.command';
import { Game } from '../../domain/game';

@Injectable()
export class CreateGameUseCase {
  constructor(@Inject(IGameRepositoryToken) private readonly gameRepo: IGameRepository) {}

  async execute(cmd: CreateGameCommand): Promise<Game> {
    const game = cmd.toDomain();
    return await this.gameRepo.save(game);
  }
}
