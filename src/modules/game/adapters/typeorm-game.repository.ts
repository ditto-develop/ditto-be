import { IGameRepository } from '../ports/game.repository';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GameEntity } from '../../../infra/db/entities/game/game.entity';
import { Repository } from 'typeorm';
import { Game } from '../domain/game';
import { GameAnswerOptionEntity } from '../../../infra/db/entities/game/game-answer-option.entity';

@Injectable()
export class TypeormGameRepository implements IGameRepository {
  constructor(
    @InjectRepository(GameEntity)
    private readonly repo: Repository<GameEntity>,
  ) {}

  async count(round: number): Promise<number> {
    return await this.repo.count({ where: { round } });
  }

  async save(domain: Game): Promise<Game> {
    const entity = this.toEntity(domain);
    // TODO:: Postgresql 사용시 아래 코드 삭제 or 주석
    //  시작
    const lastSaved = await this.repo.find({
      order: { idx: 'DESC' },
      take: 1,
    });
    entity.idx = (lastSaved.length > 0 ? lastSaved[0].idx : 0) + 1;
    //  여기까지 삭제 or 주석
    const saved = await this.repo.save(entity);
    return this.toDomain(saved);
  }

  async findAll(round: number): Promise<Game[]> {
    const entities = await this.repo.find({
      where: { round },
      order: { idx: 'ASC' },
    });
    return entities.map(this.toDomain.bind(this));
  }

  private toEntity(domain: Game): GameEntity {
    const entity = new GameEntity();
    entity.id = domain.id.toString();
    entity.question = domain.text;
    entity.round = domain.round;
    entity.options = domain.options.map((o) => {
      const optionEntity = new GameAnswerOptionEntity();
      optionEntity.id = o.id.toString();
      optionEntity.gameId = domain.id.toString();
      optionEntity.order = o.index;
      optionEntity.text = o.label;
      return optionEntity;
    });

    return entity;
  }

  private toDomain(entity: GameEntity): Game {
    const options = entity.options.map((o) => ({ id: o.id, index: o.order, label: o.text }));
    return Game.create({
      id: entity.id,
      text: entity.question,
      options,
      round: entity.round,
      index: entity.idx,
    });
  }
}
