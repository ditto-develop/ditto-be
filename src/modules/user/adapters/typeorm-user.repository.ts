import { Injectable, NotFoundException } from '@nestjs/common';
import { IUserRepository } from '../ports/user.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { UserEntity } from '../../../infra/db/entities/user.entity';
import { User } from '../domain/user';
import { NanoId } from '../../../common/value-objects/nanoid.vo';

@Injectable()
export class TypeormUserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repo: Repository<UserEntity>,

    private readonly dataSource: DataSource,
  ) {}

  async count(): Promise<number> {
    return await this.repo.count();
  }

  async findAll(): Promise<User[]> {
    const entities = await this.repo.find();
    return entities.map(this.toDomain.bind(this));
  }

  async save(user: User): Promise<void> {
    const entity = new UserEntity();
    entity.id = user.id.toString();
    entity.email = user.email;
    entity.referralToken = user.referralToken.toString();
    entity.referredBy = user.referredBy?.toString() || null;

    await this.repo.save(entity);
  }

  async findById(id: string): Promise<UserEntity> {
    const entity = await this.repo.findOneBy({ id: id.toString() });
    if (!entity) throw new NotFoundException('Cannot find user with id');
    return entity;
  }

  async bulkSave(users: User[], chunkSize: number = 500): Promise<void> {
    const chunks: User[][] = [];
    for (let i = 0; i < users.length; i += chunkSize) {
      chunks.push(users.slice(i, i + chunkSize));
    }

    for (const chunk of chunks) {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      try {
        const values = chunk.map((u) => ({
          id: u.id.toString(),
          email: null,
          referralToken: u.referralToken.toString(),
          referredBy: null,
        }));
        await queryRunner.manager.createQueryBuilder().insert().into(UserEntity).values(values).orIgnore().execute();

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

  private toDomain(entity: UserEntity): User {
    const referredBy = entity.referredBy ? NanoId.from(entity.referredBy) : null;
    return User.create({
      id: NanoId.from(entity.id),
      referralToken: NanoId.from(entity.referralToken),
      email: entity.email,
      referredBy,
    });
  }
}
