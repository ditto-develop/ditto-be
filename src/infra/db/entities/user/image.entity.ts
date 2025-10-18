import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { ApiUidProperty } from '../../../../common/decorators/api-uid.decorator';
import { UserEntity } from './user.entity';
import { ApiUserEmailProperty } from '../../../../common/decorators/api-user-email.decorator';

@Entity({ name: 'image' })
export class ImageEntity {
  @PrimaryColumn({ type: 'varchar', length: 32 })
  @ApiUidProperty('이미지 고유 ID')
  id!: string;

  @Column({ type: 'int' })
  round: number;

  @Column({ name: 'user_id', type: 'varchar', length: 32 })
  userId!: string;

  @ManyToOne(() => UserEntity, (u) => u.images)
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @Column({ name: 'image_path', type: 'varchar', length: 255, nullable: true })
  @ApiUserEmailProperty()
  imagePath: string;
}
