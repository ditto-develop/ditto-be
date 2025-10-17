import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { type IGameAnswerRepository, IGameAnswerRepositoryToken } from '../../../game/ports/game-answer.repository';
import { type IGameRepository, IGameRepositoryToken } from '../../../game/ports/game.repository';
import { isInteger } from '../../../../common/typeguards/common.type-guard';
import { GameAnswer } from '../../../game/domain/game-answer';
import {
  type IGameAnswerCounter,
  IGameAnswerCounterToken,
} from '../../../game/application/services/counter/game-answer-counter.interface';

type UserAnswer = {
  userId: string;
  answer: string;
};

@Injectable()
export class MatchPreloaderService implements OnModuleInit {
  private readonly logger = new Logger(MatchPreloaderService.name);

  constructor(
    @Inject(IGameRepositoryToken)
    private readonly gameRepo: IGameRepository,

    @Inject(IGameAnswerRepositoryToken)
    private readonly gameAnswerRepo: IGameAnswerRepository,

    @Inject(IGameAnswerCounterToken)
    private readonly gameAnswerCounter: IGameAnswerCounter,
  ) {}

  async onModuleInit(): Promise<void> {
    const answers = await this.getAnswers();
    for (const value of answers) {
      await this.gameAnswerCounter.increment(1, value.answer);
    }
  }

  private async fetchRequiredIdxs(round: number): Promise<number[]> {
    const games = await this.gameRepo.findAll(round);
    return games.filter((g) => isInteger(g.index)).map((g) => g.index!);
  }

  private buildUserBitArrays(rows: GameAnswer[], requiredIdxs: number[]): Map<string, string[]> {
    const idxToPos = new Map<number, number>();
    for (let i = 0; i < requiredIdxs.length; i++) idxToPos.set(requiredIdxs[i], i);

    const map = new Map<string, string[]>();
    for (const r of rows) {
      if (r.gameIndex === undefined) {
        this.logger.warn('gameIndex is undefined');
        continue;
      }

      if (!map.has(r.userId.toString())) map.set(r.userId.toString(), new Array<string>(requiredIdxs.length).fill('0'));
      const arr = map.get(r.userId.toString())!;
      const pos = idxToPos.get(r.gameIndex);
      if (pos === undefined) {
        this.logger.warn(`Unexpected idx ${r.gameIndex} for user ${r.userId.toString()} - ignored`);
        continue;
      }
      arr[pos] = r.selectedIndex ? '1' : '0';
    }

    return map;
  }

  private buildUserAnswersFromBitArrays(userBitArrays: Map<string, string[]>): UserAnswer[] {
    const result: UserAnswer[] = [];
    for (const [userId, bitArr] of userBitArrays.entries()) {
      let s = '';
      for (let i = 0; i < bitArr.length; i++) s += bitArr[i];
      result.push({ userId, answer: s });
    }
    return result;
  }

  private async getAnswers() {
    const requiredIdxs = await this.fetchRequiredIdxs(1);
    if (requiredIdxs.length === 0) return [];

    const gameAnswers = await this.gameAnswerRepo.findOfCompleteUsers(requiredIdxs.length);
    if (gameAnswers.length === 0) return [];

    const userBitArrays = this.buildUserBitArrays(gameAnswers, requiredIdxs);
    const result = this.buildUserAnswersFromBitArrays(userBitArrays);

    result.sort((a, b) => a.userId.localeCompare(b.userId));
    return result;
  }
}
