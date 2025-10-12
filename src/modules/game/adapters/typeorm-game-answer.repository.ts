import { Injectable, NotFoundException } from '@nestjs/common';
import { IGameAnswerRepository } from '../ports/game-answer.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { GameAnswerEntity } from '../../../infra/db/entities/game/game-answer.entity';
import { Repository } from 'typeorm';
import { GameAnswer } from '../domain/game-answer';
import { NanoId } from '../../../common/value-objects/nanoid.vo';
import { GameEntity } from '../../../infra/db/entities/game/game.entity';

@Injectable()
export class TypeormGameAnswerRepository implements IGameAnswerRepository {
  constructor(
    @InjectRepository(GameEntity)
    private readonly gameRepo: Repository<GameEntity>,

    @InjectRepository(GameAnswerEntity)
    private readonly gameAnswerRepo: Repository<GameAnswerEntity>,
  ) {}

  async save(doamin: GameAnswer): Promise<void> {
    const entity = await this.toEntity(doamin);
    await this.gameAnswerRepo.save(entity);
    return;
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
