import { Inject, Injectable } from '@nestjs/common';
import { type IGameAnswerCounter, IGameAnswerCounterToken } from '../services/counter/game-answer-counter.interface';
import { type IGameAnswerRepository, IGameAnswerRepositoryToken } from '../../ports/game-answer.repository';
import { type IGameRepository, IGameRepositoryToken } from '../../ports/game.repository';
import { GetGameResultKeyCommand } from '../commands/get-game-result-key.command';
import { Binary } from '../../../../common/types/common.type';

@Injectable()
export class GetGameResultKeyUseCase {
  constructor(
    @Inject(IGameRepositoryToken)
    private readonly gameRepo: IGameRepository,

    @Inject(IGameAnswerRepositoryToken)
    private readonly gameAnswerRepo: IGameAnswerRepository,

    @Inject(IGameAnswerCounterToken)
    private readonly gameAnswerCounter: IGameAnswerCounter,
  ) {}

  async execute(cmd: GetGameResultKeyCommand): Promise<Binary> {
    const games = await this.gameRepo.findAll(cmd.round);
    const gameAnswers = await this.gameAnswerRepo.findByUserId(cmd.userId);
    const answers = games.map((g) => {
      const answer = gameAnswers.find((ga) => ga.gameId === g.id);
      return answer?.selectedIndex;
    });
    if (!answers.every(Number)) throw Error('모든 답안이 필요합니다.');
    return answers.join();
  }
}
