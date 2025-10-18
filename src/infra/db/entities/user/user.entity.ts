import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryColumn } from 'typeorm';
import { ApiUserEmailProperty } from '../../../../common/decorators/api-user-email.decorator';
import { ApiUidProperty } from '../../../../common/decorators/api-uid.decorator';
import { ImageEntity } from './image.entity';

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryColumn({ type: 'varchar', length: 32 })
  @ApiUidProperty('유저 고유 ID')
  id!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @ApiUserEmailProperty()
  email?: string | null;

  @Index({ unique: true })
  @Column({ name: 'referral_token', type: 'varchar', length: 32, nullable: false })
  @ApiUidProperty('나의 추천인 토큰')
  referralToken!: string;

  @Column({ name: 'referred_by', type: 'varchar', length: 32, nullable: true })
  @ApiUidProperty('추천인 토큰')
  referredBy?: string | null;

  @OneToMany(() => ImageEntity, (img) => img.user, {
    eager: true,
  })
  images!: ImageEntity[];

  // TODO:: Postgresql 사용시 아래 주석 해제
  // @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt!: Date;
}
