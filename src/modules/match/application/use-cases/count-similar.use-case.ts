import { CountSimilarCommand } from '../commands/count-similar.command';
import { Inject } from '@nestjs/common';
import {
  GameAnswerCounter,
  type IGameAnswerCounter,
  IGameAnswerCounterToken,
} from '../../../game/application/services/counter/game-answer-counter.interface';
import { GameCount } from '../../../game/domain/game';

export class CountSimilarUseCase {
  private readonly populationCountMap: Map<string, Uint8Array> = new Map();
  constructor(
    @Inject(IGameAnswerCounterToken)
    private readonly gameAnswerCounter: IGameAnswerCounter,
  ) {
    const ROUND1_MAX_KEY = 1 << GameCount['1'];
    const populationCountForRound1 = new Uint8Array(ROUND1_MAX_KEY);
    for (let i = 1; i < ROUND1_MAX_KEY; i++) {
      populationCountForRound1[i] = populationCountForRound1[i >> 1] + (i & 1);
    }
    this.populationCountMap.set('1', populationCountForRound1);
  }
  async execute(cmd: CountSimilarCommand): Promise<{ total: number; similarCount: number }> {
    const strRound = String(cmd.round);
    const populationCount = this.populationCountMap.get(strRound)!;

    const BITS = GameCount[strRound] as number;
    const MAX_KEY = 1 << BITS;

    const answer = GameAnswerCounter.binaryToNumber(cmd.round, cmd.gameResult);
    const requiredMatches = Math.ceil((BITS * cmd.thresholdPercent) / 100);
    const allowedDiff = BITS - requiredMatches;

    let similarCount = 0;
    for (let key = 0; key < MAX_KEY; key++) {
      const dist = populationCount[answer ^ key];
      if (dist <= allowedDiff) {
        similarCount += await this.gameAnswerCounter.get(cmd.round, key);
      }
    }

    // 본인 제외
    similarCount -= 1;
    const total = (await this.gameAnswerCounter.getTotal()) - 1;
    return { total, similarCount };
  }
}
