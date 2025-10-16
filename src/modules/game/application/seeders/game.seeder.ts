import { Inject, Injectable, Logger } from '@nestjs/common';
import { type IGameRepository, IGameRepositoryToken } from '../../ports/game.repository';
import { CreateGameUseCase } from '../use-cases/create-game.use-case';
import { CreateGameCommand } from '../commands/create-game.command';
import { dummyData } from './dummy-game.data';
import { ISeeder } from '../../../../common/seeder/seeder.interface';

@Injectable()
export class GameSeeder implements ISeeder {
  private readonly logger = new Logger(GameSeeder.name);

  constructor(
    @Inject(IGameRepositoryToken)
    private readonly gameRepo: IGameRepository,
    private readonly createGameUseCase: CreateGameUseCase,
  ) {}

  async seed(): Promise<void> {
    const existingGamesCount = await this.gameRepo.count(1);
    if (existingGamesCount === 0) {
      this.logger.log('게임 데이터가 없으므로 더미 데이터를 추가합니다.');
      for (const item of dummyData) {
        const cmd = new CreateGameCommand({
          round: 1,
          text: item.text,
          options: item.options.map((o) => ({ id: undefined, index: o.index, label: o.label })),
        });
        await this.createGameUseCase.execute(cmd);
      }
      this.logger.log('더미 데이터 추가 완료');
    } else {
      this.logger.log('게임 데이터가 이미 존재합니다. 시딩 생략');
    }
  }
}
