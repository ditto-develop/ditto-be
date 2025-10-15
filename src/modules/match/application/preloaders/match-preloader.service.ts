import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { type IGameRepository, IGameRepositoryToken } from '../../../game/ports/game.repository';
import { DataSource } from 'typeorm';
import { GameEntity } from '../../../../infra/db/entities/game/game.entity';
import { GameAnswerEntity } from '../../../../infra/db/entities/game/game-answer.entity';

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
    private dataSource: DataSource,
  ) {}

  async onModuleInit(): Promise<void> {
    this.logger.log(await this.getAnswers());
  }

  async getAnswers() {
    const gameRepo = this.dataSource.getRepository(GameEntity);
    const games = await gameRepo.find({
      select: ['id', 'idx'],
      order: { idx: 'ASC' },
    });

    if (!games || games.length === 0) return [];

    const maxIdx = Math.max(...games.map((g) => g.idx));

    const qb = this.dataSource
      .getRepository(GameAnswerEntity)
      .createQueryBuilder('ga')
      .select(['ga.user_id AS "userId"', 'ga.selected AS "selected"', 'g.idx AS "idx"'])
      .innerJoin('ga.game', 'g')
      .orderBy('ga.user_id', 'ASC')
      .addOrderBy('g.idx', 'ASC');

    const rows: Array<{ userId: string; selected: number; idx: number }> = await qb.getRawMany();

    const map = new Map<string, string[]>();
    for (const r of rows) {
      const uid = r.userId;
      if (!map.has(uid)) {
        const arr = new Array<string>(maxIdx + 1).fill('0');
        map.set(uid, arr);
      }

      const arr = map.get(uid)!;
      arr[r.idx] = r.selected ? '1' : '0';
    }

    const result: UserAnswer[] = [];
    for (const [userId, bitArr] of map.entries()) {
      let s = '';
      for (let i = maxIdx; i >= 1; i--) {
        s += bitArr[i] ?? '0';
      }
      result.push({ userId, answer: s });
    }
    result.sort((a, b) => a.userId.localeCompare(b.userId));

    return result;
  }
}
