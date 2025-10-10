import { Column, Entity, ManyToOne, PrimaryColumn, Unique } from 'typeorm';
import { GameEntity } from './game.entity';
import { ApiUidProperty } from '../../../../common/decorators/api-uid.decorator';

@Entity({ name: 'game_answer' })
@Unique(['user', 'game'])
export class GameAnswerEntity {
  @PrimaryColumn({ type: 'varchar', length: 32 })
  @ApiUidProperty('사용자별 문제 선택 고유 ID')
  id!: string;

  @Column({ type: 'varchar', length: 32 })
  userId!: string;

  @ManyToOne(() => GameEntity, (game) => game.options, {
    onDelete: 'CASCADE',
  })
  game: GameEntity;
}
