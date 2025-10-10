import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { ApiUidProperty } from '../../../../common/decorators/api-uid.decorator';
import { GameAnswerOptionEntity } from './game-answer-option.entity';
import { GameAnswerEntity } from './game-answer.entity';

@Entity({ name: 'game' })
export class GameEntity {
  @PrimaryColumn({ type: 'varchar', length: 32 })
  @ApiUidProperty('게임 고유 ID')
  id!: string;

  // TODO:: Postgresql 사용시 아래 주석 해제
  // @Column({ generated: 'increment', generatedType: 'STORED', type: 'int' })
  @Column({ type: 'int' })
  @ApiUidProperty('게임 순서')
  idx: number;

  @Column({ type: 'varchar', length: 255 })
  question: string;

  @Column({ type: 'int' })
  round: number;

  @OneToMany(() => GameAnswerOptionEntity, (option) => option.game, {
    cascade: true,
    eager: true,
  })
  options!: GameAnswerOptionEntity[];

  @OneToMany(() => GameAnswerEntity, (answer) => answer.game)
  answers!: GameAnswerEntity[];
}
