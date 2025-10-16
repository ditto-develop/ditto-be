import { Injectable, NotFoundException } from '@nestjs/common';
import { IGameAnswerRepository } from '../ports/game-answer.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { GameAnswerEntity } from '../../../infra/db/entities/game/game-answer.entity';
import { DataSource, Repository } from 'typeorm';
import { GameAnswer } from '../domain/game-answer';
import { NanoId } from '../../../common/value-objects/nanoid.vo';
import { GameEntity } from '../../../infra/db/entities/game/game.entity';
import { SubmitAnswerIncludeGameIndex } from '../presentation/dto/submit-answers.dto';

@Injectable()
export class TypeormGameAnswerRepository implements IGameAnswerRepository {
  constructor(
    @InjectRepository(GameEntity)
    private readonly gameRepo: Repository<GameEntity>,

    @InjectRepository(GameAnswerEntity)
    private readonly gameAnswerRepo: Repository<GameAnswerEntity>,

    private readonly dataSource: DataSource,
  ) {}

  async save(doamin: GameAnswer): Promise<void> {
    const entity = await this.toEntity(doamin);
    await this.gameAnswerRepo.save(entity);
    return;
  }

  async count(): Promise<number> {
    return await this.gameAnswerRepo.count();
  }

  async bulkSave(domains: GameAnswer[], chunkSize: number = 500): Promise<void> {
    const chunks: GameAnswer[][] = [];
    for (let i = 0; i < domains.length; i += chunkSize) {
      chunks.push(domains.slice(i, i + chunkSize));
    }

    for (const chunk of chunks) {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      try {
        const values = chunk.map((ga) => ({
          id: NanoId.create().toString(),
          userId: ga.userId.toString(),
          gameId: ga.gameId.toString(),
          selected: ga.selectedIndex,
        }));
        await queryRunner.manager
          .createQueryBuilder()
          .insert()
          .into(GameAnswerEntity)
          .values(values)
          .orIgnore()
          .execute();

        await queryRunner.commitTransaction();
      } catch (err) {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
        throw err;
      } finally {
        await queryRunner.release();
      }
    }
  }

  async findOfCompleteUsers(requiredCount: number): Promise<GameAnswer[]> {
    const sub = this.dataSource
      .getRepository(GameAnswerEntity)
      .createQueryBuilder('subga')
      .select('subga.user_id')
      .innerJoin('subga.game', 'subg')
      .groupBy('subga.user_id')
      .having('COUNT(subga.user_id) = :requiredCount');

    const qb = this.dataSource
      .getRepository(GameAnswerEntity)
      .createQueryBuilder('ga')
      .select(['ga.user_id AS "userId"', 'g.id AS "gameId"', 'ga.selected AS "selectedIndex"', 'g.idx AS "gameIndex"'])
      .innerJoin('ga.game', 'g')
      .where(`ga.user_id IN (${sub.getQuery()})`)
      .orderBy('ga.user_id', 'ASC')
      .addOrderBy('g.idx', 'ASC')
      .setParameter('requiredCount', requiredCount);

    const data = await qb.getRawMany<SubmitAnswerIncludeGameIndex>();
    return data.map((answer) => GameAnswer.create(answer));
  }

  private async toEntity(domain: GameAnswer): Promise<GameAnswerEntity> {
    const alreadyEntity = await this.gameAnswerRepo.findOne({
      where: {
        userId: domain.userId.toString(),
        gameId: domain.gameId.toString(),
      },
    });

    const gameEntity = await this.gameRepo.findOne({ where: { id: domain.gameId.toString() } });
    if (!gameEntity) throw new NotFoundException(`등록되지 않은 Game(${domain.gameId.toString()}) 입니다.`);

    const entity = new GameAnswerEntity();
    entity.id = alreadyEntity ? alreadyEntity.id : NanoId.create().toString();
    entity.userId = domain.userId.toString();
    entity.selected = domain.selectedIndex;
    entity.gameId = gameEntity.id;
    entity.game = gameEntity;

    return entity;
  }
}
