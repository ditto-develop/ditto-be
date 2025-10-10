import { Column, Entity, ManyToOne, PrimaryColumn, Unique } from 'typeorm';
import { ApiUidProperty } from '../../../../common/decorators/api-uid.decorator';
import { GameEntity } from './game.entity';

@Entity({ name: 'game_answer_option' })
@Unique(['game', 'order'])
export class GameAnswerOptionEntity {
  @PrimaryColumn({ type: 'varchar', length: 32 })
  @ApiUidProperty('게임 선택지 고유 ID')
  id!: string;

  @ManyToOne(() => GameEntity, (game) => game.options, {
    onDelete: 'CASCADE',
  })
  game: GameEntity;

  @Column({ type: 'int' })
  order!: number;

  @Column({ type: 'varchar', length: 255 })
  text!: string;
}
