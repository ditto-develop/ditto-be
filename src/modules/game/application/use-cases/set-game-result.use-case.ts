import { Inject, Injectable } from '@nestjs/common';
import { type IGameAnswerCounter, IGameAnswerCounterToken } from '../services/counter/game-answer-counter.interface';
import { Binary } from '../../../../common/types/common.type';

@Injectable()
export class SetGameResultUseCase {
  constructor(
    @Inject(IGameAnswerCounterToken)
    private readonly gameAnswerCounter: IGameAnswerCounter,
  ) {}

  async execute(round: number, binary: Binary): Promise<void> {
    await this.gameAnswerCounter.increment(round, binary);
  }
}
