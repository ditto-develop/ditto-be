import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, Unique } from 'typeorm';
import { ApiUidProperty } from '../../../../common/decorators/api-uid.decorator';
import { GameEntity } from './game.entity';

@Entity({ name: 'game_answer_option' })
@Unique(['game', 'order'])
export class GameAnswerOptionEntity {
  @PrimaryColumn({ type: 'varchar', length: 32 })
  @ApiUidProperty('게임 선택지 고유 ID')
  id!: string;

  @Column({ type: 'varchar', length: 32, name: 'game_id' })
  gameId!: string;

  @ManyToOne(() => GameEntity, (g) => g.options, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'game_id' })
  game!: GameEntity;

  @Column({ type: 'int' })
  order!: number;

  @Column({ type: 'varchar', length: 255 })
  text!: string;
}
