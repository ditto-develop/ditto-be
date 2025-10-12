import { Inject, Injectable } from '@nestjs/common';
import { type IGameRepository, IGameRepositoryToken } from '../../ports/game.repository';
import { Game } from '../../domain/game';
import { LoadAllGamesCommand } from '../commands/load-all-games.command';

@Injectable()
export class LoadAllGamesUseCase {
  constructor(@Inject(IGameRepositoryToken) private readonly gameRepo: IGameRepository) {}

  async execute(cmd: LoadAllGamesCommand): Promise<Game[]> {
    return await this.gameRepo.findAll(cmd.round);
  }
}
