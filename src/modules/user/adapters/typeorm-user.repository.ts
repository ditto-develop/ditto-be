import { Injectable } from '@nestjs/common';
import { IUserRepository } from '../ports/user.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../../infra/db/entities/user.entity';
import { User } from '../domain/user';

@Injectable()
export class TypeormUserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repo: Repository<UserEntity>,
  ) {}

  async save(user: User): Promise<void> {
    const entity = new UserEntity();
    entity.id = user.id.toString();
    entity.email = user.email;
    entity.referralToken = user.referralToken.toString();
    entity.referredBy = user.referredBy?.toString() || null;

    await this.repo.save(entity);
  }
}
